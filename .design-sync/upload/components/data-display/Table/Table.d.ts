import * as React from 'react';

/**
 * Table — the real TableComponent, run by Angular behind `<ds-table>`.
 * Data table with the full DS structure: horizontal scroll-wrap, sticky header (on by default), sortable headers with direction icons, selection checkboxes + bulk bar, expandable rows, skeleton/overlay loading, zebra/compact/bordered variants. Generic over the row type — rows MUST have a string `id`.
 */
export interface TableProps {
  /** Rows to render. */
  data?: unknown;
  /** Row identity for tracking, selection, expansion and the active-row highlight. Defaults to `row.id`; pass an accessor (`[rowId]="row => row.channel + row.sentAt"`) for data with no key. */
  rowId?: unknown;
  /** Column definitions driving headers, cells and sorting. */
  columns?: unknown;
  /** Adds a checkbox column for row/select-all selection. */
  selectable?: boolean;
  /** Opt-in outer border + radius, off so tables flush in a `<ds-card padding="none">` don't double-border. Unset falls back to `DS_CONFIG.table.bordered`, then `false`. */
  bordered?: boolean | null;
  /** `false`: no loading state. `true`: the table picks, skeleton rows while it has nothing to show, overlay once rows are on screen. Prefer it. `'skeleton'`: first-load shimmer rows. `'overlay'`: re-fetch spinner over the existing rows. */
  loading?: boolean | 'skeleton' | 'overlay';
  /** Keeps the header row pinned while the body scrolls. */
  stickyHeader?: boolean;
  /** Prints every row of a client-paged table instead of the page on screen, without the pager. A server-paged table (`total`) holds only its page, so it prints that page. */
  printAllRows?: boolean;
  /** Prints as the first row of the header, repeated on every printed page with it, so a table's heading never ends a page without the table. Hidden on screen. */
  printHeading?: string | null;
  /** A line under `printHeading` in the printout. */
  printHeadingNote?: string | null;
  /** Caps the scroll body height (any CSS length) and scrolls it vertically; pair with `stickyHeader`. `null` (default) grows to content. */
  maxHeight?: string | null;
  /** `'compact'` tightens cell padding. */
  density?: 'default' | 'compact';
  /** Tints odd rows. */
  zebra?: boolean;
  /** Animate the body height when the row set changes. Instant under reduced motion. */
  animateHeight?: boolean;
  /** Two-way set of currently selected row ids. */
  selectedIds?: unknown;
  onSelectedIdsChange?: (value: unknown) => void;
  /** Column key currently sorted by; `null` when unsorted. Bind `[(sortKey)]` or use `(sortChange)`. */
  sortKey?: string | null;
  /** Emitted for `[(sortKey)]`. `sortChange` carries both halves at once. */
  onSortKeyChange?: (value: string | null) => void;
  /** Sort direction for `sortKey`. */
  sortDirection?: ('asc' | 'desc' | null);
  /** Emitted for `[(sortDirection)]`. */
  onSortDirectionChange?: (value: ('asc' | 'desc' | null)) => void;
  /** Sort states a column cycles through on click. Pass `['asc','desc']` to forbid unsorted. */
  sortingOrder?: ('asc' | 'desc' | null)[];
  /** Wording for the sort announcement: receives the column label and direction; return `''` to say nothing. Unset falls back to `DS_INTL.table.sorted`. */
  sortAnnouncement?: unknown;
  /** Wording for the row-range announcement: receives the 1-based first and last row on screen and the total; return `''` to say nothing. A paged table with no rows announces its empty state's text instead, calling this with `(0, 0, 0)` only when that state has none. Unset falls back to `DS_INTL.pagination.range`. */
  rangeAnnouncement?: unknown;
  /** Number of shimmer rows rendered while `loading` is `'skeleton'`. */
  skeletonRows?: number;
  /** Accessible name, rendered as a visually-hidden caption. */
  caption?: string;
  /** Each row becomes a keyboard-operable control (Enter/Space emit `rowClicked`) named from the first column. Also gates the hover/pressed row tints. */
  rowInteractive?: boolean;
  /** Id of the row rendered as current (highlight + `aria-current`), e.g. the one whose detail panel is open. `null`: none. */
  activeRowId?: string | null;
  /** Client-side substring filter (case-insensitive) on cell text. `filterable` columns restrict the match; with none marked every column matches, hidden ones included. */
  filterQuery?: string;
  /** Two-way per-column set-filters: column key to the still-checked values. Absent or full: unfiltered. */
  columnFilters?: unknown;
  onColumnFiltersChange?: (value: unknown) => void;
  /** Persist the column layout (order, widths, hidden keys) in `localStorage`. Needs `storageKey`. */
  persistLayout?: boolean;
  /** Stable per-table id the persisted layout is stored under. */
  storageKey?: string;
  /** Keeps the horizontal scrollbar reachable on tall tables: the native bar is hidden and a proxy stuck to the bottom of the nearest scroll ancestor mirrors it. Unset falls back to `DS_CONFIG.table.stickyScrollbar`, then `false`. */
  stickyScrollbar?: boolean | null;
  /** Rows per page. `null` (default) disables pagination — all rows render. */
  pageSize?: number | null;
  onPageSizeChange?: (value: number | null) => void;
  /** Current 1-based page. Only meaningful when `pageSize()` is set. */
  page?: number;
  onPageChange?: (value: number) => void;
  /** Selectable page-size choices shown in the pagination control. */
  pageSizeOptions?: number[];
  /** Shows the page-size picker in the footer pager. */
  showPageSize?: boolean;
  /** Shows the "N of M" range label in the footer pager. */
  showLabel?: boolean;
  /** Control height of the footer pager. Unset falls back to `DS_CONFIG.pagination.size`, then `DS_CONFIG.control.size`, then `'sm'`. */
  paginationSize?: ('sm' | 'md' | 'lg') | null;
  /** `'spread'` stretches the footer pager to the table's full width. Unset falls back to `DS_CONFIG.pagination.layout`, then `'grouped'`. */
  paginationLayout?: ('grouped' | 'spread') | null;
  /** Server-side total row count. `null` (default): client paging, the table slices `data()`. When set, the host has sliced to one page and `data()` renders as-is. */
  total?: number | null;
  /** Scroll the table into view on a page change. */
  scrollToTopOnPageChange?: boolean;
  /** Who sorts, see `TableSortMode`. Unset resolves to `'server'`: the table emits `(sortChange)` and reorders nothing. */
  sortMode?: ('client' | 'server' | 'none') | null;
  /** Who filters, see `TableFilterMode`. Unset resolves to `'server'`: the table tracks `columnFilters` and runs no local pass. */
  filterMode?: ('client' | 'server' | 'none') | null;
  /** Full value domain per column key for a header filter the table cannot derive; without it the checklist offers only the values on the current page. */
  columnFilterOptions?: unknown;
  /** Where the sticky horizontal scrollbar rests, as a CSS length. Unset, the table cancels its scroll container's bottom padding. Falls back to `DS_CONFIG.table.stickyScrollbarOffset`; `--ds-table-sticky-scrollbar-offset` wins over both. */
  stickyScrollbarOffset?: string | null;
  /** `'auto'`, the default: the 0.15.0 widths, which follow the cell content and ignore `kind`. `'fixed'`: a column is as wide as its `width`, else its `kind`, else an equal share of what the others leave, whatever its cells hold. Unset falls back to `DS_CONFIG.table.layout`, then `'auto'`. */
  layoutMode?: 'fixed' | 'auto' | null;
  /** Pin the first data column (and the select column) on horizontal scroll. */
  stickyFirstColumn?: boolean;
  /** Render only the rows in view, padding the rest with spacer rows. Needs `maxHeight` (dev-warned, nothing virtualizes without a bounded scroller). Every row must be `virtualRowSize` tall, so virtual mode forces `table-layout: fixed`, single-line cells and no expansion panel. */
  virtualScroll?: boolean;
  /** Row height in px in virtual mode. Drives the CSS height, so it must match the rendered rows. */
  virtualRowSize?: number;
  /** Fetch rows as they scroll into view. `data` becomes a SPARSE array `total` long: put each fetched row at its absolute index; every gap in the window renders a skeleton row and `(lazyLoad)` asks for its range. Needs `virtualScroll` and `total`. */
  lazy?: boolean;
  /** The on-screen range with gaps in `data`; write fetched rows back at their absolute indices. Re-emits only when the range moves. */
  onLazyLoad?: (value: unknown) => void;
  /** Fires with the row on click (or Enter/Space when `rowInteractive`). */
  onRowClicked?: (value: unknown) => void;
  /** Fires whenever sort key/direction changes, in every `sortMode` but `'none'`. */
  onSortChange?: (value: unknown) => void;
  /** Row-action items rendered as a trailing kebab column; empty: no column. Menu clicks never trigger `rowClicked`. */
  rowActions?: unknown;
  /** Fires with the chosen action and its row when a kebab menu item is selected. */
  onRowActionSelected?: (value: unknown) => void;
  /** Fires when an `editable` cell is committed (Enter or blur) with the new value. */
  onCellEdited?: (value: unknown) => void;
  /** Cell templates as an explicit map, for wrappers whose `<ng-content>` hides projected `dsCellTemplate` directives from this component's content query. Overrides projected ones. */
  cellTemplateMap?: unknown;
  /** Empty-state template, alternative to the `[empty]` slot for wrappers that cannot re-project. */
  emptyTemplate?: unknown;
  /** Each row renders a leading chevron that toggles an inline expansion panel. */
  expandableRows?: boolean;
  /** Two-way set of currently expanded row ids. */
  expandedIds?: unknown;
  onExpandedIdsChange?: (value: unknown) => void;
  /** `'single'` collapses the open row when another expands. Enforced on interaction only: a set seeded with several ids is left alone (dev-warned). */
  expandMode?: ('multiple' | 'single');
  /** Expand-all/collapse-all chevron in the expander header, page-scoped when paginating. Suppressed under `expandMode="single"`. */
  expandAllToggle?: boolean;
  /** Fires with the row when an expander opens it, including each row opened by expand-all. */
  onRowExpanded?: (value: unknown) => void;
  /** Fires with the row when an expander closes it, including the row auto-closed by `expandMode="single"`. An id whose row left `data()` (server paging) is cleared silently, so `expandedIds` is the complete signal. */
  onRowCollapsed?: (value: unknown) => void;
  /** Template rendered inside an expanded row's panel; `$implicit` and `row` are the row. */
  rowExpandTemplate?: unknown;
  /** Content for the `[toolbar]` slot. */
  toolbar?: React.ReactNode;
  /** Content for the `[empty]` slot. */
  empty?: React.ReactNode;
  /** Content for the `[bulk-actions]` slot. */
  bulkActions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Table: React.ComponentType<TableProps>;
