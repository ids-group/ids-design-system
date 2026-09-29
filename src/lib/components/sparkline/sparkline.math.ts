import type { SparklineScale } from './sparkline.types';

export interface SparklinePoint {
  readonly index: number;
  readonly x: number;
  readonly y: number;
}

export interface SparklineGeometry {
  readonly path: string;
  readonly points: readonly SparklinePoint[];
}

/** Positions in percent of the box, x across the readings and y down from the top of the scale.
 *  A flat series on the `'data'` scale draws through the middle. A `null` breaks the line. */
export function sparklineGeometry(
  data: readonly (number | null)[],
  scale: SparklineScale,
): SparklineGeometry {
  const finite = data.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  if (finite.length === 0) {
    return { path: '', points: [] };
  }
  const floor = scale === 'zero' ? Math.min(0, ...finite) : Math.min(...finite);
  const ceiling =
    scale === 'zero' ? Math.max(0, ...finite) : Math.max(...finite);
  const span = ceiling - floor;
  const lastIndex = data.length - 1;
  const points: SparklinePoint[] = [];
  let path = '';
  let penDown = false;
  data.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) {
      penDown = false;

      return;
    }
    const x = lastIndex === 0 ? 50 : (index / lastIndex) * 100;
    const y = span === 0 ? 50 : ((ceiling - value) / span) * 100;
    points.push({ index, x, y });
    path += `${penDown ? 'L' : 'M'}${x} ${y}`;
    penDown = true;
  });

  return { path, points };
}
