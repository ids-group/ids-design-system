import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Close a DS overlay panel.
 *
 * TODO(overlay-leave): reinstate the exit ("leave") animation. This helper used
 * to add a `ds-leaving` class, wait for the animation to finish, then dispose —
 * hence the name. It was cut because a leave animation on a deliberate close
 * read as lag, so today it just disposes immediately; only the enter animation
 * (`ds-overlay-in`, styles/_overlay-motion.scss) still plays. When the leave
 * animation is redone here, it takes effect at every call site below.
 *
 * Applied in each panel's `close()` — file:line:
 *   - components/select/select.component.ts:257
 *   - components/autocomplete/autocomplete.component.ts:378
 *   - components/multi-select/multi-select.component.ts:309
 *   - components/date-picker/date-picker.component.ts:627
 *   - components/time-picker/time-picker.component.ts:239
 *   - components/color-picker/color-picker.component.ts:312
 *   - components/popover/popover.component.ts:123
 *   - components/modal/modal.service.ts:39
 *
 * NOTE: `ngOnDestroy` teardown paths dispose directly (no leave on host destroy),
 * so they are intentionally NOT in this list.
 */
export function disposeWithLeave(
  overlayRef: OverlayRef | null | undefined,
): void {
  overlayRef?.dispose();
}
