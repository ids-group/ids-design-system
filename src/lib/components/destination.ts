import { computed, type Signal } from '@angular/core';

/** Which element a control with an optional destination renders as. */
export type DsDestination = 'routerLink' | 'href' | 'button';

/**
 * Picks the element a control renders from the destination it was given:
 * `routerLink` → an `<a [routerLink]>`, `href` → a plain `<a href>`, neither → a
 * `<button type="button">`.
 *
 * **Neither is a button, not an `<a href="#">`.** A `#` href navigates: it rewrites the URL and
 * discards the scroll position on every click. A control that only emits an event is a button, and
 * that is what a screen reader must be told it is.
 *
 * Shared because three controls resolve this — `ds-sidenav-item`, `ds-sidenav-group` and
 * `ds-button` — and the rule above is the part worth having in one place. The three template
 * branches stay with each component: they carry different attributes, and a template cannot be
 * shared without a wrapper element that would change each control's box.
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
