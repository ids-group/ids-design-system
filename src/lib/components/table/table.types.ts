import type { IconName } from '../../icons/icons.data';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  /** Include the column in `filterQuery` matching. When no column is marked,
   *  every column matches. Works on `hidden` columns too. */
  filterable?: boolean;
  /** Ellipsis-clip long cell text at `width` (240px when unset), full value in
   *  the title tooltip. Text cells only — template cells own their overflow. */
  truncate?: boolean;
  /** Column width in px — also the clip width for `truncate`. */
  width?: number;
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => string;
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
