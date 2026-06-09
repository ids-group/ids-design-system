/** A container that content can dismiss from the inside — e.g. a popover (and,
 *  later, a dropdown/select) closing when a menu item is selected. The container
 *  provides it via DI; content injects it with `{ optional: true }` so the same
 *  content also works standalone (outside any dismissible container). */
export abstract class DismissibleOverlay {
  abstract close(): void;
}
