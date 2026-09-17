const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/** d3's tick-increment rule. A naive `span / count` produces steps like 482, which
 *  no reader parses; this snaps to 1, 2, 5 or 10 times a power of ten. */
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

/** Positions for marks that sit AT a category rather than inside it — the readings of a line.
 *  The first is at the plot's start and the last at its end, so the run fills the axis rather than
 *  floating half a slot inside it. A single reading has no run to fill and takes the middle.
 *
 *  `step` is the distance between neighbours, which is what a crosshair band is a slot of; at the
 *  two ends that slot is half outside the plot and the caller clamps it.
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
    // Nearest reading, not the slot the pointer is over: with the ends on the axes the first and
    // last slots are half-width, and rounding is what makes both of them reachable.
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
// A step divided out of a domain and multiplied back rarely lands on itself, so a
// candidate equal to the minimum can compare as smaller by one bit and push the
// whole axis up a rung.
const ROUND_STEP_TOLERANCE = 1 - 1e-12;

/** The smallest 1/2/5/10 x power-of-ten step that is not below `minimumStep`.
 *  `niceDomain` picks its own number of intervals, so it cannot answer this: a second
 *  axis drawn against the first's gridlines has to reach its data within the intervals
 *  the first already drew.
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
