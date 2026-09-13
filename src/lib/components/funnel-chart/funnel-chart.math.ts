import type { FunnelChartShape } from './funnel-chart.types';

/** Bottom width of the fixed silhouette, as a fraction of the full width. The
 *  tail carries a label, so it never narrows past this. */
export const FUNNEL_TAIL_WIDTH = 0.38;

/** Ramp step for one stage, spread across the whole ramp rather than taking its
 *  first `rampedCount` entries — a three-stage funnel that used steps 1-3 would
 *  never reach the deep end the ramp exists to provide. */
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

/** The viewBox is normalised: depth runs 0..100 whatever the stage count, and
 *  the rendered block size carries the real height. */
export const FUNNEL_VIEW_BOX_WIDTH = 100;

export const FUNNEL_VIEW_BOX_HEIGHT = 100;

/** One inter-stage gap, as a share of a single stage's own depth. A share and
 *  not a count of units, because the viewBox depth is normalised: a fixed
 *  number of units would grow on screen with every stage added. */
const FUNNEL_STAGE_GAP_SHARE = 0.14;

export interface FunnelStageGeometry {
  /** Fraction of the full width at the stage's top edge, 0..1. */
  readonly topWidth: number;
  readonly bottomWidth: number;
  /** Fraction of the total depth at the stage's top edge, 0..1. */
  readonly top: number;
  readonly bottom: number;
}

/** Every value as a finite, non-negative number. A negative would mirror a
 *  stage about its own centre line, and a non-finite one reaches an SVG
 *  attribute as `NaN`, where the renderer drops the whole shape without an
 *  error. */
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

/** The depth at which `areaShare` of the silhouette's area lies above. The area
 *  down to depth `t` is `t - (1 - tail) * t² / 2` against a whole of
 *  `(1 + tail) / 2`, so the depth is a root of that quadratic rather than a
 *  ratio — this is the step that makes area, not width, carry the value. The
 *  discriminant bottoms out at `tail²`, so the root is always real. */
export function depthForAreaShare(
  areaShare: number,
  tailWidth: number,
): number {
  const share = clampFraction(areaShare);
  const tail = clampFraction(tailWidth);
  const narrowing = 1 - tail;
  // A silhouette that does not narrow is a rectangle, where area is linear in
  // depth and the quadratic degenerates to 0/0.
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

  // The last boundary repeats the last value, which flattens the closing edge:
  // there is no following stage to taper towards.
  return Array.from({ length: count + 1 }, (_, index) =>
    clampFraction(values[Math.min(index, count - 1)] / largest),
  );
}

/** One trapezoid per stage, in fractions of the full width and of the total
 *  depth.
 *
 *  `'taper'` and `'area'` share one fixed silhouette — full width at the top,
 *  `FUNNEL_TAIL_WIDTH` at the bottom — and differ only in where the stage
 *  boundaries land on it: evenly spaced for `'taper'`, so width encodes
 *  nothing, and at the depths that make each band's area proportional to its
 *  value for `'area'`. `'width'` abandons the silhouette and reads every
 *  boundary straight off the values. */
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

/** The fall from `previousValue` to `value`, as a fraction of `previousValue`.
 *  Null where there is nothing to fall from — a zero or non-finite predecessor
 *  makes the ratio 0/0. Negative where the stage grew, which is real data. */
export function stageDrop(previousValue: number, value: number): number | null {
  if (!Number.isFinite(previousValue) || !Number.isFinite(value)) {
    return null;
  }
  if (previousValue <= 0) {
    return null;
  }

  return (previousValue - value) / previousValue;
}

/** The drop into each stage. The first entry is null and not zero: a printed
 *  `0%` there would claim nobody fell away, rather than that there was no
 *  earlier stage to fall from. */
export function stageDrops(values: readonly number[]): (number | null)[] {
  return values.map((value, index) =>
    index === 0 ? null : stageDrop(values[index - 1], value),
  );
}

/** Depth of one inter-stage gap, in viewBox units. */
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

/** The stage's four corners as an SVG `points` value, or an empty string when
 *  any input is non-finite. An attribute holding `NaN` is discarded by the
 *  renderer without an error, so the shape would go missing in silence. */
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
  let top = bandTop + halfGap;
  let bottom = bandBottom - halfGap;
  if (bottom < top) {
    // A band shallower than the gap it has to leave. Collapse it to a line
    // instead of letting the edges cross and draw a bow tie.
    const middle = (top + bottom) / 2;
    top = middle;
    bottom = middle;
  }
  const horizontalCentre = viewBoxWidth / 2;
  const topWidth = clampFraction(geometry.topWidth);
  const bottomWidth = clampFraction(geometry.bottomWidth);
  // The widths belong to the band's own boundaries, and the gap moves the drawn edges INSIDE them.
  // Drawing the boundary widths at the inset depths makes every band overhang the silhouette at its
  // top and fall short of it at its bottom, so the stack reads as a fir tree rather than a funnel.
  // The silhouette is linear in depth for every shape, so the inset widths interpolate exactly.
  const bandDepth = bandBottom - bandTop;
  // Capped at half: past that the band has collapsed to a line, and an uncapped fraction would
  // swap the two edges and draw the bow tie the collapse exists to prevent.
  const inset =
    bandDepth > 0 ? Math.min(Math.max(halfGap / bandDepth, 0), 0.5) : 0;
  const widthAt = (fraction: number) =>
    topWidth + (bottomWidth - topWidth) * fraction;
  const halfTopWidth = (widthAt(inset) * viewBoxWidth) / 2;
  const halfBottomWidth = (widthAt(1 - inset) * viewBoxWidth) / 2;

  return [
    `${roundCoordinate(horizontalCentre - halfTopWidth)},${roundCoordinate(top)}`,
    `${roundCoordinate(horizontalCentre + halfTopWidth)},${roundCoordinate(top)}`,
    `${roundCoordinate(horizontalCentre + halfBottomWidth)},${roundCoordinate(bottom)}`,
    `${roundCoordinate(horizontalCentre - halfBottomWidth)},${roundCoordinate(bottom)}`,
  ].join(' ');
}
