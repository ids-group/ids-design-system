import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG, type DsConfig } from '../config/ds-config';

/**
 * Resolve an input against `DS_CONFIG`, then a built-in default.
 *
 * The shape every configurable input follows: it is typed `T | null` and
 * defaults to `null`, because a signal input cannot report whether it was
 * bound — `null` is what makes "not set" distinguishable from an explicit
 * value, so an app-level default can fill the gap without overriding a
 * deliberate binding. Precedence is input → config → built-in.
 *
 * Call from a field initializer (an injection context):
 * `protected readonly sizeResolved = resolveWithConfig(this.size, (c) => c.control?.size, 'md');`
 */
export function resolveWithConfig<T>(
  value: Signal<T | null>,
  pick: (config: DsConfig) => T | undefined,
  fallback: T,
): Signal<T> {
  const config = inject(DS_CONFIG);

  return computed(() => value() ?? pick(config) ?? fallback);
}
