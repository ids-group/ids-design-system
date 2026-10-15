import type {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';

/** Where a connected panel sits relative to its trigger; the panel enters FROM the trigger. */
export type DsOverlayPlacement = 'top' | 'bottom' | 'left' | 'right';

/** The theme's role layer, forwarded onto every portaled pane. */
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

/** Public enter-motion tokens read by every `ds-overlay-pane`. */
const OVERLAY_MOTION_TOKENS = [
  '--ds-overlay-enter-keyframes',
  '--ds-overlay-enter-duration',
  '--ds-overlay-enter-easing',
  '--ds-overlay-enter-offset',
  '--ds-overlay-enter-scale',
] as const;

/** Styles the `ds-dropdown-panel` class every `dropdownOverlay()` pane carries. */
const DROPDOWN_PANEL_TOKENS = [
  '--ds-dropdown-panel-radius',
  '--ds-dropdown-panel-max-height',
  '--ds-dropdown-panel-border-color',
  '--ds-dropdown-panel-shadow',
  '--ds-option-padding',
  '--ds-option-gap',
  '--ds-option-radius',
  '--ds-option-row-gap',
  '--ds-option-bg-color-active',
  '--ds-option-font-weight',
  '--ds-option-font-size',
  '--ds-option-line-height',
  '--ds-option-font-family',
] as const;

/**
 * Why a panel is closing. `'select'` is a deliberate action (option chosen, trigger pressed
 * again, Tab moving on); `'dismiss'` is ambient (Escape, a press outside, scrolling away).
 * @internal
 */
export type DsOverlayCloseCause = 'select' | 'dismiss';

const DROPDOWN_GAP = 4;

/**
 * One panel-class input as an array; spreading the raw string would give a per-letter class list.
 * @internal
 */
export function panelClassesOf(
  panelClass: string | readonly string[],
): readonly string[] {
  return typeof panelClass === 'string'
    ? panelClass.split(' ').filter((className) => className.length > 0)
    : panelClass;
}

/** The pane's floor: the trigger, or `--ds-dropdown-panel-min-width` when that is wider. Set on the
 *  pane, not the panel inside it, so the overlay is placed by the width it is drawn at. */
export function dropdownMinWidth(triggerWidth: number): string {
  return `max(${triggerWidth}px, var(--_dropdown-panel-min-width))`;
}

/**
 * The geometry every DS dropdown shares. Width is NOT set here: each caller has its own policy.
 * @internal
 */
export function dropdownOverlay(
  overlay: Overlay,
  trigger: HTMLElement,
  extraPanelClass: string | readonly string[] = [],
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
      // The panel skin is global CSS: `:host ::ng-deep` cannot reach a portaled node.
      panelClass: [
        'ds-dropdown-panel',
        'ds-overlay-pane',
        ...panelClassesOf(extraPanelClass),
      ],
      scrollStrategy: overlay.scrollStrategies.reposition(),
    },
  };
}

// Teardown fallback: a display:none pane, a removed animation or a 0s reduced-motion duration
// (animationend is not reliably delivered) all end here. Past --ds-motion-exit-duration.
const LEAVE_TIMEOUT_MS = 400;

/**
 * Closes a DS overlay panel instantly on a `'select'`, with a short fade on a `'dismiss'`.
 *
 * NOTE: teardown paths dispose directly; `ModalService` owns its own leave.
 * @internal
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
  // The pane's ROOT CHILD animates (CDK owns transforms on the pane), so the event bubbles up.
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
 * Forwards a portaled panel's public `--ds-*` override tokens from the component host onto
 * the overlay pane (in `document.body`, outside `:host`). Only non-empty values are set, so an
 * unset token falls through to the panel's `var(--ds-*, <default>)`. Call once per open.
 * @internal
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

  // Roles resolve at :root; pinning them unconditionally would freeze an open panel against a
  // theme switch. Forward only where the host declares the role ITSELF, compared against the
  // PARENT (custom properties inherit) so an inline pin never outranks `.ds-overlay-pane`.
  const inheritedStyle = getComputedStyle(
    host.parentElement ?? host.ownerDocument.documentElement,
  );
  for (const token of ROLE_TOKENS) {
    const value = hostStyle.getPropertyValue(token).trim();
    if (value && value !== inheritedStyle.getPropertyValue(token).trim()) {
      paneStyle.setProperty(token, value);
    }
  }
}

/** `overlayY` is the panel edge pinned to the trigger, so `top` means the panel hangs BELOW it.
 * @internal
 */
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
 * Primes a `ds-overlay-pane` for its enter animation. Call right after `overlay.create()`:
 * CDK positions in `afterNextRender`, so the placement stamp lands before the first painted
 * frame. Until then (or with no strategy) the CSS default enters from above.
 *
 * No teardown needed: disposing the overlay completes `positionChanges`.
 * @internal
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

/** Closes a non-modal overlay on a pointer press outside it, EXCEPT on its trigger. Use with `hasBackdrop: false`.
 * @internal
 */
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

/** Closes a non-modal overlay when the page scrolls. CDK's scroll strategies miss a plain
 *  `overflow:auto` container, so this listens on the document in the CAPTURE phase (`scroll`
 *  does not bubble). A scroll inside the panel is ignored.
 * @internal
 */
export function closeOnScroll(
  overlayRef: OverlayRef,
  close: () => void,
): () => void {
  const onScroll = (event: Event): void => {
    const target = event.target as Node | null;
    if (target && overlayRef.overlayElement.contains(target)) {
      return;
    }
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

/** Calls `onEscape` when `Escape` is pressed anywhere on `target`, in the CAPTURE phase so a handler
 *  further down cannot swallow it. Returns the removal. A null target (no document, as on the
 *  server) listens to nothing.
 * @internal
 */
export function listenForEscape(
  target: Pick<Document, 'addEventListener' | 'removeEventListener'> | null,
  onEscape: () => void,
): () => void {
  if (!target) {
    return () => undefined;
  }
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      onEscape();
    }
  };
  target.addEventListener('keydown', onKeydown as EventListener, true);

  return () =>
    target.removeEventListener('keydown', onKeydown as EventListener, true);
}

/**
 * Syncs a component's "which overlay is mine, and is it open" state when THIS overlay detaches,
 * skipping the write when a newer one has taken over.
 *
 * `disposeWithLeave` defers the dispose until the exit animation ends, so a dismiss followed
 * by a re-open delivers the OLD overlay's detachment while the NEW one is live. Clearing
 * unconditionally would leave that panel on screen with its component believing it closed.
 * @internal
 */
export function clearOnDetach(
  overlayRef: OverlayRef,
  {
    current,
    clear,
    always,
  }: {
    /** Reads the ref the component considers live right now. */
    current: () => OverlayRef | null;
    /** Drops the stored ref and marks the component closed. */
    clear: () => void;
    /** Teardown that must run for every detachment, current or superseded. */
    always?: () => void;
  },
): void {
  overlayRef.detachments().subscribe(() => {
    always?.();
    if (current() !== overlayRef) {
      return;
    }
    clear();
  });
}

/** True when keyboard focus sits inside the overlay pane. Read it BEFORE disposing, to decide
 *  whether the close must refocus the trigger rather than strand focus on `<body>`.
 * @internal
 */
export function focusIsInside(overlayRef: OverlayRef): boolean {
  const doc = overlayRef.overlayElement.ownerDocument;

  return overlayRef.overlayElement.contains(doc.activeElement);
}
