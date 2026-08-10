import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  input,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';
import {
  from12h,
  genHours,
  genMinutes,
  isTimeDisabled,
  pad2,
  parseTime,
  to12h,
} from '../time-picker/time.util';
import type {
  TimeConstraints,
  TimeFormat,
} from '../time-picker/time-picker.types';

type ColumnId = 'hours' | 'minutes' | 'period';
interface Cell<T> {
  value: T;
  label: string;
  disabled: boolean;
  selected: boolean;
}

/** Internal (not public API): Hours / Minutes / AM-PM listbox columns.
 * Reused by ds-time-picker's overlay and the date-picker time footer. */
@Component({
  selector: 'ds-time-columns',
  standalone: true,
  templateUrl: './time-columns.component.html',
  styleUrl: './time-columns.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'ds-time-columns',
    role: 'group',
    '[attr.aria-label]': "'Time'",
  },
})
export class TimeColumnsComponent {
  /** Current time as `HH:mm` (24h, always — `format` changes only what is DISPLAYED). */
  readonly value = input<string | null>(null);
  /** Display clock. `12h` adds an AM/PM column; the emitted value stays 24h either way. */
  readonly format = input<TimeFormat>('24h');
  /** Minute granularity — 15 gives four rows an hour instead of sixty. */
  readonly minuteStep = input(1, { transform: numberAttribute });
  /** Earliest selectable time, `HH:mm`. Earlier rows render disabled rather than being removed,
   *  so the columns do not reflow as the bound changes. */
  readonly minTime = input<string | null>(null);
  /** Latest selectable time, `HH:mm`. */
  readonly maxTime = input<string | null>(null);
  /** Per-time predicate for what a range cannot express — booked slots, a lunch break.
   *  Receives `HH:mm`; return true to disable. */
  readonly disabledTime = input<((time: string) => boolean) | null>(null);
  /** A complete time was picked, as `HH:mm`. Not emitted while only one column has moved. */
  readonly timeChange = output<string>();

  private readonly hourButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('hourOpt');
  private readonly minuteButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('minOpt');
  private readonly periodButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('periodOpt');

  protected readonly is12h = computed(() => this.format() === '12h');
  protected readonly periods: readonly ('AM' | 'PM')[] = ['AM', 'PM'];

  private readonly constraints = computed<TimeConstraints>(() => ({
    minTime: this.minTime(),
    maxTime: this.maxTime(),
    disabledTime: this.disabledTime(),
  }));
  private readonly parsedValue = computed(() => parseTime(this.value()));
  private readonly hourNums = computed(() => genHours(this.format()));
  private readonly minuteNums = computed(() => genMinutes(this.minuteStep()));

  protected readonly currentPeriod = computed<'AM' | 'PM'>(() => {
    const parsed = this.parsedValue();

    return parsed ? to12h(parsed.h).period : 'AM';
  });

  protected readonly hourCells = computed<Cell<number>[]>(() => {
    const parsed = this.parsedValue();
    const selectedHour = parsed
      ? this.is12h()
        ? to12h(parsed.h).h
        : parsed.h
      : null;

    return this.hourNums().map((hours) => ({
      value: hours,
      label: pad2(hours),
      disabled: this.allMinutesDisabled(this.toH24(hours)),
      selected: hours === selectedHour,
    }));
  });

  protected readonly minuteCells = computed<Cell<number>[]>(() => {
    const parsed = this.parsedValue();
    const hour24 = this.baseHour();

    return this.minuteNums().map((minute) => ({
      value: minute,
      label: pad2(minute),
      disabled: isTimeDisabled(
        `${pad2(hour24)}:${pad2(minute)}`,
        this.constraints(),
      ),
      selected: parsed ? parsed.m === minute : false,
    }));
  });

  protected readonly periodCells = computed<Cell<'AM' | 'PM'>[]>(() => {
    const parsed = this.parsedValue();

    return this.periods.map((period) => ({
      value: period,
      label: period,
      disabled: this.hourNums().every((hours) =>
        this.allMinutesDisabled(from12h(hours, period)),
      ),
      selected: parsed ? to12h(parsed.h).period === period : false,
    }));
  });

  protected readonly hourEntry = computed(() =>
    this.entryIndex(this.hourCells()),
  );
  protected readonly minuteEntry = computed(() =>
    this.entryIndex(this.minuteCells()),
  );
  protected readonly periodEntry = computed(() =>
    this.entryIndex(this.periodCells()),
  );

  protected selectHour(cell: Cell<number>): void {
    if (cell.disabled) {
      return;
    }
    const hour24 = this.toH24(cell.value);
    const parsed = this.parsedValue();
    this.emit(hour24, parsed ? parsed.m : this.firstEnabledMinute(hour24));
  }

  protected selectMinute(cell: Cell<number>): void {
    if (cell.disabled) {
      return;
    }
    this.emit(this.baseHour(), cell.value);
  }

  protected selectPeriod(cell: Cell<'AM' | 'PM'>): void {
    if (cell.disabled) {
      return;
    }
    const parsed = this.parsedValue();
    const hour12 = parsed
      ? to12h(parsed.h).h
      : this.firstEnabledHour12(cell.value);
    const hour24 = from12h(hour12, cell.value);
    this.emit(hour24, parsed ? parsed.m : this.firstEnabledMinute(hour24));
  }

  protected onKey(event: KeyboardEvent, column: ColumnId, index: number): void {
    const cells = this.cellsFor(column);
    let target = -1;
    switch (event.key) {
      case 'ArrowDown':
        target = this.nextEnabled(cells, index, 1);
        break;
      case 'ArrowUp':
        target = this.nextEnabled(cells, index, -1);
        break;
      case 'Home':
        target = this.nextEnabled(cells, -1, 1);
        break;
      case 'End':
        target = this.nextEnabled(cells, cells.length, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusColumn(this.siblingColumn(column, 1));

        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusColumn(this.siblingColumn(column, -1));

        return;
      default:
        return;
    }
    if (target < 0) {
      return;
    }
    event.preventDefault();
    this.selectAt(column, target);
    this.buttonsFor(column)()[target]?.nativeElement.focus();
  }

  /** Called by the parent after the overlay renders. */
  focusSelected(): void {
    this.hourButtons()[Math.max(this.hourEntry(), 0)]?.nativeElement.focus();
    this.scrollSelectedIntoView();
  }

  scrollSelectedIntoView(): void {
    this.scrollColumn(this.hourButtons(), this.hourEntry());
    this.scrollColumn(this.minuteButtons(), this.minuteEntry());
    this.scrollColumn(this.periodButtons(), this.periodEntry());
  }

  private toH24(hourCol: number): number {
    return this.is12h() ? from12h(hourCol, this.currentPeriod()) : hourCol;
  }

  private allMinutesDisabled(hour24: number): boolean {
    return this.minuteNums().every((minute) =>
      isTimeDisabled(`${pad2(hour24)}:${pad2(minute)}`, this.constraints()),
    );
  }

  private baseHour(): number {
    const parsed = this.parsedValue();
    if (parsed) {
      return parsed.h;
    }
    const first = this.hourCells().find((cell) => !cell.disabled);

    return first ? this.toH24(first.value) : 0;
  }

  private firstEnabledMinute(hour24: number): number {
    const minute = this.minuteNums().find(
      (candidate) =>
        !isTimeDisabled(
          `${pad2(hour24)}:${pad2(candidate)}`,
          this.constraints(),
        ),
    );

    return minute ?? 0;
  }

  private firstEnabledHour12(period: 'AM' | 'PM'): number {
    const hours = this.hourNums().find(
      (candidate) => !this.allMinutesDisabled(from12h(candidate, period)),
    );

    return hours ?? 12;
  }

  private emit(hour24: number, minute: number): void {
    this.timeChange.emit(`${pad2(hour24)}:${pad2(minute)}`);
  }

  private entryIndex(
    cells: readonly { disabled: boolean; selected: boolean }[],
  ): number {
    const selected = cells.findIndex((cell) => cell.selected && !cell.disabled);

    return selected >= 0 ? selected : cells.findIndex((cell) => !cell.disabled);
  }

  private nextEnabled(
    cells: readonly { disabled: boolean }[],
    from: number,
    step: number,
  ): number {
    const count = cells.length;
    if (count === 0) {
      return -1;
    }
    let index = from;
    for (let i = 0; i < count; i++) {
      index = (index + step + count) % count;
      if (!cells[index].disabled) {
        return index;
      }
    }

    return -1;
  }

  private cellsFor(column: ColumnId): readonly { disabled: boolean }[] {
    if (column === 'hours') {
      return this.hourCells();
    }
    if (column === 'minutes') {
      return this.minuteCells();
    }

    return this.periodCells();
  }

  private buttonsFor(column: ColumnId) {
    if (column === 'hours') {
      return this.hourButtons;
    }
    if (column === 'minutes') {
      return this.minuteButtons;
    }

    return this.periodButtons;
  }

  private selectAt(column: ColumnId, index: number): void {
    if (column === 'hours') {
      this.selectHour(this.hourCells()[index]);
    } else if (column === 'minutes') {
      this.selectMinute(this.minuteCells()[index]);
    } else {
      this.selectPeriod(this.periodCells()[index]);
    }
  }

  private siblingColumn(column: ColumnId, step: number): ColumnId {
    const order: ColumnId[] = this.is12h()
      ? ['hours', 'minutes', 'period']
      : ['hours', 'minutes'];
    const next = order.indexOf(column) + step;

    return order[Math.min(Math.max(next, 0), order.length - 1)];
  }

  private focusColumn(column: ColumnId): void {
    const entry =
      column === 'hours'
        ? this.hourEntry()
        : column === 'minutes'
          ? this.minuteEntry()
          : this.periodEntry();
    this.buttonsFor(column)()[Math.max(entry, 0)]?.nativeElement.focus();
  }

  private scrollColumn(
    buttons: readonly ElementRef<HTMLButtonElement>[],
    index: number,
  ): void {
    buttons[Math.max(index, 0)]?.nativeElement.scrollIntoView({
      block: 'center',
    });
  }
}
