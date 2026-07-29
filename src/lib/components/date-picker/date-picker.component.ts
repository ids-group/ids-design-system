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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  focusIsInside,
  forwardOverlayTokens,
} from '../overlay-motion';
import { IconComponent } from '../../icons/icon.component';
import { CalendarDayComponent } from '../calendar-day/calendar-day.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import {
  FieldMessageComponent,
  type FieldMessageState,
} from '../field-message/field-message.component';
import { DS_CONFIG } from '../../config/ds-config';
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
  RangeValue,
} from './date-picker.types';
import type { DsSize } from '../../core/size';

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
  imports: [IconComponent, CalendarDayComponent, FieldMessageComponent, A11yModule],
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
})
export class DatePickerComponent
  extends DsControlValueAccessor<Date | RangeValue | null>
  implements OnDestroy
{
  constructor() {
    super();
    // Renders through toFieldText so the field is fixed-width `_`-padded once
    // any digit exists (even a partial range pads the empty end date), but
    // genuinely empty ('') when untouched — see Fix A.
    effect(() => {
      const spec = this.formatSpec();
      const value = this.value();
      const layout = this.layout();
      if (this.editing) {
        return;
      }
      if (this.mode() === 'single') {
        const date = value as Date | null;
        this.inputText.set(date ? formatDate(date, spec) : '');

        return;
      }
      const single = singleFieldLayout(spec);
      const [start, end] = (value as RangeValue | null) ?? [null, null];
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

  /** Field text for the DOM: fixed-width `_`-padded once any digit exists,
   *  else '' (so an untouched field is genuinely empty — no error on blur,
   *  nothing for AT to read out). */
  private toFieldText(segments: string[], layout: FieldLayout): string {
    return segments.some((segment) => segment.length > 0)
      ? renderFieldValue(segments, layout)
      : '';
  }

  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly config = inject(DS_CONFIG);
  private readonly host = inject(ElementRef<HTMLElement>);
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-date-picker { --ds-date-picker-panel-*: … }` reaches it. */
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
  ];

  /** Selection mode — single date or start/end range. */
  readonly mode = input<DatePickerMode>('single');
  /** Trigger height — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Selected date (single) or `[start, end]` (range), two-way bound. */
  readonly value = model<Date | RangeValue | null>(null);
  /** Accessible-name fallback only — the mask fills the visible placeholder, not this. */
  readonly placeholder = input<string>('Select date');
  /** Field label shown above the trigger. */
  readonly label = input<string>('');
  /** Helper text shown below the field. */
  readonly hint = input<string>('');
  /** Reserve the message-row height even when empty, so the field doesn't shift
   *  the layout below it when a hint/error appears. Default on — opt out for a
   *  deliberately collapsing field. */
  readonly reserveMessage = input(true, { transform: booleanAttribute });
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker beside the label — ignored when `required` is set. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Disables the picker and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Applies error styling and marks the trigger `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Bounds for the year dropdown in the calendar header. */
  readonly minYear = input<number>(new Date().getFullYear() - 100);
  /** Upper bound for the year dropdown in the calendar header. */
  readonly maxYear = input<number>(new Date().getFullYear() + 10);
  /** Earliest selectable date (inclusive). Days before this are disabled. */
  readonly minDate = input<Date | null>(null);
  /** Latest selectable date (inclusive). Days after this are disabled. */
  readonly maxDate = input<Date | null>(null);
  /** Predicate — return true to disable an individual day. */
  readonly disabledDate = input<((date: Date) => boolean) | null>(null);
  /** Quick-pick shortcuts shown as a button column inside the calendar panel. */
  readonly presets = input<readonly DatePickerPreset[]>([]);
  /** BCP-47 locale driving month/weekday names and the value format. */
  readonly locale = input<string | null>(null);
  /** Explicit token format e.g. `'MM/DD/YYYY'`; default derived from `locale`. */
  readonly dateFormat = input<string | null>(null);
  /** First weekday column: 0=Sunday … 6=Saturday. Default 1 (Monday). */
  readonly firstDayOfWeek = input<number | null>(null);
  /** Date the calendar opens on when the value is empty (e.g. a Date Of Birth):
   *  the panel shows its month and grid focus lands on its exact day.
   *  Never written to `value` — selection stays with the user. */
  readonly defaultDate = input<Date | null>(null);
  /** Allow masked manual typing. When false the trigger is a button (calendar-only). */
  readonly allowInput = input(true, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.messageText() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() || this.typedInvalid() || this.rangeInvalid() ? 'error' : 'default',
  );
  /** Field-message text: a validation message when typing is invalid, else the hint. */
  protected readonly messageText = computed(() => {
    if (this.typedInvalid() || this.rangeInvalid()) {
      const mask =
        this.mode() === 'single'
          ? this.formatSpec().mask
          : rangeMask(this.formatSpec());

      return `Enter a valid date (${mask})`;
    }

    return this.hint();
  });

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? this.config.datePicker?.locale ?? 'en-US',
  );
  protected readonly resolvedFirstDay = computed(
    () => this.firstDayOfWeek() ?? this.config.datePicker?.firstDayOfWeek ?? 1,
  );
  protected readonly formatSpec = computed<DateFormatSpec>(() =>
    resolveDateFormat(
      this.resolvedLocale(),
      this.dateFormat() ?? this.config.datePicker?.dateFormat,
    ),
  );
  /** Slot/literal layout for the current mode — single date or doubled range. */
  protected readonly layout = computed<FieldLayout>(() =>
    this.mode() === 'range'
      ? rangeFieldLayout(this.formatSpec())
      : singleFieldLayout(this.formatSpec()),
  );
  protected readonly monthNames = computed(() => monthLabels(this.resolvedLocale()));
  protected readonly weekdays = computed(() =>
    weekdayLabels(this.resolvedLocale(), this.resolvedFirstDay()),
  );
  /** Full weekday names for the grid column headers' accessible names. */
  protected readonly weekdaysFull = computed(() =>
    weekdayLabels(this.resolvedLocale(), this.resolvedFirstDay(), 'long'),
  );
  /** Localized "Month YYYY" caption — the grid's accessible name + live label. */
  protected readonly monthYearLabel = computed(
    () => `${this.monthNames()[this.viewMonthIndex()]} ${this.viewYear()}`,
  );

  protected readonly uid = `ds-datepicker-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly panelId = `${this.uid}-panel`;
  protected readonly captionId = `${this.uid}-caption`;
  protected readonly isOpen = signal(false);
  /** The day that holds keyboard focus in the open grid (roving tabindex). */
  protected readonly gridFocus = signal<Date | null>(null);
  protected readonly inputText = signal<string>('');
  protected readonly rangeText = signal<string>('');
  protected readonly typedInvalid = signal(false);
  protected readonly rangeInvalid = signal(false);
  // Guards the value→text sync from clobbering the field mid-keystroke.
  private editing = false;
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  protected dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  protected isFocusDay(cell: DayCell): boolean {
    const f = this.gridFocus();

    return !!f && this.dayKey(f) === this.dayKey(cell.date);
  }

  /** Arrow-key roving navigation across the calendar grid (APG date grid). */
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
        next = this.addDays(f, -((f.getDay() - this.resolvedFirstDay() + 7) % 7));
        break;
      case 'End':
        next = this.addDays(f, 6 - ((f.getDay() - this.resolvedFirstDay() + 7) % 7));
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

  /** Full, unambiguous date for a day cell's accessible name. */
  protected dayLabel(cell: DayCell): string {
    return fullDateLabel(cell.date, this.resolvedLocale());
  }

  protected readonly triggerClasses = computed(() => {
    const parts = ['trigger'];
    const size = this.size();
    if (size !== 'md') {
      parts.push(size);
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.invalid() || this.typedInvalid() || this.rangeInvalid()) {
      parts.push('error');
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

  /** Text shown in the field: masked single value, or the combined range string. */
  protected readonly fieldText = computed(() =>
    this.mode() === 'single' ? this.inputText() : this.rangeText(),
  );
  /** Format-mask placeholder (single) or the doubled range mask. */
  protected readonly fieldPlaceholder = computed(() =>
    this.mode() === 'single'
      ? this.formatSpec().mask
      : rangeMask(this.formatSpec()),
  );
  /** `size` attribute so the field hugs its mask width instead of stretching.
   * +1 covers `size` under-counting the mask's wide glyphs (M/D/Y), which
   * otherwise clip the last chars of the longer range mask. The field's
   * `font-family: var(--font-mono)` keeps every glyph equal width, so the
   * width never shifts as you type. */
  protected readonly fieldSize = computed(() => this.fieldPlaceholder().length + 1);
  /** Per-slot overlay runs: digits at normal weight, unfilled positions
   *  (format letters or `_` padding) muted — see displayParts(). */
  protected readonly displaySlots = computed<DisplayPart[]>(() =>
    displayParts(parseFieldText(this.fieldText(), this.layout()), this.layout()),
  );

  // ---- Month / year grid pickers in the calendar header ----
  protected readonly monthMenuOpen = signal(false);
  protected readonly yearMenuOpen = signal(false);
  protected readonly viewMonthIndex = computed(() =>
    this.viewMonth().getMonth(),
  );
  protected readonly viewYear = computed(() => this.viewMonth().getFullYear());

  /** First year shown in the year grid; paged by YEAR_PAGE_SIZE within [minYear, maxYear]. */
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

  /** Aligns the page so `year` lands on a stable grid boundary measured from minYear. */
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

  /** daysGrid split into rows of 7 for the grid's `role="row"` structure. */
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
    const r = (value as RangeValue | null) ?? [null, null];
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
    if (this.isDisabled() || this.overlayRef) {
      return;
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.anchor().nativeElement)
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
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.overlayRef = this.overlay.create(cfg);
    forwardOverlayTokens(this.overlayRef, this.host.nativeElement, this.panelTokens);
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.host.nativeElement.contains(target),
      () => this.close(),
    );
    // No backdrop catches a page scroll, and CDK's scroll strategies don't see a
    // plain overflow container — so close on any outside scroll ourselves. Sync
    // state on every detach so a stray CDK detach can't wedge the reopen guard.
    const removeScrollClose = closeOnScroll(this.overlayRef, () => this.close());
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      this.overlayRef = null;
      this.isOpen.set(false);
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
        this.focusTrigger();
      }
    });
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.isOpen.set(true);
    // Seed grid focus on the selected day (or today) and move focus into it.
    const selected =
      this.mode() === 'single'
        ? (this.value() as Date | null)
        : ((this.value() as RangeValue | null)?.[0] ?? null);
    const focus = this.clampToBounds(selected ?? this.defaultDate() ?? new Date());
    this.gridFocus.set(focus);
    this.viewMonth.set(new Date(focus.getFullYear(), focus.getMonth(), 1));
    if (moveFocusToGrid) {
      afterNextRender(() => this.focusGridDay(), { injector: this.injector });
    }
  }

  protected close(): void {
    const focusWasInPanel = this.overlayRef
      ? focusIsInside(this.overlayRef)
      : false;
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.isOpen.set(false);
    this.closeMenus();
    this.markTouched();
    // Refocusing the editable field on a coarse pointer would summon the soft
    // keyboard mid-scroll; the readonly field (allowInput=false) never does.
    if (
      focusWasInPanel &&
      (!this.allowInput() || !window.matchMedia('(pointer: coarse)').matches)
    ) {
      this.inputEl().nativeElement.focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected onFieldClick(): void {
    this.open(!this.allowInput());
    if (this.allowInput()) {
      this.inputEl().nativeElement.focus();
    }
  }

  // Intended result of a `beforeinput` segment edit, re-asserted in onFieldInput
  // when a native mutation slips past a non-cancelable beforeinput (Android).
  private mobileEdit: { value: string; caret: number } | null = null;

  protected onFieldInput(event: Event): void {
    if (!this.allowInput()) {
      return;
    }
    const element = event.target as HTMLInputElement;
    if (this.mobileEdit) {
      const { value, caret } = this.mobileEdit;
      this.mobileEdit = null;
      // beforeinput already applied the segment edit; overwrite whatever the
      // native change did with the intended fixed-width value + caret.
      this.writeBackText(element, value, caret);

      return;
    }
    this.commitRaw(element, element.value);
  }

  /** Physical-keyboard editing (desktop): typed digits fill the caret's slot;
   *  Backspace/Delete never shift digits across a separator. Delegates to the
   *  shared segment editor. */
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (!this.allowInput()) {
      return;
    }
    const key = event.key;
    const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
    const isDigit = key.length === 1 && key >= '0' && key <= '9' && plain;
    if (key.length === 1 && plain && !isDigit) {
      // Reject non-numeric characters outright, as typed.
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

  /** Mobile keyboards don't fire a reliable `keydown` (Gboard reports keyCode 229 /
   *  "Unidentified"), so edits are routed here via `beforeinput`'s `inputType` instead.
   *  Android Chrome can also ignore `preventDefault()` here, so the intended result is
   *  stashed and re-asserted in `onFieldInput`; the microtask expires the stash once
   *  preventDefault worked (no following `input` in the same task). */
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
    // Gboard reports Backspace/Delete on mobile with a full-segment "selection" (its
    // composing region), which would hit the selection-clear branch below and wipe
    // the whole slot. Collapse to the caret edge so a mobile delete removes one digit.
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

  /** Apply one segment edit (type a digit / Backspace / Delete) at the caret or
   *  over the selection, then write the fixed-width value + caret back. A
   *  selection is cleared through the model so `_` placeholders are never
   *  natively erased — only digits are editable. Shared by keydown + beforeinput. */
  private runSegmentEdit(
    element: HTMLInputElement,
    kind: 'type' | 'backspace' | 'delete',
    digit?: string,
    caretOverride?: number | null,
  ): void {
    const layout = this.layout();
    const segments = parseFieldText(element.value, layout);
    // A caretOverride collapses the range (caret === selectionEnd), forcing the
    // single-character branch below — used by the mobile beforeinput path.
    const caret = caretOverride ?? element.selectionStart ?? element.value.length;
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

  /** Paste digits into the segment model at the caret slot — never a global
   *  flatten — so existing digits elsewhere in the field survive untouched. */
  protected onFieldPaste(event: ClipboardEvent): void {
    if (!this.allowInput()) {
      return;
    }
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    const layout = this.layout();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (!pasted) {
      return;
    }
    const segments = parseFieldText(element.value, layout);
    const caret = element.selectionStart ?? element.value.length;
    const start = caretToSlot(layout, caret);
    let result = { segments, slot: start.slot, offset: start.offset };
    for (const digit of pasted) {
      result = editType(result.segments, layout, result.slot, result.offset, digit);
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

  /** Rebuild `raw` as a digit stream (IME / autofill / suggestion fallback —
   *  any `input` event with no preceding handled `beforeinput`), split per slot
   *  by its fixed width, then render fixed-width so it matches the overlay —
   *  empty when no digits remain. */
  private commitRaw(element: HTMLInputElement, raw: string): void {
    const layout = this.layout();
    const capacity = layout.slots.reduce((sum, slot) => sum + slot.maxLength, 0);
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

  /** Write masked text + caret into the DOM, then parse and validate it. */
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

  /** Force the DOM value to `text` (over-typed digits can't accumulate) and
   *  place the caret at `caret`. Setting `value` first parks the caret at the
   *  end, so the explicit range must follow; the later `[value]` binding writes
   *  the same string, which leaves the caret untouched. */
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

  /** Caret just past the last digit filled by a flat digit stream (commitRaw's
   *  fallback path) — the first slot short of its max length, or the very end
   *  once every slot is full. Empty segments naturally resolve to 0. */
  private caretAfterFill(segments: string[], layout: FieldLayout): number {
    for (let slot = 0; slot < segments.length; slot++) {
      if (segments[slot].length < layout.slots[slot].maxLength) {
        return slotToCaret(layout, slot, segments[slot].length);
      }
    }
    const last = segments.length - 1;

    return slotToCaret(layout, last, layout.slots[last].maxLength);
  }

  /** Parse the combined range text, flag malformed segments, commit on blur. */
  private applyRangeText(text: string, spec: DateFormatSpec, commit: boolean): void {
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
      const ordered: RangeValue =
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
    const r = (this.value() as RangeValue | null) ?? [null, null];
    const a = r[0];
    const b = r[1];
    if (!a || (a && b)) {
      this.value.set([new Date(cell.date), null]);
      this.gridFocus.set(new Date(cell.date));
    } else {
      const picked = new Date(cell.date);
      const range: RangeValue =
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
    const rangeValue = presetValue as RangeValue;
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
      const rangeValue = presetValue as RangeValue;
      this.value.set([
        rangeValue[0] ? new Date(rangeValue[0]) : null,
        rangeValue[1] ? new Date(rangeValue[1]) : null,
      ]);
    }
    this.close();
    this.focusTrigger();
  }
}
