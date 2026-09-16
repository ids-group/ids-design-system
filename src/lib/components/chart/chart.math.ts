import {
  domainMinOf,
  linearScale,
  niceDomain,
} from '@ids-group-ltd/ids-design-system/components';
import type { NiceDomain } from '@ids-group-ltd/ids-design-system/components';

export const CHART_VIEW_WIDTH = 640;
export const CHART_VIEW_HEIGHT = 320;
export const CHART_DEFAULT_TICK_COUNT = 5;
export const CHART_AXIS_LABEL_GAP = 8;
export const CHART_CATEGORY_LABEL_OFFSET = 18;
export const CHART_BAND_PADDING = 0.3;

const AXIS_GUTTER = 46;
const EDGE_GUTTER = 12;
const PLOT_TOP = 14;
const CATEGORY_GUTTER = 30;

/** @internal */
export const CHART_PLOT = {
  left: AXIS_GUTTER,
  top: PLOT_TOP,
  width: CHART_VIEW_WIDTH - AXIS_GUTTER - EDGE_GUTTER,
  height: CHART_VIEW_HEIGHT - CATEGORY_GUTTER - PLOT_TOP,
};

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
