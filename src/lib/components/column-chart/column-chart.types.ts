/** How a mark is painted. `'hatched'` survives greyscale, print and colour-vision deficiency, so use
 *  it to separate readings of different standing, such as a projection from a settled figure. */
export type ChartMarkFill = 'solid' | 'hatched';

export interface ColumnChartPoint {
  /** Falls back to the column's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  value: number;
  /** Overrides this column's colour. Columns take the categorical palette by position. */
  color?: string;
  /** Defaults to `'solid'`. The chart derives nothing: which columns are projections is the caller's call. */
  fill?: ChartMarkFill;
}

/** One named set of columns, for comparing two or more readings per category. A flat
 *  `ColumnChartPoint[]` is one series coloured by position; this form takes one colour per series. */
export interface ColumnChartSeries {
  /** Names the series in the legend and in the tooltip, and keys it in the DOM. */
  id: string;
  label: string;
  /** One point per category, in the same order for every series. */
  data: readonly ColumnChartPoint[];
  /** Overrides the palette slot this series would take. A point's own `color` wins over it. */
  color?: string;
  /** Paints every mark of this series, so a whole projected or estimated series is written once
   *  rather than per point. A point's own `fill` wins over it. */
  fill?: ChartMarkFill;
}
