import {
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { IconComponent } from '../../icons/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { PopoverComponent } from '../popover/popover.component';
import { MenuComponent } from '../menu/menu.component';
import { MenuItemComponent } from '../menu/menu-item.component';
import { CellTemplateDirective } from './cell-template.directive';
import type {
  SortChangeEvent,
  SortDir,
  TableCellEditEvent,
  TableColumn,
  TableRowAction,
  TableRowActionEvent,
} from './table.types';

const NUMERIC = /^-?\d+(\.\d+)?$/;

/** Rendered values that read as "no data" — sorted last in EITHER direction, so
 *  a descending sort does not fill the first screen with empty rows. Matched
 *  case-insensitively; mirrors the set mm-broker had to maintain itself. */
const BLANK_CELL = new Set(['', '—', '-', '–', 'n/a', 'never', 'none']);

/** Normalises "no data" to a single `null`, so the comparator has one blank
 *  case to test and TypeScript narrows the rest without a cast. */
function sortableOf(
  value: string | number | Date | null | undefined,
): string | number | Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' && BLANK_CELL.has(value.trim().toLowerCase())) {
    return null;
  }

  return value;
}

/** Both sides are known non-blank here. Dates and numbers compare numerically;
 *  anything else falls back to text, where `numeric: true` keeps "item 10" after
 *  "item 9" instead of before it. */
function compareSortValues(
  first: string | number | Date,
  second: string | number | Date,
): number {
  if (first instanceof Date && second instanceof Date) {
    return first.getTime() - second.getTime();
  }
  if (typeof first === 'number' && typeof second === 'number') {
    return first - second;
  }

  const firstText = String(first);
  const secondText = String(second);
  if (NUMERIC.test(firstText) && NUMERIC.test(secondText)) {
    return Number(firstText) - Number(secondText);
  }

  return firstText.localeCompare(secondText, undefined, { numeric: true });
}

@Component({
  selector: 'ds-table',
  standalone: true,
  imports: [
    IconComponent,
    NgTemplateOutlet,
    SkeletonComponent,
    PaginationComponent,
    LoadingOverlayComponent,
    PopoverComponent,
    MenuComponent,
    MenuItemComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.bordered]': 'bordered()',
    '[class.selectable]': 'selectable()',
    '[class.pinned]': 'stickyFirstColumn()',
    '[class.expandable]': 'expandableRows()',
    '[class.sticky-scrollbar]': 'stickyScrollbar()',
    '[class.resizable]': 'resizableColumns()',
  },
})
export class TableComponent<T extends object> {
  /** Rows to render. */
  readonly data = input.required<readonly T[]>();
  /** Row identity used for tracking, selection, expansion and the active-row
   *  highlight. Defaults to `row.id`; pass an accessor for display-only data
   *  with no natural key (`[rowId]="row => row.channel + row.sentAt"`), which
   *  beats mapping synthetic ids into the data just to satisfy the table. */
  readonly rowId = input<((row: T) => string) | null>(null);
  /** Column definitions driving headers, cells and sorting. */
  readonly columns = input.required<readonly TableColumn<T>[]>();
  /** Adds a checkbox column for row/select-all selection. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Opt-in outer border + radius. Off by default so tables flush inside a
   *  `<ds-card padding="none">` (workspaces, programs-list) don't double-border.
   *  When `true`, the scroll-wrap gets a `var(--border-default)` outline and
   *  `var(--radius-md)` radius — useful when the table stands alone in a padded card. */
  readonly bordered = input(false, { transform: booleanAttribute });
  /** false  — no loading state.
   *  'skeleton' — first-load placeholder; rows are replaced with shimmer
   *  rows that read the global --skeleton-shimmer-x driver.
   *  'overlay'  — re-fetch indicator; existing rows stay visible behind
   *  a translucent overlay with a centred spinner. */
  readonly loading = input<false | 'skeleton' | 'overlay'>(false);
  /** Keeps the header row pinned while the body scrolls. */
  readonly stickyHeader = input(true, { transform: booleanAttribute });
  /** Caps the scroll body height (any CSS length, e.g. `'320px'`) and scrolls it
   *  vertically — pair with `stickyHeader` for a self-contained scroll region.
   *  `null` (default) lets the table grow to its content. */
  readonly maxHeight = input<string | null>(null);
  /** Row density — `'compact'` tightens cell padding for spreadsheet-dense lists. */
  readonly density = input<'default' | 'compact'>('default');
  /** Tints odd rows for easier row-tracking across wide tables. */
  readonly zebra = input(false, { transform: booleanAttribute });
  /** Animate the body height when the row set changes (page/filter) instead of
   *  snapping. Opt-in; instant under reduced-motion (the DS zeroes the token). */
  readonly animateHeight = input(false, { transform: booleanAttribute });
  /** Two-way set of currently selected row ids. */
  readonly selectedIds = model<Set<string>>(new Set<string>());
  /** Column key currently sorted by; `null` when unsorted. */
  readonly sortKey = model<string | null>(null);
  /** Sort direction for `sortKey`. */
  readonly sortDir = model<SortDir>(null);
  /** Sort states a column cycles through on click. Default includes null
   *  (unsorted); pass ['asc','desc'] to forbid the unsorted state (e.g.
   *  server-paged lists). */
  readonly sortingOrder = input<SortDir[]>(['asc', 'desc', null]);
  /** Number of shimmer rows rendered while `loading` is `'skeleton'`. */
  readonly skeletonRows = input<number>(5);
  /** Accessible name for the table (rendered as a visually-hidden caption).
   *  Without it, screen-reader users get an unlabelled table. */
  readonly caption = input<string>('');
  /** When true, each row becomes a keyboard-operable control (role=button,
   *  tabindex, Enter/Space → rowClicked) with an accessible name from the first
   *  column. Off by default so non-navigating tables don't advertise a false
   *  click affordance. Also the gate for the hover/pressed row tints. */
  readonly rowInteractive = input(false, { transform: booleanAttribute });

  /** Id of the row rendered as current (highlight + `aria-current`) — e.g. the
   *  row whose detail drawer or side panel is open. `null` — none. */
  readonly activeRowId = input<string | null>(null);

  /** Client-side row filter — case-insensitive substring match against cell
   *  text. Columns with `filterable: true` restrict the match set (none
   *  marked — every column matches, hidden ones included). '' — no filtering. */
  readonly filterQuery = input<string>('');
  /** Two-way per-column set-filters: column key → the still-checked values.
   *  A column absent from the map (or with every value checked) is unfiltered. */
  readonly columnFilters = model<Map<string, ReadonlySet<string>>>(new Map());

  /** Two-way set of hidden column keys. `null` (default) derives the set from
   *  each column's `hidden` flag; the column picker then owns it. Binding a
   *  Set takes over — `hidden` flags are ignored. */
  readonly hiddenKeys = model<Set<string> | null>(null);

  /** Enables drag-to-resize handles on each column header. */
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  /** Two-way per-column pixel width overrides (keyed by column key), set by
   *  dragging a resize handle. Seeded from `column.width` where unset. */
  readonly columnWidths = model<Map<string, number>>(new Map());
  /** Enables drag + up/down reordering in the column panel. */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  /** Two-way column order as a list of keys. `null` (default) keeps declaration
   *  order; the column panel owns it once the user reorders. Keys absent from
   *  the list fall back to declaration order after the listed ones. */
  readonly columnOrder = model<string[] | null>(null);

  /** Keeps the horizontal scrollbar reachable on tall tables: the scroll
   *  container's native bar is hidden and a proxy stuck to the bottom of the
   *  nearest scroll ancestor mirrors it both ways. Off by default. */
  readonly stickyScrollbar = input(false, { transform: booleanAttribute });

  /** Rows per page. `null` (default) disables pagination — all rows render. */
  readonly pageSize = model<number | null>(null);
  /** Current 1-based page. Only meaningful when `pageSize()` is set. */
  readonly page = model<number>(1);
  /** Selectable page-size choices shown in the pagination control. */
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  /** Server-side total row count. `null` (default) = client paging: the table
   *  slices `data()` itself and the pager counts the rows in hand. When set, the
   *  host has already sliced to one page — the pager uses this count and the
   *  table renders `data()` as-is (no internal slice). */
  readonly total = input<number | null>(null);
  /** Scroll the table into view on a page change (opt-in) — keeps a bottom
   *  pager from leaving the viewport on the previous page's last rows. */
  readonly scrollToTopOnPageChange = input(false, {
    transform: booleanAttribute,
  });
  /** When true, the table sorts `data()` itself; otherwise it only emits
   *  `sortChange` and leaves ordering to the consumer (default). */
  readonly clientSort = input(false, { transform: booleanAttribute });
  /** Pin the first data column (and the select column) on horizontal scroll. */
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });

  /** Fires with the row on click (or Enter/Space when `rowInteractive`). */
  readonly rowClicked = output<T>();
  /** Fires whenever sort key/direction changes, regardless of `clientSort`. */
  readonly sortChange = output<SortChangeEvent>();

  /** Row-action menu items rendered as a trailing kebab (⋮) column.
   *  Empty (default) — no column. Menu clicks never trigger `rowClicked`. */
  readonly rowActions = input<readonly TableRowAction<T>[]>([]);
  /** Fires with the chosen action and its row when a kebab menu item is selected. */
  readonly rowActionSelected = output<TableRowActionEvent<T>>();

  /** Fires when an `editable` cell is committed (Enter or blur) with the new value. */
  readonly cellEdited = output<TableCellEditEvent<T>>();

  /** Cell templates supplied as an explicit map instead of (or in addition to)
   *  projected `dsCellTemplate` directives. Lets a wrapper component collect
   *  the directives itself and pass them down, since content projected through
   *  a wrapper's `<ng-content>` is not seen by this component's content query.
   *  Entries here override projected ones. */
  readonly cellTemplateMap = input<
    Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>>
  >({});

  /** Empty-state template, as an alternative to the `[empty]` content slot —
   *  again for wrappers that can't rely on slot re-projection. */
  readonly emptyTemplate = input<TemplateRef<unknown> | null>(null);

  /** When true, each row renders a leading chevron button that toggles an
   *  inline expansion panel below it. */
  readonly expandableRows = input(false, { transform: booleanAttribute });

  /** Two-way set of currently expanded row ids. */
  readonly expandedIds = model<Set<string>>(new Set<string>());

  /** Template rendered inside an expanded row's panel.
   *  Context: `$implicit` = row, `row` = row. */
  readonly rowExpandTemplate = input<TemplateRef<{
    $implicit: unknown;
    row: unknown;
  }> | null>(null);

  protected readonly cellTemplateDirectives = contentChildren(
    CellTemplateDirective,
  );

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>>
  >(() => {
    const map: Record<
      string,
      TemplateRef<{ $implicit: unknown; row: unknown }>
    > = {};
    for (const dir of this.cellTemplateDirectives()) {
      map[dir.dsCellTemplate()] = dir.template;
    }

    return { ...map, ...this.cellTemplateMap() };
  });

  protected cellTemplate(
    col: TableColumn<T>,
  ): TemplateRef<{ $implicit: unknown; row: unknown }> | null {
    return this.cellTemplates()[col.key] ?? null;
  }

  protected readonly tableClasses = computed(() => {
    const parts = ['table'];
    if (this.loading() === 'skeleton') {
      parts.push('skeleton-mode');
    }
    if (this.stickyHeader()) {
      parts.push('sticky-header');
    }
    if (this.density() === 'compact') {
      parts.push('compact');
    }
    if (this.zebra()) {
      parts.push('zebra');
    }

    return parts.join(' ');
  });

  protected readonly isSkeletonLoading = computed(
    () => this.loading() === 'skeleton',
  );
  protected readonly isOverlayLoading = computed(
    () => this.loading() === 'overlay',
  );

  protected readonly effectiveHiddenKeys = computed<ReadonlySet<string>>(
    () =>
      this.hiddenKeys() ??
      new Set(
        this.columns()
          .filter((col) => col.hidden)
          .map((col) => col.key),
      ),
  );

  /** Columns in the user-controlled order — `columnOrder` first (dropping
   *  unknown keys), then any declared column the order omitted. */
  protected readonly orderedColumns = computed<readonly TableColumn<T>[]>(
    () => {
      const order = this.columnOrder();
      const columns = this.columns();
      if (!order) {
        return columns;
      }
      const byKey = new Map(columns.map((col) => [col.key, col]));
      const placed = new Set<string>();
      const out: TableColumn<T>[] = [];
      for (const key of order) {
        const col = byKey.get(key);
        if (col && !placed.has(key)) {
          out.push(col);
          placed.add(key);
        }
      }
      for (const col of columns) {
        if (!placed.has(col.key)) {
          out.push(col);
        }
      }

      return out;
    },
  );

  /** Columns actually rendered — reordered, then hidden ones skipped. */
  protected readonly visibleColumns = computed<readonly TableColumn<T>[]>(() =>
    this.orderedColumns().filter(
      (col) => !this.effectiveHiddenKeys().has(col.key),
    ),
  );

  /** Columns the user may toggle — drives the header column picker. */
  protected readonly hideableColumns = computed<readonly TableColumn<T>[]>(() =>
    this.columns().filter((col) => col.hideable),
  );
  protected readonly hasColumnPicker = computed(
    () => this.hideableColumns().length > 0 || this.reorderableColumns(),
  );
  /** The trailing utility column hosts the picker button and/or row kebabs. */
  protected readonly hasUtilityColumn = computed(
    () => this.hasRowActions() || this.hasColumnPicker(),
  );

  protected isColumnVisible(col: TableColumn<T>): boolean {
    return !this.effectiveHiddenKeys().has(col.key);
  }

  /** The last visible column can't be hidden — an all-hidden grid is useless. */
  protected isColumnLocked(col: TableColumn<T>): boolean {
    return this.isColumnVisible(col) && this.visibleColumns().length === 1;
  }

  protected toggleColumn(col: TableColumn<T>): void {
    if (!col.hideable || this.isColumnLocked(col)) {
      return;
    }
    const next = new Set(this.effectiveHiddenKeys());
    if (next.has(col.key)) {
      next.delete(col.key);
    } else {
      next.add(col.key);
    }
    this.hiddenKeys.set(next);
  }

  protected moveColumn(col: TableColumn<T>, delta: -1 | 1): void {
    const keys = this.orderedColumns().map((column) => column.key);
    const from = keys.indexOf(col.key);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= keys.length) {
      return;
    }
    moveItemInArray(keys, from, to);
    this.columnOrder.set(keys);
  }

  protected onColumnDrop(event: CdkDragDrop<unknown>): void {
    const keys = this.orderedColumns().map((column) => column.key);
    moveItemInArray(keys, event.previousIndex, event.currentIndex);
    this.columnOrder.set(keys);
  }

  protected resetColumns(): void {
    this.columnOrder.set(null);
    this.hiddenKeys.set(null);
    this.columnWidths.set(new Map());
  }

  private readonly columnFilterPopover = viewChild<PopoverComponent>(
    'columnFilterPopover',
  );
  /** The column whose filter menu is open — drives the distinct-value list. */
  protected readonly filterColumn = signal<TableColumn<T> | null>(null);
  protected readonly filterSearch = signal('');

  protected hasColumnFilter(col: TableColumn<T>): boolean {
    return col.filter === 'set';
  }

  /** A column is "actively filtered" when at least one of its values is unchecked. */
  protected isColumnFiltered(col: TableColumn<T>): boolean {
    const allowed = this.columnFilters().get(col.key);

    return !!allowed && allowed.size < this.distinctValuesOf(col).length;
  }

  private distinctValuesOf(col: TableColumn<T>): string[] {
    const seen = new Set<string>();
    for (const row of this.data()) {
      seen.add(this.cellValue(row, col));
    }

    return [...seen].sort((a, b) => a.localeCompare(b));
  }

  /** Distinct values of the open column, narrowed by the popover search box. */
  protected readonly filterValues = computed<string[]>(() => {
    const col = this.filterColumn();
    if (!col) {
      return [];
    }
    const needle = this.filterSearch().trim().toLowerCase();
    const values = this.distinctValuesOf(col);

    return needle
      ? values.filter((value) => value.toLowerCase().includes(needle))
      : values;
  });

  protected readonly filterSelectedCount = computed<number>(() => {
    const col = this.filterColumn();
    if (!col) {
      return 0;
    }
    const allowed = this.columnFilters().get(col.key);

    return allowed ? allowed.size : this.distinctValuesOf(col).length;
  });

  protected isFilterValueChecked(value: string): boolean {
    const col = this.filterColumn();
    if (!col) {
      return false;
    }
    const allowed = this.columnFilters().get(col.key);

    return !allowed || allowed.has(value);
  }

  protected onColumnFilterClick(col: TableColumn<T>, event: Event): void {
    event.stopPropagation();
    this.filterColumn.set(col);
    this.filterSearch.set('');
    this.columnFilterPopover()?.toggle(event.currentTarget as HTMLElement);
  }

  protected onFilterSearch(event: Event): void {
    this.filterSearch.set((event.target as HTMLInputElement).value);
  }

  protected toggleFilterValue(value: string): void {
    const col = this.filterColumn();
    if (!col) {
      return;
    }
    const distinct = this.distinctValuesOf(col);
    const current = new Set(this.columnFilters().get(col.key) ?? distinct);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    const next = new Map(this.columnFilters());
    // Every value checked again → drop the entry so the column reads unfiltered.
    if (current.size >= distinct.length) {
      next.delete(col.key);
    } else {
      next.set(col.key, current);
    }
    this.columnFilters.set(next);
  }

  protected clearColumnFilter(): void {
    const col = this.filterColumn();
    if (!col) {
      return;
    }
    const next = new Map(this.columnFilters());
    next.delete(col.key);
    this.columnFilters.set(next);
  }

  private readonly injector = inject(Injector);
  private readonly editInput =
    viewChild<ElementRef<HTMLInputElement>>('editInput');
  protected readonly editingCell = signal<{
    rowId: string;
    key: string;
  } | null>(null);
  protected readonly editDraft = signal('');

  protected isEditing(row: T, col: TableColumn<T>): boolean {
    const cell = this.editingCell();

    return !!cell && cell.rowId === this.rowKey(row) && cell.key === col.key;
  }

  protected startEdit(row: T, col: TableColumn<T>, event: Event): void {
    if (!col.editable) {
      return;
    }
    event.stopPropagation();
    this.editDraft.set(this.cellValue(row, col));
    this.editingCell.set({ rowId: this.rowKey(row), key: col.key });
    afterNextRender(
      () => {
        const input = this.editInput()?.nativeElement;
        input?.focus();
        input?.select();
      },
      { injector: this.injector },
    );
  }

  protected onEditInput(event: Event): void {
    this.editDraft.set((event.target as HTMLInputElement).value);
  }

  protected commitEdit(row: T, col: TableColumn<T>): void {
    if (!this.isEditing(row, col)) {
      return;
    }
    this.editingCell.set(null);
    this.cellEdited.emit({ row, key: col.key, value: this.editDraft() });
  }

  protected cancelEdit(): void {
    this.editingCell.set(null);
  }

  private static readonly MIN_COLUMN_WIDTH = 48;
  private resizeState: {
    key: string;
    startX: number;
    startWidth: number;
  } | null = null;

  /** Resolved pixel width for a column: a drag override wins, else `column.width`. */
  protected columnWidth(col: TableColumn<T>): number | null {
    return this.columnWidths().get(col.key) ?? col.width ?? null;
  }

  protected onResizeStart(col: TableColumn<T>, event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const header = (event.target as HTMLElement).closest('th');
    if (!header) {
      return;
    }
    this.resizeState = {
      key: col.key,
      startX: event.clientX,
      startWidth: header.offsetWidth,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onResizeMove(event: PointerEvent): void {
    if (!this.resizeState) {
      return;
    }
    const width = Math.max(
      TableComponent.MIN_COLUMN_WIDTH,
      this.resizeState.startWidth + (event.clientX - this.resizeState.startX),
    );
    const next = new Map(this.columnWidths());
    next.set(this.resizeState.key, Math.round(width));
    this.columnWidths.set(next);
  }

  protected onResizeEnd(): void {
    this.resizeState = null;
  }

  /** Client-side filter over the full data set — combines the `filterQuery`
   *  substring search with any per-column set filters. Sorting and pagination
   *  run on the filtered rows. */
  protected readonly filteredData = computed<readonly T[]>(() => {
    const query = this.filterQuery().trim().toLowerCase();
    const setFilters = this.columnFilters();
    const columns = this.columns();
    if (!query && setFilters.size === 0) {
      return this.data();
    }
    const marked = columns.filter((col) => col.filterable);
    const scope = marked.length ? marked : columns;
    const activeSetFilters = [...setFilters]
      .map(([key, allowed]) => ({
        col: columns.find((col) => col.key === key),
        allowed,
      }))
      .filter(
        (
          entry,
        ): entry is { col: TableColumn<T>; allowed: ReadonlySet<string> } =>
          !!entry.col,
      );

    return this.data().filter((row) => {
      if (
        query &&
        !scope.some((col) =>
          this.cellValue(row, col).toLowerCase().includes(query),
        )
      ) {
        return false;
      }

      return activeSetFilters.every(({ col, allowed }) =>
        allowed.has(this.cellValue(row, col)),
      );
    });
  });

  /** Client-side sort over the filtered data set — only when `clientSort()`. */
  protected readonly sortedData = computed<readonly T[]>(() => {
    const rows = this.filteredData();
    if (!this.clientSort()) {
      return rows;
    }
    const key = this.sortKey();
    const dir = this.sortDir();
    if (!key || !dir) {
      return rows;
    }
    const column = this.columns().find((col) => col.key === key);
    if (!column) {
      return rows;
    }

    const direction = dir === 'asc' ? 1 : -1;
    const sortValue = column.sortValue;

    return rows.slice().sort((a, b) => {
      const aValue = sortableOf(
        sortValue ? sortValue(a) : this.cellValue(a, column),
      );
      const bValue = sortableOf(
        sortValue ? sortValue(b) : this.cellValue(b, column),
      );

      // Blanks sink in BOTH directions, so `direction` is deliberately not
      // applied to this branch — a descending sort must not open with a screen
      // of empty rows.
      if (aValue === null || bValue === null) {
        if (aValue === null && bValue === null) {
          return 0;
        }

        return aValue === null ? 1 : -1;
      }

      return compareSortValues(aValue, bValue) * direction;
    });
  });

  /** Current page's slice of the sorted rows, when paginating. */
  protected readonly pagedData = computed<readonly T[]>(() => {
    const size = this.pageSize();
    // Server-side paging (`total` set): the host already sliced to one page.
    if (size === null || this.total() !== null) {
      return this.sortedData();
    }
    const start = (this.page() - 1) * size;

    return this.sortedData().slice(start, start + size);
  });

  /** Rows actually rendered: paged when paginating, else sorted/raw data. */
  protected readonly displayData = computed<readonly T[]>(() =>
    this.pageSize() !== null ? this.pagedData() : this.sortedData(),
  );

  protected readonly allSelected = computed(() => {
    const data = this.displayData();
    if (data.length === 0) {
      return false;
    }
    const sel = this.selectedIds();

    return data.every((row) => sel.has(this.rowKey(row)));
  });

  protected readonly someSelected = computed(() => {
    const data = this.displayData();
    const sel = this.selectedIds();

    return data.some((row) => sel.has(this.rowKey(row))) && !this.allSelected();
  });

  /** Select-all is page-scoped only when paginating. */
  protected readonly selectAllLabel = computed(() =>
    this.pageSize() !== null
      ? 'Select all rows on this page'
      : 'Select all rows',
  );

  protected readonly skeletonArray = computed(() =>
    Array(this.skeletonRows()).fill(0),
  );

  /** Total colspan for the expanded-row panel: data cols + optional select/expand/actions cols. */
  protected readonly expandedColspan = computed(() => {
    let count = this.visibleColumns().length;
    if (this.selectable()) {
      count += 1;
    }
    if (this.expandableRows()) {
      count += 1;
    }
    if (this.hasUtilityColumn()) {
      count += 1;
    }

    return count;
  });

  protected readonly hasRowActions = computed(
    () => this.rowActions().length > 0,
  );
  /** Row whose kebab menu is open — drives the per-row `disabled` predicates. */
  protected readonly menuRow = signal<T | null>(null);
  private readonly rowMenuPopover =
    viewChild<PopoverComponent>('rowMenuPopover');
  private readonly columnPickerPopover = viewChild<PopoverComponent>(
    'columnPickerPopover',
  );

  protected readonly columnPickerOpened = computed(
    () => this.columnPickerPopover()?.opened() ?? false,
  );

  protected onColumnPickerClick(event: Event): void {
    this.columnPickerPopover()?.toggle(event.currentTarget as HTMLElement);
  }

  protected readonly hasTruncate = computed(() =>
    this.columns().some((col) => col.truncate),
  );
  private readonly cellTextPopover =
    viewChild<PopoverComponent>('cellTextPopover');
  protected readonly cellPopoverText = signal('');

  /** Click on a `truncate` cell: when the text is actually clipped, show the
   *  full value in a popover; otherwise let the click fall through to the row. */
  protected onCellClipClick(row: T, col: TableColumn<T>, event: Event): void {
    const element = event.currentTarget as HTMLElement;
    if (element.scrollWidth <= element.clientWidth) {
      return;
    }
    event.stopPropagation();
    this.cellPopoverText.set(this.cellValue(row, col));
    this.cellTextPopover()?.toggle(element);
  }

  private readonly scrollWrap =
    viewChild.required<ElementRef<HTMLElement>>('scrollWrap');
  private readonly hscrollProxy =
    viewChild<ElementRef<HTMLElement>>('hscrollProxy');
  protected readonly hscrollContentWidth = signal(0);
  protected readonly hscrollNeeded = signal(false);

  constructor() {
    // Wire the proxy whenever it exists (stickyScrollbar on). Assigning an
    // equal scrollLeft fires no scroll event, so the two mirrors can't loop.
    effect((onCleanup) => {
      const proxy = this.hscrollProxy()?.nativeElement;
      if (!proxy) {
        return;
      }
      const wrap = this.scrollWrap().nativeElement;
      const fromWrap = (): void => {
        proxy.scrollLeft = wrap.scrollLeft;
      };
      const fromProxy = (): void => {
        wrap.scrollLeft = proxy.scrollLeft;
      };
      wrap.addEventListener('scroll', fromWrap, { passive: true });
      proxy.addEventListener('scroll', fromProxy, { passive: true });
      const measure = (): void => {
        this.hscrollContentWidth.set(wrap.scrollWidth);
        this.hscrollNeeded.set(wrap.scrollWidth > wrap.clientWidth + 1);
      };
      // The wrap's own box never changes with content — watch the table too
      // (column toggles, data swaps change its width).
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(wrap);
      const table = wrap.querySelector('table');
      if (table) {
        resizeObserver.observe(table);
      }
      measure();
      onCleanup(() => {
        wrap.removeEventListener('scroll', fromWrap);
        proxy.removeEventListener('scroll', fromProxy);
        resizeObserver.disconnect();
      });
    });

    // Opt-in height tween. Observer fires pre-paint: freezing the old height
    // here stops the jump being painted; disconnect during the anim so its own
    // resizes don't re-trigger it; clip (not hidden) avoids a scroll container.
    effect((onCleanup) => {
      if (!this.animateHeight()) {
        return;
      }
      const wrap = this.scrollWrap().nativeElement;
      let previousHeight: number | null = null;
      let previousWidth: number | null = null;
      let heightAnim: Animation | null = null;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const box = entry.borderBoxSize?.[0];
        const nextHeight = box ? box.blockSize : entry.contentRect.height;
        const nextWidth = box ? box.inlineSize : entry.contentRect.width;
        const fromHeight = previousHeight;
        const widthChanged = nextWidth !== previousWidth;
        previousHeight = nextHeight;
        previousWidth = nextWidth;
        // Only a height change at a stable width is a row-set swap; skip the
        // first measure and width-driven reflows (window/column resize) so the
        // tween doesn't chase a resize.
        if (fromHeight === null || widthChanged || nextHeight === fromHeight) {
          return;
        }
        const styles = getComputedStyle(wrap);
        const duration = this.parseDurationMs(
          styles.getPropertyValue('--duration-base'),
        );
        if (duration <= 0) {
          return;
        }
        observer.disconnect();
        heightAnim?.cancel();
        wrap.style.height = `${fromHeight}px`;
        wrap.style.overflowY = 'clip';
        heightAnim = wrap.animate(
          [{ height: `${fromHeight}px` }, { height: `${nextHeight}px` }],
          {
            duration,
            easing:
              styles.getPropertyValue('--ease-standard').trim() || 'ease-out',
          },
        );
        heightAnim.onfinish = heightAnim.oncancel = () => {
          heightAnim = null;
          wrap.style.height = '';
          wrap.style.overflowY = '';
          observer.observe(wrap);
        };
      });
      observer.observe(wrap);
      onCleanup(() => {
        if (heightAnim) {
          heightAnim.onfinish = heightAnim.oncancel = null;
          heightAnim.cancel();
          heightAnim = null;
        }
        wrap.style.height = '';
        wrap.style.overflowY = '';
        observer.disconnect();
      });
    });

    // Client-side paging only (with `total` set the host owns the clamp): when a
    // filter shrinks the result set below the current page, pull `page` back to
    // the last page that still has rows so the body never renders empty.
    effect(() => {
      const size = this.pageSize();
      if (size === null || this.total() !== null) {
        return;
      }
      const lastPage = Math.max(
        1,
        Math.ceil(this.filteredData().length / size),
      );
      if (this.page() > lastPage) {
        this.page.set(lastPage);
      }
    });

    let previousPage = this.page();
    effect(() => {
      const current = this.page();
      const enabled = this.scrollToTopOnPageChange();
      if (current !== previousPage && enabled) {
        this.scrollWrap().nativeElement.scrollIntoView({ block: 'start' });
      }
      previousPage = current;
    });
  }

  private parseDurationMs(raw: string): number {
    const value = raw.trim();
    if (value.endsWith('ms')) {
      return parseFloat(value);
    }
    if (value.endsWith('s')) {
      return parseFloat(value) * 1000;
    }

    return parseFloat(value) || 0;
  }

  protected onRowMenuClick(row: T, event: Event): void {
    event.stopPropagation();
    this.menuRow.set(row);
    this.rowMenuPopover()?.toggle(event.currentTarget as HTMLElement);
  }

  protected isMenuOpenFor(row: T): boolean {
    return this.menuRow() === row && !!this.rowMenuPopover()?.opened();
  }

  protected isActionDisabled(action: TableRowAction<T>): boolean {
    const row = this.menuRow();

    return row !== null && !!action.disabled?.(row);
  }

  protected onRowAction(action: TableRowAction<T>): void {
    const row = this.menuRow();
    if (row === null) {
      return;
    }
    this.rowActionSelected.emit({ action, row });
  }

  protected isExpanded(row: T): boolean {
    return this.expandedIds().has(this.rowKey(row));
  }

  protected onToggleExpand(row: T, event: Event): void {
    event.stopPropagation();
    const next = new Set<string>(this.expandedIds());
    if (next.has(this.rowKey(row))) {
      next.delete(this.rowKey(row));
    } else {
      next.add(this.rowKey(row));
    }
    this.expandedIds.set(next);
  }

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(this.rowKey(row));
  }

  protected onToggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>(this.selectedIds());
    if (checked) {
      this.displayData().forEach((row) => next.add(this.rowKey(row)));
    } else {
      this.displayData().forEach((row) => next.delete(this.rowKey(row)));
    }
    this.selectedIds.set(next);
  }

  protected onToggleRow(row: T, event: Event): void {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>(this.selectedIds());
    if (checked) {
      next.add(this.rowKey(row));
    } else {
      next.delete(this.rowKey(row));
    }
    this.selectedIds.set(next);
  }

  private selectionBeforeGesture = '';

  protected onRowMousedown(): void {
    this.selectionBeforeGesture = window.getSelection()?.toString() ?? '';
  }

  protected onRowClick(row: T, event: Event): void {
    if ((event.target as HTMLElement).closest('input')) {
      return;
    }
    // Only a selection created by this gesture blocks the click — a stale one
    // mousedown can't collapse (user-select:none content) must not wedge rows.
    const selection = window.getSelection()?.toString() ?? '';
    if (selection && selection !== this.selectionBeforeGesture) {
      return;
    }
    this.rowClicked.emit(row);
  }

  protected onRowKey(row: T, event: Event): void {
    if (!this.rowInteractive()) {
      return;
    }
    event.preventDefault();
    this.rowClicked.emit(row);
  }

  /** Accessible name for an interactive row, taken from the first visible column. */
  protected rowAriaLabel(row: T): string {
    const first = this.visibleColumns()[0];

    return first ? this.cellValue(row, first) : '';
  }

  /** `aria-sort` value for a header: only meaningful on sortable columns. */
  /** Row identity — the `rowId` accessor when given, else `row.id`. Public so a
   *  host reading `selectedIds`/`expandedIds` can compute the same keys. */
  rowKey(row: T): string {
    const accessor = this.rowId();
    if (accessor) {
      return accessor(row);
    }

    return String((row as { id?: unknown }).id ?? '');
  }

  protected ariaSort(
    col: TableColumn<T>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) {
      return null;
    }
    if (this.sortKey() === col.key && this.sortDir()) {
      return this.sortDir() === 'asc' ? 'ascending' : 'descending';
    }

    return 'none';
  }

  protected onSort(col: TableColumn<T>): void {
    if (!col.sortable) {
      return;
    }
    const order = this.sortingOrder();
    const currentKey = this.sortKey();
    let dir: SortDir;
    if (currentKey !== col.key) {
      dir = order[0] ?? null;
    } else {
      const currentIndex = order.indexOf(this.sortDir());
      dir = order[(currentIndex + 1) % order.length] ?? null;
    }
    // The key survives "unsorted" (`sortDir === null` alone means that): nulling
    // it desynced a host that maps off back to its own default sort, because on
    // the default column that write is a no-op for Angular's binding diff.
    this.sortKey.set(col.key);
    this.sortDir.set(dir);
    this.sortChange.emit({ key: col.key, dir });
  }

  protected headerClasses(col: TableColumn<T>): string {
    const parts: string[] = [];
    if (col.sortable) {
      parts.push('sortable');
    }
    if (this.sortKey() === col.key && this.sortDir()) {
      parts.push(`sorted-${this.sortDir()}`);
    }

    return parts.join(' ');
  }

  protected sortIcon(col: TableColumn<T>): 'sortAsc' | 'sortDesc' | 'sort' {
    if (this.sortKey() !== col.key || !this.sortDir()) {
      return 'sort';
    }

    return this.sortDir() === 'asc' ? 'sortAsc' : 'sortDesc';
  }

  protected cellValue(row: T, col: TableColumn<T>): string {
    if (col.cell) {
      return col.cell(row);
    }

    return String((row as Record<string, unknown>)[col.key] ?? '');
  }

  /** Exports the visible columns of the filtered + sorted rows (all rows, not
   *  just the current page) as a CSV download. Call from a consumer button:
   *  `<ds-button (pressed)="table.exportCsv()">`. */
  exportCsv(filename = 'table.csv'): void {
    if (typeof document === 'undefined') {
      return;
    }
    const columns = this.visibleColumns();
    const escapeCell = (value: string): string =>
      /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const header = columns.map((col) => escapeCell(col.label));
    const body = this.sortedData().map((row) =>
      columns.map((col) => escapeCell(this.cellValue(row, col))),
    );
    // Leading BOM so Excel reads UTF-8 (accented labels/values) correctly.
    const csv =
      '﻿' + [header, ...body].map((cells) => cells.join(',')).join('\r\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Deterministic per-cell width so skeleton rows look organic but stable
   *  across re-renders. Mixes column key + row index into one of five widths. */
  protected skeletonWidth(col: TableColumn<T>, rowIndex: number): string {
    const seed = `${col.key}-${rowIndex}`;
    let hash = 0;
    for (let charIndex = 0; charIndex < seed.length; charIndex++) {
      hash = (hash + seed.charCodeAt(charIndex)) | 0;
    }
    const widths = ['45%', '55%', '65%', '75%', '85%'];

    return widths[Math.abs(hash) % widths.length] ?? '70%';
  }
}
