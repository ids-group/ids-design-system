import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';
import {
  clampToRange,
  formatTime,
  from12h,
  genHours,
  genMinutes,
  isTimeDisabled,
  pad2,
  parseTime,
  snapToStep,
  to12h,
  toMinutes,
} from '../generated/time.util';

export type TimePickerMode = 'single' | 'range';
export type TimePickerSize = 'sm' | 'md' | 'lg';
export type TimeFormat = '24h' | '12h';

/** Canonical stored value: 24h `"HH:MM"`. */
export type TimeValue = string;
export type TimeRangeValue = [string | null, string | null];
export type TimePickerValue = TimeValue | TimeRangeValue | null;

/** Which trigger's panel is open — `'single'` in single mode. */
export type TimePickerSegment = 'single' | 'start' | 'end';

export interface TimeConstraints {
  minTime?: string | null;
  maxTime?: string | null;
  disabledTime?: ((time: string) => boolean) | null;
}

type ColumnId = 'hours' | 'minutes' | 'period';

interface Cell<T> {
  value: T;
  label: string;
  disabled: boolean;
  selected: boolean;
}

interface TimeColumnsProps {
  value?: string | null;
  format?: TimeFormat;
  minuteStep?: number;
  minTime?: string | null;
  maxTime?: string | null;
  disabledTime?: ((time: string) => boolean) | null;
  onTimeChange?: (time: string) => void;
}

function TimeColumns({
  value = null,
  format = '24h',
  minuteStep = 1,
  minTime = null,
  maxTime = null,
  disabledTime = null,
  onTimeChange,
}: TimeColumnsProps) {
  const is12h = format === '12h';
  const periods: readonly ('AM' | 'PM')[] = ['AM', 'PM'];
  const constraints: TimeConstraints = { minTime, maxTime, disabledTime };
  const parsedValue = parseTime(value);
  const hourNums = genHours(format);
  const minuteNums = genMinutes(minuteStep);

  const currentPeriod: 'AM' | 'PM' = parsedValue ? to12h(parsedValue.h).period : 'AM';
  const toH24 = (hourCol: number): number =>
    is12h ? from12h(hourCol, currentPeriod) : hourCol;

  const allMinutesDisabled = (hour24: number): boolean =>
    minuteNums.every((minute) =>
      isTimeDisabled(`${pad2(hour24)}:${pad2(minute)}`, constraints),
    );

  const selectedHour = parsedValue ? (is12h ? to12h(parsedValue.h).h : parsedValue.h) : null;
  const hourCells: Cell<number>[] = hourNums.map((hours) => ({
    value: hours,
    label: pad2(hours),
    disabled: allMinutesDisabled(toH24(hours)),
    selected: hours === selectedHour,
  }));

  const baseHour = (): number => {
    if (parsedValue) {
      return parsedValue.h;
    }
    const first = hourCells.find((cell) => !cell.disabled);
    return first ? toH24(first.value) : 0;
  };

  const minuteCells: Cell<number>[] = minuteNums.map((minute) => ({
    value: minute,
    label: pad2(minute),
    disabled: isTimeDisabled(`${pad2(baseHour())}:${pad2(minute)}`, constraints),
    selected: parsedValue ? parsedValue.m === minute : false,
  }));

  const periodCells: Cell<'AM' | 'PM'>[] = periods.map((period) => ({
    value: period,
    label: period,
    disabled: hourNums.every((hours) => allMinutesDisabled(from12h(hours, period))),
    selected: parsedValue ? to12h(parsedValue.h).period === period : false,
  }));

  const entryIndex = (cells: readonly { disabled: boolean; selected: boolean }[]): number => {
    const selected = cells.findIndex((cell) => cell.selected && !cell.disabled);
    return selected >= 0 ? selected : cells.findIndex((cell) => !cell.disabled);
  };
  const hourEntry = entryIndex(hourCells);
  const minuteEntry = entryIndex(minuteCells);
  const periodEntry = entryIndex(periodCells);

  const firstEnabledMinute = (hour24: number): number => {
    const minute = minuteNums.find(
      (candidate) => !isTimeDisabled(`${pad2(hour24)}:${pad2(candidate)}`, constraints),
    );
    return minute ?? 0;
  };

  const firstEnabledHour12 = (period: 'AM' | 'PM'): number => {
    const hours = hourNums.find((candidate) => !allMinutesDisabled(from12h(candidate, period)));
    return hours ?? 12;
  };

  const emit = (hour24: number, minute: number): void => {
    onTimeChange?.(`${pad2(hour24)}:${pad2(minute)}`);
  };

  const selectHour = (cell: Cell<number>): void => {
    if (cell.disabled) return;
    const hour24 = toH24(cell.value);
    emit(hour24, parsedValue ? parsedValue.m : firstEnabledMinute(hour24));
  };

  const selectMinute = (cell: Cell<number>): void => {
    if (cell.disabled) return;
    emit(baseHour(), cell.value);
  };

  const selectPeriod = (cell: Cell<'AM' | 'PM'>): void => {
    if (cell.disabled) return;
    const hour12 = parsedValue ? to12h(parsedValue.h).h : firstEnabledHour12(cell.value);
    const hour24 = from12h(hour12, cell.value);
    emit(hour24, parsedValue ? parsedValue.m : firstEnabledMinute(hour24));
  };

  // Roving focus + selection with the arrow keys; Left/Right hop columns.
  const hourRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const minuteRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const periodRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const cellsFor = (column: ColumnId): readonly { disabled: boolean }[] =>
    column === 'hours' ? hourCells : column === 'minutes' ? minuteCells : periodCells;
  const refsFor = (column: ColumnId) =>
    column === 'hours' ? hourRefs : column === 'minutes' ? minuteRefs : periodRefs;
  const entryFor = (column: ColumnId): number =>
    column === 'hours' ? hourEntry : column === 'minutes' ? minuteEntry : periodEntry;

  const nextEnabled = (
    cells: readonly { disabled: boolean }[],
    from: number,
    step: number,
  ): number => {
    const count = cells.length;
    if (count === 0) return -1;
    let index = from;
    for (let i = 0; i < count; i++) {
      index = (index + step + count) % count;
      if (!cells[index].disabled) return index;
    }
    return -1;
  };

  const selectAt = (column: ColumnId, index: number): void => {
    if (column === 'hours') selectHour(hourCells[index]);
    else if (column === 'minutes') selectMinute(minuteCells[index]);
    else selectPeriod(periodCells[index]);
  };

  const siblingColumn = (column: ColumnId, step: number): ColumnId => {
    const order: ColumnId[] = is12h ? ['hours', 'minutes', 'period'] : ['hours', 'minutes'];
    const next = order.indexOf(column) + step;
    return order[Math.min(Math.max(next, 0), order.length - 1)];
  };

  const focusColumn = (column: ColumnId): void => {
    refsFor(column).current[Math.max(entryFor(column), 0)]?.focus();
  };

  const onKey = (event: React.KeyboardEvent, column: ColumnId, index: number): void => {
    const cells = cellsFor(column);
    let target = -1;
    switch (event.key) {
      case 'ArrowDown':
        target = nextEnabled(cells, index, 1);
        break;
      case 'ArrowUp':
        target = nextEnabled(cells, index, -1);
        break;
      case 'Home':
        target = nextEnabled(cells, -1, 1);
        break;
      case 'End':
        target = nextEnabled(cells, cells.length, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusColumn(siblingColumn(column, 1));
        return;
      case 'ArrowLeft':
        event.preventDefault();
        focusColumn(siblingColumn(column, -1));
        return;
      default:
        return;
    }
    if (target < 0) return;
    event.preventDefault();
    selectAt(column, target);
    refsFor(column).current[target]?.focus();
  };

  // Center each column's selected (or first enabled) entry on mount and when
  // the value changes — scrollTop math instead of scrollIntoView so a preview
  // page never scrolls.
  const colRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  React.useEffect(() => {
    const center = (colIndex: number, refs: Array<HTMLButtonElement | null>, entry: number) => {
      const col = colRefs.current[colIndex];
      const button = refs[Math.max(entry, 0)];
      if (!col || !button) return;
      col.scrollTop =
        button.getBoundingClientRect().top -
        col.getBoundingClientRect().top +
        col.scrollTop -
        (col.clientHeight - button.offsetHeight) / 2;
    };
    center(0, hourRefs.current, hourEntry);
    center(1, minuteRefs.current, minuteEntry);
    if (is12h) center(2, periodRefs.current, periodEntry);
  }, [value, is12h, hourEntry, minuteEntry, periodEntry]);

  const renderColumn = <T,>(
    column: ColumnId,
    colIndex: number,
    ariaLabel: string,
    cells: Cell<T>[],
    entry: number,
    refs: React.MutableRefObject<Array<HTMLButtonElement | null>>,
    onSelect: (cell: Cell<T>) => void,
  ) => (
    <div
      className="col"
      role="listbox"
      aria-label={ariaLabel}
      ref={(el) => {
        colRefs.current[colIndex] = el;
      }}
    >
      {cells.map((cell, index) => (
        <button
          key={String(cell.value)}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="option"
          className={cx('opt', cell.selected && 'is-selected')}
          aria-selected={cell.selected}
          tabIndex={index === entry ? 0 : -1}
          disabled={cell.disabled}
          onClick={() => onSelect(cell)}
          onKeyDown={(event) => onKey(event, column, index)}
        >
          {cell.label}
        </button>
      ))}
    </div>
  );

  return host(
    'ds-time-columns',
    { class: 'ds-time-columns', role: 'group', 'aria-label': 'Time' },
    renderColumn('hours', 0, 'Hours', hourCells, hourEntry, hourRefs, selectHour),
    renderColumn('minutes', 1, 'Minutes', minuteCells, minuteEntry, minuteRefs, selectMinute),
    is12h &&
      renderColumn('period', 2, 'AM/PM', periodCells, periodEntry, periodRefs, selectPeriod),
  );
}

export interface TimePickerProps {
  /** Selected time (`"HH:MM"`, 24h canonical), or `[start, end]` tuple when
   *  `mode="range"`. Controlled when `onValueChange` is provided; otherwise
   *  the component manages its own state seeded from this value. */
  value?: string | TimeRangeValue | null;
  /** Emits the new value when a time is picked or cleared. */
  onValueChange?: (value: string | TimeRangeValue | null) => void;
  /** Single time or `[start, end]` range picker. */
  mode?: TimePickerMode;
  /** Minute increment shown in the picker columns. */
  minuteStep?: number;
  /** Earliest selectable time ("HH:MM"). */
  minTime?: string | null;
  /** Latest selectable time ("HH:MM"). */
  maxTime?: string | null;
  /** Predicate marking individual times unselectable. */
  disabledTime?: ((time: string) => boolean) | null;
  /** Trigger height — sm/md/lg. */
  size?: TimePickerSize;
  /** Disables the picker and blocks all interaction. */
  disabled?: boolean;
  /** Applies error styling and marks the trigger `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the picker. */
  hint?: string;
  /** Shown in the trigger when no time is set. */
  placeholder?: string;
  /** Shows an inline clear button when a value is set — single mode only. */
  clearable?: boolean;
  /** Accessible name for the trigger(s), suffixed "(from)"/"(to)" in range mode. */
  ariaLabel?: string | null;
  /** 12h/24h display format. Default '24h' (the Angular DS-config fallback). */
  format?: TimeFormat | null;
  /** Which trigger's panel is open (`'single'` in single mode). Controlled
   *  when `onOpenSegmentChange` is provided; otherwise internal state seeded
   *  from this value. The open panel renders INLINE inside the host. */
  openSegment?: TimePickerSegment | null;
  /** Emits the segment whose panel opened, or null on close. */
  onOpenSegmentChange?: (segment: TimePickerSegment | null) => void;
}

/** Time field with hours/minutes(/AM-PM) scroll columns — port of
 *  `ds-time-picker`. The panel is a CDK overlay in Angular; this binding
 *  renders it inline inside the host below the trigger(s) — use `openSegment`
 *  to show it statically. Includes the internal `ds-time-columns` listboxes. */
export function TimePicker({
  value,
  onValueChange,
  mode = 'single',
  minuteStep = 1,
  minTime = null,
  maxTime = null,
  disabledTime = null,
  size = 'md',
  disabled = false,
  invalid = false,
  hint = '',
  placeholder = '--:--',
  clearable = false,
  ariaLabel = null,
  format = null,
  openSegment,
  onOpenSegmentChange,
}: TimePickerProps) {
  const [uid] = React.useState(() => nextControlId('ds-timepicker'));
  const hintId = hint ? `${uid}-hint` : undefined;

  const [ownValue, setOwnValue] = React.useState<string | TimeRangeValue | null>(value ?? null);
  const val = onValueChange ? (value ?? null) : ownValue;
  const setVal = (v: string | TimeRangeValue | null) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const [ownSegment, setOwnSegment] = React.useState<TimePickerSegment | null>(
    openSegment ?? null,
  );
  const segment = onOpenSegmentChange ? (openSegment ?? null) : ownSegment;
  const setSegment = (next: TimePickerSegment | null) => {
    if (!onOpenSegmentChange) setOwnSegment(next);
    onOpenSegmentChange?.(next);
  };

  const resolvedFormat: TimeFormat = format ?? '24h';
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const singleValue = typeof val === 'string' ? val : null;
  const rangeValue: TimeRangeValue = Array.isArray(val) ? val : [null, null];
  const hasValue = !!singleValue;
  const formatFor = (v: string | null): string => formatTime(v, resolvedFormat);
  const displayValue = formatFor(singleValue) || placeholder;

  const triggerClasses = cx(
    'trigger',
    size !== 'md' && size,
    disabled && 'disabled',
    invalid && 'error',
    mode === 'single' && clearable && hasValue && 'has-clear',
  );

  const minutesOf = (v: string): number => toMinutes(v) ?? 0;
  const laterOf = (a: string | null, b: string | null): string | null => {
    if (!a) return b;
    if (!b) return a;
    return minutesOf(a) >= minutesOf(b) ? a : b;
  };

  /** Value the open column set edits (the active segment's value). */
  const panelValue =
    segment === 'start' ? rangeValue[0] : segment === 'end' ? rangeValue[1] : singleValue;
  /** The end segment cannot precede the chosen start. */
  const panelMinTime = segment !== 'end' ? minTime : laterOf(minTime, rangeValue[0]);
  const panelMaxTime = maxTime;

  const ariaLabelFor = (seg: TimePickerSegment): string => {
    const base = ariaLabel ?? 'Select time';
    if (seg === 'start') return `${base} (from)`;
    if (seg === 'end') return `${base} (to)`;
    return base;
  };

  const onTriggerClick = (seg: TimePickerSegment): void => {
    if (disabled) return;
    if (segment) {
      const wasSameSegment = segment === seg;
      setSegment(null);
      if (wasSameSegment) return;
    }
    setSegment(seg);
  };

  const close = (): void => setSegment(null);

  const onPick = (next: string): void => {
    if (segment === 'start') {
      const end = rangeValue[1];
      const bumped = end && minutesOf(end) < minutesOf(next);
      setVal([next, bumped ? next : end]);
      return;
    }
    if (segment === 'end') {
      setVal([rangeValue[0], next]);
      return;
    }
    setVal(next);
  };

  const setNow = (): void => {
    const now = new Date();
    const raw = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const constraints: TimeConstraints = {
      minTime: panelMinTime,
      maxTime: panelMaxTime,
      disabledTime,
    };
    onPick(clampToRange(snapToStep(raw, minuteStep), constraints));
  };

  const clear = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setVal(null);
  };

  const renderTrigger = (seg: TimePickerSegment, text: string) => (
    <button
      type="button"
      aria-haspopup="dialog"
      className={triggerClasses}
      disabled={disabled}
      aria-expanded={segment === seg}
      aria-label={ariaLabelFor(seg)}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={hintId}
      onClick={() => onTriggerClick(seg)}
    >
      <Icon name="clock" size={14} />
      <span className="time-value">{text}</span>
    </button>
  );

  return host(
    'ds-time-picker',
    null,
    <div className="field">
      {mode === 'range' ? (
        <div className="range-wrap">
          <div className="trigger-wrap">
            {renderTrigger('start', formatFor(rangeValue[0]) || placeholder)}
          </div>

          <span className="range-sep" aria-hidden="true">–</span>

          <div className="trigger-wrap">
            {renderTrigger('end', formatFor(rangeValue[1]) || placeholder)}
          </div>
        </div>
      ) : (
        <div className="trigger-wrap">
          {renderTrigger('single', displayValue)}

          {clearable && hasValue && (
            <button
              type="button"
              className="time-clear"
              aria-label="Clear"
              disabled={disabled}
              onClick={clear}
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      )}

      <FieldMessage text={hint} state={messageState} messageId={hintId} />
    </div>,
    // Inline panel — Angular portals this into a CDK overlay pane anchored to
    // the open trigger; the `.time-panel` class carries the full panel skin,
    // so in-flow rendering inside the host needs no extra wrapper.
    segment && (
      <div
        className="time-panel"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      >
        <TimeColumns
          value={panelValue}
          format={resolvedFormat}
          minuteStep={minuteStep}
          minTime={panelMinTime}
          maxTime={panelMaxTime}
          disabledTime={disabledTime}
          onTimeChange={onPick}
        />

        <div className="time-footer">
          <button type="button" className="time-action" onClick={setNow}>
            Now
          </button>

          <button type="button" className="time-action primary" onClick={close}>
            Done
          </button>
        </div>
      </div>
    ),
  );
}
