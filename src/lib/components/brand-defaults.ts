import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '../config/ds-config';

/**
 * Resolve one brand string against the app-level default.
 *
 * `ds-sidenav` and `ds-auth-layout` ask the same three questions, and an app
 * answers them identically on every screen — so the answer belongs in one
 * provider rather than in four bindings per template.
 *
 * Same `null`-means-unset shape as `resolveReserveMessage`: a signal input cannot
 * report whether it was bound, so `null` is "ask the config" and `''` is an
 * explicit "this screen has no brand". Precedence: the input, then
 * `DS_CONFIG.brand.*`, then empty.
 */
export function resolveBrandValue(
  value: Signal<string | null>,
  key: 'name' | 'logoLetter' | 'tagline',
): Signal<string> {
  const config = inject(DS_CONFIG);

  return computed(() => value() ?? config.brand?.[key] ?? '');
}
