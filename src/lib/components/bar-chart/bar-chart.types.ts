/** One part of a row that is a distribution rather than a single quantity. */
export interface BarChartSegment {
  /** Falls back to the segment's position when left out. */
  id?: string;
  label: string;
  value: number;
  /** Overrides the palette slot this segment would take. Segments are CATEGORIES, so they take the
   *  categorical palette in order — unlike the rows, which are one series and share one colour. */
  color?: string;
}

export interface BarChartRow {
  /** Falls back to the row's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  value: number;
  /** A percentage already out of 100, not a fraction: `42`, never `0.42`. Printed at
   *  the row's end while `showPercent` is on; derived from `value / max` when omitted. */
  percent?: number;
  /** Splits the row's track into parts that sum to its value — one full-width bar whose segments
   *  are the categories, which is how a share-of-total reads when the whole is the row rather than
   *  the chart. The parts are sized against their OWN sum, so they always fill the track: a set that
   *  does not add up to `value` is a data error the chart cannot silently paper over by leaving a
   *  gap that looks like a category.
   *
   *  Where segments are present the row's own colour is unused — each part takes its own. */
  segments?: readonly BarChartSegment[];
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
