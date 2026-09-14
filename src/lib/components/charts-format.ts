const numberFormatters = new Map<string, Intl.NumberFormat>();

function numberFormatter(locale: string | undefined): Intl.NumberFormat {
  const key = locale ?? 'default';
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormatters.set(key, formatter);
  }

  return formatter;
}

/** @internal */
export function formatValue(value: number, locale?: string): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return numberFormatter(locale).format(value);
}

/** @internal */
export function formatPercent(value: number, total: number): string {
  if (!total || !Number.isFinite(value) || !Number.isFinite(total)) {
    return '—';
  }

  const percent = (value / total) * 100;
  // A real share must never print as an exact zero: at one decimal, 214 of 987,654,321 rounds to
  // "0.0%" beside a bar too short to see, and the row reads as nothing when it is not nothing.
  if (percent !== 0 && Math.abs(percent) < 0.05) {
    return percent > 0 ? '<0.1%' : '>-0.1%';
  }

  return `${percent.toFixed(1)}%`;
}

/** Whole percentages that sum to exactly 100. Rounding each share on its own
 *  gives 33/33/33 for three equal parts, and a legend that visibly loses 1%.
 *
 *  @internal Exported for the chart entry points; not part of the package surface. */
export function largestRemainder(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total) {
    return values.map(() => 0);
  }
  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map(Math.floor);
  let remaining = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  for (const { index } of order) {
    if (remaining <= 0) {
      break;
    }
    result[index]++;
    remaining--;
  }

  return result;
}

/** @internal */
export function formatTick(value: number, step: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  if (Math.abs(value) < 1000) {
    return String(value);
  }

  // The unit follows the STEP, not the value, so every label on one axis carries the same suffix:
  // a step of 200M labels 1e9 as 1000M, never 1B beside 800M.
  const units = [
    { suffix: 'B', scale: 1e9 },
    { suffix: 'M', scale: 1e6 },
    { suffix: 'K', scale: 1e3 },
  ];
  const unit =
    units.find((candidate) => Math.abs(step) >= candidate.scale) ?? units[2];
  const scaled = value / unit.scale;

  // A step that divides its unit evenly needs no decimal; one that does not needs exactly one on
  // EVERY label, so an axis reads 1.0K · 1.5K · 2.0K rather than mixing 1K with 1.5K. Rounding the
  // whole branch matters too: a caller passing a raw datum instead of a tick would otherwise print
  // every digit of the division, as 987.654321M.
  return step % unit.scale === 0
    ? `${Math.round(scaled)}${unit.suffix}`
    : `${scaled.toFixed(1)}${unit.suffix}`;
}

function ordinal(rank: number): string {
  // 11th, 12th and 13th break the last-digit rule, which is why the teens are excluded first.
  const teens = rank % 100;
  if (teens >= 11 && teens <= 13) {
    return `${rank}th`;
  }
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[rank % 10] ?? 'th';

  return `${rank}${suffix}`;
}

/** Where one mark stands among its siblings: its share of the total, and its rank.
 *
 *  A single-series category chart prints every mark's own value beside it, so a tooltip repeating
 *  that number tells the reader nothing they are not already looking at. What is NOT on the chart
 *  is how the mark compares — and both halves of that are arithmetic the reader should not have to
 *  do. Empty for a single mark, which has nothing to stand among.
 *
 *  @internal */
export function describeStanding(
  values: readonly number[],
  index: number,
): string {
  const value = values[index];
  if (values.length < 2 || !Number.isFinite(value)) {
    return '';
  }
  // Negatives and non-finite readings are excluded from the total rather than subtracted from it:
  // a share of a total that some marks reduced is not a share of anything a reader can see.
  const positives = values.filter(
    (entry) => Number.isFinite(entry) && entry > 0,
  );
  const total = positives.reduce((sum, entry) => sum + entry, 0);
  const rank =
    1 +
    values.filter((entry) => Number.isFinite(entry) && entry > value).length;
  const standing = `${ordinal(rank)} of ${values.length}`;

  return total > 0 && value > 0
    ? `${formatPercent(value, total)} of total · ${standing}`
    : standing;
}
