import type { PieChartSlice } from './pie-chart.types';

const FULL_TURN = Math.PI * 2;
const FULL_TURN_EPSILON = 1e-9;

export const DEFAULT_INNER_RADIUS = 0.68;

/** Valid over [0, 1); anything else falls back. */
export function holeFraction(innerRadius: number): number {
  return Number.isFinite(innerRadius) && innerRadius >= 0 && innerRadius < 1
    ? round(innerRadius)
    : DEFAULT_INNER_RADIUS;
}

/** The slices a legend can carry, with everything past `limit` summed into one that takes the neutral eighth palette slot. */
export function groupSmallest(
  slices: readonly PieChartSlice[],
  limit: number | null,
  otherLabel: string,
): PieChartSlice[] {
  if (limit === null || !Number.isInteger(limit) || limit < 2) {
    return [...slices];
  }
  if (slices.length <= limit) {
    return [...slices];
  }
  const ranked = [...slices]
    .map((slice, index) => ({ index, value: positiveValues([slice.value])[0] }))
    .sort((a, b) => b.value - a.value || a.index - b.index);
  const kept = new Set(ranked.slice(0, limit - 1).map((entry) => entry.index));
  const remainder = slices
    .filter((unusedSlice, index) => !kept.has(index))
    .reduce((sum, slice) => sum + positiveValues([slice.value])[0], 0);

  return [
    ...slices.filter((unusedSlice, index) => kept.has(index)),
    { id: 'ds-pie-other', label: otherLabel, value: remainder, slot: 8 },
  ];
}

export interface PieArc {
  readonly startAngle: number;
  readonly endAngle: number;
}

/** Anything that is not a positive share becomes zero; a NaN would reach every slice through the total and draw nothing, silently. */
export function positiveValues(values: readonly number[]): number[] {
  return values.map((value) =>
    Number.isFinite(value) && value > 0 ? value : 0,
  );
}

export function resolveTotal(values: readonly number[]): number {
  return positiveValues(values).reduce((sum, value) => sum + value, 0);
}

export function sliceArcs(values: readonly number[]): PieArc[] {
  const positive = positiveValues(values);
  const total = resolveTotal(positive);
  if (total <= 0) {
    return positive.map(() => ({ startAngle: 0, endAngle: 0 }));
  }
  let cursor = 0;

  return positive.map((value) => {
    const startAngle = cursor;
    cursor += (value / total) * FULL_TURN;

    return { startAngle, endAngle: cursor };
  });
}

/** Start and end angles, flattened, of `count` slices drawn from the skeleton's `skeletonSlices`
 *  equal slices; a slice past them opens from the end of the ring. */
export function skeletonArcs(count: number, skeletonSlices: number): number[] {
  const step = FULL_TURN / Math.max(skeletonSlices, 1);

  return Array.from({ length: count }, (unused, index) =>
    index < skeletonSlices
      ? [index * step, (index + 1) * step]
      : [FULL_TURN, FULL_TURN],
  ).flat();
}

export function resolveInnerRadius(
  outerRadius: number,
  innerRadius: number,
): number {
  if (!Number.isFinite(outerRadius) || outerRadius <= 0) {
    return 0;
  }

  return outerRadius * holeFraction(innerRadius);
}

/** A centre-value text with its width at the largest font size. */
export interface MeasuredText {
  readonly text: string;
  readonly width: number;
}

export interface CenterValueFit {
  readonly text: string;
  readonly fontSize: number;
}

/** The largest font size, between `minFontSize` and `maxFontSize`, at which the value fits
 *  `availableWidth`; past the floor, the compact text in its place when there is one. */
export function fitCenterValue(
  full: MeasuredText,
  compact: MeasuredText | null,
  availableWidth: number,
  maxFontSize: number,
  minFontSize: number,
): CenterValueFit {
  const sizeFor = (width: number) =>
    width <= availableWidth
      ? maxFontSize
      : (maxFontSize * availableWidth) / width;

  const fullSize = sizeFor(full.width);
  if (fullSize >= minFontSize) {
    return { text: full.text, fontSize: fullSize };
  }
  if (compact && compact.text !== full.text) {
    return {
      text: compact.text,
      fontSize: Math.max(sizeFor(compact.width), minFontSize),
    };
  }

  return { text: full.text, fontSize: minFontSize };
}

export function paletteIndex(
  slot: number | undefined,
  index: number,
  paletteLength: number,
): number {
  if (paletteLength <= 0) {
    return 0;
  }
  if (slot !== undefined && Number.isInteger(slot) && slot > 0) {
    return (slot - 1) % paletteLength;
  }

  return index % paletteLength;
}

/** One `"x y"` pair for a path. Angles run clockwise from 12 o'clock. */
export function ringPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): string {
  const { x, y } = ringCoords(centerX, centerY, radius, angle);

  return `${x} ${y}`;
}

/** The same point as numbers. */
export function ringCoords(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: round(centerX + radius * Math.sin(angle)),
    y: round(centerY - radius * Math.cos(angle)),
  };
}

export function arcPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const finite = [
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    startAngle,
    endAngle,
  ].every((value) => Number.isFinite(value));
  if (!finite || outerRadius <= 0) {
    return '';
  }
  const inner = Math.min(Math.max(innerRadius, 0), outerRadius);
  const sweep = endAngle - startAngle;
  if (sweep <= 0) {
    return '';
  }
  if (sweep >= FULL_TURN - FULL_TURN_EPSILON) {
    return fullRingPath(centerX, centerY, outerRadius, inner);
  }
  const largeArcFlag = sweep > Math.PI ? 1 : 0;
  const outerRadii = `${round(outerRadius)} ${round(outerRadius)}`;
  const outerArc =
    `M ${ringPoint(centerX, centerY, outerRadius, startAngle)}` +
    ` A ${outerRadii} 0 ${largeArcFlag} 1 ${ringPoint(centerX, centerY, outerRadius, endAngle)}`;
  if (inner === 0) {
    return `${outerArc} L ${round(centerX)} ${round(centerY)} Z`;
  }
  const innerRadii = `${round(inner)} ${round(inner)}`;

  return (
    `${outerArc} L ${ringPoint(centerX, centerY, inner, endAngle)}` +
    ` A ${innerRadii} 0 ${largeArcFlag} 0 ${ringPoint(centerX, centerY, inner, startAngle)} Z`
  );
}

function fullRingPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
): string {
  const outer = circlePath(centerX, centerY, outerRadius, 1);
  if (innerRadius <= 0) {
    return outer;
  }

  // The inner circle winds the other way so the nonzero fill rule cancels it against the outer one.
  return `${outer} ${circlePath(centerX, centerY, innerRadius, 0)}`;
}

/** A closed circle is two half-turns: a single full-turn SVG arc draws nothing. */
function circlePath(
  centerX: number,
  centerY: number,
  radius: number,
  sweepFlag: 0 | 1,
): string {
  const top = ringPoint(centerX, centerY, radius, 0);
  const bottom = ringPoint(centerX, centerY, radius, Math.PI);
  const radii = `${round(radius)} ${round(radius)}`;

  return `M ${top} A ${radii} 0 1 ${sweepFlag} ${bottom} A ${radii} 0 1 ${sweepFlag} ${top} Z`;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
