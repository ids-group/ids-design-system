import {
  pointScale,
  linearScale,
  niceDomain,
  roundStepAtLeast,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import type { LinePoint } from '@ids-group-ltd/ids-design-system/components';
import type { LineChartAxisMode, LineChartGaps } from './line-chart.types';

export {
  areaPath,
  linePath,
  lineSegments,
  polylinePoints,
  roundStepAtLeast,
} from '@ids-group-ltd/ids-design-system/components';
export type {
  LineCurve,
  LinePoint,
} from '@ids-group-ltd/ids-design-system/components';

export const LINE_CHART_VIEW_WIDTH = 640;
export const LINE_CHART_VIEW_HEIGHT = 320;
export const LINE_CHART_DEFAULT_TICK_COUNT = 5;
export const LINE_CHART_AXIS_LABEL_GAP = 8;

const AXIS_GUTTER = 46;
const BARE_EDGE_GUTTER = 12;
const PLOT_TOP = 14;
const CATEGORY_GUTTER = 30;
const CATEGORY_LABEL_OFFSET = 18;
const STACKED_PLOT_GAP = 34;
const MAX_CATEGORY_LABELS = 12;
const TICK_DECIMALS = 6;

export interface PlotArea {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface AxisScale {
  readonly max: number;
  readonly ticks: readonly number[];
}

export interface AxisLayout {
  readonly primary: AxisScale;
  /** Null when no series asked for a second axis. */
  readonly secondary: AxisScale | null;
  /** True when the secondary axis is drawn against the primary's gridlines. */
  readonly alignedTicks: boolean;
}

export interface ChartLayout {
  readonly primaryPlot: PlotArea;
  /** The same area as `primaryPlot` unless the plots are stacked. */
  readonly secondaryPlot: PlotArea;
  readonly categoryLabelY: number;
  readonly stacked: boolean;
}

function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(decimals));
}

export function normalizeTickCount(tickCount: number): number {
  return Number.isFinite(tickCount) && tickCount >= 1
    ? Math.floor(tickCount)
    : LINE_CHART_DEFAULT_TICK_COUNT;
}

/** One reading per category, however long the series actually was. A series longer
 *  than `categories` loses its tail and a shorter one ends early: a line that stops
 *  short is a defect the reader can see, while a thrown error takes down the page
 *  around it. Anything that is not a finite number is a missing reading, so `NaN`
 *  and `Infinity` follow the `gaps` policy rather than reaching a coordinate. */
export function alignSeriesValues(
  data: readonly (number | null)[],
  categoryCount: number,
  gaps: LineChartGaps,
): (number | null)[] {
  const length =
    Number.isFinite(categoryCount) && categoryCount > 0
      ? Math.floor(categoryCount)
      : 0;
  const aligned: (number | null)[] = [];
  for (let index = 0; index < length; index++) {
    const raw = data[index];
    const reading =
      typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
    aligned.push(reading === null && gaps === 'zero' ? 0 : reading);
  }

  return aligned;
}

/** Largest finite reading across the given series, or zero. Never negative: the
 *  tick helpers only describe axes that start at zero, and a negative domain there
 *  is a division waiting to happen. */
export function domainMaxOf(
  valueGroups: readonly (readonly (number | null)[])[],
): number {
  let max = 0;
  for (const values of valueGroups) {
    for (const value of values) {
      if (value !== null && Number.isFinite(value) && value > max) {
        max = value;
      }
    }
  }

  return max;
}

function nicedAxis(domainMax: number, tickCount: number): AxisScale {
  return {
    max: niceDomain(0, domainMax, tickCount).max,
    ticks: tickValues(0, domainMax, tickCount),
  };
}

/** Both y axes, as the four modes define them. `'aligned'` and `'exact'` share the
 *  primary's gridlines and differ only in the step they divide the secondary domain
 *  by: `'aligned'` snaps the step up to a round number and overshoots the data,
 *  `'exact'` takes the domain itself and lands on it. `'dual-grid'` and
 *  `'split'` nice each axis on its own — stacked plots sit one above the other,
 *  so there is nothing to align. */
export function axisLayout(
  primaryDomainMax: number,
  secondaryDomainMax: number | null,
  mode: LineChartAxisMode,
  tickCount: number,
): AxisLayout {
  const count = normalizeTickCount(tickCount);
  const primary = nicedAxis(primaryDomainMax, count);
  if (secondaryDomainMax === null) {
    return { primary, secondary: null, alignedTicks: true };
  }

  const intervals = primary.ticks.length - 1;
  const canAlign =
    (mode === 'aligned' || mode === 'exact') &&
    intervals >= 1 &&
    Number.isFinite(secondaryDomainMax) &&
    secondaryDomainMax > 0;
  if (!canAlign) {
    return {
      primary,
      secondary: nicedAxis(secondaryDomainMax, count),
      alignedTicks: false,
    };
  }

  const step =
    mode === 'aligned'
      ? roundStepAtLeast(secondaryDomainMax / intervals)
      : secondaryDomainMax / intervals;
  if (step <= 0) {
    return { primary, secondary: { max: 0, ticks: [0] }, alignedTicks: true };
  }

  const ticks: number[] = [];
  for (let index = 0; index <= intervals; index++) {
    ticks.push(roundTo(step * index, TICK_DECIMALS));
  }

  return {
    primary,
    secondary: { max: roundTo(step * intervals, TICK_DECIMALS), ticks },
    alignedTicks: true,
  };
}

export function chartLayout(
  mode: LineChartAxisMode,
  hasSecondaryAxis: boolean,
): ChartLayout {
  const stacked = mode === 'split' && hasSecondaryAxis;
  const left = AXIS_GUTTER;
  const right = hasSecondaryAxis && !stacked ? AXIS_GUTTER : BARE_EDGE_GUTTER;
  const width = LINE_CHART_VIEW_WIDTH - left - right;
  const plotBottom = LINE_CHART_VIEW_HEIGHT - CATEGORY_GUTTER;
  const categoryLabelY = plotBottom + CATEGORY_LABEL_OFFSET;

  if (!stacked) {
    const plot: PlotArea = {
      left,
      top: PLOT_TOP,
      width,
      height: plotBottom - PLOT_TOP,
    };

    return {
      primaryPlot: plot,
      secondaryPlot: plot,
      categoryLabelY,
      stacked: false,
    };
  }

  const height = (plotBottom - PLOT_TOP - STACKED_PLOT_GAP) / 2;

  return {
    primaryPlot: { left, top: PLOT_TOP, width, height },
    secondaryPlot: {
      left,
      top: PLOT_TOP + height + STACKED_PLOT_GAP,
      width,
      height,
    },
    categoryLabelY,
    stacked: true,
  };
}

export function categoryCenters(count: number, plot: PlotArea): number[] {
  const total = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const scale = pointScale(total, plot.width);
  const centers: number[] = [];
  for (let index = 0; index < total; index++) {
    centers.push(plot.left + scale.position(index));
  }

  return centers;
}

/** The y a reading sits at, always inside the plot. The clamp is what keeps a
 *  negative reading — which no zero-based axis can place — off the category labels
 *  below, and the finite test is what stops an unplottable one becoming `NaN`. */
export function valueY(value: number, axisMax: number, plot: PlotArea): number {
  const baseline = plot.top + plot.height;
  const y = baseline - linearScale(0, axisMax, plot.height)(value);
  if (!Number.isFinite(y)) {
    return baseline;
  }

  return Math.min(Math.max(y, plot.top), baseline);
}

export function seriesPoints(
  values: readonly (number | null)[],
  axisMax: number,
  plot: PlotArea,
  centers: readonly number[],
): (LinePoint | null)[] {
  return values.map((value, index) => {
    const x = centers[index];
    if (value === null || !Number.isFinite(value) || !Number.isFinite(x)) {
      return null;
    }

    return { categoryIndex: index, x, y: valueY(value, axisMax, plot), value };
  });
}

/** Show every nth category label. Every label at 60 categories is a grey smear, and
 *  the axis stops saying anything at all. */
export function categoryLabelStride(
  count: number,
  maxLabels: number = MAX_CATEGORY_LABELS,
): number {
  if (!Number.isFinite(count) || count <= 0 || maxLabels < 1) {
    return 1;
  }

  return Math.max(1, Math.ceil(count / maxLabels));
}

export function paletteIndexFor(
  slot: number | undefined,
  index: number,
  paletteSize: number,
): number {
  if (!Number.isFinite(paletteSize) || paletteSize < 1) {
    return 0;
  }
  const chosen =
    slot !== undefined && Number.isFinite(slot) && slot >= 1
      ? Math.floor(slot) - 1
      : index;

  return ((chosen % paletteSize) + paletteSize) % paletteSize;
}
