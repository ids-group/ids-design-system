import {
  Component,
  ElementRef,
  type OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  forwardOverlayTokens,
  prepareOverlayEnter,
} from '../overlay-motion';
import { IconComponent } from '../../icons/icon.component';
import { TagComponent } from '../tag/tag.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import { FieldMessageComponent } from '../field-message/field-message.component';
import {
  normalizeFieldErrors,
  resolveFieldMessage,
  type DsFieldError,
  type DsFieldErrorsInput,
} from '../field-errors';
import type {
  AutocompleteOption,
  AutocompleteOptionGroup,
  AutocompleteWidth,
} from './autocomplete.types';
import type { DsSize } from '../../core/size';
import { resolveReserveMessage } from '../field-defaults';

let nextId = 0;

@Component({
  selector: 'ds-autocomplete',
  standalone: true,
  imports: [IconComponent, TagComponent, FieldMessageComponent],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.content-width]': "width() === 'content'",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
})
export class AutocompleteComponent<T = unknown>
  extends DsControlValueAccessor<T | readonly T[] | null>
  implements OnDestroy
{
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-autocomplete { --ds-autocomplete-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-autocomplete-panel-bg-color',
    '--ds-autocomplete-option-bg-color-hover',
  ];

  /** Flat option list — ignored when `optionGroups` is set. */
  readonly options = input<readonly AutocompleteOption<T>[]>([]);
  /** Options grouped under labelled sections, rendered instead of `options`. */
  readonly optionGroups = input<AutocompleteOptionGroup<T>[]>([]);
  /** Selected value, or an array of values when `multiple`. */
  readonly value = model<T | readonly T[] | null>(null);
  /** Allows selecting more than one option, shown as removable tags. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Trigger height — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Trigger width — `fill` stretches to the container, `content` hugs the value. */
  readonly width = input<AutocompleteWidth>('fill');
  /** Placeholder shown in the input when empty. */
  readonly placeholder = input<string>('Select…');
  /** Disables the trigger and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Applies error styling and marks the field `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Helper text shown below the field. */
  readonly hint = input<string>('');
  /** Error text. Shown immediately — binding it says the consumer has already
   *  decided this field is in error. Takes precedence over `errors`. */
  readonly error = input<string>('');
  /** Advisory text, shown when there is no error. */
  readonly warning = input<string>('');
  /** Validation errors, shown once the user has interacted. Bound automatically
   *  by signal forms; reactive and template-driven forms are read through
   *  `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  readonly errors = input<readonly DsFieldError[], DsFieldErrorsInput>([], {
    transform: normalizeFieldErrors,
  });
  /** Whether the user has interacted with the field. Bound by signal forms; gates
   *  `errors`, so a `required` error does not greet an untouched form. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Reserve the message-row height even when empty, so the field doesn't shift
   *  the layout below it when a hint/error appears. Falls back to
   *  `DS_CONFIG.field.reserveMessage`, then off — opt in per field, or app-wide
   *  for a form that shows validation messages. */
  readonly reserveMessage = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  protected readonly reserveMessageResolved = resolveReserveMessage(
    this.reserveMessage,
  );
  /** Shows a "Create «text»" row when the typed text matches no option. */
  readonly allowCreate = input(false, { transform: booleanAttribute });
  /** Accessible name for the combobox input. */
  readonly ariaLabel = input<string | null>(null);

  /** Fires with the typed text when the user picks the create-new option. */
  readonly create = output<string>();

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  protected readonly query = signal('');
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly trigger =
    viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly filterInput =
    viewChild.required<ElementRef<HTMLInputElement>>('filter');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  protected readonly uid = `ds-autocomplete-${++nextId}`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }
  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.isOpen() && index >= 0 ? this.optionId(index) : null;
  });

  /** All options flattened from either optionGroups or options. */
  protected readonly allOptions = computed<readonly AutocompleteOption<T>[]>(
    () => {
      const groups = this.optionGroups();
      if (groups.length > 0) {
        return groups.flatMap((group) => group.options);
      }

      return this.options();
    },
  );

  protected readonly filteredOptions = computed(() => {
    const trimmedQuery = this.query().toLowerCase().trim();
    if (!trimmedQuery) {
      return this.allOptions();
    }

    return this.allOptions().filter((option) =>
      option.label.toLowerCase().includes(trimmedQuery),
    );
  });

  /** Filtered groups for grouped rendering — groups with no matching options are hidden. */
  protected readonly filteredGroups = computed<AutocompleteOptionGroup<T>[]>(
    () => {
      const groups = this.optionGroups();
      if (groups.length === 0) {
        return [];
      }
      const trimmedQuery = this.query().toLowerCase().trim();
      if (!trimmedQuery) {
        return groups;
      }

      return groups
        .map((group) => ({
          ...group,
          options: group.options.filter((option) =>
            option.label.toLowerCase().includes(trimmedQuery),
          ),
        }))
        .filter((group) => group.options.length > 0);
    },
  );

  /** Whether to show the "Create «text»" row at the bottom of the panel. */
  protected readonly showCreateRow = computed<boolean>(() => {
    if (!this.allowCreate()) {
      return false;
    }
    const text = this.query().trim();
    if (!text) {
      return false;
    }
    const lowerText = text.toLowerCase();

    return !this.allOptions().some(
      (option) => option.label.toLowerCase() === lowerText,
    );
  });

  /** Flat list of visible options used for keyboard navigation index. */
  protected readonly visibleOptions = computed<
    readonly AutocompleteOption<T>[]
  >(() => this.filteredOptions());

  protected readonly selectedTags = computed(() => {
    if (!this.multiple()) {
      return [];
    }
    const selectedValues = (this.value() as readonly T[] | null) ?? [];
    const selectedSet = new Set(selectedValues);

    return this.allOptions().filter((option) => selectedSet.has(option.value));
  });

  protected readonly displayLabel = computed(() => {
    if (this.multiple()) {
      return '';
    }
    const currentValue = this.value() as T | null;
    if (currentValue === null) {
      return '';
    }

    return (
      this.allOptions().find((option) => option.value === currentValue)
        ?.label ?? ''
    );
  });

  protected readonly placeholderText = computed(() => {
    if (this.multiple()) {
      return '';
    }
    if (this.displayLabel()) {
      return '';
    }

    return this.placeholder();
  });

  protected isSelected(option: AutocompleteOption<T>): boolean {
    if (this.multiple()) {
      const selectedValues = (this.value() as readonly T[] | null) ?? [];

      return selectedValues.includes(option.value);
    }

    return this.value() === option.value;
  }

  protected optionClass(option: AutocompleteOption<T>): string {
    const parts = ['option'];
    if (this.multiple()) {
      parts.push('multi');
    }
    void option;

    return parts.join(' ');
  }

  /** Flat index of the given option within the visible (filtered) list. */
  protected flatIndexOf(option: AutocompleteOption<T>): number {
    return this.visibleOptions().findIndex((opt) => opt === option);
  }

  protected onTriggerClick(): void {
    if (this.isDisabled()) {
      return;
    }
    this.filterInput().nativeElement.focus();
    if (!this.overlayRef) {
      this.openPanel();
    }
  }

  protected togglePanel(event: MouseEvent): void {
    if (this.isDisabled()) {
      return;
    }
    event.stopPropagation();
    if (this.overlayRef) {
      this.close();
    } else {
      this.filterInput().nativeElement.focus();
      this.openPanel();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const visibleCount = this.visibleOptions().length;
    // Create row adds one extra navigable slot at the end.
    const totalSlots = visibleCount + (this.showCreateRow() ? 1 : 0);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.overlayRef) {
          this.openPanel();

          return;
        }
        this.activeIndex.set(
          totalSlots ? (this.activeIndex() + 1) % totalSlots : -1,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.overlayRef) {
          this.openPanel();

          return;
        }
        this.activeIndex.set(
          totalSlots ? (this.activeIndex() - 1 + totalSlots) % totalSlots : -1,
        );
        break;
      case 'Enter': {
        const index = this.activeIndex();
        if (this.showCreateRow() && index === visibleCount) {
          event.preventDefault();
          this.onCreateNew();
          break;
        }
        const opt = this.visibleOptions()[index];
        if (opt) {
          event.preventDefault();
          this.onPick(opt);
        }
        break;
      }
      case 'Escape':
        if (this.overlayRef) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        // Close the panel but let Tab move focus naturally (no preventDefault),
        // else the open overlay panel lingers behind the moved focus.
        if (this.overlayRef) {
          this.close();
        }
        break;
      case 'Backspace':
        if (this.multiple() && !this.query()) {
          const tags = this.selectedTags();
          const last = tags[tags.length - 1];
          if (last) {
            this.remove(last.value);
          }
        }
        break;
    }
  }

  protected openPanel(): void {
    if (this.overlayRef) {
      return;
    }
    const triggerElement = this.trigger().nativeElement;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -4,
        },
      ]);
    const overlayConfig: OverlayConfig = {
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    // Content-width trigger can be narrow — let the panel size to its options
    // with the trigger as the floor; fill mode keeps the exact trigger width.
    const triggerWidth = triggerElement.getBoundingClientRect().width;
    if (this.width() === 'content') {
      overlayConfig.minWidth = triggerWidth;
    } else {
      overlayConfig.width = triggerWidth;
    }
    this.overlayRef = this.overlay.create(overlayConfig);
    prepareOverlayEnter(
      this.overlayRef,
      this.host.nativeElement,
      positionStrategy,
    );
    forwardOverlayTokens(
      this.overlayRef,
      this.host.nativeElement,
      this.panelTokens,
    );
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.host.nativeElement.contains(target),
      () => this.close(),
    );
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close(),
    );
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      this.overlayRef = null;
      this.isOpen.set(false);
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.isOpen.set(true);
    this.activeIndex.set(this.visibleOptions().length ? 0 : -1);
  }

  protected close(): void {
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.markTouched();
  }

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected onFilter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onPick(option: AutocompleteOption<T>): void {
    if (this.multiple()) {
      const current = (this.value() as readonly T[] | null) ?? [];
      const next = current.includes(option.value)
        ? current.filter((existing) => existing !== option.value)
        : [...current, option.value];
      this.value.set(next);
    } else {
      this.value.set(option.value);
      this.close();
    }
  }

  protected onCreateNew(): void {
    const text = this.query().trim();
    if (!text) {
      return;
    }
    this.create.emit(text);
    this.query.set('');
    this.close();
  }

  protected remove(target: T): void {
    if (!this.multiple()) {
      return;
    }
    const current = (this.value() as readonly T[] | null) ?? [];
    this.value.set(current.filter((existing) => existing !== target));
  }
}
