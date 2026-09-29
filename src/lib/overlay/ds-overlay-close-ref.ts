/** Lets projected content close the overlay it lives in. The container provides it via DI; inject with `{ optional: true }` so the content also works outside any overlay. */
export abstract class DsOverlayCloseRef {
  abstract close(): void;
}
