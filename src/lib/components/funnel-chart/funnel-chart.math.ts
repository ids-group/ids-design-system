import type { FunnelChartShape } from './funnel-chart.types';

/** Bottom width of the fixed silhouette, as a fraction of the full width; the tail carries a label. */
export const FUNNEL_TAIL_WIDTH = 0.38;

/** Ramp step for one stage, spread across the whole ramp rather than its first `rampedCount` entries. */
export function rampPosition(
  index: number,
  rampedCount: number,
  rampLength: number,
): number {
  if (rampLength <= 0 || rampedCount <= 1) {
    return 0;
  }
  const position = Math.round((index / (rampedCount - 1)) * (rampLength - 1));

  return Math.min(Math.max(position, 0), rampLength - 1);
}

export const FUNNEL_VIEW_BOX_WIDTH = 100;

export const FUNNEL_VIEW_BOX_HEIGHT = 100;

/** One inter-stage gap as a share of a stage's depth. */
const FUNNEL_STAGE_GAP_SHARE = 0.14;

export interface FunnelStageGeometry {
  /** Fraction of the full width at the stage's top edge, 0..1. */
  readonly topWidth: number;
  readonly bottomWidth: number;
  /** Fraction of the total depth at the stage's top edge, 0..1. */
  readonly top: number;
  readonly bottom: number;
}

/** Every value as a finite, non-negative number: a negative mirrors a stage about its centre line, and
 *  `NaN` in an SVG attribute drops the whole shape silently. */
export function sanitizeValues(values: readonly number[]): number[] {
  return values.map((value) =>
    Number.isFinite(value) ? Math.max(value, 0) : 0,
  );
}

function clampFraction(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
}

function widthAtDepth(depth: number, tailWidth: number): number {
  return 1 - (1 - tailWidth) * clampFraction(depth);
}

function largestValue(values: readonly number[]): number {
  return values.reduce(
    (largest, value) => (value > largest ? value : largest),
    0,
  );
}

/** The depth at which `areaShare` of the silhouette's area lies above: the quadratic root of
 *  `t - (1 - tail) * t² / 2 = areaShare * (1 + tail) / 2`, always real. */
export function depthForAreaShare(
  areaShare: number,
  tailWidth: number,
): number {
  const share = clampFraction(areaShare);
  const tail = clampFraction(tailWidth);
  const narrowing = 1 - tail;
  // A rectangle: area is linear in depth and the quadratic degenerates to 0/0.
  if (narrowing <= 0) {
    return share;
  }
  const discriminant = Math.max(1 - narrowing * share * (1 + tail), 0);

  return clampFraction((1 - Math.sqrt(discriminant)) / narrowing);
}

function evenDepths(count: number): number[] {
  return Array.from({ length: count + 1 }, (_, index) => index / count);
}

function boundaryDepths(
  values: readonly number[],
  shape: FunnelChartShape,
  tailWidth: number,
): number[] {
  const count = values.length;
  if (shape !== 'area') {
    return evenDepths(count);
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 0) {
    return evenDepths(count);
  }
  const depths: number[] = [];
  let consumed = 0;
  for (let index = 0; index <= count; index += 1) {
    depths.push(depthForAreaShare(consumed / total, tailWidth));
    if (index < count) {
      consumed += values[index];
    }
  }

  return depths;
}

function boundaryWidths(
  values: readonly number[],
  shape: FunnelChartShape,
  depths: readonly number[],
  tailWidth: number,
): number[] {
  if (shape !== 'width') {
    return depths.map((depth) => widthAtDepth(depth, tailWidth));
  }
  const count = values.length;
  const largest = largestValue(values);
  if (!Number.isFinite(largest) || largest <= 0) {
    return depths.map(() => 0);
  }

  // The last boundary repeats the last value: no following stage to taper towards.
  return Array.from({ length: count + 1 }, (_, index) =>
    clampFraction(values[Math.min(index, count - 1)] / largest),
  );
}

/** One trapezoid per stage, in fractions of the full width and of the total depth. `'taper'` and
 *  `'area'` share one silhouette and differ in boundary depths: even for `'taper'`, area-proportional
 *  for `'area'`. `'width'` reads every boundary off the values. */
export function funnelGeometry(
  values: readonly number[],
  shape: FunnelChartShape,
  tailWidth: number = FUNNEL_TAIL_WIDTH,
): FunnelStageGeometry[] {
  const safeValues = sanitizeValues(values);
  if (safeValues.length === 0) {
    return [];
  }
  const tail = Number.isFinite(tailWidth)
    ? clampFraction(tailWidth)
    : FUNNEL_TAIL_WIDTH;
  const depths = boundaryDepths(safeValues, shape, tail);
  const widths = boundaryWidths(safeValues, shape, depths, tail);

  return safeValues.map((_, index) => ({
    top: depths[index],
    bottom: depths[index + 1],
    topWidth: widths[index],
    bottomWidth: widths[index + 1],
  }));
}

/** The fall from `previousValue` to `value`, as a fraction of `previousValue`. Null for a zero or
 *  non-finite predecessor; negative where the stage grew. */
export function stageDrop(previousValue: number, value: number): number | null {
  if (!Number.isFinite(previousValue) || !Number.isFinite(value)) {
    return null;
  }
  if (previousValue <= 0) {
    return null;
  }

  return (previousValue - value) / previousValue;
}

/** The drop into each stage. The first entry is null, not zero: `0%` would claim nobody fell away. */
export function stageDrops(values: readonly number[]): (number | null)[] {
  return values.map((value, index) =>
    index === 0 ? null : stageDrop(values[index - 1], value),
  );
}

export function stageGapUnits(
  stageCount: number,
  viewBoxHeight: number,
): number {
  if (
    !Number.isFinite(stageCount) ||
    !Number.isFinite(viewBoxHeight) ||
    stageCount <= 0
  ) {
    return 0;
  }

  return (FUNNEL_STAGE_GAP_SHARE * viewBoxHeight) / stageCount;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** The stage's four corners as an SVG `points` value, or an empty string when any input is
 *  non-finite (`NaN` in the attribute drops the shape silently). */
export function stagePolygonPoints(
  geometry: FunnelStageGeometry,
  viewBoxWidth: number,
  viewBoxHeight: number,
  gapUnits: number,
): string {
  const inputs = [
    geometry.topWidth,
    geometry.bottomWidth,
    geometry.top,
    geometry.bottom,
    viewBoxWidth,
    viewBoxHeight,
    gapUnits,
  ];
  if (inputs.some((input) => !Number.isFinite(input))) {
    return '';
  }
  const halfGap = Math.max(gapUnits, 0) / 2;
  const bandTop = clampFraction(geometry.top) * viewBoxHeight;
  const bandBottom = clampFraction(geometry.bottom) * viewBoxHeight;
  const bandDepth = bandBottom - bandTop;
  let top = bandTop + halfGap;
  let bottom = bandBottom - halfGap;
  if (bandDepth <= 0) {
    top = bandTop;
    bottom = bandTop;
  } else if (bottom - top < halfGap) {
    // A band shallower than its gap keeps half a gap of depth about its middle so it stays visible.
    const middle = Math.min(
      Math.max((bandTop + bandBottom) / 2, halfGap / 2),
      viewBoxHeight - halfGap / 2,
    );
    top = middle - halfGap / 2;
    bottom = middle + halfGap / 2;
  }
  const horizontalCentre = viewBoxWidth / 2;
  const topWidth = clampFraction(geometry.topWidth);
  const bottomWidth = clampFraction(geometry.bottomWidth);
  // Boundary widths at the inset depths would draw a fir tree; the silhouette is linear, so interpolate.
  const widthAt = (depth: number) =>
    bandDepth > 0
      ? topWidth +
        (bottomWidth - topWidth) * clampFraction((depth - bandTop) / bandDepth)
      : (topWidth + bottomWidth) / 2;
  const halfTopWidth = (widthAt(top) * viewBoxWidth) / 2;
  const halfBottomWidth = (widthAt(bottom) * viewBoxWidth) / 2;

  return [
    `${roundCoordinate(horizontalCentre - halfTopWidth)},${roundCoordinate(top)}`,
    `${roundCoordinate(horizontalCentre + halfTopWidth)},${roundCoordinate(top)}`,
    `${roundCoordinate(horizontalCentre + halfBottomWidth)},${roundCoordinate(bottom)}`,
    `${roundCoordinate(horizontalCentre - halfBottomWidth)},${roundCoordinate(bottom)}`,
  ].join(' ');
}

/** The middle of a band, for placing a marker inside it.
 *
 *  @internal */
export function stageCenter(
  geometry: FunnelStageGeometry,
  viewBoxWidth: number,
  viewBoxHeight: number,
): { x: number; y: number } {
  const top = clampFraction(geometry.top) * viewBoxHeight;
  const bottom = clampFraction(geometry.bottom) * viewBoxHeight;

  return { x: viewBoxWidth / 2, y: (top + bottom) / 2 };
}
