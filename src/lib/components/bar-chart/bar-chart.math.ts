import type { BarChartValue } from './bar-chart.types';

/** Where a row's bar starts and ends on the value axis.
 *
 *  A plain number spans from zero, negative included - a reading below zero hangs from the
 *  baseline rather than reaching up to it. A pair is normalised, because a bar of negative width
 *  draws nothing at all and a reader who wrote the ends backwards meant the same band. A
 *  non-finite end collapses the whole extent, so one bad reading draws no bar rather than a bar of
 *  unknown length.
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

/** Largest finite value, or `explicitMax` when it is a usable track length. A
 *  non-finite datum is skipped rather than compared: one `Infinity` row would
 *  otherwise become the track length and flatten every other row to nothing. */
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

/** Track share for one row, in percent. Has no upper bound: an explicit `max`
 *  below the data is the caller's statement, and `.track` clips the overflow. */
export function widthPercent(value: number, max: number): number {
  // Math.max(NaN, 0) is NaN, so the lower clamp cannot stand in for this test —
  // and the result is written into a style attribute, where `width: NaN%` is
  // dropped silently.
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.max((value / max) * 100, 0);
}

/** Each segment's share of the row's track, in percent. Sized against the segments' OWN sum, never
 *  the row's `value`: when the two disagree the row is a distribution that does not add up, and a
 *  gap left where the difference is would draw that error as an unlabelled category.
 *
 *  A set with no positive finite total has no shares to give, and returns none. */
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
