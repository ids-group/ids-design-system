/** Largest finite value in the series — the domain the value axis is niced from.
 *  A non-finite point is skipped rather than compared: one `Infinity` point
 *  would otherwise become the domain and flatten every other column to nothing. */
export function resolveDomainMax(values: readonly number[]): number {
  const finite = values.filter((value) => Number.isFinite(value));

  return finite.length ? Math.max(...finite) : 0;
}

/** Share of the plot area, in percent. Drives both a column's height and a
 *  gridline's offset, so a tick and the column beside it cannot drift apart. */
export function heightPercent(value: number, axisMax: number): number {
  // Math.max(NaN, 0) is NaN, so the lower clamp cannot stand in for this test —
  // and the result is written into a style attribute, where `height: NaN%` is
  // dropped silently.
  if (!Number.isFinite(value) || !Number.isFinite(axisMax) || axisMax <= 0) {
    return 0;
  }

  return Math.max((value / axisMax) * 100, 0);
}
