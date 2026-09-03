import type {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';

/** Where a connected panel sits relative to its trigger. `_overlay-motion.scss`
 *  maps this onto the enter direction, so the panel moves in FROM the trigger. */
export type DsOverlayPlacement = 'top' | 'bottom' | 'left' | 'right';

/** The theme's role layer, forwarded onto every portaled pane alongside whatever
 *  tokens the component names for itself. */
const ROLE_TOKENS = [
  '--ds-radius-inner',
  '--ds-radius-control',
  '--ds-radius-panel',
  '--ds-radius-pill',
  '--ds-elevation-raised',
  '--ds-elevation-overlay',
  '--ds-elevation-floating',
  '--ds-elevation-modal',
] as const;

/** Public enter-motion tokens read by every `ds-overlay-pane`
 *  (styles/_overlay-motion.scss). */
const OVERLAY_MOTION_TOKENS = [
  '--ds-overlay-enter-keyframes',
  '--ds-overlay-enter-duration',
  '--ds-overlay-enter-easing',
  '--ds-overlay-enter-offset',
  '--ds-overlay-enter-scale',
] as const;

/** Styles `dropdownOverlay()`'s default panel class, so every connected picker
 *  gets it whether or not it names panel tokens of its own. */
const DROPDOWN_PANEL_TOKENS = [
  '--ds-dropdown-panel-radius',
  '--ds-dropdown-panel-maxh',
  '--ds-option-padding',
  '--ds-option-gap',
  '--ds-option-radius',
  '--ds-option-row-gap',
  '--ds-option-bg-color-active',
] as const;

/**
 * Why a panel is closing. `'select'` is a deliberate action that produced a
 * result — an option chosen, a date picked, the trigger pressed again, Tab moving
 * on; `'dismiss'` is ambient — Escape, a press outside, the page scrolling away.
 */
export type DsOverlayCloseCause = 'select' | 'dismiss';

const DROPDOWN_GAP = 4;

/**
 * The geometry every DS dropdown shares. Width is deliberately NOT set here —
 * each caller has its own policy (the exact trigger width, or the trigger as a
 * floor).
 */
export function dropdownOverlay(
  overlay: Overlay,
  trigger: HTMLElement,
  panelClass: string | string[] = ['ds-dropdown-panel', 'ds-overlay-pane'],
): {
  positionStrategy: FlexibleConnectedPositionStrategy;
  config: OverlayConfig;
} {
  const positionStrategy = overlay
    .position()
    .flexibleConnectedTo(trigger)
    .withPositions([
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: DROPDOWN_GAP,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -DROPDOWN_GAP,
      },
    ]);

  return {
    positionStrategy,
    config: {
      positionStrategy,
      hasBackdrop: false,
      // The global panel skin lives in styles/_dropdown-overlay.scss: a portaled
      // node sits outside the host's DOM tree, so `:host ::ng-deep` cannot reach it.
      panelClass,
      scrollStrategy: overlay.scrollStrategies.reposition(),
    },
  };
}

// Backstop for the leave animation: if the class never produces an animation
// (a pane that is display:none, a consumer stylesheet that removed it), the
// panel must still go away. Comfortably past --ds-motion-exit-duration.
const LEAVE_TIMEOUT_MS = 400;

/**
 * Close a DS overlay panel — instantly on a `'select'`, with a short fade on a
 * `'dismiss'`. A fade after a deliberate pick reads as the panel lagging behind a
 * decision already made; on a dismissal nothing was chosen, so the same fade reads
 * as the panel backing out.
 *
 * NOTE: teardown paths dispose directly instead — a destroyed host has no time to
 * animate, and `ModalService` owns its own scrim-and-card leave.
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
 * host onto the overlay pane. The pane is portaled into `document.body`, outside
 * `:host`, so custom properties a consumer sets via `ds-x { … }` never inherit
 * down to it. Only non-empty values are set, so an unset token still falls
 * through to the panel's own `var(--ds-*, <default>)`. Call once per open, right
 * after `overlay.create()`.
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

  // Roles resolve at :root, so every host has a value for them and copying it
  // unconditionally would PIN it inline on the pane — an open panel would then
  // ignore a theme switch until it was reopened. Forward only where the host
  // actually overrides the root, which is the case the pane cannot see.
  const rootStyle = getComputedStyle(host.ownerDocument.documentElement);
  for (const token of ROLE_TOKENS) {
    const value = hostStyle.getPropertyValue(token).trim();
    if (value && value !== rootStyle.getPropertyValue(token).trim()) {
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
 * Prime a `ds-overlay-pane` for its enter animation. Call right after
 * `overlay.create()` — CDK applies the position in `afterNextRender`, so the
 * placement stamp still lands before the first painted frame. Until it does (or
 * with no strategy passed) the CSS default applies: entering from above.
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
  forwardOverlayTokens(overlayRef, host, DROPDOWN_PANEL_TOKENS);
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
 *  event from ANY nested container. A scroll inside the panel itself is ignored. */
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

/** True when keyboard focus currently sits inside the overlay pane. Read it
 *  BEFORE disposing, to decide whether the close has to refocus the trigger
 *  rather than strand focus on `<body>`. An outside-pointer close leaves focus on
 *  the clicked element (mousedown moved it out of the pane first), so this
 *  returns false there and focus is correctly left alone. */
export function focusIsInside(overlayRef: OverlayRef): boolean {
  const doc = overlayRef.overlayElement.ownerDocument;

  return overlayRef.overlayElement.contains(doc.activeElement);
}
