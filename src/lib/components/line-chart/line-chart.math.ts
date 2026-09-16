import {
  pointScale,
  linearScale,
  niceDomain,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import type { LineChartAxisMode, LineChartGaps } from './line-chart.types';

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
const COORDINATE_DECIMALS = 2;
const TICK_DECIMALS = 6;
const ROUND_STEP_FACTORS = [1, 2, 5, 10];
// A step divided out of a domain and multiplied back rarely lands on itself, so a
// candidate equal to the minimum can compare as smaller by one bit and push the
// whole axis up a rung.
const ROUND_STEP_TOLERANCE = 1 - 1e-12;

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

export interface LinePoint {
  readonly categoryIndex: number;
  readonly x: number;
  readonly y: number;
  readonly value: number;
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

/** The smallest 1/2/5/10 × power-of-ten step that is not below `minimumStep`.
 *  `niceMax` picks its own number of intervals, so it cannot answer this: an aligned
 *  secondary axis has to reach its data within the intervals the primary already
 *  drew. */
export function roundStepAtLeast(minimumStep: number): number {
  if (!Number.isFinite(minimumStep) || minimumStep <= 0) {
    return 0;
  }
  const base = Math.pow(10, Math.floor(Math.log10(minimumStep)));
  for (const factor of ROUND_STEP_FACTORS) {
    const candidate = factor * base;
    if (candidate >= minimumStep * ROUND_STEP_TOLERANCE) {
      return candidate;
    }
  }

  return 10 * base;
}

function nicedAxis(domainMax: number, tickCount: number): AxisScale {
  return {
    max: niceDomain(0, domainMax, tickCount).max,
    ticks: tickValues(0, domainMax, tickCount),
  };
}

/** Both y axes, as the four modes define them. `'rounded'` and `'exact'` share the
 *  primary's gridlines and differ only in the step they divide the secondary domain
 *  by: `'rounded'` snaps the step up to a round number and overshoots the data,
 *  `'exact'` takes the domain itself and lands on it. `'independent'` and
 *  `'stacked'` nice each axis on its own — stacked plots sit one above the other,
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
    (mode === 'rounded' || mode === 'exact') &&
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
    mode === 'rounded'
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
  const stacked = mode === 'stacked' && hasSecondaryAxis;
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

export function lineSegments(
  points: readonly (LinePoint | null)[],
): LinePoint[][] {
  const segments: LinePoint[][] = [];
  let current: LinePoint[] = [];
  for (const point of points) {
    if (point === null) {
      if (current.length > 0) {
        segments.push(current);
      }
      current = [];
    } else {
      current.push(point);
    }
  }
  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
}

/** `''` rather than a partial list when a coordinate is unplottable: one `NaN` in a
 *  `points` list or a path `d` voids the whole attribute, and the line then vanishes
 *  with nothing logged. */
export function polylinePoints(segment: readonly LinePoint[]): string {
  if (segment.length === 0 || !segment.every(isPlottable)) {
    return '';
  }

  return segment.map((point) => coordinatePair(point)).join(' ');
}

export function areaPath(
  segment: readonly LinePoint[],
  baselineY: number,
): string {
  if (
    segment.length < 2 ||
    !Number.isFinite(baselineY) ||
    !segment.every(isPlottable)
  ) {
    return '';
  }
  const first = segment[0];
  const last = segment[segment.length - 1];
  const along = segment.map((point) => coordinatePair(point)).join(' L ');
  const baseline = roundTo(baselineY, COORDINATE_DECIMALS);

  return `M ${along} L ${roundTo(last.x, COORDINATE_DECIMALS)},${baseline} L ${roundTo(first.x, COORDINATE_DECIMALS)},${baseline} Z`;
}

function isPlottable(point: LinePoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function coordinatePair(point: LinePoint): string {
  return `${roundTo(point.x, COORDINATE_DECIMALS)},${roundTo(point.y, COORDINATE_DECIMALS)}`;
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
