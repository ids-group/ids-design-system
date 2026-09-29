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
 * Why a panel is closing. `'select'` is a deliberate action that produced a result (option
 * chosen, date picked, trigger pressed again, Tab moving on); `'dismiss'` is ambient (Escape,
 * a press outside, the page scrolling away).
 * @internal
 */
export type DsOverlayCloseCause = 'select' | 'dismiss';

const DROPDOWN_GAP = 4;

/**
 * One panel-class input as an array. Spreading the raw input would scatter a
 * string into its characters, which is a silent per-letter class list.
 * @internal
 */
export function panelClassesOf(
  panelClass: string | readonly string[],
): readonly string[] {
  return typeof panelClass === 'string'
    ? panelClass.split(' ').filter((className) => className.length > 0)
    : panelClass;
}

/**
 * The geometry every DS dropdown shares. Width is deliberately NOT set here: each caller has
 * its own policy (the exact trigger width, or the trigger as a floor).
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
      // The panel skin is global CSS: a portaled node sits outside the host's DOM tree, so
      // `:host ::ng-deep` cannot reach it. The shared pair is never optional; callers add to it.
      panelClass: [
        'ds-dropdown-panel',
        'ds-overlay-pane',
        ...panelClassesOf(extraPanelClass),
      ],
      scrollStrategy: overlay.scrollStrategies.reposition(),
    },
  };
}

// The teardown guarantee for the leave: a pane that is display:none, a consumer stylesheet
// that removed the animation, and a 0s reduced-motion duration (whose animationend is not
// reliably delivered) all end here. Comfortably past --ds-motion-exit-duration.
const LEAVE_TIMEOUT_MS = 400;

/**
 * Closes a DS overlay panel instantly on a `'select'`, with a short fade on a `'dismiss'`
 * (a fade after a deliberate pick reads as the panel lagging behind the decision).
 *
 * NOTE: teardown paths dispose directly: a destroyed host has no time to animate, and
 * `ModalService` owns its own leave.
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
 * Forwards a portaled panel's public `--ds-*` override tokens from the component host onto
 * the overlay pane, which sits in `document.body` outside `:host`. Only non-empty values are
 * set, so an unset token still falls through to the panel's own `var(--ds-*, <default>)`.
 * Call once per open, right after `overlay.create()`.
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

  // Roles resolve at :root, so copying them unconditionally would PIN them inline on the pane
  // and an open panel would ignore a theme switch. Forward only where the host declares the
  // role ITSELF, compared against the PARENT and not :root: custom properties inherit, so a
  // shell that sets a role for its chrome would otherwise be pinned inline on every panel,
  // outranking the `.ds-overlay-pane` rule that is a consumer's route to a portaled panel.
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
 * CDK applies the position in `afterNextRender`, so the placement stamp lands before the first
 * painted frame. Until it does (or with no strategy) the CSS default applies: entering from above.
 *
 * The subscription needs no teardown: disposing the overlay completes `positionChanges`.
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

/** Closes a non-modal overlay on a pointer press outside it, EXCEPT on its trigger, which stays
 *  interactive (caret, re-focus) while open. Use with `hasBackdrop: false`.
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
 *  `overflow:auto` container, so this listens on the document in the CAPTURE phase, which
 *  catches the non-bubbling `scroll` event from ANY nested container. A scroll inside the
 *  panel itself is ignored.
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
    // A form control scrolling its own text never moves the panel's anchor.
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

/**
 * Syncs a component's "which overlay is mine, and is it open" state when THIS overlay detaches,
 * skipping the write when a newer one has taken over.
 *
 * `disposeWithLeave` defers the dispose of a dismissed overlay until its exit animation ends, so a
 * dismiss followed by a re-open inside that window delivers the OLD overlay's detachment while
 * the NEW one is live. Clearing unconditionally would leave that panel on screen with its
 * component believing it closed (no `aria-expanded`, and `close()` a no-op on the null ref).
 *
 * A detachment of the CURRENT overlay always clears, whatever caused it.
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
 *  whether the close must refocus the trigger rather than strand focus on `<body>`. An
 *  outside-pointer close returns false: mousedown already moved focus out of the pane.
 * @internal
 */
export function focusIsInside(overlayRef: OverlayRef): boolean {
  const doc = overlayRef.overlayElement.ownerDocument;

  return overlayRef.overlayElement.contains(doc.activeElement);
}
