/** Whether the label-and-value table under a chart's plot is offered, and how. It is the
 *  non-visual route to the numbers: use `'none'` only if the page already has the data in a table. */
export type ChartDataTable = 'toggle' | 'visible' | 'none';

/** Whether a chart draws its own bordered, padded box; `'none'` for a chart inside a card. */
export type ChartFrame = 'auto' | 'none';

/** Where a chart-value formatter is printing: the compact `'tick'` label on the value axis,
 *  `'readout'` for the hovered value in a pill on the axis, or `'tooltip'` for every value spelled
 *  out in full (annex table, description, beside a mark). `'readout'` reaches only a formatter
 *  that sets `handlesReadout`. */
export type ChartFormatLocation = 'tick' | 'readout' | 'tooltip';

/** Formats every value a chart prints, annex table and generated description included.
 *  Receives the location, so one function can abbreviate on the axis only.
 *
 *  The axis readout pill asks for `'tooltip'`, unless the formatter carries
 *  `handlesReadout: true`; only then is it called with `'readout'`. A formatter written for
 *  `'tick' | 'tooltip'` therefore compiles and keeps a full number in the pill. */
export type ChartValueFormat = {
  // Method syntax makes `location` bivariant, so a formatter typed `'tick' | 'tooltip'` compiles.
  format(value: number, location: ChartFormatLocation): string;
}['format'] & { readonly handlesReadout?: boolean };

/** How a reference line is stroked. */
export type ChartThresholdDash = 'solid' | 'dashed' | 'dotted';

/** A line drawn across a chart's plot at one reading - a target, a budget, an SLA - or, with `to`,
 *  the band between two of them. */
export interface ChartThreshold {
  readonly value: number;
  /** Printed at the line's left end and named in the generated description (default "Threshold"). */
  readonly label?: string;
  /** Any CSS colour. Unset takes `--ds-chart-threshold-color`. */
  readonly color?: string;
  /** The band's other end: the threshold is drawn as a filled region between the two readings. */
  readonly to?: number;
  /** Defaults to `'dashed'`. Ignored on a band. */
  readonly dash?: ChartThresholdDash;
}

/** Which of a chart's two value axes a mark is measured against. */
export type ChartAxis = 'primary' | 'secondary';

/** How a chart's second value axis relates to its first.
 *
 *  - `'aligned'` - one set of gridlines; the secondary axis rounds its step up, so its series
 *    stops short of the top.
 *  - `'exact'` - one set of gridlines; the secondary axis ends exactly at its largest reading,
 *    so the labels are not round.
 *  - `'dual-grid'` - each axis is scaled and gridded on its own.
 *  - `'split'` - two plots one above the other, sharing the category axis. */
export type ChartAxisMode = 'aligned' | 'exact' | 'dual-grid' | 'split';

/** How a line joins its readings. `'step'` holds each reading until the next, for a quantity that
 *  CHANGES at a moment. `'smooth'` is a monotone cubic: it never draws a peak or trough the
 *  readings do not contain. */
export type ChartCurve = 'linear' | 'step' | 'smooth';

/** What a `null` reading draws: a hole in the line, or a point at zero. */
export type ChartGaps = 'break' | 'zero';

/** How several series share one category's band.
 *
 *  - `'none'` - every series draws from the baseline at the band's centre.
 *  - `'grouped'` - each series takes its own slot inside the band, side by side.
 *  - `'stacked'` - each series starts where the one before it ended.
 *  - `'normalized'` - stacked, then divided by the category's total: the axis reads in shares. */
export type ChartStackMode = 'none' | 'grouped' | 'stacked' | 'normalized';

/** How charts build themselves on a long page, set in `DS_CONFIG.chart.rendering`.
 *  Everything is off unless `deferUntilVisible` is on. */
export interface ChartRendering {
  /** Build a chart only when it comes near the viewport; until then it shows its loading
   *  placeholder at its own height. Default `false`. For pages with dozens of charts. */
  deferUntilVisible?: boolean;
  /** How far outside the viewport a deferred chart is built, as an `IntersectionObserver`
   *  `rootMargin`. Default `'10% 0px'`. */
  visibleMargin?: string;
  /** Also build deferred charts within `buildAheadMargin` while the page is idle. Default `true`.
   *  Skipped where `requestIdleCallback` does not exist. */
  buildAheadWhileIdle?: boolean;
  /** The reach of `buildAheadWhileIdle`, as a `rootMargin`. Default `'100% 0px'`, one viewport. */
  buildAheadMargin?: string;
  /** Milliseconds of chart building one task may spend before it yields. Default `8`. A single
   *  chart that takes longer is still built whole. */
  frameBudgetMs?: number;
  /** With `deferUntilVisible`, also skip a built chart's style, layout and paint while off screen
   *  (`content-visibility: auto`). Default `true`. */
  skipWhileOffscreen?: boolean;
}
