const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/** d3's tick-increment rule: snaps to 1, 2, 5 or 10 times a power of ten, not `span / count` steps like 482. */
function tickIncrement(span: number, targetCount: number): number {
  const step = span / Math.max(1, targetCount);
  const power = Math.floor(Math.log10(step));
  const error = step / Math.pow(10, power);
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;

  return factor * Math.pow(10, power);
}

/** The floor of a domain that has to include zero: zero itself for an all-positive
 *  series, and the most negative reading otherwise.
 *
 *  @internal */
export function domainMinOf(values: readonly number[]): number {
  return values.reduce((min, value) => Math.min(min, value), 0);
}

/** @internal */
export function tickValues(
  domainMin: number,
  domainMax: number,
  targetCount: number,
): number[] {
  const span = domainMax - domainMin;
  if (!Number.isFinite(span) || span <= 0) {
    return [0];
  }
  const step = tickIncrement(span, targetCount);
  const first = Math.floor(domainMin / step);
  const last = Math.ceil(domainMax / step);
  const out: number[] = [];
  for (let i = first; i <= last; i++) {
    out.push(i * step);
  }

  return out;
}

/** @internal */
export interface NiceDomain {
  readonly min: number;
  readonly max: number;
}

/** @internal */
export function niceDomain(
  domainMin: number,
  domainMax: number,
  targetCount: number,
): NiceDomain {
  const span = domainMax - domainMin;
  if (!Number.isFinite(span) || span <= 0) {
    return { min: 0, max: 0 };
  }
  const step = tickIncrement(span, targetCount);

  return {
    min: Math.floor(domainMin / step) * step,
    max: Math.ceil(domainMax / step) * step,
  };
}

/** Distance between two ticks, which `formatTick` needs to pick a precision. A
 *  degenerate series yields a single tick and therefore no step.
 *
 *  @internal */
export function tickStep(ticks: readonly number[]): number {
  return ticks.length > 1 ? ticks[1] - ticks[0] : 0;
}

/** @internal */
export function linearScale(
  domainMin: number,
  domainMax: number,
  rangeSize: number,
): (value: number) => number {
  const span = domainMax - domainMin;
  if (!Number.isFinite(span) || span <= 0) {
    return () => 0;
  }

  return (value) => ((value - domainMin) / span) * rangeSize;
}

/** @internal */
export interface PointScale {
  readonly step: number;
  readonly count: number;
  position(index: number): number;
  indexAt(offset: number): number;
}

/** @internal */
export interface BandScale {
  readonly bandWidth: number;
  /** Centre to centre, so it exceeds `bandWidth` by the padding. */
  readonly step: number;
  readonly count: number;
  position(index: number): number;
  /** The band an offset falls in, clamped at both ends so a pointer leaving the plot
   *  keeps the band it left from. `-1` when there are no bands, which is the one case
   *  a caller branches on rather than clamps. */
  indexAt(offset: number): number;
}

/** Positions for marks that sit at a category rather than inside it (a line's readings). The first
 *  is at the plot's start and the last at its end; a single reading takes the middle.
 *
 *  `step` is the distance between neighbours, the crosshair band's slot; at the two ends that slot
 *  is half outside the plot and the caller clamps it.
 *
 *  @internal */
export function pointScale(count: number, rangeSize: number): PointScale {
  const total = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const size = Number.isFinite(rangeSize) && rangeSize > 0 ? rangeSize : 0;
  if (total === 0) {
    return { step: 0, count: 0, position: () => 0, indexAt: () => -1 };
  }
  if (total === 1) {
    return {
      step: size,
      count: 1,
      position: () => size / 2,
      indexAt: () => 0,
    };
  }
  const step = size / (total - 1);

  return {
    step,
    count: total,
    position: (index) => Math.min(Math.max(index, 0), total - 1) * step,
    // Nearest reading, not the slot the pointer is over: the end slots are half-width, and rounding keeps them reachable.
    indexAt: (offset) => {
      if (!Number.isFinite(offset) || step === 0) {
        return -1;
      }
      const index = Math.round(offset / step);

      return Math.min(Math.max(index, 0), total - 1);
    },
  };
}

/** @internal */
export function bandScale(
  count: number,
  rangeSize: number,
  paddingRatio: number,
): BandScale {
  if (count <= 0) {
    return {
      bandWidth: 0,
      step: 0,
      count: 0,
      position: () => 0,
      indexAt: () => -1,
    };
  }
  const step = rangeSize / count;
  const bandWidth = step * (1 - paddingRatio);

  return {
    bandWidth,
    step,
    count,
    position: (index) => step * index + (step - bandWidth) / 2,
    indexAt: (offset) =>
      Math.min(count - 1, Math.max(0, Math.floor(offset / step))),
  };
}

const ROUND_STEP_FACTORS = [1, 2, 5, 10];
// A step divided out and multiplied back rarely lands on itself: a candidate equal to the minimum
// can compare smaller by one bit and push the axis up a rung.
const ROUND_STEP_TOLERANCE = 1 - 1e-12;

/** The smallest 1/2/5/10 x power-of-ten step not below `minimumStep`. `niceDomain` picks its own
 *  interval count, so it cannot answer this: a second axis on the first's gridlines must reach its
 *  data within the intervals the first drew.
 *
 *  @internal */
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
