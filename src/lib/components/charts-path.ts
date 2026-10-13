import type { ChartCurve } from '@ids-group-ltd/ids-design-system/core';

/** One plotted reading, in the canvas's own coordinates.
 *
 *  @internal */
export interface LinePoint {
  readonly categoryIndex: number;
  readonly x: number;
  readonly y: number;
  readonly value: number;
}

const COORDINATE_DECIMALS = 2;

function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(decimals));
}

function isPlottable(point: LinePoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function coordinatePair(point: LinePoint): string {
  return `${roundTo(point.x, COORDINATE_DECIMALS)},${roundTo(point.y, COORDINATE_DECIMALS)}`;
}

/** The unbroken runs of a series: a missing reading ends one run and starts the next.
 *
 *  @internal */
export function lineSegments(
  points: readonly (LinePoint | null)[],
): LinePoint[][] {
  const segments: LinePoint[][] = [];
  let current: LinePoint[] = [];
  for (const point of points) {
    if (point === null) {
      if (current.length > 0) {
        segments.push(current);
      }
      current = [];
    } else {
      current.push(point);
    }
  }
  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
}

/** Fritsch-Carlson tangents: the slope at each reading, clamped so no segment turns back on itself.
 *  A zero slope on either side pins the tangent flat, keeping a plateau flat. */
function monotoneTangents(segment: readonly LinePoint[]): number[] {
  const count = segment.length;
  const secants: number[] = [];
  for (let index = 0; index < count - 1; index++) {
    const run = segment[index + 1].x - segment[index].x;
    secants.push(
      run === 0 ? 0 : (segment[index + 1].y - segment[index].y) / run,
    );
  }

  const tangents = [secants[0]];
  for (let index = 1; index < count - 1; index++) {
    const before = secants[index - 1];
    const after = secants[index];
    tangents.push(before * after <= 0 ? 0 : (before + after) / 2);
  }
  tangents.push(secants[count - 2]);

  for (let index = 0; index < count - 1; index++) {
    const secant = secants[index];
    if (secant === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }
    // Tangent within three times its secant keeps the cubic monotone on that span.
    const alpha = tangents[index] / secant;
    const beta = tangents[index + 1] / secant;
    const magnitude = Math.hypot(alpha, beta);
    if (magnitude > 3) {
      tangents[index] = (3 / magnitude) * alpha * secant;
      tangents[index + 1] = (3 / magnitude) * beta * secant;
    }
  }

  return tangents;
}

function smoothPath(segment: readonly LinePoint[]): string {
  const tangents = monotoneTangents(segment);
  let path = `M ${coordinatePair(segment[0])}`;
  for (let index = 0; index < segment.length - 1; index++) {
    const from = segment[index];
    const to = segment[index + 1];
    const third = (to.x - from.x) / 3;
    const firstControl = {
      x: from.x + third,
      y: from.y + tangents[index] * third,
    };
    const secondControl = {
      x: to.x - third,
      y: to.y - tangents[index + 1] * third,
    };
    path +=
      ` C ${roundTo(firstControl.x, COORDINATE_DECIMALS)},${roundTo(firstControl.y, COORDINATE_DECIMALS)}` +
      ` ${roundTo(secondControl.x, COORDINATE_DECIMALS)},${roundTo(secondControl.y, COORDINATE_DECIMALS)}` +
      ` ${coordinatePair(to)}`;
  }

  return path;
}

/** One unbroken run as a path `d`. `''` when a coordinate is unplottable (one `NaN` voids the attribute).
 *
 *  @internal */
export function linePath(
  segment: readonly LinePoint[],
  curve: ChartCurve = 'linear',
): string {
  if (segment.length === 0 || !segment.every(isPlottable)) {
    return '';
  }
  if (segment.length === 1 || curve === 'linear') {
    return `M ${segment.map((point) => coordinatePair(point)).join(' L ')}`;
  }
  if (curve === 'step') {
    let path = `M ${coordinatePair(segment[0])}`;
    for (const point of segment.slice(1)) {
      path += ` H ${roundTo(point.x, COORDINATE_DECIMALS)} V ${roundTo(point.y, COORDINATE_DECIMALS)}`;
    }

    return path;
  }

  return smoothPath(segment);
}

/** The filled band between two edges. The lower edge is walked backwards, so its curve is rebuilt
 *  from the reversed points: a monotone cubic is not symmetric.
 *
 *  @internal */
export function bandPath(
  upper: readonly LinePoint[],
  lower: readonly LinePoint[],
  curve: ChartCurve = 'linear',
): string {
  if (
    upper.length < 2 ||
    upper.length !== lower.length ||
    !upper.every(isPlottable) ||
    !lower.every(isPlottable)
  ) {
    return '';
  }
  const back = linePath([...lower].reverse(), curve);

  return `${linePath(upper, curve)} L ${back.slice('M '.length)} Z`;
}

/** The same run as `linePath`, closed down to the baseline. It takes the curve so a fill and its
 *  line share one edge.
 *
 *  @internal */
export function areaPath(
  segment: readonly LinePoint[],
  baselineY: number,
  curve: ChartCurve = 'linear',
): string {
  if (
    segment.length < 2 ||
    !Number.isFinite(baselineY) ||
    !segment.every(isPlottable)
  ) {
    return '';
  }
  const first = segment[0];
  const last = segment[segment.length - 1];
  const baseline = roundTo(baselineY, COORDINATE_DECIMALS);

  return `${linePath(segment, curve)} L ${roundTo(last.x, COORDINATE_DECIMALS)},${baseline} L ${roundTo(first.x, COORDINATE_DECIMALS)},${baseline} Z`;
}
