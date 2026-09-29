/**
 * Signal forms binds `min`, `max`, `minLength` and `maxLength` BY NAME and sends `undefined`
 * when the schema sets no bound. The DS spells an absent bound as `null`, so the write type
 * accepts both while the read type stays `number | null`.
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
