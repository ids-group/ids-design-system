export interface DateFormatSpec {
  order: ('D' | 'M' | 'Y')[];
  separator: string;
  mask: string;
  segments: { type: 'D' | 'M' | 'Y'; length: number }[];
}

const SEGMENT_LENGTH: Record<'D' | 'M' | 'Y', number> = { D: 2, M: 2, Y: 4 };
const TOKEN: Record<'D' | 'M' | 'Y', string> = { D: 'DD', M: 'MM', Y: 'YYYY' };
// Day, month and year are all distinct values.
const REFERENCE_DATE = new Date(2023, 10, 22);

function buildSpec(
  order: ('D' | 'M' | 'Y')[],
  separator: string,
): DateFormatSpec {
  return {
    order,
    separator,
    mask: order.map((token) => TOKEN[token]).join(separator),
    segments: order.map((token) => ({
      type: token,
      length: SEGMENT_LENGTH[token],
    })),
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

export function resolveDateFormat(
  locale: string,
  explicit?: string | null,
): DateFormatSpec {
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

export function formatDate(date: Date | null, spec: DateFormatSpec): string {
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

export function parseDate(text: string, spec: DateFormatSpec): Date | null {
  return parseSegments(parseFieldText(text, singleFieldLayout(spec)), spec);
}

export const RANGE_SEPARATOR = ' – ';

export function rangeMask(spec: DateFormatSpec): string {
  return `${spec.mask}${RANGE_SEPARATOR}${spec.mask}`;
}

export function formatRange(
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

export function parseDateRange(
  text: string,
  spec: DateFormatSpec,
): [Date | null, Date | null] {
  const slots = parseFieldText(text, rangeFieldLayout(spec));
  const perDate = spec.segments.length;

  return [
    parseSegments(slots.slice(0, perDate), spec),
    parseSegments(slots.slice(perDate, perDate * 2), spec),
  ];
}

// Fields are fixed-width digit slots joined by literals; edits stay inside the caret's slot and never shift digits across a literal.

export interface FieldSlot {
  type: 'D' | 'M' | 'Y';
  maxLength: number;
}

export interface FieldLayout {
  slots: FieldSlot[];
  literals: string[];
}

export function singleFieldLayout(spec: DateFormatSpec): FieldLayout {
  return {
    slots: spec.segments.map((segment) => ({
      type: segment.type,
      maxLength: segment.length,
    })),
    literals: spec.segments.slice(1).map(() => spec.separator),
  };
}

export function rangeFieldLayout(spec: DateFormatSpec): FieldLayout {
  const single = singleFieldLayout(spec);

  return {
    slots: [...single.slots, ...single.slots],
    literals: [...single.literals, RANGE_SEPARATOR, ...single.literals],
  };
}

/** Splits a fixed-width renderFieldValue output into per-slot digits by position, dropping `_` pads. */
export function parseFieldText(text: string, layout: FieldLayout): string[] {
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

export interface DisplayPart {
  text: string;
  muted: boolean;
}

function slotPlaceholder(slot: FieldSlot): string {
  return slot.type === 'Y' ? 'YYYY' : slot.type === 'M' ? 'MM' : 'DD';
}

/** Fixed-width value: every slot padded with `_`, all literals present. */
export function renderFieldValue(
  segments: string[],
  layout: FieldLayout,
): string {
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

/** Ordered runs for the overlay; an untouched slot shows its format letters, a partial one digits + `_`; a separator stays muted until the slot before it is full. */
export function displayParts(
  segments: string[],
  layout: FieldLayout,
): DisplayPart[] {
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
      parts.push({
        text: layout.literals[index],
        muted: digits.length < slot.maxLength,
      });
    }
  }

  return parts;
}

function slotStart(layout: FieldLayout, index: number): number {
  let position = 0;
  for (let slot = 0; slot < index; slot++) {
    position += layout.slots[slot].maxLength + layout.literals[slot].length;
  }

  return position;
}

export function slotToCaret(
  layout: FieldLayout,
  slot: number,
  offset: number,
): number {
  return slotStart(layout, slot) + offset;
}

/** A caret inside a literal snaps forward to the next slot. */
export function caretToSlot(
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

function advanceAfterType(
  segments: string[],
  layout: FieldLayout,
  slot: number,
  offset: number,
): SlotEdit {
  if (
    offset >= layout.slots[slot].maxLength &&
    slot < layout.slots.length - 1
  ) {
    return { segments, slot: slot + 1, offset: 0 };
  }

  return { segments, slot, offset };
}

/** Types a digit into the caret's slot: overtype, else append; a full slot spills into the next. */
export function editType(
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

/** Backspace: null when nothing precedes the caret. */
export function editBackspace(
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

/** Delete: null when nothing follows the caret. */
export function editDelete(
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

/** The locale's first weekday, 0=Sunday to 6=Saturday; `null` when the engine has no week data. */
export function localeFirstDayOfWeek(locale: string): number | null {
  // Chrome 99-129 and Safari 15.4-16 expose a `weekInfo` accessor instead of `getWeekInfo()`.
  const tag = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const firstDay = (tag.getWeekInfo?.() ?? tag.weekInfo)?.firstDay;

  return firstDay === undefined ? null : firstDay % 7;
}

export function weekdayLabels(
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

export function monthLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });

  return Array.from({ length: 12 }, (_unused, month) =>
    formatter.format(new Date(2023, month, 1)),
  );
}

export function fullDateLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
