/** True when `element` is showing less text than it holds, horizontally.
 *
 * Descendants count: a template-driven cell puts the ellipsis on a child, so testing only the
 * wrapper misses it. `overflow: clip` still reports the overflow, which is what lets the house
 * `single-line-ellipsis` mixin earn a disclosure — checked in Chromium.
 *
 * Only horizontal. A clamped block hides whole LINES and its `scrollWidth` matches its
 * `clientWidth`, so a caller that clamps has to compare line counts instead.
 */
export function isTextClipped(element: HTMLElement): boolean {
  if (element.scrollWidth > element.clientWidth) {
    return true;
  }

  return [...element.querySelectorAll<HTMLElement>('*')].some(
    (child) => child.scrollWidth > child.clientWidth,
  );
}
