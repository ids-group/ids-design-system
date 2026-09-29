/**
 * Dismiss-on-backdrop for a backdrop that WRAPS its dialog.
 *
 * `click` cannot be trusted there: it fires at the nearest common ancestor of press and release,
 * so a drag from inside the dialog to the backdrop fires `click` ON THE BACKDROP. Dismiss only
 * when press AND release both land on the backdrop itself.
 * @internal
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
