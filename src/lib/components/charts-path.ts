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

/** `''` rather than a partial list when a coordinate is unplottable: one `NaN` in a
 *  `points` list or a path `d` voids the whole attribute, and the line then vanishes
 *  with nothing logged.
 *
 *  @internal */
export function polylinePoints(segment: readonly LinePoint[]): string {
  if (segment.length === 0 || !segment.every(isPlottable)) {
    return '';
  }

  return segment.map((point) => coordinatePair(point)).join(' ');
}

/** @internal */
export function areaPath(
  segment: readonly LinePoint[],
  baselineY: number,
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
  const along = segment.map((point) => coordinatePair(point)).join(' L ');
  const baseline = roundTo(baselineY, COORDINATE_DECIMALS);

  return `M ${along} L ${roundTo(last.x, COORDINATE_DECIMALS)},${baseline} L ${roundTo(first.x, COORDINATE_DECIMALS)},${baseline} Z`;
}
