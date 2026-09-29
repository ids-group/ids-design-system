/** Whether the label-and-value table under a chart's plot is offered, and how. It is the
 *  non-visual route to the numbers, so `'none'` belongs only where the same data is already in a
 *  table on the page. */
export type ChartDataTable = 'toggle' | 'visible' | 'none';

/** Whether a chart draws its own bordered, padded box. `'auto'` draws it; `'none'` leaves the
 *  chart bare, for a chart placed inside a card the page has already drawn. */
export type ChartFrame = 'auto' | 'none';

/** Where a chart-value formatter is printing: the compact `'tick'` label on the value axis, or
 *  `'tooltip'` everywhere else a value is spelled out in full, meaning the annex table, the
 *  generated description, and a value printed beside a mark. */
export type ChartFormatLocation = 'tick' | 'tooltip';

/** Formats every value a chart prints, the annex table and the generated description included.
 *  Called with the location it is formatting for, so one function can abbreviate on the axis and
 *  spell the value out everywhere else. */
export type ChartValueFormat = (
  value: number,
  location: ChartFormatLocation,
) => string;

/** How a reference line is stroked. Named rather than a `stroke-dasharray`, so the same word
 *  draws the same line on every chart. */
export type ChartThresholdDash = 'solid' | 'dashed' | 'dotted';

/** A line drawn across a chart's plot at one reading - a target, a budget, an SLA - or, with `to`,
 *  the band between two of them.
 *
 *  ONE number, not a coordinate pair: a horizontal line has a single reading. */
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

/** How a chart's second value axis relates to its first. The modes differ only in what is done
 *  to the GRIDLINES.
 *
 *  - `'aligned'` - one set of gridlines, and the secondary axis rounds its step up to a round
 *    number, so its series stops short of the top.
 *  - `'exact'` - one set of gridlines, and the secondary axis ends exactly at its largest
 *    reading, so its series uses the full height and the labels are not round.
 *  - `'dual-grid'` - each axis is scaled and gridded on its own.
 *  - `'split'` - two plots one above the other, sharing the category axis. */
export type ChartAxisMode = 'aligned' | 'exact' | 'dual-grid' | 'split';

/** How a line joins its readings. `'linear'` asserts nothing the data does not say. `'step'`
 *  holds each reading until the next, which is right for a quantity that CHANGES at a moment
 *  rather than drifting between two. `'smooth'` is a monotone cubic: it never draws a peak or a
 *  trough the readings do not contain, which a Catmull-Rom does. */
export type ChartCurve = 'linear' | 'step' | 'smooth';

/** What a `null` reading draws: a hole in the line, or a point at zero. */
export type ChartGaps = 'break' | 'zero';

/** How several series share one category's band.
 *
 *  - `'none'` - every series draws from the baseline at the band's centre (the single-series case).
 *  - `'grouped'` - each series takes its own slot inside the band, side by side.
 *  - `'stacked'` - each series starts where the one before it ended, so the band's full height is
 *    the category's total.
 *  - `'normalized'` - stacked, then divided by the category's own total, so every band is full and
 *    the axis reads in shares rather than in the data's own unit.
 *
 *  Unrelated to `ChartAxisMode`'s `'split'`, which puts two PLOTS one above the other. */
export type ChartStackMode = 'none' | 'grouped' | 'stacked' | 'normalized';

/** How charts build themselves on a long page, set once for an app in `DS_CONFIG.chart.rendering`.
 *  Everything is off unless `deferUntilVisible` is on: a screen with a few charts draws them at
 *  once, with nothing waiting and nothing to flicker. */
export interface ChartRendering {
  /** Build a chart only when it comes near the viewport; until then it shows its loading
   *  placeholder at its own height, and a screen reader meets its caption and nothing else.
   *  Default `false`. For a page with dozens of charts - a dashboard, a report - where building
   *  them all at once stalls the page. */
  deferUntilVisible?: boolean;
  /** How far outside the viewport a deferred chart is built, as an `IntersectionObserver`
   *  `rootMargin`. Default `'10% 0px'`: near enough that its entrance still plays on screen. */
  visibleMargin?: string;
  /** Also build the deferred charts within `buildAheadMargin` while the page is idle, so the next
   *  scroll finds them ready. Default `true`. Skipped where `requestIdleCallback` does not exist. */
  buildAheadWhileIdle?: boolean;
  /** The reach of `buildAheadWhileIdle`, as a `rootMargin`. Default `'100% 0px'`, one viewport. */
  buildAheadMargin?: string;
  /** Milliseconds of chart building one task may spend before it yields, so no frame waits on a
   *  queue of charts. Default `8`. A single chart that takes longer is still built whole. */
  frameBudgetMs?: number;
  /** With `deferUntilVisible`, also let the browser skip a built chart's style, layout and paint
   *  while it is off screen, through `content-visibility: auto`. Default `true`. */
  skipWhileOffscreen?: boolean;
}
