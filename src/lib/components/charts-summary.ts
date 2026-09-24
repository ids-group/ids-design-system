import type {
  ChartThreshold,
  DsIntl,
} from '@ids-group-ltd/ids-design-system/core';
import { formatValue } from './charts-format';

/** @internal */
export interface SummaryPoint {
  readonly label: string;
  readonly value: number;
}

function trendOf(values: readonly number[], words: DsIntl['chart']): string {
  const first = values[0];
  const last = values[values.length - 1];
  const rose = values.every(
    (value, index) => index === 0 || value > values[index - 1],
  );
  const fell = values.every(
    (value, index) => index === 0 || value < values[index - 1],
  );
  if (rose) {
    return words.trendRisingThroughout;
  }
  if (fell) {
    return words.trendFallingThroughout;
  }
  if (last > first) {
    return words.trendRisingOverall;
  }
  if (last < first) {
    return words.trendFallingOverall;
  }

  return words.trendFlat;
}

/** Where the readings sit against each reference line, appended to the description. A line the
 *  reader cannot see is a line that does not exist for them, and its whole point is the
 *  comparison, not its position. */
function describeThresholds(
  thresholds: readonly ChartThreshold[],
  points: readonly SummaryPoint[],
  format: (value: number) => string,
  words: DsIntl['chart'],
): string {
  const total = points.length;

  return thresholds
    .map((threshold) => {
      const name = threshold.label ?? words.threshold;
      if (threshold.to == null) {
        const above = points.filter(
          (point) => point.value > threshold.value,
        ).length;

        return ` ${words.thresholdAbove(name, format(threshold.value), above, total)}`;
      }
      const low = Math.min(threshold.value, threshold.to);
      const high = Math.max(threshold.value, threshold.to);
      const inside = points.filter(
        (point) => point.value >= low && point.value <= high,
      ).length;

      return ` ${words.thresholdInside(name, format(low), format(high), inside, total)}`;
    })
    .join('');
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
  words: DsIntl['chart'],
  label: string,
  points: readonly SummaryPoint[],
  format: (value: number) => string = formatValue,
  tableFollows = true,
  thresholds: readonly ChartThreshold[] = [],
): string {
  if (points.length === 0) {
    return words.noData(label);
  }
  const pointer =
    describeThresholds(thresholds, points, format, words) +
    (tableFollows ? ` ${words.tableFollows}` : '');
  if (points.length === 1) {
    return `${words.onePoint(label, format(points[0].value), points[0].label)}${pointer}`;
  }
  const lowest = points.reduce((min, point) =>
    point.value < min.value ? point : min,
  );
  const highest = points.reduce((max, point) =>
    point.value > max.value ? point : max,
  );

  return (
    `${words.range(label, points.length, format(lowest.value), format(highest.value))} ` +
    `${trendOf(
      points.map((point) => point.value),
      words,
    )}. ` +
    `${words.extremes(highest.label, format(highest.value), lowest.label, format(lowest.value))}${pointer}`
  );
}
