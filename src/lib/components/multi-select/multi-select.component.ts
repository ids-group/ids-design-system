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
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { chipFit } from '../chip-overflow';
import { IconComponent } from '../../icons/icon.component';
import { TagComponent } from '../tag/tag.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  focusIsInside,
  forwardOverlayTokens,
  dropdownOverlay,
  prepareOverlayEnter,
} from '../overlay-motion';
import { FieldMessageComponent } from '../field-message/field-message.component';
import {
  resolveFieldMessage,
} from '../field-errors';
import { nextControlId } from '../field-ids';
import type { MultiSelectOption } from './multi-select.types';

@Component({
  selector: 'ds-multi-select',
  standalone: true,
  imports: [IconComponent, TagComponent, FieldMessageComponent],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  host: {
    '[attr.data-field-state]': 'controlState()',
  },
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent
  extends DsControlValueAccessor<string[]>
  implements OnDestroy
{
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-multi-select { --ds-multi-select-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-multi-select-panel-bg-color',
    '--ds-multi-select-option-bg-color-active',
    '--ds-multi-select-check-bg-color',
  ];

  /** Selected values, two-way bound. */
  readonly value = model<string[]>([]);
  /** Options shown in the panel. */
  readonly options = input<readonly MultiSelectOption[]>([]);
  /** Placeholder shown in the trigger when nothing is selected. */
  readonly placeholder = input<string>('Select…');
  /** Placeholder for the in-panel filter input. */
  readonly searchPlaceholder = input<string>('Filter…');
  /** How the chips collapse when they outgrow one line. `"fit"` (the default)
   *  measures and shows as many as the trigger is wide, the rest behind "+N more".
   *  A NUMBER caps at exactly that many, which is what you want when the trigger's
   *  height must be predictable whatever the width. `null` shows every chip and
   *  lets the trigger grow a line per selection. */
  readonly maxVisibleChips = input<number | 'fit' | null>('fit', {
    transform: (raw: unknown) =>
      raw === 'fit' ? 'fit' : raw == null ? null : numberAttribute(raw),
  });
  /** Disables the trigger and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Applies success styling to the field. */
  readonly success = input(false, { transform: booleanAttribute });
  /** Accessible name for the trigger — falls back to `placeholder`. */
  readonly ariaLabel = input<string | null>(null);
  /** Shows a "Select all" row that toggles every filter-matching, enabled option. */
  readonly selectAll = input(false, { transform: booleanAttribute });

  protected readonly uid = nextControlId('ds-multi-select');
  protected readonly listboxId = `${this.uid}-listbox`;
  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('search');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  private readonly chipRow = viewChild<ElementRef<HTMLElement>>('chipRow');

  protected readonly open = signal(false);
  protected readonly filter = signal('');
  protected readonly activeIndex = signal(-1);

  private overlayRef: OverlayRef | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    clearTimeout(this.focusTimer ?? undefined);
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  // Selected options in the source order, so chip order is stable.
  protected readonly selectedOptions = computed<MultiSelectOption[]>(() => {
    const selected = this.value();

    return this.options().filter((option) => selected.includes(option.value));
  });

  /** True for BOTH `'fit'` and a number: a number is a ceiling, not a promise —
   *  "at most N" — so the row still measures and shows only what the trigger is
   *  wide enough for. Without that, a phone-width trigger honoured the count and
   *  wrapped the text input onto a second line, which is the one thing the cap
   *  exists to prevent. `null` opts out of measuring and grows, as documented. */
  protected readonly fitsChipsToWidth = computed(
    () => this.maxVisibleChips() !== null,
  );
  /** How many chips the row is ASKED to render before measuring: everything for
   *  `'fit'`, the ceiling for a number. It has to be the ceiling and not the
   *  selection, because the measurement caches chip widths from a render that
   *  holds them all — with a numeric cap that render never happens, the cache
   *  never fills, and the fit fell back to "show them all" without a word. */
  private readonly chipBudget = computed(() => {
    const max = this.maxVisibleChips();
    const total = this.selectedOptions().length;

    return typeof max === 'number' ? Math.min(Math.max(max, 0), total) : total;
  });
  private readonly chipsThatFit = chipFit(
    this.chipBudget,
    this.chipRow,
    this.fitsChipsToWidth,
    computed(() => this.selectedOptions().length),
  );

  protected readonly visibleChips = computed<MultiSelectOption[]>(() => {
    const selected = this.selectedOptions();

    return this.maxVisibleChips() === null
      ? selected
      : selected.slice(0, this.chipsThatFit());
  });

  protected readonly overflowCount = computed<number>(
    () => this.selectedOptions().length - this.visibleChips().length,
  );

  protected readonly filteredOptions = computed<MultiSelectOption[]>(() => {
    const query = this.filter().trim().toLowerCase();
    const options = this.options();

    return query
      ? options.filter((option) => option.label.toLowerCase().includes(query))
      : options.slice();
  });

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 ? this.optionId(index) : null;
  });

  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() || this.placeholder(),
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
    success: this.success,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  // Select-all reflects the currently filter-matching, enabled options.
  private enabledFiltered(): MultiSelectOption[] {
    return this.filteredOptions().filter((option) => !option.disabled);
  }

  protected readonly allFilteredSelected = computed<boolean>(() => {
    const enabled = this.enabledFiltered();
    const selected = this.value();

    return (
      enabled.length > 0 && enabled.every((o) => selected.includes(o.value))
    );
  });

  protected readonly someFilteredSelected = computed<boolean>(() => {
    const selected = this.value();

    return (
      this.enabledFiltered().some((o) => selected.includes(o.value)) &&
      !this.allFilteredSelected()
    );
  });

  protected toggleSelectAll(): void {
    const enabledValues = this.enabledFiltered().map((o) => o.value);
    if (this.allFilteredSelected()) {
      const remove = new Set(enabledValues);

      this.value.set(this.value().filter((value) => !remove.has(value)));
    } else {
      const next = new Set(this.value());
      enabledValues.forEach((value) => next.add(value));
      this.value.set([...next]);
    }
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  protected toggleValue(option: MultiSelectOption): void {
    if (option.disabled) {
      return;
    }
    const current = this.value();
    this.value.set(
      current.includes(option.value)
        ? current.filter((value) => value !== option.value)
        : [...current, option.value],
    );
  }

  protected removeValue(value: string): void {
    this.value.set(this.value().filter((entry) => entry !== value));
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.filteredOptions().length ? 0 : -1);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onTriggerClick();

      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const option = this.filteredOptions()[this.activeIndex()];
        if (option) {
          this.toggleValue(option);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close('dismiss');
        break;
      case 'Backspace':
        if (!this.filter()) {
          const selected = this.selectedOptions();
          if (selected.length) {
            this.removeValue(selected[selected.length - 1].value);
          }
        }
        break;
      default:
        break;
    }
  }

  protected openPanel(): void {
    if (this.overlayRef || this.isDisabled()) {
      return;
    }
    const triggerElement = this.trigger().nativeElement;
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      triggerElement,
    );
    config.width = triggerElement.getBoundingClientRect().width;
    this.overlayRef = this.overlay.create(config);
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
      () => this.close('dismiss'),
    );
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      this.overlayRef = null;
      this.open.set(false);
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close('dismiss');
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.open.set(true);
    this.activeIndex.set(this.filteredOptions().length ? 0 : -1);
    this.focusTimer = setTimeout(() => {
      this.focusTimer = null;
      this.searchInput()?.nativeElement.focus();
    });
  }

  protected onTriggerClick(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.overlayRef) {
      this.close();

      return;
    }
    this.openPanel();
  }

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    if (!this.overlayRef) {
      return;
    }
    clearTimeout(this.focusTimer ?? undefined);
    this.focusTimer = null;
    const focusWasInPanel = focusIsInside(this.overlayRef);
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.open.set(false);
    this.filter.set('');
    this.activeIndex.set(-1);
    this.markTouched();
    if (focusWasInPanel) {
      this.trigger().nativeElement.focus({ preventScroll: true });
    }
  }

  private moveActive(delta: number): void {
    const options = this.filteredOptions();
    const count = options.length;
    if (!count) {
      return;
    }
    let next = this.activeIndex();
    let remaining = count;
    while (remaining-- > 0) {
      next = (next + delta + count) % count;
      if (!options[next].disabled) {
        this.activeIndex.set(next);

        return;
      }
    }
  }
}
