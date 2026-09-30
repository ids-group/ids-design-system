let nextId = 0;

/** Process-wide counter for SSR-safe control ids (no DOM dependency).
 * @internal
 */
export function nextControlId(prefix: string): string {
  return `${prefix}-${++nextId}`;
}
