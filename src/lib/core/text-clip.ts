/** True when `element` is showing less text than it holds, horizontally.
 *
 * Descendants count: a template-driven cell puts the ellipsis on a child. Only horizontal:
 * a clamped block hides whole LINES with `scrollWidth` equal to `clientWidth`.
 */
export function isTextClipped(element: HTMLElement): boolean {
  if (element.scrollWidth > element.clientWidth) {
    return true;
  }

  return [...element.querySelectorAll<HTMLElement>('*')].some(
    (child) => child.scrollWidth > child.clientWidth,
  );
}
