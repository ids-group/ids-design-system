export interface BarChartRow {
  /** A stable key across renders, so reordering the rows moves the DOM nodes instead of
   *  rewriting them. Falls back to the row's position when left out. */
  id?: string;
  label: string;
  value: number;
  /** Printed at the row's end. Derived from `value / max` when omitted. */
  percent?: number;
  /** Overrides this row's colour. The rows are one series, so they share one
   *  colour by default; set this on the row the reader should land on, usually
   *  to `var(--ds-chart-series-accent-color)`. There is no separate accent
   *  flag — the accent is a colour, so a boolean would only be a less flexible
   *  way of setting one. */
  color?: string;
}
