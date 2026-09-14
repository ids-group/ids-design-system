export interface ColumnChartPoint {
  /** Falls back to the column's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  value: number;
  /** Overrides this column's colour. Columns take the categorical palette by
   *  position; set this where a column carries a meaning its position does not,
   *  such as the accent on the period the reader should land on. */
  color?: string;
}
