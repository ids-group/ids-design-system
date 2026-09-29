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
  screenReaderLabel?: string;
  sortable?: boolean;
  /** Include the column in `filterQuery` matching. When no column is marked,
   *  every column matches. Works on `hidden` columns too. */
  filterable?: boolean;
  /** Adds a header filter menu. `'set'` lists the column's distinct values as
   *  a searchable checkbox list; a row passes when its value stays checked. */
  filter?: 'set';
  /** Ellipsis-clip long cell text at `width` (240px when unset); the full value
   *  reaches a tooltip on hover and focus. */
  truncate?: boolean;
  /** Column width in px — also the clip width for `truncate`.
   *
   *  `'content'` instead sizes the column to its widest cell and stops it wrapping,
   *  leaving the remaining width to the other columns. A pixel width cannot express
   *  that: pin one column and the rest still spread. Dragging the edge overrides it. */
  width?: number | 'content';
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => string;
  /** Sort this column by a DOMAIN value instead of the rendered text. Without
   *  it, client sorting compares what the cell displays, so `$1.2M / $840K / $95K`
   *  and `Oct 09, 2023 / Feb 27, 2024` sort wrongly. Return the underlying
   *  number, `Date` or plain string; `null`/`undefined`/`''` counts as blank and
   *  sorts last in BOTH directions. Only affects sorting — the header filter
   *  still lists what the user can see. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Double-click the cell to edit it inline; the committed value is emitted
   *  via the table's `cellEdited` output (the consumer owns the data update). */
  editable?: boolean;
  /** Let the user toggle the column in the header column picker. Needs the
   *  `dsTableColumns` directive on the table: that is what renders the picker,
   *  and without it this flag does nothing. */
  hideable?: boolean;
  /** Marks the cell whose TEXT tells the reader what the row opens, so it takes a link
   *  colour and underline while the row is hovered. Only has an effect on a
   *  `rowInteractive` table: a passive one suppresses every hover treatment. Style it
   *  with `--ds-table-cell-link-color` / `--ds-table-cell-link-decoration`.
   *
   *  Prefer `link` where the row leads somewhere: the tint appears only on hover, which
   *  a keyboard or touch user never sees. */
  interactive?: boolean;
  /** Renders this column's value as a real `<a>`: visible without hovering, in the tab
   *  order as a link, and opens in a new tab on Ctrl/Cmd-click.
   *
   *  Return an Angular route target (a string, or the array form for dynamic
   *  segments); `null` / `undefined` leaves that row's cell as plain text, so a list
   *  where only some rows are reachable needs no second column. For an external URL,
   *  render the cell through a `[cell]` template instead: this takes route targets only.
   *
   *  With `rowInteractive` the link stops its own click from reaching the row, so it
   *  navigates once. Same `--ds-table-cell-link-*` tokens as `interactive`. */
  link?: (row: T) => string | readonly unknown[] | null | undefined;
  /** Initial visibility: start hidden. Needs the `dsTableColumns` directive on
   *  the table — visibility is its stage, so without it the column renders. The
   *  picker (or a bound `hiddenKeys` set) owns the state from then on; a hidden
   *  column stays available to `filterable` matching and sorting. */
  hidden?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortChangeEvent {
  key: string;
  dir: SortDirection;
}

export interface TableRowAction<T = unknown> {
  /** Stable identifier — use it to branch in `rowActionSelected`. */
  id: string;
  /** Per-row where one action reads two ways: Deactivate on a live row and
   *  Reactivate on a suspended one. It is ONE action — the same `id` reaches
   *  `rowActionSelected` either way. */
  label: string | ((row: T) => string);
  icon?: IconName;
  /** Renders the item in the destructive style. */
  error?: boolean;
  /** Draws a divider ABOVE this item. For the destructive tail, where colour
   *  alone is the only thing separating Delete from the actions above it. */
  divider?: boolean;
  /** Per-row predicate — return true to disable the item for that row. */
  disabled?: (row: T) => boolean;
  /** Per-row predicate — return true to leave the item OUT for that row. Use it
   *  where the action does not apply rather than `disabled`, which greys an item
   *  that is always there. When every item of a row is hidden the kebab is not
   *  rendered. */
  hidden?: (row: T) => boolean;
  /** Why the item is disabled, shown as the item's second line. Only read when
   *  `disabled` returns true for the row. */
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
