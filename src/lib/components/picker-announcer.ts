import {
  type Signal,
  DestroyRef,
  effect,
  inject,
  DOCUMENT,
} from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';

/**
 * Announces how many options survived the filter.
 *
 * NOT a row inside the listbox (a live region there is an invalid child). The node is created
 * once, empty, and only its text changes: a region created with its text is not reliably announced.
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
  // Off-screen, not `display: none`, which would remove it from the accessibility tree.
  // glyph-clip-guard: visually hidden live region
  region.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;margin:-1px;padding:0';
  documentRef.body.appendChild(region);
  inject(DestroyRef).onDestroy(() => region.remove());

  effect(() => {
    if (!active()) {
      region.textContent = '';

      return;
    }
    region.textContent = intl().picker.resultCount(count());
  });
}
