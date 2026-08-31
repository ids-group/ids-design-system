import { NgTemplateOutlet } from '@angular/common';
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
  output,
  signal,
  contentChild,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  forwardOverlayTokens,
  dropdownOverlay,
  prepareOverlayEnter,
} from '../overlay-motion';
import { chipFit } from '../chip-overflow';
import { IconComponent } from '../../icons/icon.component';
import { TagComponent } from '../tag/tag.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import { FieldMessageComponent } from '../field-message/field-message.component';
import { resolveFieldMessage, trimmedText } from '../field-errors';
import type {
  AutocompleteItem,
  AutocompleteOption,
  AutocompleteOptionGroup,
  AutocompleteValueOverflow,
  AutocompleteWidth,
} from './autocomplete.types';
import { flattenDsOptions, isDsOptionGroup } from '../../core/option';
import {
  firstEnabledIndex as firstEnabledOf,
  lastEnabledIndex as lastEnabledOf,
  nextEnabledIndex,
} from '../../core/list-cursor';
import { scrollActiveOptionIntoView } from '../scroll-active-option';
import { DsOptionTemplateDirective } from '../option-template.directive';
import { DsChipTemplateDirective } from '../chip-template.directive';
import { DsPickerTriggerDirective } from '../picker-trigger.directive';
import { DsEmptyTemplateDirective } from '../empty-template.directive';
import { DsCreateTemplateDirective } from '../create-template.directive';
import type { DsSize } from '../../core/size';
import { inFieldGroup } from '../field-group/field-group.token';
import { resolveWithConfig } from '../../core/config-defaults';

let nextId = 0;

@Component({
  selector: 'ds-autocomplete',
  standalone: true,
  imports: [
    IconComponent,
    TagComponent,
    FieldMessageComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.in-group]': 'inGroup',
    '[class.content-width]': "width() === 'content'",
    '[class.value-wraps]': "valueOverflow() === 'wrap'",
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
  /** Segment of a ds-field-group: the group owns the border, radius and focus
   *  ring, so .in-group strips this control back to its bare contents. */
  protected readonly inGroup = inFieldGroup();

  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-autocomplete { --ds-autocomplete-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-dropdown-panel-bg-color',
    '--ds-dropdown-panel-radius',
    '--ds-dropdown-panel-maxh',
    '--ds-dropdown-panel-minw',
    '--ds-dropdown-panel-maxw',
    '--ds-option-selected-bg-color',
    '--ds-option-selected-label-color',
    '--ds-option-selected-bg-color-hover',
    '--ds-option-check-color',
  ];

  /** Options, groups, or both mixed — rendered in the order given. */
  readonly options = input<readonly AutocompleteItem<T>[]>([]);
  /** Selected value, or an array of values when `multiple`. */
  readonly value = model<T | readonly T[] | null>(null);
  /** Allows selecting more than one option, shown as removable tags. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Draws the trailing chevron. Turn it off for a search field, where an arrow
   *  invites a click that would list everything instead of searching. */
  readonly showChevron = input(true, { transform: booleanAttribute });
  /** How the chips collapse when they outgrow one line. `"fit"` (the default)
   *  measures and shows as many as the trigger is wide, the rest behind "+N more".
   *  A NUMBER is a CEILING, not a promise: the row still measures, so you get at
   *  most that many and fewer when the trigger is narrow. `"all"` shows every chip and
   *  lets the trigger grow a line per selection.
   *
   *  Unset (`null`) means "not deciding", as it does on every other input in the
   *  library — it resolves to `"fit"`. It does NOT mean "show all": that is
   *  `"all"`, which is the loudest of the three modes and has to be asked for. */
  readonly maxVisibleChips = input<number | 'fit' | 'all' | null>(null, {
    transform: (raw: unknown) => {
      if (raw === 'fit' || raw === 'all') {
        return raw;
      }

      return raw == null ? null : numberAttribute(raw);
    },
  });
  /** Trigger height — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Trigger width — `fill` stretches to the container, `content` hugs the value. */
  readonly width = input<AutocompleteWidth>('fill');
  /** What a settled single value does when it is wider than the trigger. Defaults
   *  to `ellipsis`; `wrap` restores the pre-0.12 behaviour, where the value broke
   *  onto a second line and pushed the chevron onto a third. Multi mode is
   *  unaffected — its chips have their own measured cap. */
  readonly valueOverflow = input<AutocompleteValueOverflow>('ellipsis');
  /** Placeholder shown in the input when empty. */
  readonly placeholder = input<string>('Select…');
  /** Disables the trigger and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Confirmation text, shown when there is no error or warning — and it paints
   *  the field's success border. A string like `warning`: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Shows a "Create «text»" row when the typed text matches no option. */
  readonly allowCreate = input(false, { transform: booleanAttribute });
  /** Field label above the control — the same meaning it has on the other two pickers. */
  readonly label = input<string>('');
  /** How two values are decided to be the same one. The default is `===`, which
   *  is reference identity — so with object values a re-fetch that returns equal
   *  data as NEW objects loses the selection. Pass a comparator keyed on whatever
   *  identifies the value: `(a, b) => a?.id === b?.id`. */
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>(
    (a, b) => a === b,
  );

  /** Scrolls the keyboard cursor's row into view. On by default: a list longer
   *  than the panel otherwise walks the cursor out of sight. Set `false` only if
   *  you are driving the scroll position yourself. */
  readonly scrollActiveIntoView = input(true, { transform: booleanAttribute });
  /** Marks the field required: a `*` beside the label and `aria-required` on the input. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Marks the field optional in words, for a form where most fields are required. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Accessible name for the input. */
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
    success: this.success,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  protected readonly optionTemplate = contentChild(DsOptionTemplateDirective, {
    read: TemplateRef,
  });
  protected readonly chipTemplate = contentChild(DsChipTemplateDirective, {
    read: TemplateRef,
  });
  protected readonly pickerTrigger = contentChild(DsPickerTriggerDirective, {
    read: TemplateRef,
  });
  protected readonly emptyTemplate = contentChild(DsEmptyTemplateDirective, {
    read: TemplateRef,
  });
  protected readonly createTemplate = contentChild(DsCreateTemplateDirective, {
    read: TemplateRef,
  });

  protected readonly query = signal('');
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly trigger =
    viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly filterInput =
    viewChild.required<ElementRef<HTMLInputElement>>('filter');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  private readonly chipRow = viewChild<ElementRef<HTMLElement>>('chipRow');
  private overlayRef: OverlayRef | null = null;

  protected readonly uid = `ds-autocomplete-${++nextId}`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly labelId = `${this.uid}-label`;
  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }
  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.isOpen() && index >= 0 ? this.optionId(index) : null;
  });

  protected readonly allOptions = computed<readonly AutocompleteOption<T>[]>(
    () => flattenDsOptions(this.options()),
  );

  protected readonly filteredItems = computed<AutocompleteItem<T>[]>(() => {
    const query = this.query().toLowerCase().trim();
    const matches = (option: AutocompleteOption<T>): boolean =>
      !query || option.label.toLowerCase().includes(query);

    const kept: AutocompleteItem<T>[] = [];
    for (const item of this.options()) {
      if (!isDsOptionGroup(item)) {
        if (matches(item)) {
          kept.push(item);
        }
        continue;
      }
      // A disabled group disables its options HERE, not only in the flattened
      // list: the template renders these objects, so a group left to inherit
      // later would paint enabled rows that refuse to be picked.
      const options = item.options
        .filter(matches)
        .map((option) =>
          item.disabled ? { ...option, disabled: true } : option,
        );
      if (options.length > 0) {
        kept.push({ ...item, options });
      }
    }

    return kept;
  });

  protected readonly filteredOptions = computed<
    readonly AutocompleteOption<T>[]
  >(() => flattenDsOptions(this.filteredItems()));

  protected isGroup(
    item: AutocompleteItem<T>,
  ): item is AutocompleteOptionGroup<T> {
    return isDsOptionGroup(item);
  }

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

  /** The visible label wins the accessible name when there is one — otherwise the
   *  placeholder would announce over it, and `placeholder` always carries a default. */
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  protected readonly selectedTags = computed(() => {
    if (!this.multiple()) {
      return [];
    }
    const selectedValues = (this.value() as readonly T[] | null) ?? [];
    const same = this.compareWith();

    return this.allOptions().filter((option) =>
      selectedValues.some((selected) => same(selected, option.value)),
    );
  });

  private readonly chipsMode = computed(() => this.maxVisibleChips() ?? 'fit');
  private readonly showsEveryChip = computed(() => this.chipsMode() === 'all');
  /** True for BOTH `'fit'` and a number: a number is a ceiling ("at most N"), not a
   *  promise, so the row still measures and shows only what the width allows. */
  protected readonly fitsChipsToWidth = computed(() => !this.showsEveryChip());
  /** How many chips the row is ASKED to render before measuring: everything for
   *  `'fit'`, the ceiling for a number. It has to be the ceiling and not the
   *  selection, because the measurement caches chip widths from a render that
   *  holds them all — with a numeric cap that render never happens, the cache
   *  never fills, and the fit fell back to "show them all" without a word. */
  private readonly chipBudget = computed(() => {
    const max = this.chipsMode();
    const total = this.selectedTags().length;

    return typeof max === 'number' ? Math.min(Math.max(max, 0), total) : total;
  });
  private readonly chipsThatFit = chipFit(
    this.chipBudget,
    this.chipRow,
    this.fitsChipsToWidth,
    computed(() => this.selectedTags().length),
  );

  /** What the trigger renders. Separate from `selectedTags`, which stays the
   *  full selection: Backspace removes the last SELECTED chip, and capping the
   *  list it reads would silently make it remove the last VISIBLE one instead. */
  protected readonly visibleTags = computed(() => {
    const tags = this.selectedTags();

    return this.showsEveryChip() ? tags : tags.slice(0, this.chipsThatFit());
  });

  protected readonly overflowCount = computed<number>(
    () => this.selectedTags().length - this.visibleTags().length,
  );

  protected readonly selectedOption = computed<AutocompleteOption<T> | null>(
    () => {
      if (this.multiple()) {
        return null;
      }
      const currentValue = this.value() as T | null;
      if (currentValue === null) {
        return null;
      }

      return (
        this.allOptions().find((option) =>
          this.compareWith()(option.value, currentValue),
        ) ?? null
      );
    },
  );

  protected readonly displayLabel = computed(
    () => this.selectedOption()?.label ?? '',
  );
  protected readonly hasSingleValue = computed(
    () => this.selectedOption() !== null,
  );

  protected readonly triggerSelection = computed(() =>
    this.multiple() ? this.selectedTags() : this.selectedOption(),
  );

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

      const same = this.compareWith();

      return selectedValues.some((selected) => same(selected, option.value));
    }

    return this.compareWith()(this.value() as T | null, option.value);
  }

  protected optionClass(option: AutocompleteOption<T>): string {
    const parts = ['option'];
    if (this.multiple()) {
      parts.push('multi');
    }
    if (option.disabled) {
      parts.push('is-disabled');
    }
    // The shared panel partial paints the selected row off this class, not off
    // `aria-selected`, so a picker that only set the attribute went unpainted.
    if (this.isSelected(option)) {
      parts.push('is-selected');
    }

    return parts.join(' ');
  }

  /** First option a reader can actually act on — -1 when the list is empty or
   *  every option is disabled. */
  private firstEnabledIndex(): number {
    const index = this.visibleOptions().findIndex((option) => !option.disabled);
    if (index >= 0) {
      return index;
    }

    // With nothing pickable, the create row IS the list, and leaving the cursor at
    // -1 meant Enter fell through allowCreate's primary flow: type a new name, press
    // Enter, nothing happens until an ArrowDown nobody knows to press.
    return this.showCreateRow() ? this.visibleOptions().length : -1;
  }

  /** Arrow keys step OVER a disabled option rather than landing on it — an active
   *  row Enter refuses to act on is a dead end the reader has to guess their way
   *  out of. `step` is +1/-1; the create row (past the last option) is always
   *  reachable. Returns -1 when every option is disabled. */
  private nextEnabledIndex(from: number, step: number, slots: number): number {
    if (!slots) {
      return -1;
    }
    const options = this.visibleOptions();
    for (let hop = 1; hop <= slots; hop++) {
      const candidate = (from + step * hop + slots * hop) % slots;
      const option = options[candidate];
      if (!option || !option.disabled) {
        return candidate;
      }
    }

    return -1;
  }

  /** Flat index of the given option within the visible (filtered) list. */
  protected flatIndexOf(option: AutocompleteOption<T>): number {
    return this.visibleOptions().findIndex((opt) => opt === option);
  }

  constructor() {
    super();
    scrollActiveOptionIntoView(this.activeDescendant, this.scrollActiveIntoView);
  }

  private cursorList() {
    const options = this.visibleOptions();

    return {
      length: options.length,
      isEnabled: (index: number) => !options[index].disabled,
    };
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
          this.nextEnabledIndex(this.activeIndex(), 1, totalSlots),
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.overlayRef) {
          this.openPanel();

          return;
        }
        this.activeIndex.set(
          this.nextEnabledIndex(this.activeIndex(), -1, totalSlots),
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
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(firstEnabledOf(this.cursorList()));
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(lastEnabledOf(this.cursorList()));
        break;
      case 'Escape':
        if (this.overlayRef) {
          event.preventDefault();
          this.close('dismiss');
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
    const { positionStrategy, config: overlayConfig } = dropdownOverlay(
      this.overlay,
      triggerElement,
    );
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
      (target) => this.trigger().nativeElement.contains(target),
      () => this.close('dismiss'),
    );
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    const detaching = this.overlayRef;
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      // A deferred dispose can outlive a re-open, and then this fires for the
      // PREVIOUS panel: clearing state here would strand the live one.
      if (this.overlayRef !== detaching) {
        return;
      }
      this.overlayRef = null;
      this.isOpen.set(false);
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.isOpen.set(true);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    // Here rather than in onPick, which is only half the paths: dismissing after
    // typing over a settled value strands the text the same way. The input
    // collapses to zero width whenever a label is on display, so anything left in
    // `query` goes INVISIBLE while it still narrows the next open. Empty in multi
    // mode, where the input never collapses and the text stays honest.
    if (this.displayLabel()) {
      this.query.set('');
    }
    this.markTouched();
  }

  /**
   * Empties the field — both the selected value and the text the user typed.
   *
   * `value.set(null)` alone is not enough from outside: the typed query is
   * component state with no input bound to it, so the text stays on screen after
   * the value goes. That gap is why a host reaching for "reset after navigating"
   * ends up querying the inner `<input>` and dispatching a synthetic `input`
   * event.
   *
   * Deliberately does NOT move focus — the caller may be navigating away, and
   * stealing focus back into a field they just left is worse than leaving it.
   */
  clear(): void {
    this.value.set(this.multiple() ? [] : null);
    this.query.set('');
    if (this.isOpen()) {
      this.close('dismiss');
    }
  }

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected onFilter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  protected onPick(option: AutocompleteOption<T>): void {
    if (option.disabled) {
      return;
    }
    if (this.multiple()) {
      const current = (this.value() as readonly T[] | null) ?? [];
      const same = this.compareWith();
      const next = current.some((entry) => same(entry, option.value))
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
