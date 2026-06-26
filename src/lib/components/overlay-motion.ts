import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Play the DS overlay leave animation, then dispose the overlay.
 *
 * Adds `ds-leaving` to the pane — a global rule in styles/_overlay-motion.scss
 * animates the panel's root child out — and disposes on `animationend`, with a
 * timeout fallback so teardown always happens (e.g. if no animation runs). Under
 * `prefers-reduced-motion` the duration token is 0, so the animation ends on the
 * next frame and dispose is effectively immediate.
 *
 * Use in a panel's `close()` in place of `overlayRef.dispose()`. On teardown
 * (`ngOnDestroy`) dispose directly instead — there is no exit animation when the
 * host is going away.
 */
export function disposeWithLeave(
  overlayRef: OverlayRef | null | undefined,
): void {
  if (!overlayRef) {
    return;
  }
  const pane = overlayRef.overlayElement;
  const child = pane?.firstElementChild as HTMLElement | null;
  if (!pane || !child) {
    overlayRef.dispose();

    return;
  }
  let done = false;
  const finish = (): void => {
    if (done) {
      return;
    }
    done = true;
    child.removeEventListener('animationend', onEnd);
    overlayRef.dispose();
  };
  const onEnd = (event: AnimationEvent): void => {
    if (event.animationName === 'ds-overlay-out') {
      finish();
    }
  };
  child.addEventListener('animationend', onEnd);
  window.setTimeout(finish, 400);
  pane.classList.add('ds-leaving');
}
