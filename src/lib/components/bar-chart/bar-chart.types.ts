export interface BarChartRow {
  /** Falls back to the row's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  value: number;
  /** A percentage already out of 100, not a fraction: `42`, never `0.42`. Printed at
   *  the row's end while `showPercent` is on; derived from `value / max` when omitted. */
  percent?: number;
  /** A second reading for this row, printed under the label. A row often encodes a RATIO — 12,400
   *  visitors against 456 requests — and the bar can only be one of the two numbers; without a
   *  place for the other, the chart drops half of what the row is about.
   *
   *  Already formatted: the row knows what its second number means and the chart does not, so a
   *  `valueFormat` written for the bar's own scale would be the wrong one to apply to it. */
  detail?: string;
  /** Overrides this row's colour. The rows are one series, so they share one
   *  colour by default; set this on the row the reader should land on, usually
   *  to `var(--ds-chart-series-accent-color)`. There is no separate accent
   *  flag — the accent is a colour, so a boolean would only be a less flexible
   *  way of setting one. */
  color?: string;
}
