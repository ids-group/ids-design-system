import { formatValue } from './charts-format';

/** @internal */
export interface SummaryPoint {
  readonly label: string;
  readonly value: number;
}

function trendOf(values: readonly number[]): string {
  const first = values[0];
  const last = values[values.length - 1];
  const rose = values.every(
    (value, index) => index === 0 || value > values[index - 1],
  );
  const fell = values.every(
    (value, index) => index === 0 || value < values[index - 1],
  );
  if (rose) {
    return 'Rising throughout';
  }
  if (fell) {
    return 'Falling throughout';
  }
  if (last > first) {
    return 'Rising overall';
  }
  if (last < first) {
    return 'Falling overall';
  }

  return 'Ending where it started';
}

/** The sentence a screen reader gets as the chart's accessible name. Generated rather than
 *  required, because a required one is a field that gets left at the component's default and then
 *  lies.
 *
 *  The ORDER is the contract: what the chart is and its scale, then the trend, then the extremes,
 *  then where the numbers are. Blind readers rank a recital of the encoding lowest of the four
 *  levels of chart description, and the encoding is the one thing a screen-reader user cannot use.
 *
 *  @internal */
export function describeSeries(
  label: string,
  points: readonly SummaryPoint[],
  format: (value: number) => string = formatValue,
  tableFollows = true,
): string {
  const pointer = tableFollows ? ' Full values in the table below.' : '';
  if (points.length === 0) {
    return `${label}. No data.`;
  }
  if (points.length === 1) {
    return `${label}, one point: ${format(points[0].value)} at ${points[0].label}.${pointer}`;
  }
  const lowest = points.reduce((min, point) =>
    point.value < min.value ? point : min,
  );
  const highest = points.reduce((max, point) =>
    point.value > max.value ? point : max,
  );

  return (
    `${label}, ${points.length} points, ` +
    `${format(lowest.value)} to ${format(highest.value)}. ` +
    `${trendOf(points.map((point) => point.value))}. ` +
    `Highest in ${highest.label} at ${format(highest.value)}, ` +
    `lowest in ${lowest.label} at ${format(lowest.value)}.${pointer}`
  );
}
