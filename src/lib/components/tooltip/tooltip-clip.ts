import { isTextClipped } from '@ids-group-ltd/ids-design-system/core';

export interface TooltipClipTarget {
  readonly selector: string | null;
}

/**
 * `''`, `true` and `'true'` test the host itself; any other string is a selector for the element
 * inside the host to test; `false`, `'false'`, `null` and `undefined` turn the test off.
 */
export function toClipTarget(
  value: boolean | string | null | undefined,
): TooltipClipTarget | null {
  if (value === true || value === '' || value === 'true') {
    return { selector: null };
  }

  return !value || value === 'false' ? null : { selector: value };
}

export function clipElement(
  host: HTMLElement,
  target: TooltipClipTarget | null,
): HTMLElement | null {
  return target?.selector
    ? host.querySelector<HTMLElement>(target.selector)
    : host;
}

export function isHostClipped(
  host: HTMLElement,
  target: TooltipClipTarget | null,
): boolean {
  const element = clipElement(host, target);
  if (element === null) {
    return false;
  }

  return isTextClipped(element) || isClippedByLines(element);
}

// A line clamp hides whole lines, so the block never overflows its width. Only hidden overflow
// counts: text in a scroll box can still be reached. The pixel absorbs sub-pixel line heights.
function isClippedByLines(element: HTMLElement): boolean {
  if (element.scrollHeight <= element.clientHeight + 1) {
    return false;
  }
  const overflow = getComputedStyle(element).overflowY;

  return overflow === 'hidden' || overflow === 'clip';
}

export function ownTextOf(element: HTMLElement | null): string {
  return (element?.textContent ?? '').trim();
}

export function textContains(haystack: string, needle: string): boolean {
  const collapse = (value: string) => value.replace(/\s+/g, ' ').trim();

  return collapse(haystack).includes(collapse(needle));
}
