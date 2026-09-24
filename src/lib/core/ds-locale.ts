import { LOCALE_ID, inject } from '@angular/core';
import { DS_CONFIG } from './ds-config';

/**
 * The BCP-47 tag the library formats numbers and dates in: `DsConfig.locale`, then Angular's
 * `LOCALE_ID`. Call from an injection context.
 * @internal
 */
export function injectDsLocale(): string {
  return inject(DS_CONFIG).locale ?? inject(LOCALE_ID);
}
