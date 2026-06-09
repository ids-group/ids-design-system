/** A handle to dismiss the containing overlay from the inside — e.g. a popover
 *  (and, later, a dropdown/select) closing when a menu item is selected. The
 *  container provides it via DI; content injects it with `{ optional: true }`
 *  so the same content also works standalone (outside any dismissible container).
 *
 *  Mirrors Angular Material's `MatDialogRef` / `MAT_MENU_PANEL` pattern: content
 *  injects a ref to close its container, rather than the container reaching into
 *  the content. */
export abstract class DsDismissRef {
  abstract close(): void;
}
