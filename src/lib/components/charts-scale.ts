const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/** d3's tick-increment rule. A naive `max / count` produces steps like 482, which
 *  no reader parses; this snaps to 1, 2, 5 or 10 times a power of ten. */
function tickIncrement(domainMax: number, targetCount: number): number {
  const step = domainMax / Math.max(1, targetCount);
  const power = Math.floor(Math.log10(step));
  const error = step / Math.pow(10, power);
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;

  return factor * Math.pow(10, power);
}

/** @internal */
export function tickValues(domainMax: number, targetCount: number): number[] {
  if (!Number.isFinite(domainMax) || domainMax <= 0) {
    return [0];
  }
  const step = tickIncrement(domainMax, targetCount);
  const out: number[] = [];
  for (let i = 0; i <= Math.ceil(domainMax / step); i++) {
    out.push(i * step);
  }

  return out;
}

/** @internal */
export function niceMax(domainMax: number, targetCount: number): number {
  if (!Number.isFinite(domainMax) || domainMax <= 0) {
    return 0;
  }
  const step = tickIncrement(domainMax, targetCount);

  return Math.ceil(domainMax / step) * step;
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
  domainMax: number,
  rangeSize: number,
): (value: number) => number {
  if (!Number.isFinite(domainMax) || domainMax <= 0) {
    return () => 0;
  }

  return (value) => (value / domainMax) * rangeSize;
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
