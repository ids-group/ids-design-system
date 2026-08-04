import type {
  FlexibleConnectedPositionStrategy,
  OverlayRef,
} from '@angular/cdk/overlay';

/** Where a connected panel sits relative to its trigger. `_overlay-motion.scss`
 *  maps this onto the enter direction, so the panel moves in FROM the trigger. */
export type DsOverlayPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Public enter-motion tokens read by every `ds-overlay-pane`
 *  (styles/_overlay-motion.scss). */
const OVERLAY_MOTION_TOKENS = [
  '--ds-overlay-enter-keyframes',
  '--ds-overlay-enter-duration',
  '--ds-overlay-enter-easing',
  '--ds-overlay-enter-offset',
  '--ds-overlay-enter-scale',
] as const;

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

/** Read a CDK connection pair as the panel's placement. `overlayY` is the panel
 *  edge pinned to the trigger, so `top` means the panel hangs BELOW the trigger. */
export function overlayPlacementOf(
  overlayY: string,
  overlayX: string,
): DsOverlayPlacement {
  if (overlayY === 'top') {
    return 'bottom';
  }
  if (overlayY === 'bottom') {
    return 'top';
  }
  if (overlayX === 'start') {
    return 'right';
  }

  return 'left';
}

/**
 * Prime a `ds-overlay-pane` for its enter animation: forward the consumer's
 * `--ds-overlay-enter-*` overrides onto the portaled pane, then stamp the
 * resolved placement that `_overlay-motion.scss` turns into an enter direction.
 * Call right after `overlay.create()` — CDK applies the position in
 * `afterNextRender`, so the stamp still lands before the first painted frame.
 * Until it does (or with no strategy passed) the CSS default applies: entering
 * from above, i.e. today's behaviour for a panel below its trigger.
 *
 * The subscription needs no teardown — disposing the overlay disposes the
 * strategy, which completes `positionChanges`.
 */
export function prepareOverlayEnter(
  overlayRef: OverlayRef,
  host: HTMLElement,
  positionStrategy?: FlexibleConnectedPositionStrategy,
): void {
  forwardOverlayTokens(overlayRef, host, OVERLAY_MOTION_TOKENS);
  positionStrategy?.positionChanges.subscribe(({ connectionPair }) => {
    overlayRef.overlayElement.dataset['dsPlacement'] = overlayPlacementOf(
      connectionPair.overlayY,
      connectionPair.overlayX,
    );
  });
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

/** Close a non-modal overlay when the page scrolls. CDK's scroll strategies only
 *  observe `window` + registered `cdkScrollable`s, so they miss a plain
 *  `overflow:auto` container (e.g. an app's scrolling `<main>`); this listens on
 *  the document in the CAPTURE phase, which catches the non-bubbling `scroll`
 *  event from ANY nested container. A scroll inside the panel itself is ignored.
 *  Returns a teardown to remove the listener. */
export function closeOnScroll(
  overlayRef: OverlayRef,
  close: () => void,
): () => void {
  const onScroll = (event: Event): void => {
    const target = event.target as Node | null;
    if (target && overlayRef.overlayElement.contains(target)) {
      return;
    }
    // A form control scrolling its own text (e.g. typing past the visible edge
    // of a host-side filter input) never moves the panel's anchor — ignore it.
    if (
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT')
    ) {
      return;
    }
    close();
  };
  const doc = overlayRef.overlayElement.ownerDocument;
  doc.addEventListener('scroll', onScroll, true);

  return () => doc.removeEventListener('scroll', onScroll, true);
}

/** True when keyboard focus currently sits inside the overlay pane. Read this
 *  BEFORE disposing: a close that would otherwise strand focus on `<body>`
 *  (a scroll-close, or an in-panel button/selection) should then refocus its
 *  trigger — with `{ preventScroll: true }` so a scroll-close never yanks the
 *  page back. An outside-pointer close leaves focus on the clicked element
 *  (mousedown moved it out of the pane first), so this returns false there and
 *  focus is correctly left alone. */
export function focusIsInside(overlayRef: OverlayRef): boolean {
  const doc = overlayRef.overlayElement.ownerDocument;

  return overlayRef.overlayElement.contains(doc.activeElement);
}
