import {
  Component,
  ElementRef,
  Injector,
  type OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
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
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { CalendarDayComponent } from '@ids-group-ltd/ids-design-system/components/calendar-day';
import {
  DsControlValueAccessor,
  DsStaticPreview,
} from '@ids-group-ltd/ids-design-system/components';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
  type DsFieldError,
} from '@ids-group-ltd/ids-design-system/components';
import {
  DS_CONFIG,
  DS_INTL,
  injectDsLocale,
} from '@ids-group-ltd/ids-design-system/core';
import {
  type DateFormatSpec,
  type DisplayPart,
  type FieldLayout,
  caretToSlot,
  displayParts,
  editBackspace,
  editDelete,
  editType,
  formatDate,
  formatRange,
  fullDateLabel,
  localeFirstDayOfWeek,
  monthLabels,
  parseDate,
  parseDateRange,
  parseFieldText,
  rangeFieldLayout,
  rangeMask,
  renderFieldValue,
  resolveDateFormat,
  singleFieldLayout,
  slotToCaret,
  weekdayLabels,
} from './date.util';
import type {
  DatePickerMode,
  DatePickerPreset,
  DateRangeValue,
} from './date-picker.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import {
  describedByIds,
  groupInvalid,
  groupMessageId,
  inFieldGroup,
} from '@ids-group-ltd/ids-design-system/components/field-group';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

let nextId = 0;
const YEAR_PAGE_SIZE = 12;

interface DayCell {
  date: Date;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  inRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'ds-date-picker',
  standalone: true,
  imports: [
    IconComponent,
    CalendarDayComponent,
    FieldMessageComponent,
    FieldStatusComponent,
    A11yModule,
    NgTemplateOutlet,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.in-group]': 'inGroup',
    '[class.full-width]': 'fullWidth()',
  },
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class DatePickerComponent
  extends DsControlValueAccessor<Date | DateRangeValue | null>
  implements OnDestroy
{
  protected readonly inGroup = inFieldGroup();
  protected readonly preview = inject(DsStaticPreview);

  constructor() {
    super();
    effect(() => {
      if (!this.preview.staticPreview()) {
        return;
      }
      const focus = this.clampToBounds(
        this.selectedAnchorDate() ?? this.defaultDate() ?? new Date(),
      );
      this.gridFocus.set(focus);
      this.viewMonth.set(new Date(focus.getFullYear(), focus.getMonth(), 1));
    });
    effect(() => {
      const spec = this.formatSpec();
      const value = this.value();
      const layout = this.layout();
      if (this.editing) {
        return;
      }
      // Reaching here means the value did not come from the keyboard, so a leftover typing error is stale.
      this.typedInvalid.set(false);
      this.rangeInvalid.set(false);
      if (this.mode() === 'single') {
        const date = value as Date | null;
        this.inputText.set(date ? formatDate(date, spec) : '');

        return;
      }
      const single = singleFieldLayout(spec);
      const [start, end] = (value as DateRangeValue | null) ?? [null, null];
      const startSegments = start
        ? parseFieldText(formatDate(start, spec), single)
        : single.slots.map(() => '');
      const endSegments = end
        ? parseFieldText(formatDate(end, spec), single)
        : single.slots.map(() => '');
      this.rangeText.set(
        this.toFieldText([...startSegments, ...endSegments], layout),
      );
    });
  }

  /** Field text for the DOM: fixed-width `_`-padded once any digit exists, else '' so an untouched field is empty (no blur error, nothing for AT to read). */
  private toFieldText(segments: string[], layout: FieldLayout): string {
    return segments.some((segment) => segment.length > 0)
      ? renderFieldValue(segments, layout)
      : '';
  }

  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly config = inject(DS_CONFIG);
  private readonly appLocale = injectDsLocale();
  protected readonly intl = inject(DS_INTL);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly panelTokens = [
    '--ds-date-picker-bg-color',
    '--ds-date-picker-border',
    '--ds-date-picker-shadow',
    '--ds-date-picker-focus-shadow',
    '--ds-date-picker-day-hover-bg-color',
    '--ds-date-picker-day-today-label-color',
    '--ds-date-picker-day-selected-bg-color',
    '--ds-date-picker-day-selected-bg-color-hover',
    '--ds-date-picker-day-selected-label-color',
    '--ds-date-picker-day-range-bg-color',
    '--ds-date-picker-day-range-label-color',
    '--ds-date-picker-day-disabled-label-color',
    '--ds-date-picker-day-label-color',
    '--ds-date-picker-day-muted-label-color',
    '--ds-date-picker-weekday-color',
    '--ds-date-picker-header-label-color',
    '--ds-date-picker-nav-icon-color',
    '--ds-date-picker-width',
    '--ds-date-picker-panel-radius',
  ];

  /** Selection mode - single date or start/end range. */
  readonly mode = input<DatePickerMode>('single');
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Stretches the trigger to fill its container instead of hugging the mask width. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Selected date (single) or `[start, end]` (range), two-way bound. */
  readonly value = model<Date | DateRangeValue | null>(null);
  /** Accessible-name fallback only; the mask fills the visible placeholder. Falls back to `DS_INTL.datePicker.placeholder`. */
  readonly placeholder = input<string | null>(null);
  readonly placeholderResolved = computed(
    () => this.placeholder() ?? this.intl().datePicker.placeholder,
  );
  /** Field label shown above the trigger. */
  readonly label = input<string>('');
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker beside the label - ignored when `required` is set. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Extra classes for the portaled panel, the only way to style one instance of it. */
  readonly panelClass = input<string | readonly string[]>([]);
  /** Disables the picker and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Lower bound for the year dropdown in the calendar header. */
  readonly minYear = input<number>(new Date().getFullYear() - 100);
  /** Upper bound for the year dropdown in the calendar header. */
  readonly maxYear = input<number>(new Date().getFullYear() + 10);
  /** Earliest selectable date (inclusive). Days before this are disabled. */
  readonly minDate = input<Date | null>(null);
  /** Latest selectable date (inclusive). Days after this are disabled. */
  readonly maxDate = input<Date | null>(null);
  /** Predicate - return true to disable an individual day. */
  readonly disabledDate = input<((date: Date) => boolean) | null>(null);
  /** Quick-pick shortcuts shown as a button column inside the calendar panel. */
  readonly presets = input<readonly DatePickerPreset[]>([]);
  /** BCP-47 locale for names and value format; falls back to `DS_CONFIG.datePicker.locale`, `DS_CONFIG.locale`, then `LOCALE_ID`. */
  readonly locale = input<string | null>(null);
  /** Explicit token format e.g. `'MM/DD/YYYY'`; default derived from `locale`. */
  readonly dateFormat = input<string | null>(null);
  /** First weekday column: 0=Sunday … 6=Saturday. Falls back to `DS_CONFIG.datePicker.firstDayOfWeek`, then the resolved `locale`'s week, then 1 (Monday). */
  readonly firstDayOfWeek = input<number | null>(null);
  /** Date the calendar opens on when the value is empty; never written to `value`. */
  readonly defaultDate = input<Date | null>(null);
  /** Allow masked manual typing; when false a date can only be picked from the calendar. */
  readonly allowInput = input(true, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.message().text || this.changedShown() ? `${this.uid}-hint` : null,
  );
  // An unparseable date is the picker's OWN error: it waits for the submit like a form error.
  private readonly parseErrors = computed<readonly DsFieldError[]>(() => {
    if (!this.typedInvalid() && !this.rangeInvalid()) {
      return [];
    }
    const mask =
      this.mode() === 'single'
        ? this.formatSpec().mask
        : rangeMask(this.formatSpec());

    return [
      { kind: 'date', message: this.intl().datePicker.invalidDate(mask) },
    ];
  });
  private readonly fieldMessage = resolveFieldMessage({
    pending: this.pending,
    dirty: this.dirty,
    showDirty: this.showDirtyResolved,
    disabled: () => this.isDisabled(),
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    ownErrors: this.parseErrors,
    invalid: this.invalid,
    success: this.success,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly groupMessage = groupMessageId();
  protected readonly describedByIds = describedByIds;
  protected readonly invalidResolved = groupInvalid(this.fieldMessage.invalid);

  readonly resolvedLocale = computed(
    () => this.locale() ?? this.config.datePicker?.locale ?? this.appLocale,
  );
  protected readonly resolvedFirstDay = computed(
    () =>
      this.firstDayOfWeek() ??
      this.config.datePicker?.firstDayOfWeek ??
      localeFirstDayOfWeek(this.resolvedLocale()) ??
      1,
  );
  protected readonly formatSpec = computed<DateFormatSpec>(() =>
    resolveDateFormat(
      this.resolvedLocale(),
      this.dateFormat() ?? this.config.datePicker?.dateFormat,
    ),
  );
  protected readonly layout = computed<FieldLayout>(() =>
    this.mode() === 'range'
      ? rangeFieldLayout(this.formatSpec())
      : singleFieldLayout(this.formatSpec()),
  );
  protected readonly monthNames = computed(() =>
    monthLabels(this.resolvedLocale()),
  );
  protected readonly weekdays = computed(() =>
    weekdayLabels(this.resolvedLocale(), this.resolvedFirstDay()),
  );
  protected readonly weekdaysFull = computed(() =>
    weekdayLabels(this.resolvedLocale(), this.resolvedFirstDay(), 'long'),
  );
  protected readonly monthYearLabel = computed(
    () => `${this.monthNames()[this.viewMonthIndex()]} ${this.viewYear()}`,
  );

  protected readonly uid = `ds-datepicker-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly panelId = `${this.uid}-panel`;
  protected readonly captionId = `${this.uid}-caption`;
  protected readonly isOpen = signal(false);
  protected readonly gridFocus = signal<Date | null>(null);
  protected readonly inputText = signal<string>('');
  protected readonly rangeText = signal<string>('');
  protected readonly typedInvalid = signal(false);
  protected readonly rangeInvalid = signal(false);
  // Guards the value→text sync from clobbering the field mid-keystroke.
  private editing = false;
  protected readonly resolvedAriaLabel = computed(() =>
    this.label()
      ? null
      : this.ariaLabel() || this.placeholderResolved() || null,
  );

  protected dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  protected isFocusDay(cell: DayCell): boolean {
    const f = this.gridFocus();

    return !!f && this.dayKey(f) === this.dayKey(cell.date);
  }

  protected onGridKeydown(event: KeyboardEvent, cell: DayCell): void {
    if (this.isDisabled()) {
      return;
    }
    const f = this.gridFocus() ?? cell.date;
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = this.addDays(f, -1);
        break;
      case 'ArrowRight':
        next = this.addDays(f, 1);
        break;
      case 'ArrowUp':
        next = this.addDays(f, -7);
        break;
      case 'ArrowDown':
        next = this.addDays(f, 7);
        break;
      case 'Home':
        next = this.addDays(
          f,
          -((f.getDay() - this.resolvedFirstDay() + 7) % 7),
        );
        break;
      case 'End':
        next = this.addDays(
          f,
          6 - ((f.getDay() - this.resolvedFirstDay() + 7) % 7),
        );
        break;
      case 'PageUp':
        next = this.addMonths(f, -1);
        break;
      case 'PageDown':
        next = this.addMonths(f, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDay(cell);

        return;
      default:
        return;
    }
    event.preventDefault();
    this.gridFocus.set(next);
    this.viewMonth.set(new Date(next.getFullYear(), next.getMonth(), 1));
    afterNextRender(() => this.focusGridDay(), { injector: this.injector });
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);

    return d;
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);

    return d;
  }

  private clampToBounds(date: Date): Date {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && date < min) {
      return new Date(min);
    }
    if (max && date > max) {
      return new Date(max);
    }

    return date;
  }

  private focusGridDay(): void {
    const f = this.gridFocus();
    if (!f || !this.overlayRef) {
      return;
    }
    const element = this.overlayRef.overlayElement.querySelector(
      `[data-day="${this.dayKey(f)}"]`,
    ) as HTMLElement | null;
    element?.focus();
  }

  protected dayLabel(cell: DayCell): string {
    return fullDateLabel(cell.date, this.resolvedLocale());
  }

  protected readonly triggerClasses = computed(() => {
    const parts = ['trigger'];
    const size = this.sizeResolved();
    if (size !== 'md') {
      parts.push(size);
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.invalidResolved()) {
      parts.push('error');
    }
    // Not :focus-within: opening from the calendar glyph moves focus into the day grid, and the trigger must stay active while it owns an open panel.
    if (this.isOpen() || this.preview.staticPreview()) {
      parts.push('open');
    }

    return parts.join(' ');
  });

  protected readonly viewMonth = signal<Date>(new Date());
  protected readonly anchor =
    viewChild.required<ElementRef<HTMLElement>>('anchor');
  protected readonly inputEl =
    viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  private focusTrigger(): void {
    this.inputEl().nativeElement.focus();
  }

  protected readonly fieldText = computed(() =>
    this.mode() === 'single' ? this.inputText() : this.rangeText(),
  );
  protected readonly fieldPlaceholder = computed(() =>
    this.mode() === 'single'
      ? this.formatSpec().mask
      : rangeMask(this.formatSpec()),
  );
  /** `size` attribute so the field hugs its mask width; +1 covers `size` under-counting wide glyphs (M/D/Y). */
  protected readonly fieldSize = computed(
    () => this.fieldPlaceholder().length + 1,
  );
  protected readonly displaySlots = computed<DisplayPart[]>(() =>
    displayParts(
      parseFieldText(this.fieldText(), this.layout()),
      this.layout(),
    ),
  );

  protected readonly monthMenuOpen = signal(false);
  protected readonly yearMenuOpen = signal(false);
  protected readonly viewMonthIndex = computed(() =>
    this.viewMonth().getMonth(),
  );
  protected readonly viewYear = computed(() => this.viewMonth().getFullYear());

  protected readonly yearPageStart = signal<number>(0);

  protected readonly yearsOnPage = computed<number[]>(() => {
    const start = this.yearPageStart();
    const max = this.maxYear();
    const list: number[] = [];
    for (
      let year = start;
      year < start + YEAR_PAGE_SIZE && year <= max;
      year++
    ) {
      list.push(year);
    }

    return list;
  });

  protected readonly yearRangeLabel = computed(() => {
    const page = this.yearsOnPage();

    return page.length ? `${page[0]} – ${page[page.length - 1]}` : '';
  });

  protected readonly canPrevYearPage = computed(
    () => this.yearPageStart() > this.minYear(),
  );
  protected readonly canNextYearPage = computed(
    () => this.yearPageStart() + YEAR_PAGE_SIZE <= this.maxYear(),
  );

  private yearPageStartFor(year: number): number {
    const min = this.minYear();

    return min + Math.floor((year - min) / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;
  }

  protected toggleMonthMenu(event: Event): void {
    event.stopPropagation();
    this.yearMenuOpen.set(false);
    this.monthMenuOpen.update((open) => !open);
  }

  protected toggleYearMenu(event: Event): void {
    event.stopPropagation();
    this.monthMenuOpen.set(false);
    this.yearMenuOpen.update((open) => !open);
    if (this.yearMenuOpen()) {
      this.yearPageStart.set(this.yearPageStartFor(this.viewYear()));
    }
  }

  protected prevYearPage(event: Event): void {
    event.stopPropagation();
    this.yearPageStart.update((start) =>
      Math.max(this.minYear(), start - YEAR_PAGE_SIZE),
    );
  }

  protected nextYearPage(event: Event): void {
    event.stopPropagation();
    this.yearPageStart.update((start) => start + YEAR_PAGE_SIZE);
  }

  protected closeMenus(): void {
    this.monthMenuOpen.set(false);
    this.yearMenuOpen.set(false);
  }

  protected selectMonth(index: number, event: Event): void {
    event.stopPropagation();
    this.viewMonth.set(new Date(this.viewYear(), index, 1));
    this.monthMenuOpen.set(false);
  }

  protected selectYear(year: number, event: Event): void {
    event.stopPropagation();
    this.viewMonth.set(new Date(year, this.viewMonthIndex(), 1));
    this.yearMenuOpen.set(false);
  }

  protected isDayDisabled(date: Date): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    const predicate = this.disabledDate();
    if (min) {
      const minStart = new Date(
        min.getFullYear(),
        min.getMonth(),
        min.getDate(),
      );
      if (date < minStart) {
        return true;
      }
    }
    if (max) {
      const maxEnd = new Date(
        max.getFullYear(),
        max.getMonth(),
        max.getDate(),
        23,
        59,
        59,
        999,
      );
      if (date > maxEnd) {
        return true;
      }
    }
    if (predicate) {
      return predicate(date);
    }

    return false;
  }

  protected readonly daysGrid = computed<DayCell[]>(() => {
    const view = this.viewMonth();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(firstOfMonth);
    const firstDay = this.resolvedFirstDay();
    gridStart.setDate(
      gridStart.getDate() - ((gridStart.getDay() - firstDay + 7) % 7),
    );
    const cells: DayCell[] = [];
    const today = new Date();
    const todayKey = today.toDateString();
    // Always six weeks so the panel height is stable while paging.
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      const inMonth = d.getMonth() === month;
      const isToday = d.toDateString() === todayKey;
      const range = this.getRangeContext(d);
      cells.push({
        date: d,
        day: d.getDate(),
        inMonth,
        isToday,
        inRange: range.inRange,
        isRangeStart: range.isStart,
        isRangeEnd: range.isEnd,
        isSelected: range.isSelected,
        isDisabled: this.isDayDisabled(d),
      });
    }

    return cells;
  });

  protected readonly weeksGrid = computed<DayCell[][]>(() => {
    const cells = this.daysGrid();
    const weeks: DayCell[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7));
    }

    return weeks;
  });

  private getRangeContext(d: Date): {
    inRange: boolean;
    isStart: boolean;
    isEnd: boolean;
    isSelected: boolean;
  } {
    const value = this.value();
    if (this.mode() === 'single') {
      const sel = value as Date | null;

      return {
        inRange: false,
        isStart: false,
        isEnd: false,
        isSelected: !!sel && sel.toDateString() === d.toDateString(),
      };
    }
    const r = (value as DateRangeValue | null) ?? [null, null];
    const a = r[0];
    const b = r[1];
    if (!a) {
      return {
        inRange: false,
        isStart: false,
        isEnd: false,
        isSelected: false,
      };
    }
    if (!b) {
      return {
        inRange: false,
        isStart: a.toDateString() === d.toDateString(),
        isEnd: false,
        isSelected: false,
      };
    }
    const t = d.getTime();
    const aT = a.getTime();
    const bT = b.getTime();

    return {
      inRange: t > Math.min(aT, bT) && t < Math.max(aT, bT),
      isStart: t === Math.min(aT, bT),
      isEnd: t === Math.max(aT, bT),
      isSelected: false,
    };
  }

  protected open(moveFocusToGrid = true): void {
    if (this.isDisabled() || this.overlayRef || this.preview.staticPreview()) {
      return;
    }
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      this.anchor().nativeElement,
      ['ds-date-picker-panel', ...panelClassesOf(this.panelClass())],
    );
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
    // The anchor, not the host: a stretched host's empty width must dismiss.
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.anchor().nativeElement.contains(target),
      () => this.close('dismiss'),
    );
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    // Syncs on every detach of the CURRENT overlay so a stray CDK detach cannot leave a stale `overlayRef` wedging the reopen guard;
    // skips a superseded overlay, which would strand the panel that replaced it.
    clearOnDetach(this.overlayRef, {
      current: () => this.overlayRef,
      always: removeScrollClose,
      clear: () => {
        this.overlayRef = null;
        this.isOpen.set(false);
      },
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close('dismiss');
        this.focusTrigger();
      }
    });
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.isOpen.set(true);
    const focus = this.clampToBounds(
      this.selectedAnchorDate() ?? this.defaultDate() ?? new Date(),
    );
    this.gridFocus.set(focus);
    this.viewMonth.set(new Date(focus.getFullYear(), focus.getMonth(), 1));
    if (moveFocusToGrid) {
      afterNextRender(() => this.focusGridDay(), { injector: this.injector });
    }
  }

  private selectedAnchorDate(): Date | null {
    return this.mode() === 'single'
      ? (this.value() as Date | null)
      : ((this.value() as DateRangeValue | null)?.[0] ?? null);
  }

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    if (this.preview.staticPreview()) {
      return;
    }
    const focusWasInPanel = this.overlayRef
      ? focusIsInside(this.overlayRef)
      : false;
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.isOpen.set(false);
    this.closeMenus();
    this.markTouched();
    // Refocusing the editable field on a coarse pointer summons the soft keyboard mid-scroll; the readonly field never does.
    if (
      focusWasInPanel &&
      (!this.allowInput() || !window.matchMedia('(pointer: coarse)').matches)
    ) {
      this.inputEl().nativeElement.focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  /** Also the calendar glyph's handler: a pointer open keeps focus on a typeable field and focuses the grid on a read-only one. */
  protected onFieldClick(): void {
    this.open(!this.allowInput());
    if (this.allowInput()) {
      this.inputEl().nativeElement.focus();
    }
  }

  // Intended result of a `beforeinput` edit, re-asserted in onFieldInput when Android ignores preventDefault.
  private mobileEdit: { value: string; caret: number } | null = null;

  protected onFieldInput(event: Event): void {
    if (!this.allowInput()) {
      return;
    }
    const element = event.target as HTMLInputElement;
    if (this.mobileEdit) {
      const { value, caret } = this.mobileEdit;
      this.mobileEdit = null;
      this.writeBackText(element, value, caret);

      return;
    }
    this.commitRaw(element, element.value);
  }

  /** Physical-keyboard editing: typed digits fill the caret's slot; Backspace/Delete never shift digits across a separator. */
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (!this.allowInput()) {
      return;
    }
    const key = event.key;
    const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
    const isDigit = key.length === 1 && key >= '0' && key <= '9' && plain;
    if (key.length === 1 && plain && !isDigit) {
      event.preventDefault();

      return;
    }
    if (!isDigit && key !== 'Backspace' && key !== 'Delete') {
      return;
    }
    event.preventDefault();
    this.runSegmentEdit(
      event.target as HTMLInputElement,
      isDigit ? 'type' : key === 'Backspace' ? 'backspace' : 'delete',
      isDigit ? key : undefined,
    );
  }

  /** Mobile keyboards fire no reliable `keydown` (Gboard reports 229), so edits arrive via `beforeinput`. Android Chrome can ignore
   *  `preventDefault()`, so the result is stashed and re-asserted in `onFieldInput`; a microtask expires the stash. */
  protected onFieldBeforeInput(event: InputEvent): void {
    if (!this.allowInput()) {
      return;
    }
    const element = event.target as HTMLInputElement;
    const type = event.inputType;
    let kind: 'type' | 'backspace' | 'delete' | null = null;
    let digit: string | undefined;
    if (type === 'insertText' && event.data && /^\d$/.test(event.data)) {
      kind = 'type';
      digit = event.data;
    } else if (type === 'deleteContentBackward') {
      kind = 'backspace';
    } else if (type === 'deleteContentForward') {
      kind = 'delete';
    } else {
      return;
    }
    event.preventDefault();
    // Gboard reports Backspace/Delete with a full-segment selection (its composing region), which would wipe the whole slot.
    // Collapse to the caret edge so a mobile delete removes one digit.
    const collapsed =
      kind === 'backspace'
        ? element.selectionEnd
        : kind === 'delete'
          ? element.selectionStart
          : undefined;
    this.runSegmentEdit(element, kind, digit, collapsed);
    this.mobileEdit = {
      value: element.value,
      caret: element.selectionStart ?? element.value.length,
    };
    queueMicrotask(() => (this.mobileEdit = null));
  }

  /** A selection is cleared through the model so `_` placeholders are never natively erased. */
  private runSegmentEdit(
    element: HTMLInputElement,
    kind: 'type' | 'backspace' | 'delete',
    digit?: string,
    caretOverride?: number | null,
  ): void {
    const layout = this.layout();
    const segments = parseFieldText(element.value, layout);
    // A caretOverride collapses the range, forcing the single-character branch (mobile beforeinput path).
    const caret =
      caretOverride ?? element.selectionStart ?? element.value.length;
    const selectionEnd = caretOverride ?? element.selectionEnd ?? caret;
    let edit: { segments: string[]; slot: number; offset: number } | null;
    if (selectionEnd !== caret) {
      const firstSel = caretToSlot(layout, caret);
      const lastSel = caretToSlot(layout, selectionEnd);
      const cleared = segments.slice();
      for (let index = firstSel.slot; index <= lastSel.slot; index++) {
        cleared[index] = '';
      }
      edit =
        kind === 'type'
          ? editType(cleared, layout, firstSel.slot, 0, digit as string)
          : { segments: cleared, slot: firstSel.slot, offset: 0 };
    } else {
      const { slot, offset } = caretToSlot(layout, caret);
      edit =
        kind === 'type'
          ? editType(segments, layout, slot, offset, digit as string)
          : kind === 'backspace'
            ? editBackspace(segments, layout, slot, offset)
            : editDelete(segments, layout, slot, offset);
    }
    if (!edit) {
      return;
    }
    const text = this.toFieldText(edit.segments, layout);
    this.applyEditedText(
      element,
      text,
      text ? slotToCaret(layout, edit.slot, edit.offset) : 0,
    );
  }

  /** Paste digits into the segment model at the caret slot, never a global flatten, so digits elsewhere survive. */
  protected onFieldPaste(event: ClipboardEvent): void {
    if (!this.allowInput()) {
      return;
    }
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    const layout = this.layout();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(
      /\D/g,
      '',
    );
    if (!pasted) {
      return;
    }
    const segments = parseFieldText(element.value, layout);
    const caret = element.selectionStart ?? element.value.length;
    const start = caretToSlot(layout, caret);
    let result = { segments, slot: start.slot, offset: start.offset };
    for (const digit of pasted) {
      result = editType(
        result.segments,
        layout,
        result.slot,
        result.offset,
        digit,
      );
    }
    this.applyEditedText(
      element,
      this.toFieldText(result.segments, layout),
      slotToCaret(layout, result.slot, result.offset),
    );
  }

  private countDigits(text: string): number {
    return text.replace(/\D/g, '').length;
  }

  /** Fallback for an `input` event with no handled `beforeinput` (IME, autofill): `raw` is redistributed over the slots as a flat digit stream. */
  private commitRaw(element: HTMLInputElement, raw: string): void {
    const layout = this.layout();
    const capacity = layout.slots.reduce(
      (sum, slot) => sum + slot.maxLength,
      0,
    );
    const digits = raw.replace(/\D/g, '').slice(0, capacity);
    const segments: string[] = [];
    let index = 0;
    for (const slot of layout.slots) {
      segments.push(digits.slice(index, index + slot.maxLength));
      index += slot.maxLength;
    }
    const text = this.toFieldText(segments, layout);
    this.applyEditedText(element, text, this.caretAfterFill(segments, layout));
  }

  private applyEditedText(
    element: HTMLInputElement,
    text: string,
    caret: number,
  ): void {
    this.editing = true;
    this.writeBackText(element, text, caret);
    const spec = this.formatSpec();
    if (this.mode() === 'range') {
      this.rangeText.set(text);
      this.applyRangeText(text, spec, false);

      return;
    }
    this.inputText.set(text);
    const parsed = parseDate(text, spec);
    if (!parsed) {
      // Incomplete input is not an error yet; a full-but-bad value is caught on blur.
      this.typedInvalid.set(false);

      return;
    }
    if (this.isDayDisabled(parsed)) {
      this.typedInvalid.set(true);

      return;
    }
    this.typedInvalid.set(false);
    this.value.set(parsed);
    this.viewMonth.set(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }

  protected onFieldBlur(): void {
    this.markTouched();
    if (!this.allowInput()) {
      return;
    }
    this.editing = false;
    const spec = this.formatSpec();
    if (this.mode() === 'range') {
      this.applyRangeText(this.rangeText(), spec, true);

      return;
    }
    const text = this.inputText();
    if (this.countDigits(text) === 0) {
      this.typedInvalid.set(false);
      this.value.set(null);
      this.inputText.set('');

      return;
    }
    const parsed = parseDate(text, spec);
    if (parsed && !this.isDayDisabled(parsed)) {
      this.typedInvalid.set(false);
      this.value.set(parsed);
      this.inputText.set(formatDate(parsed, spec));
    } else {
      this.typedInvalid.set(true);
    }
  }

  /** Writing `value` parks the caret at the end, so the explicit range must follow; the later `[value]` binding writes the same string and leaves it. */
  private writeBackText(
    element: HTMLInputElement,
    text: string,
    caret: number,
  ): void {
    if (element.value !== text) {
      element.value = text;
    }
    element.setSelectionRange(caret, caret);
  }

  private caretAfterFill(segments: string[], layout: FieldLayout): number {
    for (let slot = 0; slot < segments.length; slot++) {
      if (segments[slot].length < layout.slots[slot].maxLength) {
        return slotToCaret(layout, slot, segments[slot].length);
      }
    }
    const last = segments.length - 1;

    return slotToCaret(layout, last, layout.slots[last].maxLength);
  }

  /** `commit` is the blur pass: only then is the field text rewritten from the parsed value and a half-filled range written to `value`. */
  private applyRangeText(
    text: string,
    spec: DateFormatSpec,
    commit: boolean,
  ): void {
    if (this.countDigits(text) === 0) {
      this.rangeInvalid.set(false);
      this.value.set(null);
      if (commit) {
        this.rangeText.set('');
      }

      return;
    }
    const layout = rangeFieldLayout(spec);
    const slots = parseFieldText(text, layout);
    const perDate = spec.segments.length;
    const startFilled = slots
      .slice(0, perDate)
      .every((seg, i) => seg.length === spec.segments[i].length);
    const endFilled = slots
      .slice(perDate, perDate * 2)
      .every((seg, i) => seg.length === spec.segments[i].length);
    const [start, end] = parseDateRange(text, spec);
    const startBad = startFilled && (!start || this.isDayDisabled(start));
    const endBad = endFilled && (!end || this.isDayDisabled(end));
    this.rangeInvalid.set(startBad || endBad);
    if (start && end && !startBad && !endBad) {
      const ordered: DateRangeValue =
        start.getTime() <= end.getTime() ? [start, end] : [end, start];
      this.value.set(ordered);
      if (commit) {
        this.rangeText.set(formatRange(ordered, spec));
      }
    } else if (commit) {
      this.value.set([start ?? null, end ?? null]);
    }
  }

  protected prevMonth(): void {
    const m = new Date(this.viewMonth());
    m.setMonth(m.getMonth() - 1);
    this.viewMonth.set(m);
  }

  protected nextMonth(): void {
    const m = new Date(this.viewMonth());
    m.setMonth(m.getMonth() + 1);
    this.viewMonth.set(m);
  }

  protected selectDay(cell: DayCell): void {
    if (cell.isDisabled) {
      return;
    }
    this.editing = false;
    if (this.mode() === 'single') {
      this.value.set(new Date(cell.date));
      this.close();
      this.focusTrigger();

      return;
    }
    const r = (this.value() as DateRangeValue | null) ?? [null, null];
    const a = r[0];
    const b = r[1];
    if (!a || (a && b)) {
      this.value.set([new Date(cell.date), null]);
      this.gridFocus.set(new Date(cell.date));
    } else {
      const picked = new Date(cell.date);
      const range: DateRangeValue =
        a.getTime() <= picked.getTime() ? [a, picked] : [picked, a];
      this.value.set(range);
      this.close();
      this.focusTrigger();
    }
  }

  protected isPresetDisabled(preset: DatePickerPreset): boolean {
    const presetValue = preset.value;
    if (presetValue instanceof Date) {
      return this.isDayDisabled(presetValue);
    }
    const rangeValue = presetValue as DateRangeValue;
    const start = rangeValue[0];
    const end = rangeValue[1];
    if (start && this.isDayDisabled(start)) {
      return true;
    }
    if (end && this.isDayDisabled(end)) {
      return true;
    }

    return false;
  }

  protected applyPreset(preset: DatePickerPreset): void {
    if (this.isPresetDisabled(preset)) {
      return;
    }
    this.editing = false;
    this.typedInvalid.set(false);
    this.rangeInvalid.set(false);
    const presetValue = preset.value;
    if (presetValue instanceof Date) {
      this.value.set(new Date(presetValue));
    } else {
      const rangeValue = presetValue as DateRangeValue;
      this.value.set([
        rangeValue[0] ? new Date(rangeValue[0]) : null,
        rangeValue[1] ? new Date(rangeValue[1]) : null,
      ]);
    }
    this.close();
    this.focusTrigger();
  }
}
