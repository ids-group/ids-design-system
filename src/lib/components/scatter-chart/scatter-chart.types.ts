/** One reading on two continuous scales. */
export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
}

/** One named set of readings. */
export interface ScatterChartSeries {
  id: string;
  label: string;
  data: readonly ScatterPoint[];
  /** Overrides the palette slot this series would take. */
  color?: string;
}

/** Which decimator thins a series that exceeds the plot's budget.
 *
 *  `'minMax'` (default) keeps each bucket's extremes, so a spike survives. `'lttb'` draws a truer
 *  silhouette with no such guarantee. `'none'` draws every point. */
export type ScatterChartDecimator = 'minMax' | 'lttb' | 'none';

/** One reading, named by the series it belongs to. */
export interface ScatterChartReading {
  readonly series: ScatterChartSeries;
  readonly point: ScatterPoint;
}
