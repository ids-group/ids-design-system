import type { OverlayRef } from '@angular/cdk/overlay';

/**
 * Close a DS overlay panel.
 *
 * TODO(overlay-leave): reinstate the exit ("leave") animation. This helper used
 * to add a `ds-leaving` class, wait for the animation to finish, then dispose —
 * hence the name. It was cut because a leave animation on a deliberate close
 * read as lag, so today it just disposes immediately; only the enter animation
 * (`ds-overlay-in`, styles/_overlay-motion.scss) still plays. When the leave
 * animation is redone here, it takes effect at every call site below.
 *
 * Applied in each panel's `close()` — file:line:
 *   - components/select/select.component.ts:257
 *   - components/autocomplete/autocomplete.component.ts:378
 *   - components/multi-select/multi-select.component.ts:309
 *   - components/date-picker/date-picker.component.ts:627
 *   - components/time-picker/time-picker.component.ts:239
 *   - components/color-picker/color-picker.component.ts:312
 *   - components/popover/popover.component.ts:123
 *   - components/modal/modal.service.ts:39
 *
 * NOTE: `ngOnDestroy` teardown paths dispose directly (no leave on host destroy),
 * so they are intentionally NOT in this list.
 */
export function disposeWithLeave(
  overlayRef: OverlayRef | null | undefined,
): void {
  overlayRef?.dispose();
}

/**
 * Forward a portaled panel's public `--ds-*` override tokens from the component
 * host onto the overlay pane. The panel is portaled into `document.body`
 * (outside `:host`), so custom properties a consumer sets via `ds-x { … }` on
 * the host don't inherit down to it. Copying the host's resolved values onto
 * the pane — the panel's DOM parent — restores that inheritance, so per-instance
 * overrides re-skin the panel. Only non-empty values are set, so unset tokens
 * fall through to the panel's own `var(--ds-*, <default>)` fallback. Call once
 * per open, right after `overlay.create()`.
 */
export function forwardOverlayTokens(
  overlayRef: OverlayRef,
  host: HTMLElement,
  tokens: readonly string[],
): void {
  const hostStyle = getComputedStyle(host);
  const paneStyle = overlayRef.overlayElement.style;
  for (const token of tokens) {
    const value = hostStyle.getPropertyValue(token).trim();
    if (value) {
      paneStyle.setProperty(token, value);
    }
  }
}

/** Close a non-modal overlay on a pointer press outside it, EXCEPT when the press
 *  lands on its trigger — so the trigger stays interactive (caret, re-focus) while
 *  open. Use with `hasBackdrop: false` so hover/cursor/pointer reach the live page. */
export function closeOnOutsidePointer(
  overlayRef: OverlayRef,
  isInsideTrigger: (target: Node) => boolean,
  close: () => void,
): void {
  overlayRef.outsidePointerEvents().subscribe((event) => {
    const target = event.target as Node | null;
    if (target && isInsideTrigger(target)) {
      return;
    }
    close();
  });
}
