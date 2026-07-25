import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import { Skeleton } from './Skeleton';
import { LoadingOverlay } from './LoadingOverlay';
import { Pagination } from './Pagination';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  /** Include the column in `filterQuery` matching. When no column is marked,
   *  every column matches. Works on `hidden` columns too. */
  filterable?: boolean;
  /** Adds a header filter-menu button. `'set'` filters rows by the column's
   *  distinct values via the `columnFilters` prop. */
  filter?: 'set';
  /** Ellipsis-clip long cell text at `width` (240px when unset) — full value
   *  in the title tooltip. Text cells only — template cells own their overflow. */
  truncate?: boolean;
  /** Column width in px — also the clip width for `truncate`. */
  width?: number;
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => string;
  /** Double-click the cell to edit it inline; the committed value is emitted
   *  via `onCellEdited` (the consumer owns the data update). */
  editable?: boolean;
  /** Marks the column toggleable in the header column picker — the picker
   *  button appears once at least one column is hideable. */
  hideable?: boolean;
  /** Initial visibility: start hidden. A bound `hiddenKeys` set takes over —
   *  `hidden` flags are then ignored. */
  hidden?: boolean;
}

export type SortDir = 'asc' | 'desc' | null;

export interface SortChangeEvent {
  key: string;
  dir: SortDir;
}

export interface TableRowAction<T = unknown> {
  /** Stable identifier — use it to branch in `onRowActionSelected`. */
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

const NUMERIC = /^-?\d+(\.\d+)?$/;

export interface TableProps<T extends { id: string }> {
  /** Rows to render. */
  data: readonly T[];
  /** Column definitions driving headers, cells and sorting. */
  columns: readonly TableColumn<T>[];
  /** Adds a checkbox column for row/select-all selection. */
  selectable?: boolean;
  /** Opt-in outer border + radius. Off by default so tables flush inside a
   *  `<Card padding="none">` don't double-border. */
  bordered?: boolean;
  /** false — no loading state. 'skeleton' — first-load placeholder rows.
   *  'overlay' — re-fetch indicator over the existing rows. */
  loading?: false | 'skeleton' | 'overlay';
  /** Keeps the header row pinned while the body scrolls. Default true. */
  stickyHeader?: boolean;
  /** Caps the scroll body height (any CSS length, e.g. `'320px'`) and scrolls
   *  it vertically. `null` (default) lets the table grow to its content. */
  maxHeight?: string | null;
  /** Row density — `'compact'` tightens cell padding for spreadsheet-dense lists. */
  density?: 'default' | 'compact';
  /** Tints odd rows for easier row-tracking across wide tables. */
  zebra?: boolean;
  /** Set of currently selected row ids. Controlled when `onSelectedIdsChange`
   *  is provided; otherwise internal state seeded from this value. */
  selectedIds?: ReadonlySet<string>;
  /** Emits the next selected-id set on checkbox toggles. */
  onSelectedIdsChange?: (ids: Set<string>) => void;
  /** Column key currently sorted by; `null` when unsorted. Controlled when
   *  `onSortChange` is provided; otherwise internal state seeded from this. */
  sortKey?: string | null;
  /** Sort direction for `sortKey`. */
  sortDir?: SortDir;
  /** Fires whenever sort key/direction changes, regardless of `clientSort`. */
  onSortChange?: (event: SortChangeEvent) => void;
  /** Number of shimmer rows rendered while `loading` is `'skeleton'`. Default 5. */
  skeletonRows?: number;
  /** Accessible name for the table (rendered as a visually-hidden caption). */
  caption?: string;
  /** When true, each row becomes a keyboard-operable control (tabindex,
   *  Enter/Space → `onRowClicked`) and the table gets `role="grid"`. Also the
   *  gate for the hover/pressed row tints. */
  rowInteractive?: boolean;
  /** Id of the row rendered as current (highlight + `aria-current`). `null` — none. */
  activeRowId?: string | null;
  /** Client-side row filter — case-insensitive substring match against cell
   *  text. Columns with `filterable: true` restrict the match set. '' — none. */
  filterQuery?: string;
  /** Per-column set-filters: column key → the still-allowed values. A column
   *  absent from the map is unfiltered. */
  columnFilters?: ReadonlyMap<string, ReadonlySet<string>>;
  /** Set of hidden column keys. `null` (default) derives the set from each
   *  column's `hidden` flag. */
  hiddenKeys?: ReadonlySet<string> | null;
  /** Renders drag-handle affordances on each column header (visual only in
   *  this binding — set widths via `columnWidths`). */
  resizableColumns?: boolean;
  /** Per-column pixel width overrides (keyed by column key). Falls back to
   *  each `column.width`. */
  columnWidths?: ReadonlyMap<string, number>;
  /** Column order as a list of keys. `null` (default) keeps declaration order.
   *  Keys absent from the list fall back to declaration order after the listed ones. */
  columnOrder?: readonly string[] | null;
  /** Reserves the column-picker affordance for reordering (panel not ported —
   *  order via `columnOrder`). */
  reorderableColumns?: boolean;
  /** Keeps the horizontal scrollbar reachable on tall tables: the scroll
   *  container's native bar is hidden and a proxy stuck to the bottom mirrors it. */
  stickyScrollbar?: boolean;
  /** Rows per page. `null` (default) disables pagination — all rows render.
   *  Controlled when `onPageSizeChange` is provided; otherwise internal state
   *  seeded from this value. */
  pageSize?: number | null;
  /** Emits the new rows-per-page when changed via the footer's size dropdown. */
  onPageSizeChange?: (size: number) => void;
  /** Current 1-based page. Only meaningful when `pageSize` is set. Controlled
   *  when `onPageChange` is provided; otherwise internal state seeded from this. */
  page?: number;
  /** Emits the new 1-based page on pager navigation (including the reset to
   *  page 1 after a size change). */
  onPageChange?: (page: number) => void;
  /** Selectable page-size choices shown in the pagination control. */
  pageSizeOptions?: number[];
  /** When true, the table sorts `data` itself; otherwise it only emits
   *  `onSortChange` and leaves ordering to the consumer (default). */
  clientSort?: boolean;
  /** Pin the first data column (and the select column) on horizontal scroll. */
  stickyFirstColumn?: boolean;
  /** Fires with the row on click (or Enter/Space when `rowInteractive`). */
  onRowClicked?: (row: T) => void;
  /** Row-action menu items rendered as a trailing kebab (⋮) column.
   *  Empty (default) — no column. (The kebab's popover menu is not ported —
   *  the button renders for structural parity only.) */
  rowActions?: readonly TableRowAction<T>[];
  /** Fires when an `editable` cell is committed (Enter or blur) with the new value. */
  onCellEdited?: (event: TableCellEditEvent<T>) => void;
  /** Custom cell renderers keyed by column key — the React stand-in for the
   *  Angular `dsCellTemplate` directives / `cellTemplateMap` input. */
  cellTemplates?: Record<string, (row: T) => React.ReactNode>;
  /** Empty-state content shown when no rows match (the `[empty]` slot). */
  empty?: React.ReactNode;
  /** When true, each row renders a leading chevron button that toggles an
   *  inline expansion panel below it. */
  expandableRows?: boolean;
  /** Set of currently expanded row ids. Controlled when `onExpandedIdsChange`
   *  is provided; otherwise internal state seeded from this value. */
  expandedIds?: ReadonlySet<string>;
  /** Emits the next expanded-id set when a row chevron is toggled. */
  onExpandedIdsChange?: (ids: Set<string>) => void;
  /** Renders the panel inside an expanded row (the `rowExpandTemplate`). */
  renderRowExpand?: (row: T) => React.ReactNode;
  /** Content of the bulk bar shown while some rows are selected
   *  (the `[bulk-actions]` slot). */
  bulkActions?: React.ReactNode;
}

/** Deterministic per-cell width so skeleton rows look organic but stable
 *  across re-renders. Mixes column key + row index into one of five widths. */
function skeletonWidth(colKey: string, rowIndex: number): string {
  const seed = `${colKey}-${rowIndex}`;
  let hash = 0;
  for (let charIndex = 0; charIndex < seed.length; charIndex++) {
    hash = (hash + seed.charCodeAt(charIndex)) | 0;
  }
  const widths = ['45%', '55%', '65%', '75%', '85%'];

  return widths[Math.abs(hash) % widths.length] ?? '70%';
}

/** Data table — port of `ds-table`. Renders the exact scroll-wrap → table →
 *  thead/tbody structure with the DS's class vocabulary: sortable headers with
 *  direction icons, selection checkboxes, expandable rows, skeleton/overlay
 *  loading, zebra/compact/sticky variants, client-side filter + sort, inline
 *  cell editing, and a `pageSize`-gated pagination footer (delegating to the
 *  `Pagination` binding). Popover-based features (column picker, set-filter
 *  panel, row-action menus) render their trigger buttons only. */
export function Table<T extends { id: string }>({
  data,
  columns,
  selectable = false,
  bordered = false,
  loading = false,
  stickyHeader = true,
  maxHeight = null,
  density = 'default',
  zebra = false,
  selectedIds,
  onSelectedIdsChange,
  sortKey,
  sortDir,
  onSortChange,
  skeletonRows = 5,
  caption = '',
  rowInteractive = false,
  activeRowId = null,
  filterQuery = '',
  columnFilters,
  hiddenKeys = null,
  resizableColumns = false,
  columnWidths,
  columnOrder = null,
  reorderableColumns = false,
  stickyScrollbar = false,
  pageSize = null,
  onPageSizeChange,
  page = 1,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  clientSort = false,
  stickyFirstColumn = false,
  onRowClicked,
  rowActions = [],
  onCellEdited,
  cellTemplates,
  empty,
  expandableRows = false,
  expandedIds,
  onExpandedIdsChange,
  renderRowExpand,
  bulkActions,
}: TableProps<T>) {
  // ---- model()-style fallbacks: controlled when the change callback exists ----
  const [ownSelectedIds, setOwnSelectedIds] = React.useState<ReadonlySet<string>>(
    () => new Set(selectedIds ?? []),
  );
  const effSelectedIds = onSelectedIdsChange ? (selectedIds ?? new Set<string>()) : ownSelectedIds;
  const setSelectedIds = (next: Set<string>) => {
    if (!onSelectedIdsChange) setOwnSelectedIds(next);
    onSelectedIdsChange?.(next);
  };

  const [ownExpandedIds, setOwnExpandedIds] = React.useState<ReadonlySet<string>>(
    () => new Set(expandedIds ?? []),
  );
  const effExpandedIds = onExpandedIdsChange ? (expandedIds ?? new Set<string>()) : ownExpandedIds;
  const setExpandedIds = (next: Set<string>) => {
    if (!onExpandedIdsChange) setOwnExpandedIds(next);
    onExpandedIdsChange?.(next);
  };

  const [ownSortKey, setOwnSortKey] = React.useState<string | null>(sortKey ?? null);
  const [ownSortDir, setOwnSortDir] = React.useState<SortDir>(sortDir ?? null);
  const effSortKey = onSortChange ? (sortKey ?? null) : ownSortKey;
  const effSortDir = onSortChange ? (sortDir ?? null) : ownSortDir;

  const [ownPageSize, setOwnPageSize] = React.useState<number | null>(pageSize);
  const effPageSize = onPageSizeChange ? pageSize : ownPageSize;
  const setPageSize = (next: number) => {
    if (!onPageSizeChange) setOwnPageSize(next);
    onPageSizeChange?.(next);
  };

  const [ownPage, setOwnPage] = React.useState<number>(page);
  const effPage = onPageChange ? page : ownPage;
  const setPage = (next: number) => {
    if (!onPageChange) setOwnPage(next);
    onPageChange?.(next);
  };

  // ---- helpers ----
  const cellValue = (row: T, col: TableColumn<T>): string => {
    if (col.cell) return col.cell(row);

    return String((row as Record<string, unknown>)[col.key] ?? '');
  };

  const effectiveHiddenKeys: ReadonlySet<string> =
    hiddenKeys ?? new Set(columns.filter((col) => col.hidden).map((col) => col.key));

  /** Columns in the user-controlled order — `columnOrder` first (dropping
   *  unknown keys), then any declared column the order omitted. */
  const orderedColumns: readonly TableColumn<T>[] = React.useMemo(() => {
    if (!columnOrder) return columns;
    const byKey = new Map(columns.map((col) => [col.key, col]));
    const placed = new Set<string>();
    const out: TableColumn<T>[] = [];
    for (const key of columnOrder) {
      const col = byKey.get(key);
      if (col && !placed.has(key)) {
        out.push(col);
        placed.add(key);
      }
    }
    for (const col of columns) {
      if (!placed.has(col.key)) out.push(col);
    }

    return out;
  }, [columns, columnOrder]);

  const visibleColumns = orderedColumns.filter((col) => !effectiveHiddenKeys.has(col.key));
  const hideableColumns = columns.filter((col) => col.hideable);
  const hasColumnPicker = hideableColumns.length > 0 || reorderableColumns;
  const hasRowActions = rowActions.length > 0;
  const hasUtilityColumn = hasRowActions || hasColumnPicker;

  const distinctValuesOf = (col: TableColumn<T>): string[] => {
    const seen = new Set<string>();
    for (const row of data) seen.add(cellValue(row, col));

    return [...seen].sort((a, b) => a.localeCompare(b));
  };

  /** A column is "actively filtered" when at least one of its values is unchecked. */
  const isColumnFiltered = (col: TableColumn<T>): boolean => {
    const allowed = columnFilters?.get(col.key);

    return !!allowed && allowed.size < distinctValuesOf(col).length;
  };

  /** Client-side filter — combines the `filterQuery` substring search with any
   *  per-column set filters. Sorting runs on the filtered rows. */
  const filteredData: readonly T[] = React.useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    const setFilters = columnFilters ?? new Map<string, ReadonlySet<string>>();
    if (!query && setFilters.size === 0) return data;
    const marked = columns.filter((col) => col.filterable);
    const scope = marked.length ? marked : columns;
    const activeSetFilters = [...setFilters]
      .map(([key, allowed]) => ({ col: columns.find((col) => col.key === key), allowed }))
      .filter(
        (entry): entry is { col: TableColumn<T>; allowed: ReadonlySet<string> } => !!entry.col,
      );

    return data.filter((row) => {
      if (query && !scope.some((col) => cellValue(row, col).toLowerCase().includes(query))) {
        return false;
      }

      return activeSetFilters.every(({ col, allowed }) => allowed.has(cellValue(row, col)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns, filterQuery, columnFilters]);

  /** Client-side sort over the filtered data set — only when `clientSort`. */
  const sortedData: readonly T[] = React.useMemo(() => {
    if (!clientSort || !effSortKey || !effSortDir) return filteredData;
    const column = columns.find((col) => col.key === effSortKey);
    if (!column) return filteredData;

    return filteredData.slice().sort((a, b) => {
      const aValue = cellValue(a, column);
      const bValue = cellValue(b, column);
      const comparison =
        NUMERIC.test(aValue) && NUMERIC.test(bValue)
          ? Number(aValue) - Number(bValue)
          : aValue.localeCompare(bValue);

      return effSortDir === 'asc' ? comparison : -comparison;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, columns, clientSort, effSortKey, effSortDir]);

  /** Rows actually rendered: the current page's slice when paginating, else
   *  the sorted/raw rows (the Angular `pagedData`/`displayData` computeds). */
  const displayData: readonly T[] =
    effPageSize != null
      ? sortedData.slice((effPage - 1) * effPageSize, (effPage - 1) * effPageSize + effPageSize)
      : sortedData;

  /** Select-all is page-scoped only when paginating. */
  const selectAllLabel =
    effPageSize != null ? 'Select all rows on this page' : 'Select all rows';

  const isSkeletonLoading = loading === 'skeleton';
  const isOverlayLoading = loading === 'overlay';

  const isSelected = (row: T) => effSelectedIds.has(row.id);
  const allSelected = displayData.length > 0 && displayData.every((row) => effSelectedIds.has(row.id));
  const someSelected = displayData.some((row) => effSelectedIds.has(row.id)) && !allSelected;

  const isExpanded = (row: T) => effExpandedIds.has(row.id);

  const expandedColspan =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (expandableRows ? 1 : 0) +
    (hasUtilityColumn ? 1 : 0);

  /** Resolved pixel width for a column: an override wins, else `column.width`. */
  const columnWidth = (col: TableColumn<T>): number | undefined =>
    columnWidths?.get(col.key) ?? col.width ?? undefined;

  /** Accessible name for an interactive row, taken from the first visible column. */
  const rowAriaLabel = (row: T): string => {
    const first = visibleColumns[0];

    return first ? cellValue(row, first) : '';
  };

  const ariaSort = (col: TableColumn<T>): 'ascending' | 'descending' | 'none' | undefined => {
    if (!col.sortable) return undefined;
    if (effSortKey === col.key && effSortDir) {
      return effSortDir === 'asc' ? 'ascending' : 'descending';
    }

    return 'none';
  };

  const headerClasses = (col: TableColumn<T>): string =>
    cx(
      col.sortable && 'sortable',
      effSortKey === col.key && effSortDir && `sorted-${effSortDir}`,
      col.align === 'right' && 'numeric',
    );

  const sortIcon = (col: TableColumn<T>): 'sortAsc' | 'sortDesc' | 'sort' => {
    if (effSortKey !== col.key || !effSortDir) return 'sort';

    return effSortDir === 'asc' ? 'sortAsc' : 'sortDesc';
  };

  const onSort = (col: TableColumn<T>) => {
    if (!col.sortable) return;
    let dir: SortDir;
    if (effSortKey !== col.key) {
      dir = 'asc';
    } else if (effSortDir === 'asc') {
      dir = 'desc';
    } else if (effSortDir === 'desc') {
      dir = null;
    } else {
      dir = 'asc';
    }
    if (!onSortChange) {
      setOwnSortKey(dir ? col.key : null);
      setOwnSortDir(dir);
    }
    onSortChange?.({ key: col.key, dir });
  };

  // ---- selection ----
  const onToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(effSelectedIds);
    if (event.target.checked) {
      displayData.forEach((row) => next.add(row.id));
    } else {
      displayData.forEach((row) => next.delete(row.id));
    }
    setSelectedIds(next);
  };

  const onToggleRow = (row: T, event: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(effSelectedIds);
    if (event.target.checked) {
      next.add(row.id);
    } else {
      next.delete(row.id);
    }
    setSelectedIds(next);
  };

  const onToggleExpand = (row: T, event: React.MouseEvent) => {
    event.stopPropagation();
    const next = new Set(effExpandedIds);
    if (next.has(row.id)) {
      next.delete(row.id);
    } else {
      next.add(row.id);
    }
    setExpandedIds(next);
  };

  // ---- row activation (text-selection guarded, mirrors the Angular gesture check) ----
  const selectionBeforeGesture = React.useRef('');
  const onRowMousedown = () => {
    selectionBeforeGesture.current = window.getSelection()?.toString() ?? '';
  };
  const onRowClick = (row: T, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('input')) return;
    const selection = window.getSelection()?.toString() ?? '';
    if (selection && selection !== selectionBeforeGesture.current) return;
    onRowClicked?.(row);
  };
  const onRowKey = (row: T, event: React.KeyboardEvent) => {
    if (!rowInteractive) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onRowClicked?.(row);
  };

  // ---- inline cell editing (opt-in `column.editable`) ----
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; key: string } | null>(null);
  const [editDraft, setEditDraft] = React.useState('');

  const isEditing = (row: T, col: TableColumn<T>) =>
    !!editingCell && editingCell.rowId === row.id && editingCell.key === col.key;

  const startEdit = (row: T, col: TableColumn<T>, event: React.MouseEvent) => {
    if (!col.editable) return;
    event.stopPropagation();
    setEditDraft(cellValue(row, col));
    setEditingCell({ rowId: row.id, key: col.key });
  };

  const commitEdit = (row: T, col: TableColumn<T>) => {
    if (!isEditing(row, col)) return;
    setEditingCell(null);
    onCellEdited?.({ row, key: col.key, value: editDraft });
  };

  // ---- sticky-proxy horizontal scrollbar (opt-in `stickyScrollbar`) ----
  const scrollWrapRef = React.useRef<HTMLDivElement>(null);
  const hscrollProxyRef = React.useRef<HTMLDivElement>(null);
  const [hscrollContentWidth, setHscrollContentWidth] = React.useState(0);
  const [hscrollNeeded, setHscrollNeeded] = React.useState(false);

  React.useEffect(() => {
    if (!stickyScrollbar) return;
    const wrap = scrollWrapRef.current;
    const proxy = hscrollProxyRef.current;
    if (!wrap || !proxy) return;
    // Assigning an equal scrollLeft fires no scroll event, so the two mirrors can't loop.
    const fromWrap = () => {
      proxy.scrollLeft = wrap.scrollLeft;
    };
    const fromProxy = () => {
      wrap.scrollLeft = proxy.scrollLeft;
    };
    wrap.addEventListener('scroll', fromWrap, { passive: true });
    proxy.addEventListener('scroll', fromProxy, { passive: true });
    const measure = () => {
      setHscrollContentWidth(wrap.scrollWidth);
      setHscrollNeeded(wrap.scrollWidth > wrap.clientWidth + 1);
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(wrap);
    const table = wrap.querySelector('table');
    if (table) resizeObserver.observe(table);
    measure();

    return () => {
      wrap.removeEventListener('scroll', fromWrap);
      proxy.removeEventListener('scroll', fromProxy);
      resizeObserver.disconnect();
    };
  }, [stickyScrollbar]);

  // ---- render ----
  const tableClasses = cx(
    'table',
    isSkeletonLoading && 'skeleton-mode',
    stickyHeader && 'sticky-header',
    density === 'compact' && 'compact',
    zebra && 'zebra',
  );

  const renderCell = (row: T, col: TableColumn<T>) => {
    if (isEditing(row, col)) {
      return (
        <input
          type="text"
          className="cell-edit"
          autoFocus
          value={editDraft}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setEditDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit(row, col);
            if (e.key === 'Escape') setEditingCell(null);
          }}
          onBlur={() => commitEdit(row, col)}
        />
      );
    }
    const template = cellTemplates?.[col.key];
    if (template) return template(row);
    if (col.truncate) {
      return (
        <span
          className="cell-clip"
          style={{ maxWidth: `${col.width ?? 240}px` }}
          title={cellValue(row, col)}
        >
          {cellValue(row, col)}
        </span>
      );
    }

    return cellValue(row, col);
  };

  return host(
    'ds-table',
    {
      class:
        cx(
          bordered && 'bordered',
          selectable && 'selectable',
          stickyFirstColumn && 'pinned',
          expandableRows && 'expandable',
          stickyScrollbar && 'sticky-scrollbar',
          resizableColumns && 'resizable',
        ) || undefined,
    },
    <div
      ref={scrollWrapRef}
      className={cx('scroll-wrap', maxHeight && 'scroll-y')}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div className="visually-hidden" role="status" aria-live="polite">
        {loading !== false && 'Loading…'}
      </div>

      <LoadingOverlay
        loading={isOverlayLoading}
        blur={true}
        insetTop="var(--ds-table-head-h, 40px)"
      >
        <table
          className={tableClasses}
          role={rowInteractive ? 'grid' : undefined}
          aria-busy={loading !== false ? 'true' : undefined}
        >
          {caption && <caption className="visually-hidden">{caption}</caption>}

          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="select-col pin-select">
                  <input
                    type="checkbox"
                    className="check"
                    aria-label={selectAllLabel}
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onToggleAll}
                  />
                </th>
              )}

              {expandableRows && (
                <th
                  scope="col"
                  className={cx('expand-col', stickyFirstColumn && 'pin-expand')}
                ></th>
              )}

              {visibleColumns.map((col, index) => {
                const width = columnWidth(col);
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cx(
                      headerClasses(col),
                      index === 0 && stickyFirstColumn && 'pin-first',
                    ) || undefined}
                    style={
                      width != null
                        ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }
                        : undefined
                    }
                    aria-sort={ariaSort(col)}
                  >
                    {col.sortable ? (
                      <button type="button" className="th-label" onClick={() => onSort(col)}>
                        {col.label}
                        <Icon className="sort-icon" name={sortIcon(col)} size={12} />
                      </button>
                    ) : (
                      <span className="th-label">{col.label}</span>
                    )}

                    {col.filter === 'set' && (
                      <button
                        type="button"
                        className={cx('col-filter-btn', isColumnFiltered(col) && 'active')}
                        aria-haspopup="dialog"
                        aria-label={`Filter ${col.label}`}
                      >
                        <Icon name="filter" size={12} />
                      </button>
                    )}

                    {resizableColumns && <span className="col-resize" aria-hidden="true"></span>}
                  </th>
                );
              })}

              {hasUtilityColumn && (
                <th scope="col" className="actions-col">
                  {hasColumnPicker ? (
                    <button
                      type="button"
                      className="col-picker-btn"
                      aria-haspopup="dialog"
                      aria-label="Choose columns"
                      aria-expanded={false}
                    >
                      <Icon name="grid" size={14} />
                    </button>
                  ) : (
                    <span className="visually-hidden">Actions</span>
                  )}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isSkeletonLoading ? (
              Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {selectable && (
                    <td className="select-col pin-select">
                      <Skeleton width="14px" height="14px" inline={true} />
                    </td>
                  )}

                  {expandableRows && (
                    <td className={cx('expand-col', stickyFirstColumn && 'pin-expand')}></td>
                  )}

                  {visibleColumns.map((col, index) => (
                    <td
                      key={col.key}
                      className={
                        cx(
                          col.align === 'right' && 'numeric',
                          index === 0 && stickyFirstColumn && 'pin-first',
                        ) || undefined
                      }
                    >
                      <Skeleton height="14px" width={skeletonWidth(col.key, rowIndex)} inline={true} />
                    </td>
                  ))}

                  {hasUtilityColumn && <td className="actions-col"></td>}
                </tr>
              ))
            ) : !filteredData.length ? (
              <tr>
                <td className="empty" colSpan={expandedColspan}>
                  {empty}
                </td>
              </tr>
            ) : (
              displayData.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={
                      cx(
                        isSelected(row) && 'selected',
                        isExpanded(row) && 'expanded',
                        rowInteractive && 'clickable',
                        row.id === activeRowId && 'active',
                      ) || undefined
                    }
                    aria-current={row.id === activeRowId ? 'true' : undefined}
                    tabIndex={rowInteractive ? 0 : undefined}
                    aria-label={rowInteractive ? rowAriaLabel(row) : undefined}
                    onMouseDown={onRowMousedown}
                    onClick={(e) => onRowClick(row, e)}
                    onKeyDown={(e) => onRowKey(row, e)}
                  >
                    {selectable && (
                      <td className="select-col pin-select">
                        <input
                          type="checkbox"
                          className="check"
                          aria-label={`Select ${rowAriaLabel(row)}`}
                          checked={isSelected(row)}
                          onChange={(e) => onToggleRow(row, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}

                    {expandableRows && (
                      <td className={cx('expand-col', stickyFirstColumn && 'pin-expand')}>
                        <button
                          type="button"
                          className="expand-btn"
                          aria-expanded={isExpanded(row)}
                          aria-label={isExpanded(row) ? 'Collapse row' : 'Expand row'}
                          onClick={(e) => onToggleExpand(row, e)}
                        >
                          <Icon
                            className={cx('expand-chev', isExpanded(row) && 'is-expanded')}
                            name="chevronRight"
                            size={16}
                          />
                        </button>
                      </td>
                    )}

                    {visibleColumns.map((col, index) => (
                      <td
                        key={col.key}
                        className={
                          cx(
                            col.align === 'right' && 'numeric',
                            index === 0 && stickyFirstColumn && 'pin-first',
                            col.editable && 'editable-cell',
                          ) || undefined
                        }
                        onDoubleClick={(e) => startEdit(row, col, e)}
                      >
                        {renderCell(row, col)}
                      </td>
                    ))}

                    {hasUtilityColumn && (
                      <td className="actions-col">
                        {hasRowActions && (
                          <button
                            type="button"
                            className="row-actions-btn"
                            aria-haspopup="menu"
                            aria-expanded={false}
                            aria-label={`Actions for ${rowAriaLabel(row)}`}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
                            }}
                          >
                            <Icon name="moreV" size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>

                  {expandableRows && isExpanded(row) && renderRowExpand && (
                    <tr className="expand-panel-row">
                      <td className="expand-panel-cell" colSpan={expandedColspan}>
                        {renderRowExpand(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </LoadingOverlay>
    </div>,
    stickyScrollbar && (
      <div
        ref={hscrollProxyRef}
        className={cx('hscroll-proxy', !hscrollNeeded && 'hscroll-hidden')}
        aria-hidden="true"
      >
        <div className="hscroll-spacer" style={{ width: `${hscrollContentWidth}px` }}></div>
      </div>
    ),
    effPageSize != null && (
      <div className="pagination-footer">
        <Pagination
          total={filteredData.length}
          pageSize={effPageSize}
          pageSizeOptions={pageSizeOptions}
          currentPage={effPage}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    ),
    selectable && someSelected && (
      <div className="bulk-bar">
        <span className="count">{effSelectedIds.size} selected</span>

        <span className="sep"></span>

        {bulkActions}
      </div>
    ),
  );
}
