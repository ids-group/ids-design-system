import { type Signal, effect, inject, DOCUMENT } from '@angular/core';

/**
 * Announces how many options survived the filter.
 *
 * Deliberately NOT a row inside the listbox. A live region there is an invalid
 * child and, worse, a region created together with its text is the case screen
 * readers reliably do not announce — there is no content CHANGE to fire on. The
 * node here is created once, empty, and only its text changes.
 *
 * The text is English, which is the same debt every other library-invented string
 * in this package carries (see the localization item in `docs/todo.md`). It is a
 * count, so it is the cheapest of them to swap once a provider lands.
 */
export function announceOptionCount(
  count: Signal<number>,
  active: Signal<boolean>,
): void {
  const documentRef = inject(DOCUMENT);
  const region = documentRef.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  // Off-screen rather than `display: none`, which would take it out of the
  // accessibility tree and announce nothing at all.
  region.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;margin:-1px;padding:0';
  documentRef.body.appendChild(region);

  effect((onCleanup) => {
    onCleanup(() => region.remove());
    if (!active()) {
      region.textContent = '';

      return;
    }
    const total = count();
    region.textContent =
      total === 0 ? 'No results' : total === 1 ? '1 result' : `${total} results`;
  });
}
