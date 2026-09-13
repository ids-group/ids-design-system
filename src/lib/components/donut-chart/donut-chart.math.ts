const FULL_TURN = Math.PI * 2;
const FULL_TURN_EPSILON = 1e-9;

export const DEFAULT_THICKNESS = 0.32;

/** Diameter of the hole, as a fraction of the ring's own diameter. The centre content is held to
 *  the square that fits inside it. */
export function holeFraction(thickness: number): number {
  const ratio =
    Number.isFinite(thickness) && thickness > 0 && thickness <= 1
      ? thickness
      : DEFAULT_THICKNESS;

  return round(1 - ratio);
}

export interface DonutArc {
  readonly startAngle: number;
  readonly endAngle: number;
}

/** A ring is a part-to-whole picture, so anything that is not a positive share
 *  becomes zero. Non-finite values go in the same pass: one NaN reaches every
 *  other slice through the total, and a `d` attribute holding NaN draws nothing
 *  at all rather than failing loudly. */
export function positiveValues(values: readonly number[]): number[] {
  return values.map((value) =>
    Number.isFinite(value) && value > 0 ? value : 0,
  );
}

export function resolveTotal(values: readonly number[]): number {
  return positiveValues(values).reduce((sum, value) => sum + value, 0);
}

export function sliceArcs(values: readonly number[]): DonutArc[] {
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

export function resolveInnerRadius(
  outerRadius: number,
  thickness: number,
): number {
  if (!Number.isFinite(outerRadius) || outerRadius <= 0) {
    return 0;
  }
  // A thickness outside (0, 1] draws no ring: at 0 the band has no width, above
  // 1 the inner radius goes negative. An unusable one falls back to the default
  // instead of rendering an empty chart.
  const ratio =
    Number.isFinite(thickness) && thickness > 0 && thickness <= 1
      ? thickness
      : DEFAULT_THICKNESS;

  return outerRadius * (1 - ratio);
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

/** One `"x y"` pair for a path. Angles run clockwise from 12 o'clock, where a
 *  reader expects a ring to start; SVG's y axis points down, so that is
 *  (sin, -cos) rather than the (cos, sin) of the maths convention. */
export function ringPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): string {
  return `${round(centerX + radius * Math.sin(angle))} ${round(
    centerY - radius * Math.cos(angle),
  )}`;
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

  // The hole is cut by winding the inner circle the other way, which the default
  // nonzero fill rule then cancels against the outer one.
  return `${outer} ${circlePath(centerX, centerY, innerRadius, 0)}`;
}

/** A single arc of a full turn ends where it starts and SVG draws nothing for
 *  it, so a closed circle is two half-turns. */
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
