import {
  domainMinOf,
  linearScale,
  niceDomain,
} from '@ids-group-ltd/ids-design-system/components';
import type { NiceDomain } from '@ids-group-ltd/ids-design-system/components';

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
const EDGE_GUTTER = 12;

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
): { left: number; top: number; width: number; height: number } {
  return {
    left: axisGutter,
    top: valueSpace,
    width: Math.max(0, measuredWidth - axisGutter - EDGE_GUTTER),
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
