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
  host: { class: 'ds-time-columns', role: 'group', '[attr.aria-label]': "'Time'" },
})
export class TimeColumnsComponent {
  readonly value = input<string | null>(null);
  readonly format = input<TimeFormat>('24h');
  readonly minuteStep = input(1, { transform: numberAttribute });
  readonly minTime = input<string | null>(null);
  readonly maxTime = input<string | null>(null);
  readonly disabledTime = input<((time: string) => boolean) | null>(null);
  readonly timeChange = output<string>();

  private readonly hourButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('hourOpt');
  private readonly minuteButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('minOpt');
  private readonly periodButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('periodOpt');

  protected readonly is12h = computed(() => this.format() === '12h');
  protected readonly periods: ReadonlyArray<'AM' | 'PM'> = ['AM', 'PM'];

  private readonly constraints = computed<TimeConstraints>(() => ({
    minTime: this.minTime(),
    maxTime: this.maxTime(),
    disabledTime: this.disabledTime(),
  }));
  private readonly sel = computed(() => parseTime(this.value()));
  private readonly hourNums = computed(() => genHours(this.format()));
  private readonly minuteNums = computed(() => genMinutes(this.minuteStep()));

  protected readonly currentPeriod = computed<'AM' | 'PM'>(() => {
    const s = this.sel();
    return s ? to12h(s.h).period : 'AM';
  });

  protected readonly hourCells = computed<Cell<number>[]>(() => {
    const s = this.sel();
    const selectedHour = s ? (this.is12h() ? to12h(s.h).h : s.h) : null;
    return this.hourNums().map((h) => ({
      value: h,
      label: pad2(h),
      disabled: this.allMinutesDisabled(this.toH24(h)),
      selected: h === selectedHour,
    }));
  });

  protected readonly minuteCells = computed<Cell<number>[]>(() => {
    const s = this.sel();
    const h24 = this.baseHour();
    return this.minuteNums().map((m) => ({
      value: m,
      label: pad2(m),
      disabled: isTimeDisabled(`${pad2(h24)}:${pad2(m)}`, this.constraints()),
      selected: s ? s.m === m : false,
    }));
  });

  protected readonly periodCells = computed<Cell<'AM' | 'PM'>[]>(() => {
    const s = this.sel();
    return this.periods.map((p) => ({
      value: p,
      label: p,
      disabled: this.hourNums().every((h) =>
        this.allMinutesDisabled(from12h(h, p)),
      ),
      selected: s ? to12h(s.h).period === p : false,
    }));
  });

  protected readonly hourEntry = computed(() => this.entryIndex(this.hourCells()));
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
    const h24 = this.toH24(cell.value);
    const s = this.sel();
    this.emit(h24, s ? s.m : this.firstEnabledMinute(h24));
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
    const s = this.sel();
    const h12 = s ? to12h(s.h).h : this.firstEnabledHour12(cell.value);
    const h24 = from12h(h12, cell.value);
    this.emit(h24, s ? s.m : this.firstEnabledMinute(h24));
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

  private toH24(hCol: number): number {
    return this.is12h() ? from12h(hCol, this.currentPeriod()) : hCol;
  }

  private allMinutesDisabled(h24: number): boolean {
    return this.minuteNums().every((m) =>
      isTimeDisabled(`${pad2(h24)}:${pad2(m)}`, this.constraints()),
    );
  }

  private baseHour(): number {
    const s = this.sel();
    if (s) {
      return s.h;
    }
    const first = this.hourCells().find((c) => !c.disabled);
    return first ? this.toH24(first.value) : 0;
  }

  private firstEnabledMinute(h24: number): number {
    const m = this.minuteNums().find(
      (mm) => !isTimeDisabled(`${pad2(h24)}:${pad2(mm)}`, this.constraints()),
    );
    return m ?? 0;
  }

  private firstEnabledHour12(period: 'AM' | 'PM'): number {
    const h = this.hourNums().find(
      (hh) => !this.allMinutesDisabled(from12h(hh, period)),
    );
    return h ?? 12;
  }

  private emit(h24: number, m: number): void {
    this.timeChange.emit(`${pad2(h24)}:${pad2(m)}`);
  }

  private entryIndex(cells: ReadonlyArray<{ disabled: boolean; selected: boolean }>): number {
    const selected = cells.findIndex((c) => c.selected && !c.disabled);
    return selected >= 0 ? selected : cells.findIndex((c) => !c.disabled);
  }

  private nextEnabled(
    cells: ReadonlyArray<{ disabled: boolean }>,
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

  private cellsFor(column: ColumnId): ReadonlyArray<{ disabled: boolean }> {
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
    buttons: ReadonlyArray<ElementRef<HTMLButtonElement>>,
    index: number,
  ): void {
    buttons[Math.max(index, 0)]?.nativeElement.scrollIntoView({
      block: 'center',
    });
  }
}
