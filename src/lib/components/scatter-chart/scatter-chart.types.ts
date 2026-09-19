import type { ScatterPoint } from '@ids-group-ltd/ids-design-system/components';

export type { ScatterPoint };

/** One named set of readings. Both scales are continuous, so a point carries its own position on
 *  each rather than an index into a list of categories. */
export interface ScatterChartSeries {
  id: string;
  label: string;
  data: readonly ScatterPoint[];
  /** Overrides the palette slot this series would take. */
  color?: string;
}

/** Which decimator thins a series that exceeds the plot's budget.
 *
 *  `'minMax'` is the default because it is the only one that can promise something: each bucket's
 *  highest and lowest reading are in the output by construction, so the spike a reader is looking
 *  for cannot be the point that was dropped. `'lttb'` draws a truer silhouette at the same budget
 *  and makes no such promise - reach for it where the outline is the reading. `'none'` draws every
 *  point and is the caller taking the node budget on themselves. */
export type ScatterChartDecimator = 'minMax' | 'lttb' | 'none';

/** One reading, named by the series it belongs to. */
export interface ScatterChartReading {
  readonly series: ScatterChartSeries;
  readonly point: ScatterPoint;
}
