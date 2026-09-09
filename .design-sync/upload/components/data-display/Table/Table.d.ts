import * as React from 'react';

/**
 * Table — the real TableComponent, run by Angular behind `<ds-table>`.
 * Data table with the full DS structure: horizontal scroll-wrap, sticky header (on by default), sortable headers with direction icons, selection checkboxes + bulk bar, expandable rows, skeleton/overlay loading, zebra/compact/bordered variants. Generic over the row type — rows MUST have a string `id`.
 */
export interface TableProps {
  /** Rows to render. */
  data?: unknown;
  /** Row identity used for tracking, selection, expansion and the active-row highlight. Defaults to `row.id`; pass an accessor for display-only data with no natural key (`[rowId]="row => row.channel + row.sentAt"`), which beats mapping synthetic ids into the data just to satisfy the table. */
  rowId?: unknown;
  /** Column definitions driving headers, cells and sorting. */
  columns?: unknown;
  /** Adds a checkbox column for row/select-all selection. */
  selectable?: boolean;
  /** Opt-in outer border + radius. Off by default so tables flush inside a `<ds-card padding="none">` don't double-border. When `true`, the scroll-wrap gets a `var(--border-default)` outline and `var(--radius-md)` radius — useful when the table stands alone in a padded card. Unset falls back to `DS_CONFIG.table.bordered`, then `false`. */
  bordered?: boolean | null;
  /** false — no loading state. `true` — the table picks: skeleton rows while it has nothing to show, overlay once rows are on screen. Prefer it; the right choice is a function of the row count, which only the table holds. 'skeleton' — first-load placeholder; rows are replaced with shimmer rows. 'overlay' — re-fetch indicator; existing rows stay visible behind a translucent overlay with a centred spinner. Pin either one only to override the rule deliberately. */
  loading?: boolean | 'skeleton' | 'overlay';
  /** Keeps the header row pinned while the body scrolls. */
  stickyHeader?: boolean;
  /** Caps the scroll body height (any CSS length, e.g. `'320px'`) and scrolls it vertically — pair with `stickyHeader` for a self-contained scroll region. `null` (default) lets the table grow to its content. */
  maxHeight?: string | null;
  /** Row density — `'compact'` tightens cell padding for spreadsheet-dense lists. */
  density?: 'default' | 'compact';
  /** Tints odd rows for easier row-tracking across wide tables. */
  zebra?: boolean;
  /** Animate the body height when the row set changes (page/filter) instead of snapping. Opt-in; instant under reduced-motion (the DS zeroes the token). */
  animateHeight?: boolean;
  /** Two-way set of currently selected row ids. */
  selectedIds?: unknown;
  onSelectedIdsChange?: (value: unknown) => void;
  /** Column key currently sorted by; `null` when unsorted. Two-way bindable (`[(sortKey)]`) or one-way from your own state with `(sortChange)`. */
  sortKey?: string | null;
  /** Emitted for `[(sortKey)]`. `sortChange` carries the same click with both halves at once, which is usually the one to listen to. */
  onSortKeyChange?: (value: string | null) => void;
  /** Sort direction for `sortKey`. */
  sortDir?: ('asc' | 'desc' | null);
  /** Emitted for `[(sortDir)]`. */
  onSortDirChange?: (value: ('asc' | 'desc' | null)) => void;
  /** Sort states a column cycles through on click. Default includes null (unsorted); pass ['asc','desc'] to forbid the unsorted state (e.g. server-paged lists). */
  sortingOrder?: ('asc' | 'desc' | null)[];
  /** Wording for the sort announcement, so it can be translated. Receives the column's label and the new direction; return an empty string to say nothing. */
  sortAnnouncement?: unknown;
  /** Wording for the row-range announcement, so it can be translated. Receives the 1-based first and last row on screen and the total; return an empty string to say nothing. */
  rangeAnnouncement?: unknown;
  /** Number of shimmer rows rendered while `loading` is `'skeleton'`. */
  skeletonRows?: number;
  /** Accessible name for the table (rendered as a visually-hidden caption). Without it, screen-reader users get an unlabelled table. */
  caption?: string;
  /** When true, each row becomes a keyboard-operable control (role=button, tabindex, Enter/Space → rowClicked) with an accessible name from the first column. Off by default so non-navigating tables don't advertise a false click affordance. Also the gate for the hover/pressed row tints. */
  rowInteractive?: boolean;
  /** Id of the row rendered as current (highlight + `aria-current`) — e.g. the row whose detail drawer or side panel is open. `null` — none. */
  activeRowId?: string | null;
  /** Client-side row filter — case-insensitive substring match against cell text. Columns with `filterable: true` restrict the match set (none marked — every column matches, hidden ones included). '' — no filtering. */
  filterQuery?: string;
  /** Two-way per-column set-filters: column key → the still-checked values. A column absent from the map (or with every value checked) is unfiltered. */
  columnFilters?: unknown;
  onColumnFiltersChange?: (value: unknown) => void;
  /** Round-trip whatever the column features persist (order, widths, hidden keys) through `localStorage`, so a reader's column layout survives a reload. Needs `storageKey` — without one there is nothing to key a screen by, and two tables would overwrite each other. Off by default. */
  persistLayout?: boolean;
  /** Screen id the persisted layout is stored under. Pick something stable per table, not per route instance. */
  storageKey?: string;
  /** Keeps the horizontal scrollbar reachable on tall tables: the scroll container's native bar is hidden and a proxy stuck to the bottom of the nearest scroll ancestor mirrors it both ways. Off by default. Unset falls back to `DS_CONFIG.table.stickyScrollbar`, then `false`. */
  stickyScrollbar?: boolean | null;
  /** Rows per page. `null` (default) disables pagination — all rows render. */
  pageSize?: number | null;
  onPageSizeChange?: (value: number | null) => void;
  /** Current 1-based page. Only meaningful when `pageSize()` is set. */
  page?: number;
  onPageChange?: (value: number) => void;
  /** Selectable page-size choices shown in the pagination control. */
  pageSizeOptions?: number[];
  /** Shows the page-size picker in the footer pager. Set false for a table whose page size is fixed — the standalone `ds-pagination` has always taken this. */
  showPageSize?: boolean;
  /** Shows the "N of M" range label in the footer pager. */
  showLabel?: boolean;
  /** Server-side total row count. `null` (default) = client paging: the table slices `data()` itself and the pager counts the rows in hand. When set, the host has already sliced to one page — the pager uses this count and the table renders `data()` as-is (no internal slice). */
  total?: number | null;
  /** Scroll the table into view on a page change (opt-in) — keeps a bottom pager from leaving the viewport on the previous page's last rows. */
  scrollToTopOnPageChange?: boolean;
  /** Who sorts — see `TableSortMode`. Unset resolves to `'server'`: the table emits `(sortChange)` and reorders nothing, which is what a paged table needs. Declare `'client'` when the table holds every row, or `'none'` to drop the affordance entirely. */
  sortMode?: ('client' | 'server' | 'none') | null;
  /** Who filters — see `TableFilterMode`. Unset resolves to `'server'`: the table tracks the selection in `columnFilters` for the host to turn into a request, and runs no local pass. Declare `'client'` when the table holds every row and should filter them itself. */
  filterMode?: ('client' | 'server' | 'none') | null;
  /** The full value domain per column key, for a header filter the table cannot derive itself. Without it the checklist is built from the rows in hand, which on a server-paged table offers only the values that happen to be on the current page. */
  columnFilterOptions?: unknown;
  /** Where the sticky horizontal scrollbar comes to rest, as any CSS length. Unset, the table measures its scroll container's bottom padding and cancels it, so the bar sits on the edge the reader can see. Set it for a scrollport whose reachable edge is not its padding edge. Falls back to `DS_CONFIG.table.stickyScrollbarOffset`; `--ds-table-sticky-scrollbar-offset` still wins over both, for a rule that has to reach one table from a stylesheet. */
  stickyScrollbarOffset?: string | null;
  /** Pin the first data column (and the select column) on horizontal scroll. */
  stickyFirstColumn?: boolean;
  /** Render only the rows in view, padding the rest with two spacer rows. Opt-in, and it needs `maxHeight` — without a bounded scroller there is no viewport to window against, so nothing is virtualized (dev-warned). Every row must be the same height, which is `virtualRowSize`: the arithmetic that decides what is in view has no other way to know where a row starts. So virtual mode forces `table-layout: fixed` and single-line cells, and the expansion panel is suppressed — a row that can grow breaks the maths. */
  virtualScroll?: boolean;
  /** Row height in px in virtual mode. Must match what the rows actually measure, so it drives the CSS height rather than merely describing it. */
  virtualRowSize?: number;
  /** Fetch rows as they scroll into view instead of receiving them all. `data` becomes a SPARSE array `total` long: put each fetched row at its absolute index and leave the rest empty. Every gap inside the window renders a skeleton row, and `(lazyLoad)` asks for the range covering it. Needs `virtualScroll` — without a window there is nothing to load lazily AGAINST — and `total`, which is what the scrollbar is sized from. */
  lazy?: boolean;
  /** The range now on screen that `data` has gaps in — fetch it and write the rows back at their absolute indices. Re-emits only when the range moves. */
  onLazyLoad?: (value: unknown) => void;
  /** Fires with the row on click (or Enter/Space when `rowInteractive`). */
  onRowClicked?: (value: unknown) => void;
  /** Fires whenever sort key/direction changes, in every `sortMode` but `'none'`. */
  onSortChange?: (value: unknown) => void;
  /** Row-action menu items rendered as a trailing kebab (⋮) column. Empty (default) — no column. Menu clicks never trigger `rowClicked`. */
  rowActions?: unknown;
  /** Fires with the chosen action and its row when a kebab menu item is selected. */
  onRowActionSelected?: (value: unknown) => void;
  /** Fires when an `editable` cell is committed (Enter or blur) with the new value. */
  onCellEdited?: (value: unknown) => void;
  /** Cell templates supplied as an explicit map instead of (or in addition to) projected `dsCellTemplate` directives. Lets a wrapper component collect the directives itself and pass them down, since content projected through a wrapper's `<ng-content>` is not seen by this component's content query. Entries here override projected ones. */
  cellTemplateMap?: unknown;
  /** Empty-state template, as an alternative to the `[empty]` content slot — again for wrappers that can't rely on slot re-projection. */
  emptyTemplate?: unknown;
  /** When true, each row renders a leading chevron button that toggles an inline expansion panel below it. */
  expandableRows?: boolean;
  /** Two-way set of currently expanded row ids. */
  expandedIds?: unknown;
  onExpandedIdsChange?: (value: unknown) => void;
  /** `'single'` collapses the open row when another expander is clicked. Enforced on interaction only: a set seeded with several ids is left alone (and warned about in dev) rather than silently rewritten under the host. */
  expandMode?: ('multiple' | 'single');
  /** Renders an expand-all/collapse-all chevron in the expander column header, page-scoped when paginating, like select-all. Suppressed under `expandMode="single"`, which it would contradict. */
  expandAllToggle?: boolean;
  /** Fires with the row when an expander opens it — including each row opened by expand-all, so a host lazy-loading panel content sees every one. */
  onRowExpanded?: (value: unknown) => void;
  /** Fires with the row when an expander closes it, the row auto-closed by `expandMode="single"` included. It carries a row, so it cannot speak for an id whose row is no longer in `data()` — under server-side paging that id is cleared silently. `expandedIds` is the complete signal; this one is the convenient one. */
  onRowCollapsed?: (value: unknown) => void;
  /** Template rendered inside an expanded row's panel. Context: `$implicit` = row, `row` = row. */
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
