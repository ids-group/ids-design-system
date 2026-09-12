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
  clearOnDetach,
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  forwardOverlayTokens,
  dropdownOverlay,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { chipFit } from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import { TagComponent } from '@ids-group-ltd/ids-design-system/components/tag';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  AutocompleteItem,
  AutocompleteOption,
  AutocompleteOptionGroup,
  AutocompleteValueOverflow,
  AutocompleteWidth,
} from './autocomplete.types';
import {
  flattenDsOptions,
  isDsOptionGroup,
} from '@ids-group-ltd/ids-design-system/core';
import {
  firstEnabledIndex as firstEnabledOf,
  lastEnabledIndex as lastEnabledOf,
  nextEnabledIndex,
} from '@ids-group-ltd/ids-design-system/core';
import { scrollActiveOptionIntoView } from '@ids-group-ltd/ids-design-system/components';
import { announceOptionCount } from '@ids-group-ltd/ids-design-system/components';
import { DsOptionTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsChipTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPickerTriggerDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsEmptyTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPanelHeaderTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPanelFooterTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsGroupLabelTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsCreateTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import {
  describedByIds,
  groupInvalid,
  groupMessageId,
  inFieldGroup,
} from '@ids-group-ltd/ids-design-system/components/field-group';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

let nextId = 0;

@Component({
  selector: 'ds-autocomplete',
  standalone: true,
  imports: [
    IconComponent,
    SpinnerComponent,
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

  /** Native `name` attribute forwarded to the trigger. */
  readonly name = input<string | null>(null);
  /** Prevents opening the panel while still allowing focus. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * The contract spelling of `readOnly`, a second input because signal forms binds
   * by NAME — a `readonly()` rule was reaching nothing before this existed.
   */
  readonly readonlyBinding = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  /** Shows a clear affordance once there is something to clear. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Placeholder while the field is being typed in, when a value is already
   *  settled — `placeholder` is the empty-field caption and cannot be both.
   *  Empty (the default) keeps `placeholder` doing both jobs, as before. */
  readonly searchPlaceholder = input<string>('');

  /** How the typed query narrows the list.
   *
   *  The default matches a case-insensitive substring of `label`. Pass a predicate
   *  to match on anything else — a second field, ignoring diacritics, a fuzzy score.
   *  Pass `'none'` when the list arrives already filtered, which is what a
   *  server-side search needs: the query is reported through `filterChange` and
   *  every option given is rendered.
   */
  readonly filterWith = input<
    ((option: AutocompleteOption<T>, query: string) => boolean) | 'none'
  >((option, query) => option.label.toLowerCase().includes(query));
  /** The query the user typed, on every change. The input for a server-side search;
   *  pair it with `filterWith="none"` so the list is not narrowed twice. */
  readonly filterChange = output<string>();
  /** Options are still being fetched. The panel shows a spinner instead of the
   *  empty row — which would otherwise claim there are no matches — and the list
   *  reports `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** The panel opened. The moment to fetch options for a picker whose list is
   *  loaded on demand. */
  readonly opened = output<void>();
  /** The panel closed, for any reason — a pick, Escape, an outside click, a scroll. */
  readonly closed = output<void>();
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
    disabled: () => this.isDisabled(),
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
  protected readonly groupMessage = groupMessageId();
  protected readonly describedByIds = describedByIds;
  protected readonly invalidResolved = groupInvalid(this.fieldMessage.invalid);

  protected readonly optionTemplate = contentChild(DsOptionTemplateDirective, {
    read: TemplateRef,
  });
  protected readonly chipTemplate = contentChild(DsChipTemplateDirective, {
    read: TemplateRef,
  });
  protected readonly pickerTrigger = contentChild(DsPickerTriggerDirective, {
    read: TemplateRef,
  });
  protected readonly panelHeaderTemplate = contentChild(
    DsPanelHeaderTemplateDirective,
    { read: TemplateRef },
  );
  protected readonly panelFooterTemplate = contentChild(
    DsPanelFooterTemplateDirective,
    { read: TemplateRef },
  );
  protected readonly groupLabelTemplate = contentChild(
    DsGroupLabelTemplateDirective,
    { read: TemplateRef },
  );
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
    const filter = this.filterWith();
    const matches = (option: AutocompleteOption<T>): boolean =>
      !query || filter === 'none' || filter(option, query);

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
  /** True for a number as well as `'fit'`: a number is a ceiling, not a promise,
   *  so the row still measures. */
  protected readonly fitsChipsToWidth = computed(() => !this.showsEveryChip());
  /** How many chips the row is ASKED to render before measuring. It has to be the
   *  ceiling and not the selection: the measurement caches chip widths from a
   *  render that holds them all, so with a numeric cap that render never happens,
   *  the cache never fills, and the fit silently falls back to showing them all. */
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
      return this.searchPlaceholder();
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

  /** -1 when nothing is pickable and there is no create row to fall back on. */
  private firstEnabledIndex(): number {
    const index = this.visibleOptions().findIndex((option) => !option.disabled);
    if (index >= 0) {
      return index;
    }

    // With nothing pickable the create row IS the list; a -1 cursor would leave
    // Enter doing nothing after typing a new name, until an ArrowDown nobody knows
    // to press.
    return this.showCreateRow() ? this.visibleOptions().length : -1;
  }

  /** Steps OVER a disabled option rather than landing on it. `step` is +1/-1; the
   *  create row (past the last option) is always reachable, and -1 comes back when
   *  every option is disabled. */
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

  protected flatIndexOf(option: AutocompleteOption<T>): number {
    return this.visibleOptions().findIndex((opt) => opt === option);
  }

  constructor() {
    super();
    scrollActiveOptionIntoView(
      this.activeDescendant,
      this.scrollActiveIntoView,
      this.cursorFromKeyboard,
    );
    announceOptionCount(
      computed(() => this.filteredOptions().length),
      this.isOpen,
    );
  }

  private setOpen(next: boolean): void {
    if (this.isOpen() === next) {
      return;
    }
    this.isOpen.set(next);
    (next ? this.opened : this.closed).emit();
  }

  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );

  protected readonly cursorFromKeyboard = signal(false);

  /** How far PageUp and PageDown move. Ten rows is the native `<select>` step and
   *  the APG listbox example's — a fixed number rather than a measured screenful,
   *  so the jump is the same wherever the panel happens to be clipped. */
  private static readonly pageStep = 10;

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
    this.cursorFromKeyboard.set(true);
    if (this.isDisabled()) {
      return;
    }
    const visibleCount = this.visibleOptions().length;
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
      case 'PageDown':
        event.preventDefault();
        this.activeIndex.set(
          nextEnabledIndex(
            this.cursorList(),
            this.activeIndex(),
            AutocompleteComponent.pageStep,
          ),
        );
        break;
      case 'PageUp':
        event.preventDefault();
        this.activeIndex.set(
          nextEnabledIndex(
            this.cursorList(),
            this.activeIndex(),
            -AutocompleteComponent.pageStep,
          ),
        );
        break;
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
    if (this.isReadOnly()) {
      return;
    }
    if (this.overlayRef) {
      return;
    }
    const triggerElement = this.trigger().nativeElement;
    const { positionStrategy, config: overlayConfig } = dropdownOverlay(
      this.overlay,
      triggerElement,
    );
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
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    clearOnDetach(this.overlayRef, {
      current: () => this.overlayRef,
      always: removeScrollClose,
      clear: () => {
        this.overlayRef = null;
        this.setOpen(false);
      },
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.setOpen(true);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.setOpen(false);
    this.activeIndex.set(-1);
    // The input collapses to zero width whenever a label is on display, so
    // anything left in `query` goes INVISIBLE while it still narrows the next
    // open. Never in multi mode, where the input keeps its width and the text
    // stays honest.
    if (this.displayLabel()) {
      this.query.set('');
    }
    this.markTouched();
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.clear();
    this.markTouched();
  }

  /**
   * Empties the field — both the selected value and the text the user typed.
   *
   * `value.set(null)` alone is not enough from outside: the typed query is
   * component state with no input bound to it, so the text stays on screen after
   * the value goes.
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
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected onFilter(event: Event): void {
    const typed = (event.target as HTMLInputElement).value;
    this.query.set(typed);
    this.filterChange.emit(typed);
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
