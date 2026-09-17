/** Whether the label-and-value table under a chart's plot is offered, and how. It is the non-visual
 *  route to the numbers, so `'none'` belongs only where the same data is already in a table on the
 *  page. */
export type ChartDataTable = 'toggle' | 'visible' | 'none';

/** Whether a chart draws its own bordered, padded box. `'auto'` draws it; `'none'` leaves the
 *  chart bare, for a chart placed inside a card the page has already drawn. */
export type ChartFrame = 'auto' | 'none';

/** Where a chart-value formatter is printing: the compact `'tick'` label on the value axis, or
 *  `'tooltip'` everywhere else a value is spelled out in full, meaning the annex table, the
 *  generated description, and a value printed beside a mark. */
export type ChartFormatLocation = 'tick' | 'tooltip';

/** Formats every value a chart prints — the annex table and the generated description included.
 *  Called with the location it is formatting for, so one function can abbreviate on the axis and
 *  spell the value out everywhere else. */
export type ChartValueFormat = (
  value: number,
  location: ChartFormatLocation,
) => string;

/** How a reference line is stroked. Named rather than a `stroke-dasharray`, so the rhythm is the
 *  design system's to retune once and the same word draws the same line on every chart. */
export type ChartThresholdDash = 'solid' | 'dashed' | 'dotted';

/** A line drawn across a chart's plot at one reading - a target, a budget, an SLA - or, with `to`,
 *  the band between two of them.
 *
 *  ONE number, not a coordinate pair: a horizontal line has a single reading, and a shape that
 *  makes it write that reading twice is a shape whose two ends can drift apart. */
export interface ChartThreshold {
  readonly value: number;
  /** Printed at the line's left end and named in the generated description. An unlabelled one
   *  reads as "Threshold" there. */
  readonly label?: string;
  /** Any CSS colour. Unset takes `--ds-chart-threshold-color`. */
  readonly color?: string;
  /** The band's other end. Present, the threshold is drawn as a filled region between the two
   *  readings rather than a line; either order reads the same. */
  readonly to?: number;
  /** Defaults to `'dashed'`, which is what separates an annotation from another series. Carries
   *  nothing on a band, which is a fill. */
  readonly dash?: ChartThresholdDash;
}

/** Which of a chart's two value axes a mark is measured against. */
export type ChartAxis = 'primary' | 'secondary';

/** How a chart's second value axis relates to its first.
 *
 *  - `'rounded'` - one set of gridlines, and the secondary axis rounds its step up to a round
 *    number, so its series stops short of the top.
 *  - `'exact'` - one set of gridlines, and the secondary axis ends exactly at its largest
 *    reading, so its series uses the full height and the labels are not round.
 *  - `'independent'` - each axis is scaled and gridded on its own.
 *  - `'stacked'` - two plots one above the other, sharing the category axis. */
export type ChartAxisMode = 'rounded' | 'exact' | 'independent' | 'stacked';

/** How several series share one category's band.
 *
 *  - `'none'` - every series draws from the baseline at the band's centre, which is the single
 *    series case and what a chart that was handed one list has always done.
 *  - `'grouped'` - each series takes its own slot inside the band, side by side.
 *  - `'stacked'` - each series starts where the one before it ended, so the band's full height is
 *    the category's total.
 *  - `'normalized'` - stacked, then divided by the category's own total, so every band is full and
 *    the axis reads in shares rather than in the data's own unit.
 *
 *  Unrelated to `ChartAxisMode`'s `'stacked'`, which puts two PLOTS one above the other. */
export type ChartStackMode = 'none' | 'grouped' | 'stacked' | 'normalized';
