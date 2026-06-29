import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Dispose a DS overlay panel immediately. Dropdowns, menus, pickers and the
 * confirm dialog close on a deliberate action (pick a value, choose an item),
 * where any exit animation reads as lag — so close is instant. The open
 * animation (`ds-overlay-in`, styles/_overlay-motion.scss) still plays.
 *
 * Kept as a named helper (not an inline `overlayRef.dispose()`) so the close
 * semantics for DS overlay panels live in one place. Use in a panel's
 * `close()`; on host teardown (`ngOnDestroy`) dispose directly too.
 */
export function disposeWithLeave(
  overlayRef: OverlayRef | null | undefined,
): void {
  overlayRef?.dispose();
}
