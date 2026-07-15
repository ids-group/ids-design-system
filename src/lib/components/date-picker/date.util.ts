export interface DateFormatSpec {
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

export function resolveDateFormat(locale: string, explicit?: string | null): DateFormatSpec {
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

function totalDigits(spec: DateFormatSpec): number {
  return spec.segments.reduce((sum, segment) => sum + segment.length, 0);
}

export function applyMask(raw: string, spec: DateFormatSpec): string {
  const digits = raw.replace(/\D/g, '').slice(0, totalDigits(spec));
  let out = '';
  let index = 0;
  for (let segmentIndex = 0; segmentIndex < spec.segments.length; segmentIndex++) {
    const segment = spec.segments[segmentIndex];
    if (index >= digits.length) {
      break;
    }
    const chunk = digits.slice(index, index + segment.length);
    out += chunk;
    index += segment.length;
    if (chunk.length === segment.length && segmentIndex < spec.segments.length - 1) {
      out += spec.separator;
    }
  }

  return out;
}

/** Build a date from three per-slot digit strings; null if any slot isn't full-width or invalid. */
export function parseSegments(segments: string[], spec: DateFormatSpec): Date | null {
  const values: Record<'D' | 'M' | 'Y', number> = { D: 1, M: 1, Y: 2000 };
  for (let index = 0; index < spec.segments.length; index++) {
    const seg = spec.segments[index];
    const digits = segments[index] ?? '';
    if (digits.length !== seg.length) {
      return null;
    }
    values[seg.type] = parseInt(digits, 10);
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

/** Separator between the two dates of a range, in the field and its placeholder. */
export const RANGE_SEPARATOR = ' – ';

/** Combined placeholder/mask for a range field, e.g. "MM/DD/YYYY – MM/DD/YYYY". */
export function rangeMask(spec: DateFormatSpec): string {
  return `${spec.mask}${RANGE_SEPARATOR}${spec.mask}`;
}

/** Mask a raw two-date string: digits fill start then end, capped and separated. */
export function applyMaskRange(raw: string, spec: DateFormatSpec): string {
  const perDate = totalDigits(spec);
  const digits = raw.replace(/\D/g, '').slice(0, perDate * 2);
  const start = applyMask(digits.slice(0, perDate), spec);
  if (digits.length < perDate) {
    return start;
  }

  return `${start}${RANGE_SEPARATOR}${applyMask(digits.slice(perDate), spec)}`;
}

/** Render a range value to the combined field string. */
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

/** Parse a combined range field string into [start, end] (either may be null). */
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

// ---- Segment-aware mask editing --------------------------------------------
// The field is a sequence of fixed-width digit slots (MM, DD, YYYY) joined by
// literals ("/", and " – " between the two dates of a range). Edits stay inside
// the caret's slot and never shift digits across a literal, so correcting one
// segment can't corrupt its neighbours or fling the caret away.

/** One editable digit slot in the masked field. */
export interface FieldSlot {
  type: 'D' | 'M' | 'Y';
  maxLength: number;
}

/** Field layout: the slots and the literal shown after each (except the last). */
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

function hasLaterContent(segments: string[], index: number): boolean {
  for (let later = index + 1; later < segments.length; later++) {
    if (segments[later].length > 0) {
      return true;
    }
  }

  return false;
}

/** A literal shows once its slot is full or any later slot holds a digit — so
 *  separators keep slots visually aligned even while an earlier one is partial. */
function literalVisible(
  segments: string[],
  layout: FieldLayout,
  index: number,
): boolean {
  if (index >= layout.slots.length - 1) {
    return false;
  }
  const full = segments[index].length === layout.slots[index].maxLength;

  return full || hasLaterContent(segments, index);
}

/** Split clean mask text (always a renderFieldText output) into per-slot digits. */
export function parseFieldText(text: string, layout: FieldLayout): string[] {
  const segments: string[] = [];
  let position = 0;
  for (let index = 0; index < layout.slots.length; index++) {
    let digits = '';
    while (
      position < text.length &&
      digits.length < layout.slots[index].maxLength &&
      /\d/.test(text[position])
    ) {
      digits += text[position];
      position++;
    }
    segments.push(digits);
    if (index < layout.slots.length - 1) {
      const literal = layout.literals[index];
      if (text.slice(position, position + literal.length) === literal) {
        position += literal.length;
      }
    }
  }

  return segments;
}

export function renderFieldText(
  segments: string[],
  layout: FieldLayout,
): string {
  let out = '';
  for (let index = 0; index < layout.slots.length; index++) {
    out += segments[index];
    if (literalVisible(segments, layout, index)) {
      out += layout.literals[index];
    }
  }

  return out;
}

export const PLACEHOLDER_CHAR = '_';

export interface DisplayPart {
  text: string;
  muted: boolean;
}

function slotPlaceholder(slot: FieldSlot): string {
  return slot.type === 'Y' ? 'YYYY' : slot.type === 'M' ? 'MM' : 'DD';
}

/** Fixed-width input value: every slot padded to maxLength with `_`, all literals present. */
export function renderFieldValue(segments: string[], layout: FieldLayout): string {
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

/** Ordered runs for the overlay: digits (not muted), placeholders (muted), literals (not muted).
 *  Untouched slot → its format letters; partial slot → digits + `_` for the missing positions. */
export function displayParts(segments: string[], layout: FieldLayout): DisplayPart[] {
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

/** Char offset where slot `index` begins in renderFieldText(segments). */
export function slotStart(
  segments: string[],
  layout: FieldLayout,
  index: number,
): number {
  let position = 0;
  for (let slot = 0; slot < index; slot++) {
    position += segments[slot].length;
    if (literalVisible(segments, layout, slot)) {
      position += layout.literals[slot].length;
    }
  }

  return position;
}

export function slotToCaret(
  segments: string[],
  layout: FieldLayout,
  slot: number,
  offset: number,
): number {
  return slotStart(segments, layout, slot) + offset;
}

/** Map a caret char offset to its slot; a caret inside a literal snaps forward. */
export function caretToSlot(
  segments: string[],
  layout: FieldLayout,
  caret: number,
): { slot: number; offset: number } {
  let position = 0;
  for (let index = 0; index < layout.slots.length; index++) {
    const length = segments[index].length;
    if (caret <= position + length) {
      return { slot: index, offset: Math.max(0, caret - position) };
    }
    position += length;
    if (literalVisible(segments, layout, index)) {
      const literalLength = layout.literals[index].length;
      if (caret <= position + literalLength) {
        return { slot: index + 1, offset: 0 };
      }
      position += literalLength;
    }
  }
  const last = layout.slots.length - 1;

  return { slot: last, offset: segments[last].length };
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
  if (
    offset >= layout.slots[slot].maxLength &&
    slot < layout.slots.length - 1
  ) {
    return { segments, slot: slot + 1, offset: 0 };
  }

  return { segments, slot, offset };
}

/** Type a digit into the caret's slot: overtype under the caret, else append;
 *  a full slot spills the digit into the next one instead of shifting. */
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

/** Backspace: drop the digit left of the caret within its slot, else the last
 *  digit of the nearest earlier non-empty slot. Null when nothing precedes it. */
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

/** Delete: drop the digit at the caret within its slot, else the first digit of
 *  the nearest later non-empty slot. Null when nothing follows it. */
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

/** True when `text` fills the mask left-to-right with no gaps — every char sits
 *  on a matching mask position (digit under M/D/Y, literal under a separator).
 *  The ghost-mask tail (`placeholder.slice(text.length)`) only aligns then;
 *  a mid-field edit can leave a shorter interior segment (e.g. "1/25/2020")
 *  where slicing would misalign, so the ghost tail is dropped instead. */
export function isMaskPrefix(text: string, placeholder: string): boolean {
  if (text.length > placeholder.length) {
    return false;
  }
  for (let index = 0; index < text.length; index++) {
    const maskChar = placeholder[index];
    const isSlot = maskChar === 'M' || maskChar === 'D' || maskChar === 'Y';
    if (isSlot ? !/\d/.test(text[index]) : text[index] !== maskChar) {
      return false;
    }
  }

  return true;
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
