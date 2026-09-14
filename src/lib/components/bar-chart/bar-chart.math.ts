/** Largest finite value, or `explicitMax` when it is a usable track length. A
 *  non-finite datum is skipped rather than compared: one `Infinity` row would
 *  otherwise become the track length and flatten every other row to nothing. */
export function resolveMax(
  explicitMax: number | null,
  values: readonly number[],
): number {
  if (explicitMax !== null && Number.isFinite(explicitMax) && explicitMax > 0) {
    return explicitMax;
  }
  const finite = values.filter((value) => Number.isFinite(value));

  return finite.length ? Math.max(...finite) : 0;
}

/** Track share for one row, in percent. Has no upper bound: an explicit `max`
 *  below the data is the caller's statement, and `.track` clips the overflow. */
export function widthPercent(value: number, max: number): number {
  // Math.max(NaN, 0) is NaN, so the lower clamp cannot stand in for this test —
  // and the result is written into a style attribute, where `width: NaN%` is
  // dropped silently.
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.max((value / max) * 100, 0);
}
