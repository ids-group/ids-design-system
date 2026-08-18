import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG, type DsConfig } from '../config/ds-config';

/**
 * Resolve an input against `DS_CONFIG`, then a built-in default.
 *
 * The input must be typed `T | null` and default to `null`: a signal input cannot
 * report whether it was bound, so `null` is what separates "not set" from an explicit
 * value. Precedence is input → config → built-in. Call from an injection context.
 */
export function resolveWithConfig<T>(
  value: Signal<T | null>,
  pick: (config: DsConfig) => T | undefined,
  fallback: T,
): Signal<T> {
  const config = inject(DS_CONFIG);

  return computed(() => value() ?? pick(config) ?? fallback);
}
