/** A reference to the overlay/container the projected content lives in, used to
 *  close it from the inside — e.g. a popover (and, later, a dropdown/select)
 *  closing when a menu item is selected. The container provides it via DI;
 *  content injects it with `{ optional: true }` so the same content also works
 *  standalone (outside any overlay).
 *
 *  Same shape as Angular Material's `MatDialogRef` (content calls `close()` on a
 *  ref), generalised so any dismissible overlay can provide it. */
export abstract class DsOverlayCloseRef {
  abstract close(): void;
}
