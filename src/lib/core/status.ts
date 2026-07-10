/** Canonical status vocabulary shared across status-bearing components. */
export type DsStatus = 'info' | 'success' | 'warning' | 'error';

/**
 * Consumer-extensible registry of product status keys for ds-badge / ds-status-dot.
 * The DS ships it EMPTY — no statuses are predefined. A consumer registers keys
 * via declaration merging to get autocomplete on the `status` input:
 *
 *   // inside this repo (ds-docs imports the lib as 'ds'):
 *   declare module 'ds' {
 *     interface DsStatusRegistry { planning: true; confirmed: true; }
 *   }
 *   // external consumer of the published package:
 *   declare module '@ids-group-ltd/ids-design-system' {
 *     interface DsStatusRegistry { shipped: true; delivered: true; }
 *   }
 */
export interface DsStatusRegistry {}

/**
 * The `status` input type. When the registry is empty (unaugmented) this is an
 * open `string`; once a consumer augments DsStatusRegistry it narrows to the
 * union of their keys (autocomplete). The tuple wrap avoids `never` distribution.
 */
export type DsStatusKey =
  [keyof DsStatusRegistry] extends [never] ? string : keyof DsStatusRegistry;
