export interface BarChartRow {
  label: string;
  value: number;
  /** Printed at the row's end. Derived from `value / max` when omitted. */
  percent?: number;
  /** Overrides this row's colour. There is no separate accent flag: in the
   *  specimens the accent is a colour, so a boolean would be a less flexible
   *  way of setting one. */
  color?: string;
}
