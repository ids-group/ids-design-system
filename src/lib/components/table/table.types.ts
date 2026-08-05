/**
 * Who sorts a `ds-table`.
 *
 * - `'client'` (default) — the table reorders `data()` itself.
 * - `'server'` — the table only emits `sortChange`; the host reorders.
 * - `'none'` — nothing sorts, and `sortable` columns render no affordance rather
 *   than a control that does nothing.
 *
 * Replaces the boolean `clientSort`, which could not express `'none'`: a column
 * marked `sortable` on a table with no sorting drew a live-looking header that
 * did nothing, and no type or dev check could catch it.
 */
/**
 * Who applies the header filters.
 *
 * `'client'` (the default when unset) filters the rows in hand. `'server'` means
 * the host does it: the table still tracks `columnFilters` so a request can be
 * driven from it, but runs no local pass — on a server-paged table a local pass
 * would filter what the server already filtered. `'none'` drops the affordance,
 * so a column left marked `filter: 'set'` renders no button rather than a
 * control that does nothing.
 */
export type TableFilterMode = 'client' | 'server' | 'none';

export type TableSortMode = 'client' | 'server' | 'none';

import type { IconName } from '../../icons/icons.data';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  /** Visually-hidden accessible header name — use when `label` is
   *  intentionally empty (e.g. an actions column). */
  srLabel?: string;
  sortable?: boolean;
  /** Include the column in `filterQuery` matching. When no column is marked,
   *  every column matches. Works on `hidden` columns too. */
  filterable?: boolean;
  /** Adds a header filter menu. `'set'` lists the column's distinct values as
   *  a searchable checkbox list; a row passes when its value stays checked. */
  filter?: 'set';
  /** Ellipsis-clip long cell text at `width` (240px when unset) — full value
   *  in the title tooltip, and clicking a clipped cell opens it in a popover.
   *  Text cells only — template cells own their overflow. */
  truncate?: boolean;
  /** Column width in px — also the clip width for `truncate`. */
  width?: number;
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => string;
  /** Sort this column by a DOMAIN value instead of the rendered text. Without
   *  it, client sorting compares what the cell displays, so `$1.2M / $840K / $95K`
   *  sorts by the leading character and `Oct 09, 2023 / Feb 27, 2024` sorts by
   *  month NAME — the table looks sorted and is not. Return the underlying
   *  number, `Date` or plain string; `null`/`undefined`/`''` counts as blank and
   *  sorts last in BOTH directions. Only affects sorting — the header filter
   *  still lists what the user can see. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Double-click the cell to edit it inline; the committed value is emitted
   *  via the table's `cellEdited` output (the consumer owns the data update). */
  editable?: boolean;
  /** Let the user toggle the column in the header column picker — the picker
   *  button appears once at least one column is hideable. */
  hideable?: boolean;
  /** Initial visibility: start hidden. The column picker (or a bound
   *  `hiddenKeys` set) owns the state from then on; a hidden column stays
   *  available to `filterable` matching and sorting. */
  hidden?: boolean;
}

export type SortDir = 'asc' | 'desc' | null;

export interface SortChangeEvent {
  key: string;
  dir: SortDir;
}

export interface TableRowAction<T = unknown> {
  /** Stable identifier — use it to branch in `rowActionSelected`. */
  id: string;
  label: string;
  icon?: IconName;
  /** Renders the item in the destructive style. */
  error?: boolean;
  /** Per-row predicate — return true to disable the item for that row. */
  disabled?: (row: T) => boolean;
}

export interface TableRowActionEvent<T = unknown> {
  action: TableRowAction<T>;
  row: T;
}

export interface TableCellEditEvent<T = unknown> {
  row: T;
  key: string;
  value: string;
}
