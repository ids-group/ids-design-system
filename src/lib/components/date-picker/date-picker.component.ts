import {
  Component,
  ElementRef,
  Injector,
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
import { disposeWithLeave } from '../overlay-motion';
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
  applyMask,
  formatDate,
  fullDateLabel,
  monthLabels,
  parseDate,
  resolveDateFormat,
  weekdayLabels,
} from './date.util';
import type {
  DatePickerMode,
  DatePickerPreset,
  DatePickerSize,
  RangeValue,
} from './date-picker.types';

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
  imports: [IconComponent, CalendarDayComponent, FieldMessageComponent],
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
export class DatePickerComponent extends DsControlValueAccessor<
  Date | RangeValue | null
> {
  constructor() {
    super();
    effect(() => {
      const spec = this.formatSpec();
      const value = this.value();
      if (this.editing) {
        return;
      }
      if (this.mode() === 'single') {
        this.inputText.set(formatDate(value as Date | null, spec));

        return;
      }
      const range = (value as RangeValue | null) ?? [null, null];
      this.startText.set(formatDate(range[0], spec));
      this.endText.set(formatDate(range[1], spec));
    });
  }

  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly config = inject(DS_CONFIG);

  readonly mode = input<DatePickerMode>('single');
  readonly size = input<DatePickerSize>('md');
  readonly value = model<Date | RangeValue | null>(null);
  readonly placeholder = input<string>('Select date');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Bounds for the year dropdown in the calendar header. */
  readonly minYear = input<number>(new Date().getFullYear() - 100);
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
  /** Month the calendar opens on when the value is empty (e.g. a Date Of Birth). */
  readonly defaultMonth = input<Date | null>(null);
  /** Allow masked manual typing. When false the trigger is a button (calendar-only). */
  readonly allowInput = input(true, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() || this.typedInvalid() || this.rangeInvalid() ? 'error' : 'default',
  );

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
  protected readonly monthNames = computed(() => monthLabels(this.resolvedLocale()));
  protected readonly weekdays = computed(() =>
    weekdayLabels(this.resolvedLocale(), this.resolvedFirstDay()),
  );

  protected readonly uid = `ds-datepicker-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly isOpen = signal(false);
  /** The day that holds keyboard focus in the open grid (roving tabindex). */
  protected readonly gridFocus = signal<Date | null>(null);
  protected readonly inputText = signal<string>('');
  protected readonly typedInvalid = signal(false);
  protected readonly startText = signal<string>('');
  protected readonly endText = signal<string>('');
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
      case 'Escape':
        event.preventDefault();
        this.close();
        this.focusTrigger();

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
  protected readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  private focusTrigger(): void {
    const target = this.inputEl()?.nativeElement ?? this.trigger()?.nativeElement;
    target?.focus();
  }

  protected readonly displayLabel = computed(() => {
    const value = this.value();
    const spec = this.formatSpec();
    if (this.mode() === 'single') {
      const single = value as Date | null;

      return single ? formatDate(single, spec) : this.placeholder();
    }
    const range = (value as RangeValue | null) ?? [null, null];
    const [start, end] = range;
    if (start && end) {
      return `${formatDate(start, spec)} – ${formatDate(end, spec)}`;
    }
    if (start) {
      return `${formatDate(start, spec)} – …`;
    }

    return this.placeholder();
  });

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

  protected open(): void {
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
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.overlayRef = this.overlay.create(cfg);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.isOpen.set(true);
    // Seed grid focus on the selected day (or today) and move focus into it.
    const selected =
      this.mode() === 'single'
        ? (this.value() as Date | null)
        : ((this.value() as RangeValue | null)?.[0] ?? null);
    const focus = this.clampToBounds(selected ?? this.defaultMonth() ?? new Date());
    this.gridFocus.set(focus);
    this.viewMonth.set(new Date(focus.getFullYear(), focus.getMonth(), 1));
    afterNextRender(() => this.focusGridDay(), { injector: this.injector });
  }

  protected close(): void {
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.isOpen.set(false);
    this.closeMenus();
    this.markTouched();
  }

  protected onInput(event: Event): void {
    this.editing = true;
    const spec = this.formatSpec();
    const masked = applyMask((event.target as HTMLInputElement).value, spec);
    this.inputText.set(masked);
    const parsed = parseDate(masked, spec);
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

  protected onBlur(): void {
    this.editing = false;
    const spec = this.formatSpec();
    const text = this.inputText();
    if (!text) {
      this.typedInvalid.set(false);
      this.value.set(null);
      this.markTouched();

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
    this.markTouched();
  }

  protected onRangeInput(part: 'start' | 'end', event: Event): void {
    this.editing = true;
    const spec = this.formatSpec();
    const masked = applyMask((event.target as HTMLInputElement).value, spec);
    (part === 'start' ? this.startText : this.endText).set(masked);
  }

  protected onRangeBlur(): void {
    this.editing = false;
    const spec = this.formatSpec();
    const start = parseDate(this.startText(), spec);
    const end = parseDate(this.endText(), spec);
    const startBad = !!this.startText() && (!start || this.isDayDisabled(start));
    const endBad = !!this.endText() && (!end || this.isDayDisabled(end));
    this.rangeInvalid.set(startBad || endBad);
    if (start && end && !startBad && !endBad) {
      const ordered: RangeValue =
        start.getTime() <= end.getTime() ? [start, end] : [end, start];
      this.value.set(ordered);
      this.startText.set(formatDate(ordered[0], spec));
      this.endText.set(formatDate(ordered[1], spec));
    } else {
      this.value.set([start ?? null, end ?? null]);
    }
    this.markTouched();
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
