import { computed, type Signal } from '@angular/core';

export type DsDestination = 'routerLink' | 'href' | 'button';

/**
 * Picks the element a control renders from the destination it was given.
 *
 * **No destination is a `<button>`, never an `<a href="#">`.** A `#` href navigates: it rewrites
 * the URL and discards the scroll position on every click.
 *
 * Shared by `ds-sidenav-item`, `ds-sidenav-group` and `ds-button`. Only the decision is shared —
 * each keeps its own template branches, because they carry different attributes and a shared
 * template would need a wrapper element that changes the control's box.
 *
 * @internal
 */
export function dsDestination(
  routerLink: Signal<string | readonly unknown[] | null>,
  href: Signal<string>,
): Signal<DsDestination> {
  return computed(() => {
    if (routerLink() !== null) {
      return 'routerLink';
    }

    return href() ? 'href' : 'button';
  });
}
