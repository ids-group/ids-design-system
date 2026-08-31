import { type Signal, afterRenderEffect, inject, DOCUMENT } from '@angular/core';

/**
 * Keeps the keyboard cursor's row visible inside a scrolling panel.
 *
 * The panel is portaled to `document.body` and capped by `--picker-maxh`, so on a
 * list longer than the panel the arrow keys walked the cursor straight out of
 * view: the reader pressed down and could not see where they were. All three
 * pickers had this.
 *
 * Looked up by id rather than through a `viewChildren` query on purpose — the
 * rows live in a portaled template, and the id is the same one
 * `aria-activedescendant` already points at, so if the lookup fails the ARIA
 * reference was broken too and that is the real defect to fix.
 *
 * `block: 'nearest'` is what keeps this from fighting the mouse: it scrolls only
 * when the row is actually outside, so hovering a visible row moves nothing.
 */
export function scrollActiveOptionIntoView(
  activeDescendantId: Signal<string | null>,
  enabled: Signal<boolean>,
): void {
  const documentRef = inject(DOCUMENT);

  afterRenderEffect(() => {
    if (!enabled()) {
      return;
    }
    const id = activeDescendantId();
    if (!id) {
      return;
    }
    documentRef
      .getElementById(id)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
}
