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
 * Why a panel is closing. `'select'` is a deliberate action that produced a
 * result — an option chosen, a date picked, the trigger pressed again, Tab moving
 * on; `'dismiss'` is ambient — Escape, a press outside, the page scrolling away.
 */
export type DsOverlayCloseCause = 'select' | 'dismiss';

// Backstop for the leave animation: if the class never produces an animation
// (a pane that is display:none, a consumer stylesheet that removed it), the
// panel must still go away. Comfortably past --ds-motion-exit-duration.
const LEAVE_TIMEOUT_MS = 400;

/**
 * Close a DS overlay panel — instantly on a `'select'`, with a short fade on a
 * `'dismiss'`.
 *
 * The split is the point. An unconditional leave animation shipped once and was
 * cut in `d2e4712`, because ~120ms of fade after picking an option reads as the
 * panel lagging behind a decision the user has already made. A dismissal is the
 * opposite: nothing was chosen, so the fade reads as the panel backing out rather
 * than as delay. Defaults to `'select'`, so a call site that says nothing keeps
 * closing instantly.
 *
 * Applied in each panel's `close()`:
 *   - select, autocomplete, multi-select, date-picker, time-picker, color-picker,
 *     popover — each passing `'dismiss'` from its Escape / outside-press / scroll
 *     paths and nothing from its selection paths.
 *
 * NOTE: `ngOnDestroy` teardown paths dispose directly — a host being destroyed has
 * no time to animate, and holding its overlay open for 120ms after it is gone
 * would leave a panel floating over the next screen. `ModalService` likewise
 * disposes directly: a modal's leave belongs to its own scrim-and-card animation,
 * not to this panel fade.
 */
export function disposeWithLeave(
  overlayRef: OverlayRef | null | undefined,
  cause: DsOverlayCloseCause = 'select',
): void {
  if (!overlayRef) {
    return;
  }
  if (cause === 'select') {
    overlayRef.dispose();

    return;
  }

  const pane = overlayRef.overlayElement;
  let disposed = false;
  const finish = (): void => {
    if (disposed) {
      return;
    }
    disposed = true;
    clearTimeout(timer);
    pane.removeEventListener('animationend', onAnimationEnd);
    overlayRef.dispose();
  };
  // The pane's ROOT CHILD is what animates (CDK owns transforms on the pane
  // itself), so the event arrives from a descendant and bubbles up to here.
  const onAnimationEnd = (event: AnimationEvent): void => {
    if (event.animationName.endsWith('ds-overlay-out')) {
      finish();
    }
  };
  const timer = setTimeout(finish, LEAVE_TIMEOUT_MS);
  pane.addEventListener('animationend', onAnimationEnd);
  pane.classList.add('ds-leaving');
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
