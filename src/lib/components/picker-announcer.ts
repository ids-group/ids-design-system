import { type Signal, effect, inject, DOCUMENT } from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';

/**
 * Announces how many options survived the filter.
 *
 * Deliberately NOT a row inside the listbox. A live region there is an invalid
 * child and, worse, a region created together with its text is the case screen
 * readers reliably do not announce — there is no content CHANGE to fire on. The
 * node here is created once, empty, and only its text changes.
 * @internal
 */
export function announceOptionCount(
  count: Signal<number>,
  active: Signal<boolean>,
): void {
  const documentRef = inject(DOCUMENT);
  const intl = inject(DS_INTL);
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
    region.textContent = intl().picker.resultCount(count());
  });
}
