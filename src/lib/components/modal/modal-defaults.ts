import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '../../config/ds-config';

/**
 * Resolve `dividers` against the app-level default.
 *
 * Same shape as `resolveReserveMessage`: the input is `boolean | null` with a
 * `null` default so "not bound" stays distinguishable from an explicit `false` —
 * a signal input cannot report whether it was bound. Precedence: the input, then
 * `DS_CONFIG.modal.dividers`, then `true`.
 *
 * Both `ds-modal` and `ds-modal-card` call this, which is the point: a
 * `ModalService` confirm renders a card with no `ds-modal` ancestor, so an
 * attribute on the element cannot reach it and only the injected default can.
 */
export function resolveDividers(
  dividers: Signal<boolean | null>,
): Signal<boolean> {
  const config = inject(DS_CONFIG);

  return computed(() => dividers() ?? config.modal?.dividers ?? true);
}
