/** A row's reading: one number spanning from zero, or a `[low, high]` pair for a floating bar. The pair's ends may be given in either order. */
export type BarChartValue = number | readonly [low: number, high: number];

/** Where a row's label sits: on its own line above the bar, or in a column before it. */
export type BarChartLabelPosition = 'top' | 'start';

/** One part of a row that is a distribution rather than a single quantity. */
export interface BarChartSegment {
  /** Falls back to the segment's position when left out. */
  id?: string;
  label: string;
  value: number;
  /** Overrides the palette slot this segment would take. */
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
  /** Divides the row's bar into parts sized against their OWN sum, filling the bar even when it
   *  differs from `value`. The row's `color` is unused and each part gets its own data-table row. */
  segments?: readonly BarChartSegment[];
  /** A second reading for this row, printed under the label. Already formatted: `valueFormat` is
   *  written for the bar's own scale and is not applied to it. */
  detail?: string;
  /** Overrides this row's colour, usually `var(--ds-chart-series-accent-color)` to accent it. */
  color?: string;
  /** Rows nested under this one, shown by a disclosure button after the label and closed at first.
   *  Each child's bar and derived percent are measured against this row's value, not `max`; a child
   *  takes this row's colour unless it sets its own. One level: a child's own `children` are ignored. */
  children?: readonly BarChartRow[];
  /** Turns the label into a defined term: a dotted underline, and this text in a tooltip on hover
   *  and keyboard focus, announced as the label's description. */
  hint?: string;
  /** Prints the label in bold, as for the first and last rows of a funnel. */
  emphasis?: boolean;
  /** Prints or hides this row's percent, overriding the chart's `showPercent`; a child without its
   *  own takes its parent's. */
  showPercent?: boolean;
  /** Marks a row that is not a part of the others, such as a total of those who finished or left:
   *  a divider separates it from the row before, and `partOfWhole` gives it no share. */
  detached?: boolean;
}
