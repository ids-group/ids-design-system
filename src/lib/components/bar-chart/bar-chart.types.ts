/** A row's reading: one number, or the two ends of a band.
 *
 *  A plain number spans from zero, which is what a bar has always drawn. A pair spans between its
 *  own two ends - a floating bar, a range, a min-to-max - and the ends may be written either way
 *  round, because a reader who reverses them means the same band. */
export type BarChartValue = number | readonly [low: number, high: number];

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
  /** One number spans from zero. A `[low, high]` pair spans between its own ends, which is what
   *  draws a floating bar - a range, a min to max, a period that starts partway along. */
  value: BarChartValue;
  /** A tick across the bar at one reading: a goal, a budget, a last-period figure. With `ranges`
   *  behind it this is the bullet chart, which is a bar with two extras rather than a chart type. */
  target?: number;
  /** Qualitative bands drawn behind the bar, given as their upper bounds in ascending order -
   *  `[60, 80, 100]` is three bands. They say what the reading MEANS where the number alone does
   *  not: poor, fair, good. They are painted in one neutral hue at rising opacity, never in the
   *  series palette, because a band is a backdrop and a bar is the reading. */
  ranges?: readonly number[];
  /** A percentage already out of 100, not a fraction: `42`, never `0.42`. Printed at
   *  the row's end while `showPercent` is on; derived from `value / max` when omitted. */
  percent?: number;
  /** Divides the row's BAR into parts. The bar keeps its own length — the row's share of the
   *  largest row — so the chart still compares the rows while each bar says what it is made of.
   *
   *  The parts are sized against their OWN sum and always fill the bar: a set that does not add up
   *  to `value` is a data error the chart cannot silently paper over by leaving a gap that looks
   *  like a category.
   *
   *  Where segments are present the row's own colour is unused — each part takes its own, and each
   *  part gets its own row in the data table. */
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
