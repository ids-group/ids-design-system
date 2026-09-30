/**
 * Signal forms binds `min`, `max`, `minLength` and `maxLength` BY NAME and sends `undefined`
 * for no bound; the DS spells it `null`, so the write type accepts both.
 * @internal
 */
export function optionalBound(value: number | null | undefined): number | null {
  return value ?? null;
}

/** As `optionalBound`, for a bound the control requires a value for.
 * @internal
 */
export function boundOr(fallback: number) {
  return (value: number | undefined): number => value ?? fallback;
}
