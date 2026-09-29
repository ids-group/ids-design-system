/** A row's reading: one number spanning from zero, or a `[low, high]` pair for a floating bar. The pair's ends may be given in either order. */
export type BarChartValue = number | readonly [low: number, high: number];

/** One part of a row that is a distribution rather than a single quantity. */
export interface BarChartSegment {
  /** Falls back to the segment's position when left out. */
  id?: string;
  label: string;
  value: number;
  /** Overrides the palette slot this segment would take. Segments take the categorical palette in
   *  order; rows share one series colour. */
  color?: string;
}

export interface BarChartRow {
  /** Falls back to the row's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  /** One number spans from zero; a `[low, high]` pair draws a floating bar. */
  value: BarChartValue;
  /** A tick across the bar at one reading, such as a goal or budget. Combined with `ranges` it draws a bullet chart. */
  target?: number;
  /** Qualitative bands behind the bar, as upper bounds in ascending order: `[60, 80, 100]` is three
   *  bands. Painted in one neutral hue at rising opacity, never in the series palette. */
  ranges?: readonly number[];
  /** A percentage already out of 100, not a fraction: `42`, never `0.42`. Printed at
   *  the row's end while `showPercent` is on; derived from `value / max` when omitted. */
  percent?: number;
  /** Divides the row's bar into parts. The bar keeps its length, so rows stay comparable.
   *
   *  The parts are sized against their OWN sum and always fill the bar, even when it differs from
   *  `value`. With segments present the row's `color` is unused and each part gets its own row in the
   *  data table. */
  segments?: readonly BarChartSegment[];
  /** A second reading for this row, printed under the label. Already formatted: `valueFormat` is
   *  written for the bar's own scale and is not applied to it. */
  detail?: string;
  /** Overrides this row's colour. Rows share one series colour by default; set this on the row to
   *  accent, usually to `var(--ds-chart-series-accent-color)`. */
  color?: string;
}
