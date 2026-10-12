import { LOCALE_ID, inject } from '@angular/core';
import { DS_CONFIG } from './ds-config';

/**
 * The BCP-47 tag the library formats numbers and dates in: `DsConfig.locale`, then Angular's
 * `LOCALE_ID`, where `'en-US'` (Angular's own default, so an app that never chose) reads as
 * `'en-GB'`. Call from an injection context.
 * @internal
 */
export function injectDsLocale(): string {
  const appLocale = inject(LOCALE_ID);

  return (
    inject(DS_CONFIG).locale ??
    (appLocale === ANGULAR_DEFAULT_LOCALE ? DS_DEFAULT_LOCALE : appLocale)
  );
}

const ANGULAR_DEFAULT_LOCALE = 'en-US';
const DS_DEFAULT_LOCALE = 'en-GB';
