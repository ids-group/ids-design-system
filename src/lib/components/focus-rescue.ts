import { DOCUMENT, Injector, afterNextRender, inject } from '@angular/core';

const TABBABLE_CANDIDATES =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';

function isTabbable(element: HTMLElement): boolean {
  return (
    element.isConnected &&
    element.tabIndex >= 0 &&
    !(element as HTMLButtonElement).disabled &&
    !element.closest('[inert]') &&
    element.checkVisibility()
  );
}

function tabbableNeighbour(
  leaving: HTMLElement,
  within: HTMLElement,
): HTMLElement | null {
  const candidates = Array.from(
    within.querySelectorAll<HTMLElement>(TABBABLE_CANDIDATES),
  ).filter((element) => !leaving.contains(element) && isTabbable(element));
  const following = candidates.find(
    (element) =>
      leaving.compareDocumentPosition(element) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  );

  return following ?? candidates.at(-1) ?? null;
}

/**
 * When focus is inside `leaving`, which is about to be removed, moves it to the nearest tabbable
 * element inside `within`: the next one in document order, else the previous one, else `fallback`.
 * @internal
 */
export function moveFocusOutOf(
  leaving: HTMLElement,
  within: HTMLElement,
  fallback: HTMLElement | null = null,
): void {
  if (!leaving.contains(leaving.ownerDocument.activeElement)) {
    return;
  }
  const target =
    tabbableNeighbour(leaving, within) ??
    (fallback && isTabbable(fallback) ? fallback : null);
  target?.focus();
}

/**
 * Returns a function that, after the next render, focuses `target()` when focus has fallen to
 * `<body>` - its element was removed or disabled under it. Focus the app moved elsewhere is left alone.
 *
 * Must be called from an injection context.
 * @internal
 */
export function focusRescue(): (
  target: () => HTMLElement | null | undefined,
) => void {
  const injector = inject(Injector);
  const documentRef = inject(DOCUMENT);

  return (target) =>
    afterNextRender(
      () => {
        const active = documentRef.activeElement as HTMLElement | null;
        // A focused control that turns disabled still reads as active until the browser's focus fixup.
        const lost =
          !active ||
          active === documentRef.body ||
          !active.isConnected ||
          (active as HTMLButtonElement).disabled === true;
        if (lost) {
          target()?.focus();
        }
      },
      { injector },
    );
}
