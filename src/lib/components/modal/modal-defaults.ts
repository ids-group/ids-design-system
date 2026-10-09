import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';

/**
 * Resolves `dividers` against the app-level default; `null` means unset.
 * Both `ds-modal` and `ds-modal-card` call this: a `ModalService` confirm renders a
 * card with no `ds-modal` ancestor.
 */
export function resolveDividers(
  dividers: Signal<boolean | null>,
): Signal<boolean> {
  const config = inject(DS_CONFIG);

  return computed(() => dividers() ?? config.modal?.dividers ?? true);
}
