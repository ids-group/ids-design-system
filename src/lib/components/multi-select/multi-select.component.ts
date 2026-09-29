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
  output,
  model,
  numberAttribute,
  signal,
  contentChild,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { chipFit } from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import { TagComponent } from '@ids-group-ltd/ids-design-system/components/tag';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import {
  clearOnDetach,
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  focusIsInside,
  forwardOverlayTokens,
  dropdownOverlay,
  panelClassesOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import {
  DS_INTL,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { DsOptionTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsChipTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPickerTriggerDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsEmptyTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPanelHeaderTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsPanelFooterTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { DsGroupLabelTemplateDirective } from '@ids-group-ltd/ids-design-system/components';
import { BadgeComponent } from '@ids-group-ltd/ids-design-system/components/badge';
import type { DsTriggerDisplay } from '@ids-group-ltd/ids-design-system/core';
import type {
  MultiSelectItem,
  MultiSelectOption,
  MultiSelectOptionGroup,
  MultiSelectWidth,
} from './multi-select.types';
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
import { createTypeAhead } from '@ids-group-ltd/ids-design-system/components';

@Component({
  selector: 'ds-multi-select',
  standalone: true,
  imports: [
    IconComponent,
    SpinnerComponent,
    TagComponent,
    BadgeComponent,
    FieldMessageComponent,
    NgTemplateOutlet,
    TooltipDirective,
  ],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.content-width]': "width() === 'content'",
    '[class.compact-trigger]': 'showsCompactTrigger()',
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
  protected readonly intl = inject(DS_INTL);
  /** Forwarded onto the portaled pane on open so consumer `--ds-multi-select-panel-*` overrides reach it. */
  private readonly panelTokens = [
    '--ds-multi-select-panel-bg-color',
    '--ds-multi-select-option-bg-color-active',
    '--ds-multi-select-check-bg-color',
    '--ds-dropdown-panel-bg-color',
    '--ds-dropdown-panel-min-width',
    '--ds-dropdown-panel-max-width',
    '--ds-option-selected-bg-color',
    '--ds-option-selected-label-color',
    '--ds-option-selected-bg-color-hover',
    '--ds-option-check-color',
  ];

  /** Selected values, two-way bound. */
  readonly value = model<string[]>([]);
  /** Options, groups, or both mixed - rendered in the order given. */
  readonly options = input<readonly MultiSelectItem[]>([]);
  /** Placeholder shown in the trigger when nothing is selected.
   *  Unset falls back to `DS_INTL.picker.placeholder`. */
  readonly placeholder = input<string | null>(null);
  readonly placeholderResolved = computed(
    () => this.placeholder() ?? this.intl().picker.placeholder,
  );
  /** Placeholder for the in-panel filter input.
   *  Unset falls back to `DS_INTL.picker.filterPlaceholder`. */
  readonly searchPlaceholder = input<string | null>(null);
  readonly searchPlaceholderResolved = computed(
    () => this.searchPlaceholder() ?? this.intl().picker.filterPlaceholder,
  );
  /** Whether the panel carries a filter row. `true` always, `false` never, a NUMBER is a threshold (row appears at that many options).
   *  Unset falls back to `DS_CONFIG.picker.searchable`, then `true`. Hiding it moves the keyboard model (arrows, Enter, Escape,
   *  `aria-activedescendant`) onto the trigger. */
  readonly searchable = input<boolean | number | null, unknown>(null, {
    transform: (raw: unknown) => {
      if (raw === null || raw === undefined) {
        return null;
      }
      // A bare attribute arrives as '' and must beat the config default, which treating it as "unset" would not.
      if (raw === '') {
        return true;
      }
      if (typeof raw === 'number') {
        return raw;
      }
      if (typeof raw === 'boolean') {
        return raw;
      }
      const asNumber = Number(raw);

      return Number.isFinite(asNumber) ? asNumber : raw !== 'false';
    },
  });
  readonly searchableResolved = resolveWithConfig<boolean | number>(
    this.searchable,
    (config) => config.picker?.searchable,
    true,
  );
  /** Native `name` attribute forwarded to the trigger. */
  readonly name = input<string | null>(null);
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`, `ds-overlay-pane` and `ds-multi-select-panel`.
   *  The panel is portaled out of the host, so a class on the pane is the only way a consumer stylesheet reaches ONE instance. */
  readonly panelClass = input<string | readonly string[]>([]);
  /** Prevents opening the panel while still allowing focus. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonly readonlyBinding = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  /** Shows a clear affordance once there is something to clear. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** How the typed query narrows the list. Default: case-insensitive substring of `label`. Pass a predicate to match on anything else.
   *  Pass `'none'` when the list arrives already filtered (server-side search): the query is reported through `filterChange`
   *  and every option given is rendered. */
  readonly filterWith = input<
    ((option: MultiSelectOption, query: string) => boolean) | 'none'
  >((option, query) => option.label.toLowerCase().includes(query));
  /** The query the user typed, on every change. The input for a server-side search;
   *  pair it with `filterWith="none"` so the list is not narrowed twice. */
  readonly filterChange = output<string>();
  /** Options are still being fetched. The panel shows a spinner instead of the
   *  empty row - which would otherwise claim there are no matches - and the list
   *  reports `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** The panel opened. The moment to fetch options for a picker whose list is
   *  loaded on demand. */
  readonly opened = output<void>();
  /** The panel closed, for any reason - a pick, Escape, an outside click, a scroll. */
  readonly closed = output<void>();
  /** Scrolls the keyboard cursor's row into view. On by default: a list longer
   *  than the panel otherwise walks the cursor out of sight. Set `false` only if
   *  you are driving the scroll position yourself. */
  readonly scrollActiveIntoView = input(true, { transform: booleanAttribute });
  /** Chip collapse when they outgrow one line. `"fit"` (default) measures and shows as many as fit, the rest behind "+N more".
   *  A number is a ceiling, not a promise: the row still measures, so narrow triggers show fewer. `"all"` shows every chip
   *  and lets the trigger grow a line per selection. Unset (`null`) resolves to `"fit"`, not `"all"`. */
  readonly maxVisibleChips = input<number | 'fit' | 'all' | null>(null, {
    transform: (raw: unknown) => {
      if (raw === 'fit' || raw === 'all') {
        return raw;
      }

      return raw == null ? null : numberAttribute(raw);
    },
  });
  /** Disables the trigger and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Confirmation text, shown when there is no error or warning. It paints the success border: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Accessible name for the trigger - falls back to `placeholder`. */
  readonly ariaLabel = input<string | null>(null);
  /** Trigger width - `fill` stretches to the container and pins the panel to the
   *  trigger's width; `content` hugs the trigger's own content and takes that width
   *  as the panel's FLOOR, so a compact trigger does not force an unreadable panel. */
  readonly width = input<MultiSelectWidth>('fill');
  /** Trigger height - sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** What the trigger shows. `count` is a caption plus a selected-count badge at
   *  intrinsic width; `labels` names the selection instead, cut to the width with the
   *  rest behind "+N". A projected `dsPickerTrigger` template WINS over this - the
   *  input is then not read at all. */
  readonly triggerDisplay = input<DsTriggerDisplay>('full');
  /** Field label above the control, and the caption a `count`/`labels` trigger uses when it needs one. */
  readonly label = input<string>('');
  /** Marks the field required: a `*` beside the label and `aria-required` on the trigger. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Marks the field optional in words, for a form where most fields are required. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Where a "select all" row appears. `false` nowhere, `true` one row over the whole
   *  panel, `'group'` one row per group, `'both'` for either. Group rows need groups
   *  in `options` - with a flat list they have nothing to head. */
  readonly selectAll = input<boolean | 'group' | 'both', unknown>(false, {
    transform: (raw: unknown) =>
      raw === 'group' || raw === 'both' ? raw : booleanAttribute(raw),
  });

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

  protected readonly uid = nextControlId('ds-multi-select');
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly labelId = `${this.uid}-label`;
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
    // Host torn down while open never runs close(): dispose the overlay so its pane and subscriptions do not leak.
    clearTimeout(this.focusTimer ?? undefined);
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly showsCompactTrigger = computed(
    () => !this.pickerTrigger() && this.triggerDisplay() !== 'full',
  );

  protected readonly showsSearch = computed<boolean>(() => {
    const setting = this.searchableResolved();

    return typeof setting === 'number'
      ? this.allOptions().length >= setting
      : setting;
  });

  protected readonly triggerActiveDescendant = computed(() =>
    this.showsSearch() ? null : this.activeDescendant(),
  );

  protected readonly triggerCaption = computed(
    () => this.label() || this.ariaLabel() || this.placeholderResolved(),
  );

  protected readonly allOptions = computed<MultiSelectOption[]>(() =>
    flattenDsOptions(this.options()),
  );

  protected readonly selectedOptions = computed<MultiSelectOption[]>(() => {
    const selected = this.value();

    return this.allOptions().filter((option) =>
      selected.includes(option.value),
    );
  });

  private readonly chipsMode = computed(() => this.maxVisibleChips() ?? 'fit');
  private readonly showsEveryChip = computed(() => this.chipsMode() === 'all');
  protected readonly fitsChipsToWidth = computed(() => !this.showsEveryChip());
  /** Chips rendered before measuring: everything for `'fit'`, the ceiling for a number. Never the selection: the width cache only fills from a render holding every chip. */
  private readonly chipBudget = computed(() => {
    const max = this.chipsMode();
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

    return this.showsEveryChip()
      ? selected
      : selected.slice(0, this.chipsThatFit());
  });

  protected readonly overflowCount = computed<number>(
    () => this.selectedOptions().length - this.visibleChips().length,
  );

  protected readonly filteredItems = computed<MultiSelectItem[]>(() => {
    const query = this.filter().trim().toLowerCase();
    const filter = this.filterWith();
    const matches = (option: MultiSelectOption): boolean =>
      !query || filter === 'none' || filter(option, query);

    const kept: MultiSelectItem[] = [];
    for (const item of this.options()) {
      if (!isDsOptionGroup(item)) {
        if (matches(item)) {
          kept.push(item);
        }
        continue;
      }
      // A disabled group must disable its options here: the template renders these objects, not the flattened list.
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

  protected readonly filteredOptions = computed<MultiSelectOption[]>(() =>
    flattenDsOptions(this.filteredItems()),
  );

  protected isGroup(item: MultiSelectItem): item is MultiSelectOptionGroup {
    return isDsOptionGroup(item);
  }

  /** Position in the flat visible list: the id `aria-activedescendant` points at, which a grouped render cannot get from the loop index. */
  protected flatIndexOf(option: MultiSelectOption): number {
    return this.filteredOptions().indexOf(option);
  }

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 ? this.optionId(index) : null;
  });

  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() || this.placeholderResolved(),
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
  protected readonly invalidResolved = this.fieldMessage.invalid;

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

  protected readonly showsPanelSelectAll = computed(() => {
    const setting = this.selectAll();

    return setting === true || setting === 'both';
  });

  protected readonly showsGroupSelectAll = computed(() => {
    const setting = this.selectAll();

    return setting === 'group' || setting === 'both';
  });

  private enabledIn(group: MultiSelectOptionGroup): MultiSelectOption[] {
    return group.options.filter((option) => !option.disabled);
  }

  protected groupAllSelected(group: MultiSelectOptionGroup): boolean {
    const enabled = this.enabledIn(group);
    const selected = this.value();

    return (
      enabled.length > 0 && enabled.every((o) => selected.includes(o.value))
    );
  }

  protected groupSomeSelected(group: MultiSelectOptionGroup): boolean {
    const selected = this.value();

    return (
      this.enabledIn(group).some((o) => selected.includes(o.value)) &&
      !this.groupAllSelected(group)
    );
  }

  protected toggleGroup(group: MultiSelectOptionGroup): void {
    const values = this.enabledIn(group).map((o) => o.value);
    if (this.groupAllSelected(group)) {
      const remove = new Set(values);

      this.value.set(this.value().filter((value) => !remove.has(value)));

      return;
    }
    const next = new Set(this.value());
    values.forEach((value) => next.add(value));
    this.value.set([...next]);
  }

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

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.clear();
    this.markTouched();
    // The button that ran this is destroyed with the chips; focus would fall to <body>.
    this.trigger().nativeElement.focus();
  }

  /**
   * Empties the selection from outside (a "reset filters" button). Does NOT move focus: the caller may be navigating away.
   */
  clear(): void {
    this.value.set([]);
    this.filter.set('');
    if (this.open()) {
      this.close('dismiss');
    }
  }

  protected removeValue(value: string): void {
    this.value.set(this.value().filter((entry) => entry !== value));
    // The close button that ran this is destroyed with its chip; focus would fall to <body>.
    this.trigger().nativeElement.focus();
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
      computed(() => this.open() && this.showsSearch()),
    );
  }

  protected onFilter(event: Event): void {
    const typed = (event.target as HTMLInputElement).value;
    this.filter.set(typed);
    this.filterChange.emit(typed);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  private setOpen(next: boolean): void {
    if (this.open() === next) {
      return;
    }
    this.open.set(next);
    (next ? this.opened : this.closed).emit();
  }

  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );

  private readonly typeAhead = createTypeAhead();

  private handleTypeAhead(key: string): boolean {
    const index = this.typeAhead.match(
      key,
      this.filteredOptions().map((option) => option.label),
      this.activeIndex(),
    );
    if (index < 0) {
      return false;
    }
    this.activeIndex.set(index);

    return true;
  }

  protected readonly cursorFromKeyboard = signal(false);

  private cursorList() {
    const options = this.filteredOptions();

    return {
      length: options.length,
      isEnabled: (index: number) => !options[index].disabled,
    };
  }

  private firstEnabledIndex(): number {
    return firstEnabledOf(this.cursorList());
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    this.cursorFromKeyboard.set(true);
    if (this.isDisabled()) {
      return;
    }
    // With no filter row the trigger runs the input's handler and must take Enter first, or Enter toggles the panel instead of picking the active row.
    if (this.open() && !this.showsSearch()) {
      this.onSearchKeydown(event);

      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onTriggerClick();

      return;
    }
    if (event.key === 'ArrowDown' && !this.open()) {
      event.preventDefault();
      this.openPanel();

      return;
    }
    if (!this.open() && this.handleTypeAhead(event.key)) {
      event.preventDefault();
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    this.cursorFromKeyboard.set(true);
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
      case 'PageDown':
        event.preventDefault();
        this.moveActive(MultiSelectComponent.pageStep);
        break;
      case 'PageUp':
        event.preventDefault();
        this.moveActive(-MultiSelectComponent.pageStep);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(lastEnabledOf(this.cursorList()));
        break;
      case 'Tab':
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
    if (this.overlayRef || this.isDisabled() || this.isReadOnly()) {
      return;
    }
    const triggerElement = this.trigger().nativeElement;
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      triggerElement,
      ['ds-multi-select-panel', ...panelClassesOf(this.panelClass())],
    );
    const triggerWidth = triggerElement.getBoundingClientRect().width;
    // A compact trigger hugs its caption, which would make the panel too narrow to read: the trigger width is a FLOOR here even without `content`.
    if (this.width() === 'content' || this.showsCompactTrigger()) {
      config.minWidth = triggerWidth;
    } else {
      config.width = triggerWidth;
    }
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
      (target) => this.trigger().nativeElement.contains(target),
      () => this.close('dismiss'),
    );
    // No backdrop catches a page scroll and CDK scroll strategies miss a plain overflow container, so close on any outside scroll ourselves.
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
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close('dismiss');
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.setOpen(true);
    this.activeIndex.set(this.firstEnabledIndex());
    if (this.showsSearch()) {
      this.focusTimer = setTimeout(() => {
        this.focusTimer = null;
        this.searchInput()?.nativeElement.focus();
      });
    }
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
    this.setOpen(false);
    this.filter.set('');
    this.activeIndex.set(-1);
    this.markTouched();
    if (focusWasInPanel) {
      this.trigger().nativeElement.focus({ preventScroll: true });
    }
  }

  /** PageUp/PageDown step: the native `<select>` and APG listbox value, fixed so it does not depend on how the panel is clipped. */
  private static readonly pageStep = 10;

  private moveActive(delta: number): void {
    const next = nextEnabledIndex(this.cursorList(), this.activeIndex(), delta);
    if (next >= 0) {
      this.activeIndex.set(next);
    }
  }
}
