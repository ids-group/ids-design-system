import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '../config/ds-config';

/**
 * Resolve a field's `reserveMessage` against the app-level default.
 *
 * Fields declare the input as `boolean | null` with a `null` default so "not set"
 * stays distinguishable from an explicit `true` — a signal input cannot report
 * whether it was bound. Precedence: the component input, then
 * `DS_CONFIG.field.reserveMessage`, then `false`.
 *
 * Call from a field initializer (an injection context), e.g.
 * `protected readonly reserve = resolveReserveMessage(this.reserveMessage);`
 */
export function resolveReserveMessage(
  reserveMessage: Signal<boolean | null>,
): Signal<boolean> {
  const config = inject(DS_CONFIG);

  return computed(
    () => reserveMessage() ?? config.field?.reserveMessage ?? false,
  );
}
