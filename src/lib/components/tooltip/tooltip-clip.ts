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
  countLines = false,
): boolean {
  const element = clipElement(host, target);
  if (element === null) {
    return false;
  }

  // A line clamp hides whole lines, so the block never overflows its width; the pixel absorbs
  // sub-pixel line heights on a block that hides nothing.
  return (
    isTextClipped(element) ||
    (countLines && element.scrollHeight > element.clientHeight + 1)
  );
}

export function ownTextOf(element: HTMLElement | null): string {
  return (element?.textContent ?? '').trim();
}

export function textContains(haystack: string, needle: string): boolean {
  const collapse = (value: string) => value.replace(/\s+/g, ' ').trim();

  return collapse(haystack).includes(collapse(needle));
}
