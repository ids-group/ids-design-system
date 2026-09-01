import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '../../core/ds-config';

/**
 * Resolve `dividers` against the app-level default — same `null`-means-unset
 * shape as `resolveReserveMessage`, and see it for why.
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
