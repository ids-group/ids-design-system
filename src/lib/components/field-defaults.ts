import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';

/**
 * Resolves a field's `reserveMessage`: the input, then `DS_CONFIG.field.reserveMessage`, then
 * `false`. The input is `boolean | null` because a signal input cannot report whether it was bound.
 *
 * `appWideDefaultApplies` is read lazily and drops the middle step for a control that is not a
 * form row (`ds-button`).
 *
 * Call from a field initializer (an injection context).
 */
export function resolveReserveMessage(
  reserveMessage: Signal<boolean | null>,
  appWideDefaultApplies: () => boolean = () => true,
): Signal<boolean> {
  const config = inject(DS_CONFIG);

  return computed(
    () =>
      reserveMessage() ??
      (appWideDefaultApplies()
        ? (config.field?.reserveMessage ?? false)
        : false),
  );
}

/**
 * Resolves a field's `showDirty`: the input, then `DS_CONFIG.field.showDirty`, then `false`.
 *
 * Call from a field initializer (an injection context).
 */
export function resolveShowDirty(
  showDirty: Signal<boolean | null>,
): Signal<boolean> {
  const config = inject(DS_CONFIG);

  return computed(() => showDirty() ?? config.field?.showDirty ?? false);
}
