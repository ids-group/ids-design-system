import { formatValue } from './charts-format';

/** @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
export interface SummaryPoint {
  readonly label: string;
  readonly value: number;
}

/** The sentence a screen reader gets as the chart's accessible name. Generated
 *  rather than required, because a required one is a field that gets left at the
 *  component's default and then lies.
 *
 *  @internal Exported for the chart entry points; not part of the package surface. */
export function describeSeries(
  label: string,
  points: readonly SummaryPoint[],
  format: (value: number) => string = formatValue,
): string {
  if (points.length === 0) {
    return `${label}. No data.`;
  }
  if (points.length === 1) {
    return `${label}. 1 point: ${format(points[0].value)} at ${points[0].label}.`;
  }
  const first = points[0];
  const last = points[points.length - 1];
  const lowest = points.reduce((min, point) =>
    point.value < min.value ? point : min,
  );
  const highest = points.reduce((max, point) =>
    point.value > max.value ? point : max,
  );

  return (
    `${label}. ${points.length} points, ` +
    `from ${format(first.value)} at ${first.label} to ${format(last.value)} at ${last.label}. ` +
    `Lowest ${format(lowest.value)} at ${lowest.label}, ` +
    `highest ${format(highest.value)} at ${highest.label}.`
  );
}
