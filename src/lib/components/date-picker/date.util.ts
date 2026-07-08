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

export function parseDate(text: string, spec: DateFormatSpec): Date | null {
  const digits = text.replace(/\D/g, '');
  if (digits.length !== totalDigits(spec)) {
    return null;
  }
  const values: Record<'D' | 'M' | 'Y', number> = { D: 1, M: 1, Y: 2000 };
  let index = 0;
  for (const segment of spec.segments) {
    values[segment.type] = parseInt(digits.slice(index, index + segment.length), 10);
    index += segment.length;
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
  const perDate = totalDigits(spec);
  const digits = text.replace(/\D/g, '');
  const startDigits = digits.slice(0, perDate);
  const endDigits = digits.slice(perDate, perDate * 2);

  return [
    startDigits.length === perDate ? parseDate(startDigits, spec) : null,
    endDigits.length === perDate ? parseDate(endDigits, spec) : null,
  ];
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
