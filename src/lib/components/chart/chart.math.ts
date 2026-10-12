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
import type { ChartTooltipEntry } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ChartAxisEntry } from './chart-scales.token';

export const CHART_DEFAULT_TICK_COUNT = 5;
export const CHART_AXIS_LABEL_GAP = 8;

/** Room a rotated axis title needs across the gutter. */
export const CHART_AXIS_TITLE_BAND = 20;
export const CHART_CATEGORY_LABEL_OFFSET = 18;
export const CHART_BAND_PADDING = 0.3;

/** The width the chart lays out at while it measures zero (SSR, `display: none`, before the first
 *  `ResizeObserver` callback); without it every category stacks on one x.
 *
 *  @internal */
export const CHART_FALLBACK_WIDTH = 640;

export const CHART_DEFAULT_PLOT_HEIGHT = 240;
/** Width of the value-axis label gutter a chart draws when none is set. @internal */
export const CHART_DEFAULT_AXIS_GUTTER = 46;
export const CHART_DEFAULT_VALUE_SPACE = 20;

/** Room past the last band, so a mark centred on it is not cut by the viewBox edge. */
export const CHART_EDGE_GUTTER = 12;

/** Blank between two stacked plots, so the lower plot's top tick label clears the upper plot. */
export const CHART_STACKED_PLOT_GAP = 34;

const CATEGORY_GUTTER = 30;

/** The drawable rectangle, in CSS pixels; the viewBox matches `measuredWidth`, so one user unit is one pixel.
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

/** The viewBox's height, equal to the `<svg>`'s rendered height in pixels.
 *
 *  `valueSpace` is budgeted above the plot, and below the baseline only when the domain reaches
 *  under zero (a negative mark's label would print into the category labels).
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

/** The domain the value axis draws: the union of every reported set, always reaching zero (a bar
 *  against a floating floor misstates its size), widened by the pins and snapped to a round tick step.
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
 *  baseline: a `NaN` would void the coordinate attribute and hide the mark silently.
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

/** Inset from the plot's left edge; a right-anchored label collides with the last column's value label. */
const THRESHOLD_LABEL_INSET = 4;

/** @internal */
export interface ThresholdMark {
  /** Position in the list, not the reading: two thresholds may share a value. */
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

/** Every drawable coordinate of a chart's reference lines and bands; strokes and labels paint in
 *  different layers and share one calculation.
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

/** A tick row's index for the value zero, or `null` when the rows do not carry one. Two axes share
 *  gridlines only if they share a zero row, or a reading above the line on one axis sits below it on the other. */
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
  /** True when the labels below sit on the primary axis's own tick rows. */
  readonly aligned: boolean;
}

/** The second value axis, as the four modes define it.
 *
 *  `'aligned'` and `'exact'` hang the second scale on the first's tick rows; `'aligned'` snaps the
 *  step to a round number, `'exact'` takes the step the data needs. `'dual-grid'` and `'split'`
 *  nice the second domain on its own.
 *
 *  Falls back to an independent scale when alignment is unavailable: fewer than two rows, no shared
 *  zero row, or a domain whose sign has no rows on its side of zero.
 *
 *  @internal */
export function secondaryAxis(
  primaryTicks: readonly number[],
  reported: Iterable<readonly number[]>,
  tickCount: number,
  mode: ChartAxisMode,
  pinnedMax: number | null = null,
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
  if (pinnedMax !== null && Number.isFinite(pinnedMax)) {
    maximum = pinnedMax;
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

/** A step multiplied back out rarely lands on itself (`149.99999999999997`). */
function roundTick(value: number): number {
  return Number(value.toFixed(6));
}

/** Every segment's span on the value axis, series-major: `offsets[series][category]`.
 *
 *  `'none'` and `'grouped'` give every series the span it would have alone. The stacking modes run a
 *  positive and a negative pile per category.
 *
 *  `'normalized'` divides a running sum, not each share in turn: 20/60 + 40/60 is
 *  0.9999999999999999 and draws a category visibly short of full.
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

/** A label pinned to one reading, legible with no pointer.
 *
 *  @internal */
export interface ChartAnnotationMark {
  readonly key: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
}

/** View units between a reading and the label above it, and the margin inside which a label
 *  anchors to its own edge instead of centring.
 *
 *  @internal */
const ANNOTATION_GAP = 12;
/** @internal */
const ANNOTATION_EDGE_GUARD = 48;

/** Places a label against each reading it names.
 *
 *  @internal */
export function annotationMarks(
  readings: readonly { key: string; label: string; x: number; y: number }[],
  plotWidth: number,
): readonly ChartAnnotationMark[] {
  return readings.map((reading) => ({
    key: reading.key,
    label: reading.label,
    x: reading.x,
    // Below the reading where there is no room above, or a label at a peak lands on its own marker.
    y:
      reading.y - ANNOTATION_GAP >= ANNOTATION_GAP
        ? reading.y - ANNOTATION_GAP
        : reading.y + ANNOTATION_GAP,
    // Anchored away from the plot edges: a centred first/last label hangs outside the viewBox.
    anchor:
      reading.x < ANNOTATION_EDGE_GUARD
        ? 'start'
        : reading.x > plotWidth - ANNOTATION_EDGE_GUARD
          ? 'end'
          : 'middle',
  }));
}

/** Where one series' segment starts and ends on the value axis, in the axis's own unit, or in
 *  shares of the category total under `'normalized'`.
 */
export interface ChartStackOffset {
  readonly from: number;
  readonly to: number;
}

/** Which category a pointer at `x` is over, or `-1` outside the plot. The half band at each end
 *  belongs to the first and last category.
 *
 *  @internal */
export function categoryAt(
  x: number,
  plotLeft: number,
  plotWidth: number,
  categoryCount: number,
): number {
  if (categoryCount <= 0 || plotWidth <= 0 || !Number.isFinite(x)) {
    return -1;
  }
  const offset = x - plotLeft;
  if (offset < 0 || offset > plotWidth) {
    return -1;
  }
  const band = plotWidth / categoryCount;

  return Math.min(categoryCount - 1, Math.floor(offset / band));
}

/** Where a pin's disc centres on a mark spanning `top` to `top + height`, `inset` being the disc's
 *  radius plus its gap: inside the mark's upper end when it holds the disc, else above the mark and
 *  above `valueTop`, the top of the value printed over it. */
export function pinYAbove(
  top: number,
  height: number,
  valueTop: number | null,
  inset: number,
): number {
  if (height >= 2 * inset) {
    return top + inset;
  }

  return Math.min(top, valueTop ?? top) - inset;
}

/** Readings ordered top to bottom with the height dropped; ties and readings with no height keep their place. */
export function topDown(
  entries: readonly ChartAxisEntry[],
): ChartTooltipEntry[] {
  return [...entries]
    .sort((above, below) => (above.y ?? Infinity) - (below.y ?? Infinity) || 0)
    .map(({ y: _drawnAt, ...reading }) => reading);
}

/** A key per category that follows the category, not its position: its label, numbered from the
 *  second time a label repeats. A mark keyed by it moves with its category when another comes or goes. */
export function categoryKeys(labels: readonly string[]): string[] {
  const seen = new Map<string, number>();

  return labels.map((label) => {
    const count = seen.get(label) ?? 0;
    seen.set(label, count + 1);

    return count === 0 ? label : `${label}#${count}`;
  });
}
