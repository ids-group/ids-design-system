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

/** The floor of a domain that has to include zero: zero for an all-positive series, else the most negative reading.
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
export interface BandScale {
  readonly bandWidth: number;
  /** Centre to centre; exceeds `bandWidth` by the padding. */
  readonly step: number;
  readonly count: number;
  position(index: number): number;
  /** The band an offset falls in, clamped at both ends. `-1` when there are no bands. */
  indexAt(offset: number): number;
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
 *  interval count, so it cannot answer this.
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
