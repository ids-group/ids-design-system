import type { ChartValueFormat } from '@ids-group-ltd/ids-design-system/core';

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

const chartFormats = new Map<string, ChartValueFormat>();

/** The built-in `valueFormat` in one locale: compact on a tick (`1.2M`), spelled out everywhere
 *  else (`1,248,392`). A caller-supplied formatter receives the same `location` and decides for
 *  itself; this is only the default.
 *
 *  @internal */
export function chartValueFormat(locale: string): ChartValueFormat {
  let format = chartFormats.get(locale);
  if (!format) {
    const compact = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    const full = new Intl.NumberFormat(locale);
    format = (value, location) =>
      !Number.isFinite(value)
        ? '—'
        : location === 'tick'
          ? compact.format(value)
          : full.format(value);
    chartFormats.set(locale, format);
  }

  return format;
}

const percentFormatters = new Map<string, Intl.NumberFormat>();

function percentFormatter(locale: string, digits: 0 | 1): Intl.NumberFormat {
  const key = `${locale}|${digits}`;
  let formatter = percentFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    percentFormatters.set(key, formatter);
  }

  return formatter;
}

/** @internal */
export function formatPercent(
  value: number,
  total: number,
  locale: string,
): string {
  if (!total || !Number.isFinite(value) || !Number.isFinite(total)) {
    return '—';
  }
  const fraction = value / total;
  const formatter = percentFormatter(locale, 1);
  // A real share must never print as an exact zero ("0.0%" at one decimal for a tiny share).
  if (fraction !== 0 && Math.abs(fraction) < 0.0005) {
    return fraction > 0
      ? `<${formatter.format(0.001)}`
      : `>${formatter.format(-0.001)}`;
  }

  return formatter.format(fraction);
}

/** A whole-number percentage (the pie's largest-remainder shares), in `locale`.
 *
 *  @internal */
export function formatWholePercent(percent: number, locale: string): string {
  return percentFormatter(locale, 0).format(percent / 100);
}

/** Whole percentages that sum to exactly 100 (rounding each alone gives 33/33/33).
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

  // The unit follows the step, not the value, so every label on an axis shares a suffix (1000M, never 1B beside 800M).
  const units = [
    { suffix: 'B', scale: 1e9 },
    { suffix: 'M', scale: 1e6 },
    { suffix: 'K', scale: 1e3 },
  ];
  const unit =
    units.find((candidate) => Math.abs(step) >= candidate.scale) ?? units[2];
  const scaled = value / unit.scale;

  // A step that divides its unit evenly needs no decimal; otherwise exactly one on every label
  // (1.0K, 1.5K, 2.0K). Rounding the whole branch keeps a raw datum from printing 987.654321M.
  return step % unit.scale === 0
    ? `${Math.round(scaled)}${unit.suffix}`
    : `${scaled.toFixed(1)}${unit.suffix}`;
}

/** One mark's share of the total its siblings add up to, as a bare percentage.
 *
 *  Empty for a lone mark, and for a negative or non-finite reading: those are excluded from the
 *  total, not subtracted from it.
 *
 *  @internal */
export function shareOfTotal(
  values: readonly number[],
  index: number,
  locale: string,
): string {
  const value = values[index];
  if (values.length < 2 || !Number.isFinite(value) || value <= 0) {
    return '';
  }
  const total = values
    .filter((entry) => Number.isFinite(entry) && entry > 0)
    .reduce((sum, entry) => sum + entry, 0);

  return total > 0 ? formatPercent(value, total, locale) : '';
}

/** The same share, phrased for a tooltip line, where no column header says what it is a percentage of.
 *
 *  @internal */
export function describeShare(
  values: readonly number[],
  index: number,
  locale: string,
  phrase: (share: string) => string,
): string {
  const share = shareOfTotal(values, index, locale);

  return share ? phrase(share) : '';
}
