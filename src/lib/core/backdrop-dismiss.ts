/**
 * Dismiss-on-backdrop for a backdrop that WRAPS its dialog.
 *
 * `click` cannot be trusted there: the browser fires it at the nearest common
 * ancestor of the press and the release, so a drag that starts inside the dialog and
 * ends on the backdrop fires `click` ON THE BACKDROP, and a
 * `target === currentTarget` check waves it through. Hence tracking the press:
 * dismiss only when press AND release both land on the backdrop itself. `ds-drawer` needs none of this because its scrim
 * is a SIBLING of the panel, which makes their common ancestor a third element.
 */
export function backdropDismiss(): {
  down: (event: PointerEvent) => void;
  shouldDismiss: (event: PointerEvent) => boolean;
} {
  let pressedOnBackdrop = false;

  return {
    down(event: PointerEvent): void {
      pressedOnBackdrop =
        event.button === 0 && event.target === event.currentTarget;
    },
    shouldDismiss(event: PointerEvent): boolean {
      const dismiss =
        pressedOnBackdrop &&
        event.button === 0 &&
        event.target === event.currentTarget;
      pressedOnBackdrop = false;

      return dismiss;
    },
  };
}
