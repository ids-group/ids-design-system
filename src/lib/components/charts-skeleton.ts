/** Marks a chart's skeleton draws when nothing is known about the data. @internal */
export const CHART_SKELETON_COUNT = 5;

const COLUMN_HEIGHTS = [0.45, 0.62, 0.52, 0.75, 0.9, 0.68, 0.58] as const;
const LINE_HEIGHTS = [0.42, 0.52, 0.47, 0.62, 0.58, 0.72, 0.68] as const;
// Sums to zero, so a long run keeps returning to the opening total instead of sinking to the axis.
const STEP_DELTAS = [-0.16, -0.14, 0.08, -0.1, 0.2, 0.12] as const;

const percent = (fraction: number): string =>
  `${Math.round(fraction * 10000) / 100}%`;

/** How many marks the skeleton draws: the data's own count once it is known, else the input. @internal */
export function skeletonMarkCount(
  dataLength: number,
  skeletonCount: number,
): number {
  if (dataLength > 0) {
    return dataLength;
  }

  return Number.isFinite(skeletonCount) && skeletonCount >= 1
    ? Math.floor(skeletonCount)
    : CHART_SKELETON_COUNT;
}

/** Column heights as fractions of the plot, a fixed rise and fall that reads as a column chart. @internal */
export function skeletonColumnHeights(count: number): number[] {
  return Array.from(
    { length: count },
    (unused, index) => COLUMN_HEIGHTS[index % COLUMN_HEIGHTS.length],
  );
}

/** A 4px band through one point per category centre, as a `clip-path` over the whole plot. @internal */
export function skeletonLineClip(count: number): string {
  const length = Math.max(count, 2);
  const points = Array.from({ length }, (unused, index) => ({
    x: percent((index + 0.5) / length),
    y: percent(1 - LINE_HEIGHTS[index % LINE_HEIGHTS.length]),
  }));
  const top = points.map(({ x, y }) => `${x} calc(${y} - 2px)`);
  const bottom = points.reverse().map(({ x, y }) => `${x} calc(${y} + 2px)`);

  return `polygon(${[...top, ...bottom].join(', ')})`;
}

/** Waterfall steps as fractions of the plot: a total, floating deltas off the running total, and
 *  the closing total standing on the axis. @internal */
export function skeletonWaterfallSteps(
  count: number,
): { bottom: number; height: number }[] {
  if (count <= 1) {
    return count === 1 ? [{ bottom: 0, height: 0.85 }] : [];
  }

  let running = 0.9;
  const steps = [{ bottom: 0, height: running }];

  for (let index = 1; index < count - 1; index++) {
    const next = Math.min(
      0.9,
      Math.max(0.2, running + STEP_DELTAS[(index - 1) % STEP_DELTAS.length]),
    );
    steps.push({
      bottom: Math.min(running, next),
      height: Math.abs(running - next),
    });
    running = next;
  }

  steps.push({ bottom: 0, height: running });

  return steps.map(({ bottom, height }) => ({
    bottom: Math.round(bottom * 100) / 100,
    height: Math.round(height * 100) / 100,
  }));
}

/** One `clip-path` per funnel stage: equal steps narrowing to 40% of the width at the bottom. @internal */
export function skeletonFunnelClips(count: number): string[] {
  const step = 0.3 / Math.max(count, 1);

  return Array.from({ length: count }, (unused, index) => {
    const top = percent(index * step);
    const bottom = percent((index + 1) * step);
    const topEnd = percent(1 - index * step);
    const bottomEnd = percent(1 - (index + 1) * step);

    return `polygon(${top} 0, ${topEnd} 0, ${bottomEnd} 100%, ${bottom} 100%)`;
  });
}
