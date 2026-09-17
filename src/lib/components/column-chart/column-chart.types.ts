/** How a mark is painted. `'hatched'` is the second encoding channel a colour cannot carry on its
 *  own: it survives greyscale, print and colour-vision deficiency, which is what makes it the right
 *  way to separate readings of different STANDING - a projection from a settled figure, an estimate
 *  from a measurement - rather than a second hue nobody can name. */
export type ChartMarkFill = 'solid' | 'hatched';

export interface ColumnChartPoint {
  /** Falls back to the column's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  value: number;
  /** Overrides this column's colour. Columns take the categorical palette by
   *  position; set this where a column carries a meaning its position does not,
   *  such as the accent on the period the reader should land on. */
  color?: string;
  /** Defaults to `'solid'`. The chart draws what it is given and reads nothing into it: which
   *  columns are projections is the caller's fact, not one a chart can derive. */
  fill?: ChartMarkFill;
}
