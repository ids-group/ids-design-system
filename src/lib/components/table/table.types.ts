/**
 * Who applies the header filters.
 *
 * `'server'` (the default when unset) means the host does it: the table tracks
 * `columnFilters` so a request can be driven from it, but runs no local pass —
 * on a paged table a local pass would filter what the server already filtered,
 * and paged is the normal case. `'client'` filters the rows in hand, for a table
 * that holds every one of them. `'none'` drops the affordance,
 * so a column left marked `filter: 'set'` renders no button rather than a
 * control that does nothing.
 */
export type TableFilterMode = 'client' | 'server' | 'none';

/**
 * Who sorts a `ds-table`.
 *
 * - `'server'` (default) — the table only emits `sortChange`; the host reorders.
 * - `'client'` — the table reorders `data()` itself, for a table holding every row.
 * - `'none'` — nothing sorts, and `sortable` columns render no affordance rather
 *   than a control that does nothing.
 */
export type TableSortMode = 'client' | 'server' | 'none';

/** `'single'` closes the open row when another is expanded; `'multiple'` (default)
 *  leaves every expanded row open. */
export type TableExpandMode = 'multiple' | 'single';

import type { IconName } from '@ids-group-ltd/ids-design-system/core';

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
  /** Column width in px — also the clip width for `truncate`.
   *
   *  `'content'` instead sizes the column to its widest cell and stops it wrapping,
   *  leaving the remaining width to the columns that should absorb it. An
   *  auto-layout table spreads slack evenly, so a short column (a status, a count,
   *  an actions cell) ends up as wide as its own header while the name column that
   *  should take the slack does not. A pixel width cannot express that — pin one
   *  column and the rest still spread. Dragging the column's edge overrides it. */
  width?: number | 'content';
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
  /** Marks the cell whose TEXT tells the reader what the row opens, so it takes a link
   *  colour and underline while the row is hovered. Only has an effect on a
   *  `rowInteractive` table: on a passive one every hover treatment is suppressed on
   *  purpose, so a tint cannot promise a click that does not happen. Style it with
   *  `--ds-table-cell-link-color` / `--ds-table-cell-link-decoration`.
   *
   *  Prefer `link` where the row leads somewhere: a tint appears only on hover, which
   *  a keyboard or touch user never sees. */
  interactive?: boolean;
  /** Renders this column's value as a real `<a>`, which is the accessible way to say
   *  a row leads somewhere: it is visible without hovering, lands in the tab order as
   *  a link rather than as a table row, and opens in a new tab on Ctrl/Cmd-click —
   *  none of which a clickable `<tr>` can offer.
   *
   *  Return an Angular route target (a string, or the array form for dynamic
   *  segments); `null` / `undefined` leaves that row's cell as plain text, so a list
   *  where only some rows are reachable needs no second column. For an external URL,
   *  render the cell through a `[cell]` template instead — this takes route targets
   *  only, and the router is touched at all only once a column sets `link`.
   *
   *  Composes with `rowInteractive`: the link stops its own click from reaching the
   *  row, so the row handler fires for the rest of the row and the link navigates
   *  once. Style it with the same `--ds-table-cell-link-*` tokens as `interactive`. */
  link?: (row: T) => string | readonly unknown[] | null | undefined;
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
  /** Per-row predicate — return true to leave the item OUT for that row. Use it
   *  where the action does not apply rather than `disabled`, which greys an item
   *  that is always there: a draft offers Edit + Launch and a live one Revert +
   *  Delete, so greying leaves every row with a permanently dead half. When every
   *  item of a row is hidden the kebab is not rendered at all, rather than opening
   *  an empty menu. */
  hidden?: (row: T) => boolean;
  /** Why the item is disabled, shown as the item's second line. Only read when
   *  `disabled` returns true for the row — a greyed item that does not say why is
   *  the same dead control as a greyed button. */
  disabledReason?: string | ((row: T) => string);
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
