/** One reading on two continuous scales. Structural, so the shared entry point does not name a chart's own type. */
interface Reading {
  readonly x: number;
  readonly y: number;
}

/** A series only decimates past four times the target: at two the saving is invisible and the loss of detail is not. */
const DECIMATION_HEADROOM = 4;

/** How many marks the plot can carry: one per pixel of its width.
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
 *  The default: a bucket's extremum is in the output by construction, so a spike cannot be the
 *  point dropped. It also stays stable while panning, since a bucket's answer does not depend on
 *  its neighbours.
 *
 *  @internal */
export function minMaxDecimate(
  points: readonly Reading[],
  target: number,
): readonly Reading[] {
  if (target <= 0 || points.length <= target) {
    return points;
  }
  const buckets = Math.max(1, Math.floor(target / 2));
  const size = points.length / buckets;
  const kept: Reading[] = [];

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
 *  Draws a truer shape than MinMax at the same budget but does not promise the extremum: a spike is
 *  dropped whenever another point describes the silhouette better. Use where the outline is the reading.
 *
 *  @internal */
export function lttbDecimate(
  points: readonly Reading[],
  target: number,
): readonly Reading[] {
  if (target <= 2 || points.length <= target) {
    return points;
  }
  const kept: Reading[] = [points[0]];
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
