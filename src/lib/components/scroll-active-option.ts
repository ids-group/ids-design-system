import {
  type Signal,
  afterRenderEffect,
  inject,
  DOCUMENT,
} from '@angular/core';

/**
 * Keeps the keyboard cursor's row visible inside a scrolling panel.
 *
 * KEYBOARD ONLY (`armed`): option rows also set the active index on `mouseenter`, so reacting
 * to every change would pull a partially visible row up under the pointer.
 *
 * Rows are looked up by id, not a `viewChildren` query, because they live in a portaled
 * template. The id is the one `aria-activedescendant` points at.
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
