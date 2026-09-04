/**
 * Signal forms binds `min`, `max`, `minLength` and `maxLength` BY NAME and sends
 * `undefined` when the schema sets no bound. The DS spells an absent bound as
 * `null`, so the write type has to accept both while the read type stays what it
 * always was — otherwise every internal use and every consumer moves for nothing.
 *
 * Declared once here because it was copy-pasted across three controls, and an
 * explanation in three places is an explanation that drifts in two of them.
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
