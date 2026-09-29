import type { HeatmapChartRow } from './heatmap-chart.types';

/** The reading's step on a ramp of `stepCount` colours, or `null` where there is no reading to
 *  place. `null` is not the coldest step: an absent measurement and the smallest measured value
 *  must not share a colour.
 *
 *  @internal */
export function rampIndexOf(
  value: number,
  domainMin: number,
  domainMax: number,
  stepCount: number,
): number | null {
  if (!Number.isFinite(value) || stepCount < 1) {
    return null;
  }
  const span = domainMax - domainMin;
  if (!Number.isFinite(span) || span <= 0) {
    return 0;
  }
  const share = Math.min(1, Math.max(0, (value - domainMin) / span));

  return Math.floor(share * (stepCount - 1));
}

/** The span every cell is coloured against, built from the readings alone: a `null` neither lowers
 *  the floor to zero nor counts as a measurement.
 *
 *  @internal */
export function heatmapDomain(rows: readonly HeatmapChartRow[]): {
  min: number;
  max: number;
} {
  const readings = rows
    .flatMap((row) => row.data)
    .filter(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value),
    );

  return readings.length === 0
    ? { min: 0, max: 0 }
    : { min: Math.min(...readings), max: Math.max(...readings) };
}
