import type { BarChartValue } from './bar-chart.types';

/** Where a row's bar starts and ends on the value axis. A pair is normalised (a negative width draws
 *  nothing); a non-finite end collapses the extent to zero.
 *
 *  @internal */
export function barExtent(value: BarChartValue): { low: number; high: number } {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? { low: Math.min(0, value), high: Math.max(0, value) }
      : { low: 0, high: 0 };
  }
  const [first, second] = value;

  return Number.isFinite(first) && Number.isFinite(second)
    ? { low: Math.min(first, second), high: Math.max(first, second) }
    : { low: 0, high: 0 };
}

/** Largest finite value, or `explicitMax` when usable. One `Infinity` row must not become the track length. */
export function resolveMax(
  explicitMax: number | null,
  values: readonly number[],
): number {
  if (explicitMax !== null && Number.isFinite(explicitMax) && explicitMax > 0) {
    return explicitMax;
  }
  const finite = values.filter((value) => Number.isFinite(value));

  return finite.length ? Math.max(...finite) : 0;
}

/** Track share in percent. No upper bound: an explicit `max` below the data overflows and `.fill` caps it. */
export function widthPercent(value: number, max: number): number {
  // Math.max(NaN, 0) is NaN, and `width: NaN%` is dropped silently.
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.max((value / max) * 100, 0);
}

/** Each segment's share in percent, against the segments' OWN sum, never the row's `value`.
 *  Returns none without a positive finite total. */
export function segmentWidths(values: readonly number[]): number[] {
  const total = values
    .filter((value) => Number.isFinite(value) && value > 0)
    .reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [];
  }

  return values.map((value) =>
    Number.isFinite(value) && value > 0 ? (value / total) * 100 : 0,
  );
}
