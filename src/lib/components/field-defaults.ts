import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';

/**
 * Resolve a field's `reserveMessage` against the app-level default.
 *
 * Fields declare the input as `boolean | null` with a `null` default so "not set"
 * stays distinguishable from an explicit `true` — a signal input cannot report
 * whether it was bound. Precedence: the component input, then
 * `DS_CONFIG.field.reserveMessage`, then `false`.
 *
 * `appWideDefaultApplies` is read lazily and drops the middle step for a control that
 * is not a form row: `ds-button` renders the same message line but does not sit in a
 * field column, so an app-wide field setting must not give it an empty row.
 *
 * Call from a field initializer (an injection context), e.g.
 * `protected readonly reserve = resolveReserveMessage(this.reserveMessage);`
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
