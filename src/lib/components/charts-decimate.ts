/** One reading on two continuous scales. */
export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
}

/** A series only decimates past FOUR times the target, not two: at two the saving is invisible on
 *  any profile and the loss of detail is not, so the trade is the wrong way round. */
const DECIMATION_HEADROOM = 4;

/** How many marks the plot can carry: one per pixel of its own width. Drawing two marks where the
 *  screen has one pixel is two DOM nodes the reader cannot tell apart.
 *
 *  @internal */
export function decimationTarget(plotWidth: number): number {
  return Number.isFinite(plotWidth) && plotWidth > 0
    ? Math.floor(plotWidth)
    : 0;
}

/** @internal */
export function needsDecimating(count: number, target: number): boolean {
  return target > 0 && count > target * DECIMATION_HEADROOM;
}

/** Buckets the series by position and keeps each bucket's highest and lowest reading.
 *
 *  The default, because it is the only one of the two that can PROMISE something: a bucket's
 *  extremum is in the output by construction, so a spike the reader is looking for cannot be the
 *  point that was dropped. It also parallelises and stays stable while the reader pans, since a
 *  bucket's answer does not depend on the buckets around it.
 *
 *  @internal */
export function minMaxDecimate(
  points: readonly ScatterPoint[],
  target: number,
): readonly ScatterPoint[] {
  if (target <= 0 || points.length <= target) {
    return points;
  }
  // Two points leave each bucket, so the bucket count is half the budget.
  const buckets = Math.max(1, Math.floor(target / 2));
  const size = points.length / buckets;
  const kept: ScatterPoint[] = [];

  for (let bucket = 0; bucket < buckets; bucket++) {
    const from = Math.floor(bucket * size);
    const to = Math.min(points.length, Math.floor((bucket + 1) * size));
    if (from >= to) {
      continue;
    }
    let lowest = points[from];
    let highest = points[from];
    for (let index = from + 1; index < to; index++) {
      if (points[index].y < lowest.y) {
        lowest = points[index];
      }
      if (points[index].y > highest.y) {
        highest = points[index];
      }
    }
    // In the order they occur, so the output still reads left to right.
    const [first, second] =
      lowest.x <= highest.x ? [lowest, highest] : [highest, lowest];
    kept.push(first);
    if (second !== first) {
      kept.push(second);
    }
  }

  return kept;
}

/** Largest Triangle Three Buckets: keeps the reading in each bucket that makes the biggest triangle
 *  with the point already kept and the next bucket's centre of mass.
 *
 *  It draws a truer SHAPE than MinMax at the same budget, and it makes no promise about the
 *  extremum - a spike is dropped whenever a different point describes the silhouette better. Reach
 *  for it where the outline is the reading and an individual point is not.
 *
 *  @internal */
export function lttbDecimate(
  points: readonly ScatterPoint[],
  target: number,
): readonly ScatterPoint[] {
  if (target <= 2 || points.length <= target) {
    return points;
  }
  const kept: ScatterPoint[] = [points[0]];
  // The first and the last are fixed, so the buckets divide what is between them.
  const size = (points.length - 2) / (target - 2);
  let previous = points[0];

  for (let bucket = 0; bucket < target - 2; bucket++) {
    const from = Math.floor(bucket * size) + 1;
    const to = Math.min(points.length - 1, Math.floor((bucket + 1) * size) + 1);
    const nextFrom = to;
    const nextTo = Math.min(
      points.length - 1,
      Math.floor((bucket + 2) * size) + 1,
    );

    let averageX = 0;
    let averageY = 0;
    const span = Math.max(1, nextTo - nextFrom);
    for (let index = nextFrom; index < nextTo; index++) {
      averageX += points[index].x;
      averageY += points[index].y;
    }
    averageX /= span;
    averageY /= span;

    let best = points[from];
    let bestArea = -1;
    for (let index = from; index < to; index++) {
      const area = Math.abs(
        (previous.x - averageX) * (points[index].y - previous.y) -
          (previous.x - points[index].x) * (averageY - previous.y),
      );
      if (area > bestArea) {
        bestArea = area;
        best = points[index];
      }
    }
    kept.push(best);
    previous = best;
  }

  kept.push(points[points.length - 1]);

  return kept;
}
