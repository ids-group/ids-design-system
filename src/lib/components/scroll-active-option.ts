import {
  type Signal,
  afterRenderEffect,
  inject,
  DOCUMENT,
} from '@angular/core';

/**
 * Keeps the keyboard cursor's row visible inside a scrolling panel.
 *
 * KEYBOARD ONLY, and that is the load-bearing part. The option rows also set the
 * active index on `mouseenter`, so a version that reacted to every change pulled
 * a partially visible row up under the pointer while the user was reading with
 * the mouse.
 *
 * Rows are looked up by id rather than through a `viewChildren` query because they
 * live in a portaled template — and the id is the one `aria-activedescendant`
 * already points at, so a failed lookup means that reference is broken too.
 * @internal
 */
export function scrollActiveOptionIntoView(
  activeDescendantId: Signal<string | null>,
  enabled: Signal<boolean>,
  armed: Signal<boolean>,
): void {
  const documentRef = inject(DOCUMENT);

  afterRenderEffect(() => {
    const id = activeDescendantId();
    if (!enabled() || !armed() || !id) {
      return;
    }
    documentRef
      .getElementById(id)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
}
