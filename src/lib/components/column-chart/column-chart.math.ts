import {
  domainMinOf,
  linearScale,
} from '@ids-group-ltd/ids-design-system/components';

/** Largest finite value in the series — the domain the value axis is niced from.
 *  A non-finite point is skipped rather than compared: one `Infinity` point
 *  would otherwise become the domain and flatten every other column to nothing. */
export function resolveDomainMax(values: readonly number[]): number {
  const finite = values.filter((value) => Number.isFinite(value));

  return finite.length ? Math.max(...finite) : 0;
}

/** The floor the value axis is niced from — zero for an all-positive series, and
 *  the most negative reading otherwise. A non-finite point is skipped for the same
 *  reason `resolveDomainMax` skips one. */
export function resolveDomainMin(values: readonly number[]): number {
  return domainMinOf(values.filter((value) => Number.isFinite(value)));
}

/** Share of the plot area, in percent, between the axis floor and ceiling. Drives both a
 *  column's edges and a gridline's offset, so a tick and the column beside it cannot drift
 *  apart. Clamped to the plot: an all-negative domain puts the zero baseline above the
 *  ceiling, and the clamp is what keeps every column measured against the ceiling rather
 *  than past it. */
export function heightPercent(
  value: number,
  domainMin: number,
  domainMax: number,
): number {
  // linearScale only guards the DOMAIN's finiteness, not the value's — Math.max(NaN, 0) is
  // NaN, so the lower clamp below cannot stand in for this test, and the result is written
  // into a style attribute, where `height: NaN%` is dropped silently.
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    Math.max(linearScale(domainMin, domainMax, 100)(value), 0),
    100,
  );
}
