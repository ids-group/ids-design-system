let nextId = 0;

/** Process-wide counter for stable, SSR-safe control ids (no DOM dependency).
 *  Replaces the per-component `let nextId = 0` pattern.
 * @internal
 */
export function nextControlId(prefix: string): string {
  return `${prefix}-${++nextId}`;
}
