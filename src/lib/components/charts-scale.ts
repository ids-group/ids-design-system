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

/** @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
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

/** @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
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
 *  @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
export function tickStep(ticks: readonly number[]): number {
  return ticks.length > 1 ? ticks[1] - ticks[0] : 0;
}

/** @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
export function linearScale(
  domainMax: number,
  rangeSize: number,
): (value: number) => number {
  if (!Number.isFinite(domainMax) || domainMax <= 0) {
    return () => 0;
  }

  return (value) => (value / domainMax) * rangeSize;
}

/** @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
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

/** @internal Reachable from the `components` entry point because the chart entry points import it across the boundary; not part of the package surface. */
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
