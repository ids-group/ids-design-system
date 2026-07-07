import { InjectionToken, Provider } from '@angular/core';
import type { IconName } from '../icons/icons.data';

export interface DsConfig {
  breadcrumbs?: {
    separator?: IconName;
    clickable?: boolean;
  };
  timePicker?: {
    /** Display format for `ds-time-picker` / date-picker time — 24h or 12h AM/PM. Default `'24h'`. */
    format?: '24h' | '12h';
  };
  datePicker?: {
    /** BCP-47 locale for `ds-date-picker` names + value format. Default `'en-US'`. */
    locale?: string;
    /** Explicit token format e.g. `'MM/DD/YYYY'`; overrides the locale-derived order. */
    dateFormat?: string;
    /** First weekday column: 0=Sunday … 6=Saturday. Default `1` (Monday). */
    firstDayOfWeek?: number;
  };
}

export const DS_CONFIG = new InjectionToken<DsConfig>('DS_CONFIG', {
  factory: () => ({}),
});

/** Provide DS-level defaults at the app root.
 *
 *   providers: [provideDsConfig({ card: { padding: 'sm' } })]
 *
 * Component inputs (e.g. `<ds-card padding="lg">`) still win over the config.
 */
export function provideDsConfig(config: DsConfig): Provider {
  return { provide: DS_CONFIG, useValue: config };
}
