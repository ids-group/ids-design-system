import { computed, type Signal } from '@angular/core';

export type DsDestination = 'routerLink' | 'href' | 'button';

/**
 * No destination is a `<button>`, never an `<a href="#">`: a `#` href navigates, rewriting the URL
 * and discarding the scroll position. Only the decision is shared — each control keeps its own
 * template branches, because a shared one would need a wrapper that changes the control's box.
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
