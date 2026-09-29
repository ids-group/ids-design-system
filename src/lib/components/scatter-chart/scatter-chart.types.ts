/** One reading on two continuous scales. */
export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
}

/** One named set of readings; each point carries its own position on both continuous scales. */
export interface ScatterChartSeries {
  id: string;
  label: string;
  data: readonly ScatterPoint[];
  /** Overrides the palette slot this series would take. */
  color?: string;
}

/** Which decimator thins a series that exceeds the plot's budget.
 *
 *  `'minMax'` (default) keeps each bucket's highest and lowest reading, so a spike cannot be the
 *  point dropped. `'lttb'` draws a truer silhouette at the same budget with no such guarantee; use
 *  it where the outline is the reading. `'none'` draws every point and leaves the node budget to
 *  the caller. */
export type ScatterChartDecimator = 'minMax' | 'lttb' | 'none';

/** One reading, named by the series it belongs to. */
export interface ScatterChartReading {
  readonly series: ScatterChartSeries;
  readonly point: ScatterPoint;
}
