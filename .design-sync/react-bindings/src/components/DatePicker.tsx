import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type DatePickerMode = 'single' | 'range';
export type DatePickerSize = 'sm' | 'md' | 'lg';

export type DateValue = Date | null;
export type RangeValue = [Date | null, Date | null];
export type DatePickerValue = DateValue | RangeValue;

export interface DatePickerPreset {
  label: string;
  value: Date | RangeValue;
}

const YEAR_PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Date/mask utilities — ported verbatim from the DS's date.util.ts (pure TS,
// redeclared locally so the binding stays self-contained).
// ---------------------------------------------------------------------------

interface DateFormatSpec {
  order: ('D' | 'M' | 'Y')[];
  separator: string;
  mask: string;
  segments: { type: 'D' | 'M' | 'Y'; length: number }[];
}

const SEGMENT_LENGTH: Record<'D' | 'M' | 'Y', number> = { D: 2, M: 2, Y: 4 };
const TOKEN: Record<'D' | 'M' | 'Y', string> = { D: 'DD', M: 'MM', Y: 'YYYY' };
// 2023-11-22: day, month and year are all distinct values.
const REFERENCE_DATE = new Date(2023, 10, 22);

function buildSpec(order: ('D' | 'M' | 'Y')[], separator: string): DateFormatSpec {
  return {
    order,
    separator,
    mask: order.map((token) => TOKEN[token]).join(separator),
    segments: order.map((token) => ({ type: token, length: SEGMENT_LENGTH[token] })),
  };
}

function parseFormatTokens(format: string): DateFormatSpec {
  const separatorMatch = format.match(/[^A-Za-z]/);
  const separator = separatorMatch ? separatorMatch[0] : '/';
  const order: ('D' | 'M' | 'Y')[] = [];
  for (const character of format.toUpperCase()) {
    if (
      (character === 'D' || character === 'M' || character === 'Y') &&
      order[order.length - 1] !== character
    ) {
      order.push(character);
    }
  }
  return buildSpec(order.length === 3 ? order : ['M', 'D', 'Y'], separator);
}

function resolveDateFormat(locale: string, explicit?: string | null): DateFormatSpec {
  if (explicit) {
    return parseFormatTokens(explicit);
  }
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(REFERENCE_DATE);
  const order: ('D' | 'M' | 'Y')[] = [];
  let separator = '/';
  let sawSeparator = false;
  for (const part of parts) {
    if (part.type === 'day') {
      order.push('D');
    } else if (part.type === 'month') {
      order.push('M');
    } else if (part.type === 'year') {
      order.push('Y');
    } else if (part.type === 'literal' && !sawSeparator && part.value.trim()) {
      separator = part.value.trim().slice(0, 1);
      sawSeparator = true;
    }
  }
  if (order.length !== 3) {
    return parseFormatTokens('MM/DD/YYYY');
  }
  return buildSpec(order, separator);
}

function formatDate(date: Date | null, spec: DateFormatSpec): string {
  if (!date) {
    return '';
  }
  const values: Record<'D' | 'M' | 'Y', string> = {
    D: String(date.getDate()).padStart(2, '0'),
    M: String(date.getMonth() + 1).padStart(2, '0'),
    Y: String(date.getFullYear()).padStart(4, '0'),
  };
  return spec.order.map((token) => values[token]).join(spec.separator);
}

/** Build a date from three per-slot digit strings; null if any slot isn't full-width or invalid. */
function parseSegments(segments: string[], spec: DateFormatSpec): Date | null {
  const values: Record<'D' | 'M' | 'Y', number> = { D: 1, M: 1, Y: 2000 };
  for (let index = 0; index < spec.segments.length; index++) {
    const segment = spec.segments[index];
    const digits = segments[index] ?? '';
    if (digits.length !== segment.length) {
      return null;
    }
    values[segment.type] = parseInt(digits, 10);
  }
  const { D: day, M: month, Y: year } = values;
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function parseDate(text: string, spec: DateFormatSpec): Date | null {
  return parseSegments(parseFieldText(text, singleFieldLayout(spec)), spec);
}

/** Separator between the two dates of a range, in the field and its placeholder. */
const RANGE_SEPARATOR = ' – ';

/** Combined placeholder/mask for a range field, e.g. "MM/DD/YYYY – MM/DD/YYYY". */
function rangeMask(spec: DateFormatSpec): string {
  return `${spec.mask}${RANGE_SEPARATOR}${spec.mask}`;
}

/** Render a range value to the combined field string. */
function formatRange(
  range: [Date | null, Date | null] | null,
  spec: DateFormatSpec,
): string {
  const [start, end] = range ?? [null, null];
  if (!start && !end) {
    return '';
  }
  const startText = formatDate(start, spec);
  if (start && end) {
    return `${startText}${RANGE_SEPARATOR}${formatDate(end, spec)}`;
  }
  return start ? `${startText}${RANGE_SEPARATOR}` : '';
}

/** Parse a combined range field string into [start, end] (either may be null). */
function parseDateRange(text: string, spec: DateFormatSpec): [Date | null, Date | null] {
  const slots = parseFieldText(text, rangeFieldLayout(spec));
  const perDate = spec.segments.length;
  return [
    parseSegments(slots.slice(0, perDate), spec),
    parseSegments(slots.slice(perDate, perDate * 2), spec),
  ];
}

/** One editable digit slot in the masked field. */
interface FieldSlot {
  type: 'D' | 'M' | 'Y';
  maxLength: number;
}

/** Field layout: the slots and the literal shown after each (except the last). */
interface FieldLayout {
  slots: FieldSlot[];
  literals: string[];
}

function singleFieldLayout(spec: DateFormatSpec): FieldLayout {
  return {
    slots: spec.segments.map((segment) => ({
      type: segment.type,
      maxLength: segment.length,
    })),
    literals: spec.segments.slice(1).map(() => spec.separator),
  };
}

function rangeFieldLayout(spec: DateFormatSpec): FieldLayout {
  const single = singleFieldLayout(spec);
  return {
    slots: [...single.slots, ...single.slots],
    literals: [...single.literals, RANGE_SEPARATOR, ...single.literals],
  };
}

/** Split a fixed-width renderFieldValue output into per-slot digits. */
function parseFieldText(text: string, layout: FieldLayout): string[] {
  const segments: string[] = [];
  let position = 0;
  for (let index = 0; index < layout.slots.length; index++) {
    const raw = text.slice(position, position + layout.slots[index].maxLength);
    segments.push(raw.replace(/\D/g, ''));
    position += layout.slots[index].maxLength;
    if (index < layout.slots.length - 1) {
      position += layout.literals[index].length;
    }
  }
  return segments;
}

const PLACEHOLDER_CHAR = '_';

interface DisplayPart {
  text: string;
  muted: boolean;
}

function slotPlaceholder(slot: FieldSlot): string {
  return slot.type === 'Y' ? 'YYYY' : slot.type === 'M' ? 'MM' : 'DD';
}

/** Fixed-width input value: every slot padded to maxLength with `_`, all literals present. */
function renderFieldValue(segments: string[], layout: FieldLayout): string {
  let out = '';
  for (let index = 0; index < layout.slots.length; index++) {
    const slot = layout.slots[index];
    out += segments[index].padEnd(slot.maxLength, PLACEHOLDER_CHAR);
    if (index < layout.slots.length - 1) {
      out += layout.literals[index];
    }
  }
  return out;
}

/** Ordered runs for the overlay: digits (not muted), placeholders (muted), literals (not muted). */
function displayParts(segments: string[], layout: FieldLayout): DisplayPart[] {
  const parts: DisplayPart[] = [];
  for (let index = 0; index < layout.slots.length; index++) {
    const slot = layout.slots[index];
    const digits = segments[index];
    if (digits.length === 0) {
      parts.push({ text: slotPlaceholder(slot), muted: true });
    } else {
      parts.push({ text: digits, muted: false });
      if (digits.length < slot.maxLength) {
        parts.push({
          text: PLACEHOLDER_CHAR.repeat(slot.maxLength - digits.length),
          muted: true,
        });
      }
    }
    if (index < layout.slots.length - 1) {
      parts.push({ text: layout.literals[index], muted: false });
    }
  }
  return parts;
}

/** Char offset where slot `index` begins in the fixed-width value. */
function slotStart(layout: FieldLayout, index: number): number {
  let position = 0;
  for (let slot = 0; slot < index; slot++) {
    position += layout.slots[slot].maxLength + layout.literals[slot].length;
  }
  return position;
}

function slotToCaret(layout: FieldLayout, slot: number, offset: number): number {
  return slotStart(layout, slot) + offset;
}

/** Map a caret char offset to its slot; a caret inside a literal snaps forward. */
function caretToSlot(
  layout: FieldLayout,
  caret: number,
): { slot: number; offset: number } {
  let position = 0;
  for (let index = 0; index < layout.slots.length; index++) {
    const width = layout.slots[index].maxLength;
    if (caret <= position + width) {
      return { slot: index, offset: Math.max(0, caret - position) };
    }
    position += width;
    const literalLength =
      index < layout.literals.length ? layout.literals[index].length : 0;
    if (caret < position + literalLength) {
      return { slot: index + 1, offset: 0 };
    }
    position += literalLength;
  }
  const last = layout.slots.length - 1;
  return { slot: last, offset: layout.slots[last].maxLength };
}

interface SlotEdit {
  segments: string[];
  slot: number;
  offset: number;
}

/** After typing, hop to the next slot once the current one is full. */
function advanceAfterType(
  segments: string[],
  layout: FieldLayout,
  slot: number,
  offset: number,
): SlotEdit {
  if (offset >= layout.slots[slot].maxLength && slot < layout.slots.length - 1) {
    return { segments, slot: slot + 1, offset: 0 };
  }
  return { segments, slot, offset };
}

/** Type a digit into the caret's slot: overtype under the caret, else append;
 *  a full slot spills the digit into the next one instead of shifting. */
function editType(
  segments: string[],
  layout: FieldLayout,
  slot: number,
  offset: number,
  digit: string,
): SlotEdit {
  const next = segments.slice();
  const maxLength = layout.slots[slot].maxLength;
  const current = next[slot];
  if (offset < current.length) {
    next[slot] = current.slice(0, offset) + digit + current.slice(offset + 1);
    return advanceAfterType(next, layout, slot, offset + 1);
  }
  if (current.length < maxLength) {
    next[slot] = current + digit;
    return advanceAfterType(next, layout, slot, current.length + 1);
  }
  if (slot < layout.slots.length - 1) {
    return editType(next, layout, slot + 1, 0, digit);
  }
  return { segments: next, slot, offset };
}

/** Backspace: drop the digit left of the caret within its slot, else the last
 *  digit of the nearest earlier non-empty slot. Null when nothing precedes it. */
function editBackspace(
  segments: string[],
  layout: FieldLayout,
  slot: number,
  offset: number,
): SlotEdit | null {
  const next = segments.slice();
  if (offset > 0) {
    next[slot] = next[slot].slice(0, offset - 1) + next[slot].slice(offset);
    return { segments: next, slot, offset: offset - 1 };
  }
  for (let index = slot - 1; index >= 0; index--) {
    if (next[index].length > 0) {
      next[index] = next[index].slice(0, -1);
      return { segments: next, slot: index, offset: next[index].length };
    }
  }
  return null;
}

/** Delete: drop the digit at the caret within its slot, else the first digit of
 *  the nearest later non-empty slot. Null when nothing follows it. */
function editDelete(
  segments: string[],
  layout: FieldLayout,
  slot: number,
  offset: number,
): SlotEdit | null {
  const next = segments.slice();
  if (offset < next[slot].length) {
    next[slot] = next[slot].slice(0, offset) + next[slot].slice(offset + 1);
    return { segments: next, slot, offset };
  }
  for (let index = slot + 1; index < next.length; index++) {
    if (next[index].length > 0) {
      next[index] = next[index].slice(1);
      return { segments: next, slot, offset };
    }
  }
  return null;
}

function weekdayLabels(
  locale: string,
  firstDayOfWeek: number,
  style: 'short' | 'long' = 'short',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: style });
  // 2023-01-01 is a Sunday (getDay() === 0).
  const sunday = new Date(2023, 0, 1);
  const labels: string[] = [];
  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (firstDayOfWeek + offset) % 7;
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + dayIndex);
    labels.push(formatter.format(day));
  }
  return labels;
}

function monthLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_unused, month) =>
    formatter.format(new Date(2023, month, 1)),
  );
}

function fullDateLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Field text for the DOM: fixed-width `_`-padded once any digit exists,
 *  else '' (so an untouched field is genuinely empty). */
function toFieldText(segments: string[], layout: FieldLayout): string {
  return segments.some((segment) => segment.length > 0)
    ? renderFieldValue(segments, layout)
    : '';
}

function countDigits(text: string): number {
  return text.replace(/\D/g, '').length;
}

// ---------------------------------------------------------------------------
// CalendarDay — INTERNAL port of `ds-calendar-day` (not publicly exported by
// the DS). Host is `display: contents` in CSS so the inner button is the grid
// item while the a11y tree keeps grid → row → gridcell(host) → button.
// ---------------------------------------------------------------------------

interface CalendarDayProps {
  selected?: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  today?: boolean;
  /** Day from an adjacent month — dimmed. */
  muted?: boolean;
  disabled?: boolean;
  /** Stable key the date-picker uses to focus a specific day (roving tabindex). */
  dataDay?: string | null;
  tabIndex?: number;
  ariaLabel?: string | null;
  onDaySelected?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDayKeydown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

function CalendarDay({
  selected = false,
  inRange = false,
  rangeStart = false,
  rangeEnd = false,
  today = false,
  muted = false,
  disabled = false,
  dataDay = null,
  tabIndex = -1,
  ariaLabel = null,
  onDaySelected,
  onDayKeydown,
  children,
}: CalendarDayProps) {
  const classes = cx(
    'day',
    muted && 'muted',
    today && 'today',
    inRange && 'in-range',
    rangeStart && 'range-start',
    rangeEnd && 'range-end',
    selected && 'selected',
    disabled && 'disabled',
  );
  return host(
    'ds-calendar-day',
    {
      role: 'gridcell',
      'aria-selected': selected || rangeStart || rangeEnd ? 'true' : undefined,
    },
    <button
      type="button"
      className={classes}
      data-day={dataDay ?? undefined}
      tabIndex={tabIndex}
      aria-label={ariaLabel ?? undefined}
      aria-current={today ? 'date' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={onDaySelected}
      onKeyDown={onDayKeydown}
    >
      {children}
    </button>,
  );
}

// ---------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------

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

export interface DatePickerProps {
  /** Selection mode — single date or start/end range. */
  mode?: DatePickerMode;
  /** Trigger height — sm/md/lg. */
  size?: DatePickerSize;
  /** Selected date (single) or `[start, end]` (range). Controlled when
   *  `onValueChange` is provided; otherwise internal state seeded from this. */
  value?: Date | RangeValue | null;
  /** Emits the new value on selection, typed commit, or clear. */
  onValueChange?: (value: Date | RangeValue | null) => void;
  /** Accessible-name fallback only — the mask fills the visible placeholder, not this. */
  placeholder?: string;
  /** Field label shown above the trigger. */
  label?: string;
  /** Helper text shown below the field. */
  hint?: string;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker beside the label — ignored when `required` is set. */
  optional?: boolean;
  /** Disables the picker and blocks all interaction. */
  disabled?: boolean;
  /** Applies error styling and marks the trigger `aria-invalid`. */
  invalid?: boolean;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string | null;
  /** Lower bound for the year dropdown in the calendar header.
   *  Defaults to 100 years before the initial visible month's year. */
  minYear?: number;
  /** Upper bound for the year dropdown in the calendar header.
   *  Defaults to 10 years after the initial visible month's year. */
  maxYear?: number;
  /** Earliest selectable date (inclusive). Days before this are disabled. */
  minDate?: Date | null;
  /** Latest selectable date (inclusive). Days after this are disabled. */
  maxDate?: Date | null;
  /** Predicate — return true to disable an individual day. */
  disabledDate?: ((date: Date) => boolean) | null;
  /** Quick-pick shortcuts shown as a button column inside the calendar panel. */
  presets?: readonly DatePickerPreset[];
  /** BCP-47 locale driving month/weekday names and the value format. Default 'en-US'. */
  locale?: string | null;
  /** Explicit token format e.g. `'MM/DD/YYYY'`; default derived from `locale`. */
  dateFormat?: string | null;
  /** First weekday column: 0=Sunday … 6=Saturday. Default 1 (Monday). */
  firstDayOfWeek?: number | null;
  /** Date the calendar opens on when the value is empty (e.g. a Date Of Birth).
   *  Never written to `value` — selection stays with the user. */
  defaultDate?: Date | null;
  /** Allow masked manual typing. When false the trigger is calendar-only. */
  allowInput?: boolean;
  /** Initial visible month of the calendar grid (any date inside it). Defaults
   *  to the value's month (range start in range mode), else `defaultDate`,
   *  else the current month. Pass a fixed date for deterministic renders. */
  month?: Date;
  /** Calendar panel open state. Controlled when `onOpenChange` is provided;
   *  otherwise the component manages its own state seeded from this value.
   *  The open panel renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Emits the new open state when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/** Date field with masked typing + calendar panel — port of `ds-date-picker`.
 *  The panel is a CDK overlay in Angular; this binding renders it inline
 *  inside the host (the re-scoped CSS only reaches host descendants, so no
 *  portals) — use the `open` prop to show it statically. Includes the internal
 *  `ds-calendar-day` grid cells. */
export function DatePicker({
  mode = 'single',
  size = 'md',
  value,
  onValueChange,
  placeholder = 'Select date',
  label = '',
  hint = '',
  required = false,
  optional = false,
  disabled = false,
  invalid = false,
  ariaLabel = null,
  minYear,
  maxYear,
  minDate = null,
  maxDate = null,
  disabledDate = null,
  presets = [],
  locale = null,
  dateFormat = null,
  firstDayOfWeek = null,
  defaultDate = null,
  allowInput = true,
  month,
  open,
  onOpenChange,
}: DatePickerProps) {
  const [uid] = React.useState(() => nextControlId('ds-datepicker'));
  const labelId = `${uid}-label`;
  const panelId = `${uid}-panel`;
  const captionId = `${uid}-caption`;

  // ---- value (controlled or internal, seeded from prop) ----
  const [ownValue, setOwnValue] = React.useState<Date | RangeValue | null>(value ?? null);
  const val = onValueChange ? (value ?? null) : ownValue;
  const setVal = (v: Date | RangeValue | null) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  // ---- open (controlled or internal, seeded from prop) ----
  const [ownOpen, setOwnOpen] = React.useState(open ?? false);
  const isOpen = onOpenChange ? (open ?? false) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const resolvedLocale = locale ?? 'en-US';
  const resolvedFirstDay = firstDayOfWeek ?? 1;
  const spec = React.useMemo(
    () => resolveDateFormat(resolvedLocale, dateFormat),
    [resolvedLocale, dateFormat],
  );
  /** Slot/literal layout for the current mode — single date or doubled range. */
  const layout = React.useMemo(
    () => (mode === 'range' ? rangeFieldLayout(spec) : singleFieldLayout(spec)),
    [mode, spec],
  );
  const monthNames = React.useMemo(() => monthLabels(resolvedLocale), [resolvedLocale]);
  const weekdays = React.useMemo(
    () => weekdayLabels(resolvedLocale, resolvedFirstDay),
    [resolvedLocale, resolvedFirstDay],
  );
  const weekdaysFull = React.useMemo(
    () => weekdayLabels(resolvedLocale, resolvedFirstDay, 'long'),
    [resolvedLocale, resolvedFirstDay],
  );

  const isDayDisabled = (date: Date): boolean => {
    if (minDate) {
      const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (date < minStart) return true;
    }
    if (maxDate) {
      const maxEnd = new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        maxDate.getDate(),
        23,
        59,
        59,
        999,
      );
      if (date > maxEnd) return true;
    }
    if (disabledDate) return disabledDate(date);
    return false;
  };

  const clampToBounds = (date: Date): Date => {
    if (minDate && date < minDate) return new Date(minDate);
    if (maxDate && date > maxDate) return new Date(maxDate);
    return date;
  };

  const selectedStart = (v: Date | RangeValue | null): Date | null =>
    v instanceof Date ? v : Array.isArray(v) ? (v[0] ?? null) : null;

  // Initial grid focus / visible month — value's month, else defaultDate,
  // else today (computed once on mount, never in module scope).
  const initialFocus = () => clampToBounds(selectedStart(val) ?? defaultDate ?? new Date());
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    const seed = month ?? initialFocus();
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
  });
  /** The day that holds keyboard focus in the open grid (roving tabindex). */
  const [gridFocus, setGridFocus] = React.useState<Date | null>(() => initialFocus());
  const viewMonthIndex = viewMonth.getMonth();
  const viewYear = viewMonth.getFullYear();
  /** Localized "Month YYYY" caption — the grid's accessible name + live label. */
  const monthYearLabel = `${monthNames[viewMonthIndex]} ${viewYear}`;

  // Year-dropdown bounds default relative to the initial visible month's year
  // (Angular uses "now" at construction; a fixed base keeps renders deterministic).
  const [yearBase] = React.useState(() => viewMonth.getFullYear());
  const resolvedMinYear = minYear ?? yearBase - 100;
  const resolvedMaxYear = maxYear ?? yearBase + 10;

  // ---- Month / year grid pickers in the calendar header ----
  const [monthMenuOpen, setMonthMenuOpen] = React.useState(false);
  const [yearMenuOpen, setYearMenuOpen] = React.useState(false);
  const [yearPageStart, setYearPageStart] = React.useState(0);

  const yearsOnPage: number[] = [];
  for (
    let year = yearPageStart;
    year < yearPageStart + YEAR_PAGE_SIZE && year <= resolvedMaxYear;
    year++
  ) {
    yearsOnPage.push(year);
  }
  const yearRangeLabel = yearsOnPage.length
    ? `${yearsOnPage[0]} – ${yearsOnPage[yearsOnPage.length - 1]}`
    : '';
  const canPrevYearPage = yearPageStart > resolvedMinYear;
  const canNextYearPage = yearPageStart + YEAR_PAGE_SIZE <= resolvedMaxYear;

  /** Aligns the page so `year` lands on a stable grid boundary measured from minYear. */
  const yearPageStartFor = (year: number): number =>
    resolvedMinYear + Math.floor((year - resolvedMinYear) / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;

  const closeMenus = () => {
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
  };

  // ---- Masked field text ----
  // editText null → not editing; the field shows text derived from the value.
  const [editText, setEditText] = React.useState<string | null>(null);
  const [typedInvalid, setTypedInvalid] = React.useState(false);
  const [rangeInvalid, setRangeInvalid] = React.useState(false);

  const derivedText = React.useMemo(() => {
    if (mode === 'single') {
      const date = val instanceof Date ? val : null;
      return date ? formatDate(date, spec) : '';
    }
    const single = singleFieldLayout(spec);
    const [start, end] = (Array.isArray(val) ? val : [null, null]) as RangeValue;
    const startSegments = start
      ? parseFieldText(formatDate(start, spec), single)
      : single.slots.map(() => '');
    const endSegments = end
      ? parseFieldText(formatDate(end, spec), single)
      : single.slots.map(() => '');
    return toFieldText([...startSegments, ...endSegments], layout);
  }, [mode, val, spec, layout]);

  /** Text shown in the field: masked single value, or the combined range string. */
  const fieldText = editText ?? derivedText;
  /** Format-mask placeholder (single) or the doubled range mask. */
  const fieldPlaceholder = mode === 'single' ? spec.mask : rangeMask(spec);
  /** `size` attribute so the field hugs its mask width instead of stretching. */
  const fieldSize = fieldPlaceholder.length + 1;
  /** Per-slot overlay runs: digits at normal weight, unfilled positions muted. */
  const displaySlots = displayParts(parseFieldText(fieldText, layout), layout);

  const hasError = invalid || typedInvalid || rangeInvalid;
  const messageState: FieldMessageState = hasError ? 'error' : 'default';
  /** Field-message text: a validation message when typing is invalid, else the hint. */
  const messageText =
    typedInvalid || rangeInvalid
      ? `Enter a valid date (${mode === 'single' ? spec.mask : rangeMask(spec)})`
      : hint;
  const hintId = messageText ? `${uid}-hint` : undefined;
  const resolvedAriaLabel = label ? undefined : ariaLabel || placeholder || undefined;

  const triggerClasses = cx(
    'trigger',
    size !== 'md' && size,
    disabled && 'disabled',
    hasError && 'error',
  );

  // ---- Calendar grid ----
  const getRangeContext = (d: Date) => {
    if (mode === 'single') {
      const sel = val instanceof Date ? val : null;
      return {
        inRange: false,
        isStart: false,
        isEnd: false,
        isSelected: !!sel && sel.toDateString() === d.toDateString(),
      };
    }
    const r = (Array.isArray(val) ? val : [null, null]) as RangeValue;
    const a = r[0];
    const b = r[1];
    if (!a) {
      return { inRange: false, isStart: false, isEnd: false, isSelected: false };
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
  };

  const daysGrid: DayCell[] = [];
  {
    const gridStart = new Date(viewYear, viewMonthIndex, 1);
    gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() - resolvedFirstDay + 7) % 7));
    const todayKey = new Date().toDateString();
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      const range = getRangeContext(d);
      daysGrid.push({
        date: d,
        day: d.getDate(),
        inMonth: d.getMonth() === viewMonthIndex,
        isToday: d.toDateString() === todayKey,
        inRange: range.inRange,
        isRangeStart: range.isStart,
        isRangeEnd: range.isEnd,
        isSelected: range.isSelected,
        isDisabled: isDayDisabled(d),
      });
    }
  }
  /** daysGrid split into rows of 7 for the grid's `role="row"` structure. */
  const weeksGrid: DayCell[][] = [];
  for (let index = 0; index < daysGrid.length; index += 7) {
    weeksGrid.push(daysGrid.slice(index, index + 7));
  }

  const isFocusDay = (cell: DayCell): boolean =>
    !!gridFocus && dayKey(gridFocus) === dayKey(cell.date);
  /** Full, unambiguous date for a day cell's accessible name. */
  const dayLabel = (cell: DayCell): string => fullDateLabel(cell.date, resolvedLocale);

  // ---- Open / close ----
  const inputRef = React.useRef<HTMLInputElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const pendingGridFocusRef = React.useRef(false);

  React.useEffect(() => {
    if (!pendingGridFocusRef.current) return;
    pendingGridFocusRef.current = false;
    if (!gridFocus || !panelRef.current) return;
    const element = panelRef.current.querySelector<HTMLElement>(
      `[data-day="${dayKey(gridFocus)}"]`,
    );
    element?.focus();
  });

  const openPanel = (moveFocusToGrid = true): void => {
    if (disabled || isOpen) return;
    // Seed grid focus on the selected day (or defaultDate/today) and show its month.
    const focus = clampToBounds(selectedStart(val) ?? defaultDate ?? new Date());
    setGridFocus(focus);
    setViewMonth(new Date(focus.getFullYear(), focus.getMonth(), 1));
    setOpen(true);
    if (moveFocusToGrid) pendingGridFocusRef.current = true;
  };

  const close = (): void => {
    const focusWasInPanel =
      !!panelRef.current && panelRef.current.contains(document.activeElement);
    setOpen(false);
    closeMenus();
    // Refocusing the editable field on a coarse pointer would summon the soft
    // keyboard mid-scroll; the readonly field (allowInput=false) never does.
    if (
      focusWasInPanel &&
      (!allowInput || !window.matchMedia('(pointer: coarse)').matches)
    ) {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const focusTrigger = () => inputRef.current?.focus();

  const onFieldClick = (): void => {
    openPanel(!allowInput);
    if (allowInput) inputRef.current?.focus();
  };

  // ---- Masked segment editing (desktop keyboard + paste + fallback input) ----

  /** Force the DOM value to `text` and place the caret — the controlled
   *  re-render writes the same string, which leaves the caret untouched. */
  const writeBackText = (element: HTMLInputElement, text: string, caret: number): void => {
    if (element.value !== text) {
      element.value = text;
    }
    element.setSelectionRange(caret, caret);
  };

  /** Parse the combined range text, flag malformed segments, commit on blur.
   *  Returns whether the text is currently invalid. */
  const applyRangeText = (text: string, commit: boolean): boolean => {
    if (countDigits(text) === 0) {
      setRangeInvalid(false);
      setVal(null);
      if (commit) setEditText(null);
      return false;
    }
    const rLayout = rangeFieldLayout(spec);
    const slots = parseFieldText(text, rLayout);
    const perDate = spec.segments.length;
    const startFilled = slots
      .slice(0, perDate)
      .every((seg, i) => seg.length === spec.segments[i].length);
    const endFilled = slots
      .slice(perDate, perDate * 2)
      .every((seg, i) => seg.length === spec.segments[i].length);
    const [start, end] = parseDateRange(text, spec);
    const startBad = startFilled && (!start || isDayDisabled(start));
    const endBad = endFilled && (!end || isDayDisabled(end));
    setRangeInvalid(startBad || endBad);
    if (start && end && !startBad && !endBad) {
      const ordered: RangeValue =
        start.getTime() <= end.getTime() ? [start, end] : [end, start];
      setVal(ordered);
      if (commit) setEditText(formatRange(ordered, spec));
    } else if (commit) {
      setVal([start ?? null, end ?? null]);
    }
    return startBad || endBad;
  };

  /** Write masked text + caret into the DOM, then parse and validate it. */
  const applyEditedText = (element: HTMLInputElement, text: string, caret: number): void => {
    writeBackText(element, text, caret);
    setEditText(text);
    if (mode === 'range') {
      applyRangeText(text, false);
      return;
    }
    const parsed = parseDate(text, spec);
    if (!parsed) {
      // Incomplete input is not an error yet; a full-but-bad value is caught on blur.
      setTypedInvalid(false);
      return;
    }
    if (isDayDisabled(parsed)) {
      setTypedInvalid(true);
      return;
    }
    setTypedInvalid(false);
    setVal(parsed);
    setViewMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  };

  /** Apply one segment edit (type a digit / Backspace / Delete) at the caret or
   *  over the selection — `_` placeholders are never natively erased. */
  const runSegmentEdit = (
    element: HTMLInputElement,
    kind: 'type' | 'backspace' | 'delete',
    digit?: string,
  ): void => {
    const segments = parseFieldText(element.value, layout);
    const caret = element.selectionStart ?? element.value.length;
    const selectionEnd = element.selectionEnd ?? caret;
    let edit: SlotEdit | null;
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
    if (!edit) return;
    const text = toFieldText(edit.segments, layout);
    applyEditedText(element, text, text ? slotToCaret(layout, edit.slot, edit.offset) : 0);
  };

  /** Physical-keyboard editing: typed digits fill the caret's slot;
   *  Backspace/Delete never shift digits across a separator. */
  const onFieldKeydown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      openPanel(true);
      return;
    }
    if (!allowInput) return;
    const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
    const isDigit = key.length === 1 && key >= '0' && key <= '9' && plain;
    if (key.length === 1 && plain && !isDigit) {
      // Reject non-numeric characters outright, as typed.
      event.preventDefault();
      return;
    }
    if (!isDigit && key !== 'Backspace' && key !== 'Delete') return;
    event.preventDefault();
    runSegmentEdit(
      event.currentTarget,
      isDigit ? 'type' : key === 'Backspace' ? 'backspace' : 'delete',
      isDigit ? key : undefined,
    );
  };

  /** Caret just past the last digit filled by a flat digit stream. */
  const caretAfterFill = (segments: string[]): number => {
    for (let slot = 0; slot < segments.length; slot++) {
      if (segments[slot].length < layout.slots[slot].maxLength) {
        return slotToCaret(layout, slot, segments[slot].length);
      }
    }
    const last = segments.length - 1;
    return slotToCaret(layout, last, layout.slots[last].maxLength);
  };

  /** Rebuild `raw` as a digit stream (IME / autofill / suggestion fallback). */
  const commitRaw = (element: HTMLInputElement, raw: string): void => {
    const capacity = layout.slots.reduce((sum, slot) => sum + slot.maxLength, 0);
    const digits = raw.replace(/\D/g, '').slice(0, capacity);
    const segments: string[] = [];
    let index = 0;
    for (const slot of layout.slots) {
      segments.push(digits.slice(index, index + slot.maxLength));
      index += slot.maxLength;
    }
    const text = toFieldText(segments, layout);
    applyEditedText(element, text, caretAfterFill(segments));
  };

  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!allowInput) return;
    commitRaw(event.currentTarget, event.currentTarget.value);
  };

  /** Paste digits into the segment model at the caret slot — never a global
   *  flatten — so existing digits elsewhere in the field survive untouched. */
  const onFieldPaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    if (!allowInput) return;
    event.preventDefault();
    const element = event.currentTarget;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (!pasted) return;
    const segments = parseFieldText(element.value, layout);
    const caret = element.selectionStart ?? element.value.length;
    const start = caretToSlot(layout, caret);
    let result: SlotEdit = { segments, slot: start.slot, offset: start.offset };
    for (const digit of pasted) {
      result = editType(result.segments, layout, result.slot, result.offset, digit);
    }
    applyEditedText(
      element,
      toFieldText(result.segments, layout),
      slotToCaret(layout, result.slot, result.offset),
    );
  };

  const onFieldBlur = (): void => {
    if (!allowInput) return;
    if (mode === 'range') {
      const bad = applyRangeText(fieldText, true);
      if (!bad && countDigits(fieldText) > 0) setEditText(null);
      return;
    }
    const text = fieldText;
    if (countDigits(text) === 0) {
      setTypedInvalid(false);
      setVal(null);
      setEditText(null);
      return;
    }
    const parsed = parseDate(text, spec);
    if (parsed && !isDayDisabled(parsed)) {
      setTypedInvalid(false);
      setVal(parsed);
      setEditText(null);
    } else {
      setTypedInvalid(true);
    }
  };

  // ---- Calendar interactions ----
  const prevMonth = () => setViewMonth(addMonths(viewMonth, -1));
  const nextMonth = () => setViewMonth(addMonths(viewMonth, 1));

  const toggleMonthMenu = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setYearMenuOpen(false);
    setMonthMenuOpen((o) => !o);
  };

  const toggleYearMenu = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setMonthMenuOpen(false);
    setYearMenuOpen((o) => {
      if (!o) setYearPageStart(yearPageStartFor(viewYear));
      return !o;
    });
  };

  const prevYearPage = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setYearPageStart((start) => Math.max(resolvedMinYear, start - YEAR_PAGE_SIZE));
  };

  const nextYearPage = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setYearPageStart((start) => start + YEAR_PAGE_SIZE);
  };

  const selectMonth = (index: number, event: React.MouseEvent): void => {
    event.stopPropagation();
    setViewMonth(new Date(viewYear, index, 1));
    setMonthMenuOpen(false);
  };

  const selectYear = (year: number, event: React.MouseEvent): void => {
    event.stopPropagation();
    setViewMonth(new Date(year, viewMonthIndex, 1));
    setYearMenuOpen(false);
  };

  const selectDay = (cell: DayCell): void => {
    if (cell.isDisabled) return;
    if (mode === 'single') {
      setEditText(null);
      setTypedInvalid(false);
      setVal(new Date(cell.date));
      close();
      focusTrigger();
      return;
    }
    const r = (Array.isArray(val) ? val : [null, null]) as RangeValue;
    const a = r[0];
    const b = r[1];
    setEditText(null);
    if (!a || (a && b)) {
      setVal([new Date(cell.date), null]);
      setGridFocus(new Date(cell.date));
    } else {
      const picked = new Date(cell.date);
      const range: RangeValue = a.getTime() <= picked.getTime() ? [a, picked] : [picked, a];
      setRangeInvalid(false);
      setVal(range);
      close();
      focusTrigger();
    }
  };

  /** Arrow-key roving navigation across the calendar grid (APG date grid). */
  const onGridKeydown = (event: React.KeyboardEvent, cell: DayCell): void => {
    if (disabled) return;
    const f = gridFocus ?? cell.date;
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(f, -1);
        break;
      case 'ArrowRight':
        next = addDays(f, 1);
        break;
      case 'ArrowUp':
        next = addDays(f, -7);
        break;
      case 'ArrowDown':
        next = addDays(f, 7);
        break;
      case 'Home':
        next = addDays(f, -((f.getDay() - resolvedFirstDay + 7) % 7));
        break;
      case 'End':
        next = addDays(f, 6 - ((f.getDay() - resolvedFirstDay + 7) % 7));
        break;
      case 'PageUp':
        next = addMonths(f, -1);
        break;
      case 'PageDown':
        next = addMonths(f, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectDay(cell);
        return;
      default:
        return;
    }
    event.preventDefault();
    setGridFocus(next);
    setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    pendingGridFocusRef.current = true;
  };

  const isPresetDisabled = (preset: DatePickerPreset): boolean => {
    const presetValue = preset.value;
    if (presetValue instanceof Date) {
      return isDayDisabled(presetValue);
    }
    const [start, end] = presetValue;
    if (start && isDayDisabled(start)) return true;
    if (end && isDayDisabled(end)) return true;
    return false;
  };

  const applyPreset = (preset: DatePickerPreset): void => {
    if (isPresetDisabled(preset)) return;
    setEditText(null);
    setTypedInvalid(false);
    setRangeInvalid(false);
    const presetValue = preset.value;
    if (presetValue instanceof Date) {
      setVal(new Date(presetValue));
    } else {
      setVal([
        presetValue[0] ? new Date(presetValue[0]) : null,
        presetValue[1] ? new Date(presetValue[1]) : null,
      ]);
    }
    close();
    focusTrigger();
  };

  const onPanelKeydown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      focusTrigger();
    }
  };

  return host(
    'ds-date-picker',
    null,
    <div className="field">
      {label && (
        <span className="label" id={labelId}>
          {label}
          {required ? (
            <span className="req" aria-hidden="true">*</span>
          ) : optional ? (
            <span className="optional-marker" aria-hidden="true">(optional)</span>
          ) : null}
        </span>
      )}

      {/* Whole-field click opens the panel; keyboard access is on the inner input. */}
      <div className={triggerClasses} onClick={onFieldClick}>
        <span className="input-wrap">
          <input
            ref={inputRef}
            type="text"
            className={cx('date-input', allowInput && 'masked')}
            inputMode="numeric"
            autoComplete="off"
            aria-haspopup="dialog"
            value={fieldText}
            size={fieldSize}
            readOnly={!allowInput}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-label={resolvedAriaLabel}
            aria-required={required ? 'true' : undefined}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hintId}
            aria-placeholder={fieldPlaceholder}
            onChange={onFieldChange}
            onPaste={onFieldPaste}
            onBlur={onFieldBlur}
            onKeyDown={onFieldKeydown}
          />
          {/* Per-slot overlay: the real input is transparent (.masked), so this
              paints every glyph. Whitespace-tight on purpose — the overlay
              paints with `white-space: pre`. */}
          {allowInput && (
            <span className="mask-ghost" aria-hidden="true">
              {displaySlots.map((part, index) => (
                <span key={index} className={part.muted ? 'muted' : undefined}>{part.text}</span>
              ))}
            </span>
          )}
        </span>

        <button
          type="button"
          className="calendar-toggle"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            openPanel(true);
          }}
        >
          <Icon name="calendar" size={16} />
        </button>
      </div>

      <FieldMessage text={messageText} state={messageState} messageId={hintId} />
    </div>,
    // Inline panel — Angular portals this into a CDK overlay pane; the
    // `.calendar` class carries the full panel skin, so in-flow rendering
    // inside the host needs no extra wrapper (focus trap omitted).
    isOpen && (
      <div
        ref={panelRef}
        className={cx('calendar', presets.length > 0 && 'has-presets')}
        role="dialog"
        aria-label="Choose date"
        id={panelId}
        onClick={closeMenus}
        onKeyDown={onPanelKeydown}
      >
        <span className="visually-hidden" aria-live="polite">
          {monthYearLabel}
        </span>

        <div className="calendar-body">
          <div className="head">
            <span className="period" id={captionId}>
              <span className="period-item">
                <button
                  type="button"
                  className="period-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={monthMenuOpen}
                  onClick={toggleMonthMenu}
                >
                  {monthNames[viewMonthIndex]}
                  <Icon name="chevronDown" size={12} />
                </button>

                {monthMenuOpen && (
                  <div
                    className="picker-menu"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeMenus();
                    }}
                  >
                    <div className="picker-grid" role="group" aria-label="Select month">
                      {monthNames.map((name, index) => (
                        <button
                          key={name}
                          type="button"
                          className={cx('picker-cell', index === viewMonthIndex && 'selected')}
                          aria-label={name}
                          aria-current={index === viewMonthIndex ? 'true' : undefined}
                          onClick={(event) => selectMonth(index, event)}
                        >
                          {name.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </span>

              <span className="period-item">
                <button
                  type="button"
                  className="period-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={yearMenuOpen}
                  onClick={toggleYearMenu}
                >
                  {viewYear}
                  <Icon name="chevronDown" size={12} />
                </button>

                {yearMenuOpen && (
                  <div
                    className="picker-menu"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeMenus();
                    }}
                  >
                    <div className="picker-head">
                      <button
                        type="button"
                        className="picker-nav"
                        aria-label="Previous years"
                        disabled={!canPrevYearPage}
                        onClick={prevYearPage}
                      >
                        <Icon name="chevronLeft" size={14} />
                      </button>

                      <span className="picker-range">{yearRangeLabel}</span>

                      <button
                        type="button"
                        className="picker-nav"
                        aria-label="Next years"
                        disabled={!canNextYearPage}
                        onClick={nextYearPage}
                      >
                        <Icon name="chevronRight" size={14} />
                      </button>
                    </div>

                    <div className="picker-grid" role="group" aria-label="Select year">
                      {yearsOnPage.map((year) => (
                        <button
                          key={year}
                          type="button"
                          className={cx('picker-cell', 'year-cell', year === viewYear && 'selected')}
                          aria-current={year === viewYear ? 'true' : undefined}
                          onClick={(event) => selectYear(year, event)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            </span>

            <span className="nav">
              <button type="button" onClick={prevMonth}>
                <Icon name="chevronLeft" size={14} />
              </button>
              <button type="button" onClick={nextMonth}>
                <Icon name="chevronRight" size={14} />
              </button>
            </span>
          </div>

          <div className="grid" role="grid" aria-labelledby={captionId}>
            <div className="dow-row" role="row">
              {weekdays.map((dow, index) => (
                <span
                  key={index}
                  className="dow"
                  role="columnheader"
                  aria-label={weekdaysFull[index]}
                >
                  {dow}
                </span>
              ))}
            </div>

            {weeksGrid.map((week, weekIndex) => (
              <div className="week" role="row" key={weekIndex}>
                {week.map((cell) => (
                  <CalendarDay
                    key={dayKey(cell.date)}
                    muted={!cell.inMonth}
                    today={cell.isToday}
                    selected={cell.isSelected}
                    inRange={cell.inRange}
                    rangeStart={cell.isRangeStart}
                    rangeEnd={cell.isRangeEnd}
                    disabled={cell.isDisabled}
                    dataDay={dayKey(cell.date)}
                    tabIndex={isFocusDay(cell) ? 0 : -1}
                    ariaLabel={dayLabel(cell)}
                    onDaySelected={() => selectDay(cell)}
                    onDayKeydown={(event) => onGridKeydown(event, cell)}
                  >
                    {cell.day}
                  </CalendarDay>
                ))}
              </div>
            ))}
          </div>
        </div>

        {presets.length > 0 && (
          <div className="presets">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="preset-btn"
                disabled={isPresetDisabled(preset)}
                onClick={(event) => {
                  applyPreset(preset);
                  event.stopPropagation();
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    ),
  );
}
