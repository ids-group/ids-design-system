/** Canonical status vocabulary shared across status-bearing components. */
export type DsStatus = 'info' | 'success' | 'warning' | 'error';

/**
 * Consumer-extensible registry of product status keys for ds-badge / ds-status-dot. It ships
 * EMPTY; a consumer registers keys via declaration merging to get autocomplete on `status`:
 *
 *   declare module '@ids-group-ltd/ids-design-system' {
 *     interface DsStatusRegistry { shipped: true; delivered: true; }
 *   }
 */
export interface DsStatusRegistry {}

/**
 * The `status` input type: an open `string` until a consumer augments `DsStatusRegistry`, then
 * the union of their keys. The tuple wrap avoids `never` distribution.
 */
export type DsStatusKey = [keyof DsStatusRegistry] extends [never]
  ? string
  : keyof DsStatusRegistry;
