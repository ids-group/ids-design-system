import {
  domainMinOf,
  linearScale,
  niceDomain,
  roundStepAtLeast,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import type { NiceDomain } from '@ids-group-ltd/ids-design-system/components';
import type {
  ChartAxisMode,
  ChartStackMode,
  ChartThreshold,
  ChartThresholdDash,
} from '@ids-group-ltd/ids-design-system/core';

export const CHART_DEFAULT_TICK_COUNT = 5;
export const CHART_AXIS_LABEL_GAP = 8;
export const CHART_CATEGORY_LABEL_OFFSET = 18;
export const CHART_BAND_PADDING = 0.3;

/** What the chart lays out at while it measures zero: under SSR, while the host is
 *  `display: none`, and for the frame before the first `ResizeObserver` callback. Without it the
 *  plot is `0 - axisGutter - EDGE_GUTTER` wide, which clamps to zero and stacks every category on
 *  one x rather than leaving a blank space that the measurement then fills.
 *
 *  The client cost is one frame drawn at this width and scaled to fit - measured at a 400px card
 *  in Chrome 153: `viewBox="0 0 640 310"` at t=242ms, `"0 0 358 310"` at t=260ms.
 *
 *  @internal */
export const CHART_FALLBACK_WIDTH = 640;

export const CHART_DEFAULT_PLOT_HEIGHT = 240;
export const CHART_DEFAULT_AXIS_GUTTER = 46;
export const CHART_DEFAULT_VALUE_SPACE = 20;

/** Room past the last band, so a mark centred on it is not cut by the viewBox edge. */
export const CHART_EDGE_GUTTER = 12;

/** Blank between two stacked plots: enough for the lower plot's top tick label to clear the upper
 *  plot's category-free bottom edge. */
export const CHART_STACKED_PLOT_GAP = 34;

/** Height of the category-label row under the plot: one line plus its descenders. */
const CATEGORY_GUTTER = 30;

/** The drawable rectangle, in the same CSS pixels the container was measured in.
 *
 *  `measuredWidth` is the `<svg>`'s own rendered width, which is what makes every coordinate
 *  derived from this an exact CSS pixel: the viewBox is sized to match, so one user unit is one
 *  pixel and a mark capped at 48 is 48 pixels wide at every card width.
 *
 *  @internal */
export function chartPlot(
  measuredWidth: number,
  plotHeight: number,
  axisGutter: number,
  valueSpace: number,
  rightGutter: number = CHART_EDGE_GUTTER,
): { left: number; top: number; width: number; height: number } {
  return {
    left: axisGutter,
    top: valueSpace,
    width: Math.max(0, measuredWidth - axisGutter - rightGutter),
    height: Math.max(0, plotHeight),
  };
}

/** The viewBox's height, and the `<svg>`'s rendered height in pixels - the two are the same
 *  number, which is what holds the 1:1 scale on the vertical axis too.
 *
 *  `valueSpace` is always budgeted above the plot, for a value label over the tallest mark. It is
 *  budgeted a SECOND time below the baseline only when the domain reaches under zero, where a
 *  negative mark's label would otherwise print into the category labels: reserving it for every
 *  chart costs the all-positive ones - the common case - that much height for nothing.
 *
 *  @internal */
export function chartViewHeight(
  plotHeight: number,
  valueSpace: number,
  reservesBelowBaseline = false,
): number {
  const below = reservesBelowBaseline ? valueSpace : 0;

  return valueSpace + Math.max(0, plotHeight) + below + CATEGORY_GUTTER;
}

/** The domain the value axis draws: the union of every reported set, always reaching zero,
 *  widened by the pins and snapped to a round tick step.
 *
 *  Zero is always in it because a bar measured against a floating floor misstates its own size,
 *  and a pin only ever widens because a maximum under the data would push readings off the plot
 *  rather than rescale them.
 *
 *  @internal */
export function axisDomain(
  reported: Iterable<readonly number[]>,
  tickCount: number,
  pinnedMinimum: number | null = null,
  pinnedMaximum: number | null = null,
): NiceDomain {
  let minimum = 0;
  let maximum = 0;
  for (const values of reported) {
    const finite = values.filter((value) => Number.isFinite(value));
    minimum = Math.min(minimum, domainMinOf(finite));
    maximum = finite.reduce(
      (highest, value) => Math.max(highest, value),
      maximum,
    );
  }
  if (
    pinnedMinimum !== null &&
    Number.isFinite(pinnedMinimum) &&
    pinnedMinimum < minimum
  ) {
    minimum = pinnedMinimum;
  }
  if (
    pinnedMaximum !== null &&
    Number.isFinite(pinnedMaximum) &&
    pinnedMaximum > maximum
  ) {
    maximum = pinnedMaximum;
  }

  return niceDomain(minimum, maximum, tickCount);
}

/** Where a value sits vertically, clamped inside the plot. An unplottable value lands on the
 *  baseline rather than becoming a `NaN`, which would void the whole coordinate attribute it was
 *  written into and take the mark off screen with nothing logged.
 *
 *  @internal */
export function valueScale(
  domain: NiceDomain,
  top: number,
  height: number,
): (value: number) => number {
  const baseline = top + height;
  const scale = linearScale(domain.min, domain.max, height);

  return (value) => {
    const y = baseline - scale(value);

    return Number.isFinite(y) ? Math.min(Math.max(y, top), baseline) : baseline;
  };
}

/** Distance from a reference line, or a band's upper edge, to its label's baseline. */
const THRESHOLD_LABEL_GAP = 5;

/** Inset from the plot's LEFT edge. The label sits at the start of the line rather than its end
 *  because a value label is centred on its column, and the last column's is the one nearest the
 *  edge the line stops at - measured on the docs demo, a right-anchored "Escalation" printed over
 *  the last column's own value. */
const THRESHOLD_LABEL_INSET = 4;

/** @internal */
export interface ThresholdMark {
  /** Position in the list, not the reading: two thresholds may legitimately name the same value -
   *  a target and the floor of the band around it - and keying on the value would collapse them
   *  into one drawn line. */
  readonly key: number;
  readonly label: string;
  readonly color: string | null;
  readonly dash: ChartThresholdDash;
  readonly band: boolean;
  readonly left: number;
  readonly right: number;
  readonly width: number;
  readonly y: number;
  readonly top: number;
  readonly height: number;
  readonly labelX: number;
  readonly labelY: number;
}

/** Every drawable coordinate of a chart's reference lines and bands, so the strokes and the labels
 *  - which paint in different layers, under the marks and over them - are laid out by one
 *  calculation rather than by two that can disagree.
 *
 *  @internal */
export function thresholdMarks(
  thresholds: readonly ChartThreshold[],
  plot: { left: number; top: number; width: number; height: number },
  toY: (value: number) => number,
): readonly ThresholdMark[] {
  return thresholds.map((threshold, index) => {
    const y = toY(threshold.value);
    const far = threshold.to == null ? y : toY(threshold.to);
    const top = Math.min(y, far);

    return {
      key: index,
      label: threshold.label ?? '',
      color: threshold.color ?? null,
      dash: threshold.dash ?? 'dashed',
      band: threshold.to != null,
      left: plot.left,
      right: plot.left + plot.width,
      width: plot.width,
      y,
      top,
      height: Math.abs(y - far),
      labelX: plot.left + THRESHOLD_LABEL_INSET,
      labelY: top - THRESHOLD_LABEL_GAP,
    };
  });
}

/** A tick row's index for the value zero, or `null` when the rows do not carry one.
 *
 *  Two axes share gridlines only if they also share a zero: a second scale hung on the first's
 *  rows has to put its own zero on the same row, or a reading above the line on one axis sits
 *  below it on the other. */
function zeroRow(ticks: readonly number[]): number | null {
  if (ticks.length < 2) {
    return null;
  }
  const step = ticks[1] - ticks[0];
  if (!Number.isFinite(step) || step === 0) {
    return null;
  }
  const row = (0 - ticks[0]) / step;
  const rounded = Math.round(row);

  return Math.abs(row - rounded) < 1e-9 &&
    rounded >= 0 &&
    rounded < ticks.length
    ? rounded
    : null;
}

/** @internal */
export interface SecondaryAxis {
  readonly domain: NiceDomain;
  readonly ticks: readonly number[];
  /** True when the labels below belong on the PRIMARY axis's own tick rows, so the plot carries
   *  one set of gridlines rather than two crossing each other. */
  readonly aligned: boolean;
}

/** The second value axis, as the four modes define it.
 *
 *  `'aligned'` and `'exact'` hang the second scale on the first's tick rows and differ only in the
 *  step: `'aligned'` snaps it up to a round number and overshoots the data, `'exact'` takes the
 *  step the data needs and lands on it. `'dual-grid'` and `'split'` nice the second domain on
 *  its own - stacked plots sit one above the other, so there is nothing to align.
 *
 *  Falls back to an independent scale wherever alignment is not available: fewer than two rows, no
 *  shared zero row, or a domain whose sign has no rows on its side of that zero.
 *
 *  @internal */
export function secondaryAxis(
  primaryTicks: readonly number[],
  reported: Iterable<readonly number[]>,
  tickCount: number,
  mode: ChartAxisMode,
): SecondaryAxis {
  let minimum = 0;
  let maximum = 0;
  for (const values of reported) {
    const finite = values.filter((value) => Number.isFinite(value));
    minimum = Math.min(minimum, domainMinOf(finite));
    maximum = finite.reduce(
      (highest, value) => Math.max(highest, value),
      maximum,
    );
  }
  const independent = (): SecondaryAxis => ({
    domain: niceDomain(minimum, maximum, tickCount),
    ticks: tickValues(minimum, maximum, tickCount),
    aligned: false,
  });

  if (mode !== 'aligned' && mode !== 'exact') {
    return independent();
  }
  const zero = zeroRow(primaryTicks);
  if (zero === null) {
    return independent();
  }
  const rowsAbove = primaryTicks.length - 1 - zero;
  const rowsBelow = zero;
  if ((maximum > 0 && rowsAbove === 0) || (minimum < 0 && rowsBelow === 0)) {
    return independent();
  }
  const needed = Math.max(
    rowsAbove > 0 ? maximum / rowsAbove : 0,
    rowsBelow > 0 ? -minimum / rowsBelow : 0,
  );
  const step = mode === 'aligned' ? roundStepAtLeast(needed) : needed;
  if (!Number.isFinite(step) || step <= 0) {
    return {
      domain: { min: 0, max: 0 },
      ticks: primaryTicks.map(() => 0),
      aligned: true,
    };
  }

  return {
    domain: { min: -rowsBelow * step, max: rowsAbove * step },
    ticks: primaryTicks.map((_, row) => roundTick((row - zero) * step)),
    aligned: true,
  };
}

/** A step multiplied back out rarely lands on itself, and an axis label that prints
 *  `149.99999999999997` is the visible form of that. */
function roundTick(value: number): number {
  return Number(value.toFixed(6));
}

/** Where one series' segment starts and ends on the value axis, in the axis's own unit - or in
 *  shares of the category total under `'normalized'`.
 */
export interface ChartStackOffset {
  readonly from: number;
  readonly to: number;
}

/** Every segment's span on the value axis, series-major: `offsets[series][category]`.
 *
 *  `'none'` and `'grouped'` give every series the same span it would have alone - the two differ in
 *  where the band puts them, which is geometry rather than value. The stacking modes run a
 *  POSITIVE and a NEGATIVE pile per category, so a negative segment hangs below the baseline
 *  instead of being subtracted from the positive pile it sits in.
 *
 *  `'normalized'` divides a running SUM rather than each share in turn: adding 20/60 to 40/60
 *  lands on 0.9999999999999999, which draws a category that visibly falls short of full.
 */
export function stackOffsets(
  series: readonly (readonly number[])[],
  mode: ChartStackMode,
): readonly (readonly ChartStackOffset[])[] {
  const reading = (value: number): number =>
    Number.isFinite(value) ? value : 0;
  if (mode === 'none' || mode === 'grouped') {
    return series.map((values) =>
      values.map((value) => ({ from: 0, to: reading(value) })),
    );
  }
  const magnitude: number[] = [];
  if (mode === 'normalized') {
    for (const values of series) {
      values.forEach((value, category) => {
        magnitude[category] =
          (magnitude[category] ?? 0) + Math.abs(reading(value));
      });
    }
  }
  const risen: number[] = [];
  const fallen: number[] = [];

  return series.map((values) =>
    values.map((raw, category) => {
      const value = reading(raw);
      const pile = value < 0 ? fallen : risen;
      const from = pile[category] ?? 0;
      const to = from + value;
      pile[category] = to;
      const total = mode === 'normalized' ? (magnitude[category] ?? 0) : 1;

      return total > 0
        ? { from: from / total, to: to / total }
        : { from: 0, to: 0 };
    }),
  );
}
