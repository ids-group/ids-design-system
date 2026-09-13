export interface ColumnChartPoint {
  label: string;
  value: number;
  /** Overrides this column's colour. See `BarChartRow.color`. */
  color?: string;
}
