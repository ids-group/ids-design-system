import { Signal, computed, inject } from '@angular/core';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';

/**
 * Resolves one brand string against the app-level default. `null` means unset;
 * `''` is an explicit "this screen has no brand". Each field resolves on its own.
 * @internal
 */
export function resolveBrandValue(
  value: Signal<string | null>,
  key: 'name' | 'logoLetter' | 'tagline',
): Signal<string> {
  const config = inject(DS_CONFIG);

  return computed(() => value() ?? config.brand?.[key] ?? '');
}
