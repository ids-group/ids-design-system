import type { ScatterChartSeries, ScatterPoint } from './scatter-chart.types';

export const SCATTER_VIEW_WIDTH = 640;
export const SCATTER_VIEW_HEIGHT = 360;
export const SCATTER_DEFAULT_TICK_COUNT = 5;

/** The drawable rectangle, in the canvas's own units. */
export interface ScatterPlot {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** What both axes have to hold. */
export interface ScatterExtent {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
}

/** The span of every plotted reading on both scales. A non-finite coordinate is not a position, so
 *  it neither widens the plot nor lands on an edge of it.
 *
 *  @internal */
export function scatterExtent(
  series: readonly ScatterChartSeries[],
): ScatterExtent {
  const points = series
    .flatMap((entry) => entry.data)
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (points.length === 0) {
    return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
  }

  return {
    xMin: Math.min(...points.map((point) => point.x)),
    xMax: Math.max(...points.map((point) => point.x)),
    yMin: Math.min(...points.map((point) => point.y)),
    yMax: Math.max(...points.map((point) => point.y)),
  };
}

/** Where one reading lands, clamped into the plot. A domain pinned narrower than the data would
 *  otherwise put a mark over the axis labels rather than on an edge.
 *
 *  @internal */
export function scatterPlacement(
  point: ScatterPoint,
  extent: ScatterExtent,
  plot: ScatterPlot,
): { cx: number; cy: number } {
  const share = (value: number, min: number, max: number): number => {
    const span = max - min;
    if (!Number.isFinite(span) || span <= 0 || !Number.isFinite(value)) {
      return 0;
    }

    return Math.min(1, Math.max(0, (value - min) / span));
  };

  return {
    cx: plot.left + share(point.x, extent.xMin, extent.xMax) * plot.width,
    cy:
      plot.top +
      plot.height -
      share(point.y, extent.yMin, extent.yMax) * plot.height,
  };
}
