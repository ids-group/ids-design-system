/**
 * Who applies the header filters.
 *
 * `'server'` (default): the host filters; the table only tracks `columnFilters`. `'client'`
 * filters the rows in hand. `'none'` renders no filter button.
 */
export type TableFilterMode = 'client' | 'server' | 'none';

/**
 * Who sorts a `ds-table`.
 *
 * - `'server'` (default): the table only emits `sortChange`; the host reorders.
 * - `'client'`: the table reorders `data()` itself.
 * - `'none'`: nothing sorts and `sortable` columns render no affordance.
 */
export type TableSortMode = 'client' | 'server' | 'none';

/** `'single'` closes the open row when another expands; `'multiple'` (default) does not. */
export type TableExpandMode = 'multiple' | 'single';

/**
 * What a column holds, which sets its width when `width` is unset: `'id'` and `'date'` 130px,
 * `'number'` 120px, `'status'` 110px, each widened to its header label. `'text'` (default)
 * columns share the rest of the table equally, each no narrower than its header label or
 * `minWidth`.
 */
export type TableColumnKind = 'text' | 'id' | 'date' | 'number' | 'status';

import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  /** Visually-hidden header name, for an intentionally empty `label`. */
  screenReaderLabel?: string;
  /** Defines the column's term: the header label gets a dotted underline, a Tab stop, and shows
   *  this text in a tooltip on hover and keyboard focus, announced as the label's description.
   *  Replaces the tooltip that otherwise shows a clipped label in full. */
  hint?: string;
  sortable?: boolean;
  /** Include the column in `filterQuery` matching; when none is marked, all match. Works on `hidden` columns. */
  filterable?: boolean;
  /** Adds a header filter menu; `'set'` is a searchable checkbox list of distinct values. */
  filter?: 'set';
  /** Ellipsis-clip long cell text at the column's width; the full value shows in a tooltip.
   *  A `'text'` column without `width` or `minWidth`, in a table whose columns do not fit
   *  without scrolling, is 240px of text wide. */
  truncate?: boolean;
  /** Sets the column's width when `width` is unset. Default `'text'`. */
  kind?: TableColumnKind;
  /** Column width in px, padding included; a `truncate` column clips its text inside it.
   *
   *  `'content'` sizes the column to its widest rendered cell without wrapping, measured again
   *  whenever the rows change, so it is the one width that moves with the data. Dragging the
   *  edge overrides it. */
  width?: number | 'content';
  /** The narrowest the column gets, in px, padding included; the table scrolls sideways before
   *  the column goes narrower. Ignored when `width` is set. */
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => string;
  /** Sort by a domain value instead of the rendered text (`$1.2M`, `Oct 09, 2023` sort wrongly
   *  as text). `null`/`undefined`/`''` counts as blank and sorts last in BOTH directions.
   *  The header filter still lists the rendered text. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Double-click to edit inline; the value is emitted via `cellEdited`, the consumer owns the data. */
  editable?: boolean;
  /** Toggleable in the column picker. Needs the `dsTableColumns` directive; does nothing without it. */
  hideable?: boolean;
  /** Marks the cell whose text names what the row opens: link colour and underline on row hover.
   *  Only on a `rowInteractive` table. Style with `--ds-table-cell-link-color` /
   *  `--ds-table-cell-link-decoration`.
   *
   *  Prefer `link` where the row navigates: the hover tint is invisible to keyboard and touch. */
  interactive?: boolean;
  /** Renders the value as a real `<a>` (tab order, Ctrl/Cmd-click).
   *
   *  Return an Angular route target (string or array form); `null` / `undefined` leaves that
   *  row's cell as plain text. Route targets only: for an external URL use a `[cell]` template.
   *
   *  With `rowInteractive` the link stops its click from reaching the row. Same
   *  `--ds-table-cell-link-*` tokens as `interactive`. */
  link?: (row: T) => string | readonly unknown[] | null | undefined;
  /** Start hidden. Needs the `dsTableColumns` directive, without it the column renders. The
   *  picker (or bound `hiddenKeys`) owns the state afterwards; a hidden column still takes part
   *  in `filterable` matching and sorting. */
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
  /** A function reads per row (Deactivate / Reactivate); the same `id` reaches `rowActionSelected`. */
  label: string | ((row: T) => string);
  icon?: IconName;
  /** Renders the item in the destructive style. */
  error?: boolean;
  /** Draws a divider ABOVE this item. */
  divider?: boolean;
  /** Per-row predicate: true disables the item. */
  disabled?: (row: T) => boolean;
  /** Per-row predicate: true leaves the item OUT (use instead of `disabled` where the action does
   *  not apply). The kebab is not rendered when every item of a row is hidden. */
  hidden?: (row: T) => boolean;
  /** Second line of a disabled item; read only when `disabled` returns true. */
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
