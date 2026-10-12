import {
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { devWarn } from '@ids-group-ltd/ids-design-system/core';
import { reportDevWarning } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  DsSize,
  PaginationLayout,
} from '@ids-group-ltd/ids-design-system/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { PaginationComponent } from '@ids-group-ltd/ids-design-system/components/pagination';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { PopoverComponent } from '@ids-group-ltd/ids-design-system/components/popover';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import { DefinitionTermDirective } from '@ids-group-ltd/ids-design-system/components/definition-term';
import { MenuComponent } from '@ids-group-ltd/ids-design-system/components/menu';
import { MenuItemComponent } from '@ids-group-ltd/ids-design-system/components/menu';
import { MenuDividerComponent } from '@ids-group-ltd/ids-design-system/components/menu';
import { CellTemplateDirective } from './cell-template.directive';
import { HeaderFilterDirective } from './header-filter.directive';
import { DsTableLayout } from './table-layout';
import type {
  SortChangeEvent,
  SortDirection,
  TableCellEditEvent,
  TableColumn,
  TableColumnKind,
  TableRowAction,
  TableRowActionEvent,
  TableExpandMode,
  TableFilterMode,
  TableSortMode,
} from './table.types';

const NUMERIC = /^-?\d+(\.\d+)?$/;

const VIRTUAL_FALLBACK_HEIGHT = 720;

const VIRTUAL_OVERSCAN = 6;

/** Column width by kind, padding included; a wider header label widens it. */
const KIND_WIDTH_PX: Readonly<
  Record<Exclude<TableColumnKind, 'text'>, number>
> = {
  id: 130,
  date: 130,
  number: 120,
  status: 110,
};

/** Text width of a `truncate` text column without `minWidth` in a table that scrolls anyway. */
const SCROLLING_CLIP_TEXT_PX = 240;

interface HeaderMetrics {
  /** Each data column's header at its max-content width, padding included. */
  readonly floors: ReadonlyMap<string, number>;
  readonly utilityWidth: number;
  readonly cellPadding: number;
  readonly tableMinWidth: number;
}

const BLANK_CELL = new Set(['', '—', '-', '–', 'n/a', 'never', 'none']);

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

/** Both sides are known non-blank here. */
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

  // `sensitivity: 'base'` so "Ångström" sorts next to "Angstrom" and casing does
  // not split a column into two runs.
  return firstText.localeCompare(secondText, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
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
    TooltipDirective,
    DefinitionTermDirective,
    MenuComponent,
    MenuItemComponent,
    MenuDividerComponent,
    // Only instantiated when a column sets `link`, so an app without a router still renders.
    RouterLink,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.bordered]': 'borderedResolved()',
    '[class.selectable]': 'selectable()',
    '[class.pinned]': 'stickyFirstColumn()',
    '[class.expandable]': 'expandableRows()',
    '[class.sticky-scrollbar]': 'stickyScrollbarResolved()',
    '[class.resizable]': 'layout.resize() !== null',
  },
  providers: [DsTableLayout],
})
export class TableComponent<T extends object> {
  /** Rows to render. */
  readonly data = input.required<readonly T[]>();
  /** Row identity for tracking, selection, expansion and the active-row highlight. Defaults to
   *  `row.id`; pass an accessor (`[rowId]="row => row.channel + row.sentAt"`) for data with no key. */
  readonly rowId = input<((row: T) => string) | null>(null);
  /** Column definitions driving headers, cells and sorting. */
  readonly columns = input.required<readonly TableColumn<T>[]>();
  /** Adds a checkbox column for row/select-all selection. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Opt-in outer border + radius, off so tables flush in a `<ds-card padding="none">` don't
   *  double-border. Unset falls back to `DS_CONFIG.table.bordered`, then `false`. */
  readonly bordered = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  /** `false`: no loading state.
   *  `true`: the table picks, skeleton rows while it has nothing to show, overlay once rows are
   *  on screen. Prefer it.
   *  `'skeleton'`: first-load shimmer rows. `'overlay'`: re-fetch spinner over the existing rows. */
  readonly loading = input<boolean | 'skeleton' | 'overlay'>(false);
  protected readonly loadingMode = computed<'skeleton' | 'overlay' | false>(
    () => {
      const loading = this.loading();
      if (loading === false) {
        return false;
      }
      if (loading === true) {
        return this.filteredData().length ? 'overlay' : 'skeleton';
      }

      return loading;
    },
  );
  /** Keeps the header row pinned while the body scrolls. */
  readonly stickyHeader = input(true, { transform: booleanAttribute });
  /** Caps the scroll body height (any CSS length) and scrolls it vertically; pair with
   *  `stickyHeader`. `null` (default) grows to content. */
  readonly maxHeight = input<string | null>(null);
  /** `'compact'` tightens cell padding. */
  readonly density = input<'default' | 'compact'>('default');
  /** Tints odd rows. */
  readonly zebra = input(false, { transform: booleanAttribute });
  /** Animate the body height when the row set changes. Instant under reduced motion. */
  readonly animateHeight = input(false, { transform: booleanAttribute });
  /** Two-way set of currently selected row ids. */
  readonly selectedIds = model<Set<string>>(new Set<string>());
  /** Column key currently sorted by; `null` when unsorted. Bind `[(sortKey)]` or use `(sortChange)`. */
  readonly sortKey = input<string | null>(null);
  /** Emitted for `[(sortKey)]`. `sortChange` carries both halves at once. */
  readonly sortKeyChange = output<string | null>();
  /** Sort direction for `sortKey`. */
  readonly sortDirection = input<SortDirection>(null);
  /** Emitted for `[(sortDirection)]`. */
  readonly sortDirectionChange = output<SortDirection>();
  // A `linkedSignal`, not a `model`: Angular diffs an input against the value IT last wrote and an
  // internal `.set()` never updates that slot, so a host answering with its own default must
  // re-seed the pair. A host that binds neither never re-seeds, so the optimistic state survives.

  private readonly sortState = linkedSignal<{
    readonly key: string | null;
    readonly dir: SortDirection;
  }>(() => ({ key: this.sortKey(), dir: this.sortDirection() }));
  protected readonly activeSortKey = computed(() => this.sortState().key);
  protected readonly activeSortDir = computed(() => this.sortState().dir);
  /** Sort states a column cycles through on click. Pass `['asc','desc']` to forbid unsorted. */
  readonly sortingOrder = input<SortDirection[]>(['asc', 'desc', null]);
  /** Wording for the sort announcement: receives the column label and direction; return `''` to
   *  say nothing. Unset falls back to `DS_INTL.table.sorted`. */
  readonly sortAnnouncement = input<
    ((label: string, dir: SortDirection) => string) | null
  >(null);
  readonly sortAnnouncementResolved = computed(
    () => this.sortAnnouncement() ?? this.intl().table.sorted,
  );
  /** Wording for the row-range announcement: receives the 1-based first and last row on screen and
   *  the total; return `''` to say nothing. A paged table with no rows announces its empty state's
   *  text instead, calling this with `(0, 0, 0)` only when that state has none. Unset falls back
   *  to `DS_INTL.pagination.range`. */
  readonly rangeAnnouncement = input<
    ((first: number, last: number, total: number) => string) | null
  >(null);
  readonly rangeAnnouncementResolved = computed(
    () => this.rangeAnnouncement() ?? this.intl().pagination.range,
  );
  /** Number of shimmer rows rendered while `loading` is `'skeleton'`. */
  readonly skeletonRows = input<number>(5);
  /** Accessible name, rendered as a visually-hidden caption. */
  readonly caption = input<string>('');
  /** Each row becomes a keyboard-operable control (Enter/Space emit `rowClicked`) named from the
   *  first column. Also gates the hover/pressed row tints. */
  readonly rowInteractive = input(false, { transform: booleanAttribute });

  /** Id of the row rendered as current (highlight + `aria-current`), e.g. the one whose detail
   *  panel is open. `null`: none. */
  readonly activeRowId = input<string | null>(null);

  /** Client-side substring filter (case-insensitive) on cell text. `filterable` columns restrict
   *  the match; with none marked every column matches, hidden ones included. */
  readonly filterQuery = input<string>('');
  /** Two-way per-column set-filters: column key to the still-checked values. Absent or full: unfiltered. */
  readonly columnFilters = model<Map<string, ReadonlySet<string>>>(new Map());

  /** Persist the column layout (order, widths, hidden keys) in `localStorage`. Needs `storageKey`. */
  readonly persistLayout = input(false, { transform: booleanAttribute });
  /** Stable per-table id the persisted layout is stored under. */
  readonly storageKey = input<string>('');

  /** True while an export is in flight; `false` without an export directive. Public for buttons outside the table. */
  readonly exporting = computed(() => this.layout.exporting());

  /** Keeps the horizontal scrollbar reachable on tall tables: the native bar is hidden and a proxy
   *  stuck to the bottom of the nearest scroll ancestor mirrors it. Unset falls back to
   *  `DS_CONFIG.table.stickyScrollbar`, then `false`. */
  readonly stickyScrollbar = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  /** Rows per page. `null` (default) disables pagination — all rows render. */
  readonly pageSize = model<number | null>(null);
  /** Current 1-based page. Only meaningful when `pageSize()` is set. */
  readonly page = model<number>(1);
  /** Selectable page-size choices shown in the pagination control. */
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  /** Shows the page-size picker in the footer pager. */
  readonly showPageSize = input(true, { transform: booleanAttribute });
  /** Shows the "N of M" range label in the footer pager. */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /** Control height of the footer pager. Unset falls back to `DS_CONFIG.pagination.size`, then
   *  `DS_CONFIG.control.size`, then `'sm'`. */
  readonly paginationSize = input<DsSize | null>(null);
  /** `'spread'` stretches the footer pager to the table's full width. Unset falls back to
   *  `DS_CONFIG.pagination.layout`, then `'grouped'`. */
  readonly paginationLayout = input<PaginationLayout | null>(null);
  /** Server-side total row count. `null` (default): client paging, the table slices `data()`.
   *  When set, the host has sliced to one page and `data()` renders as-is. */
  readonly total = input<number | null>(null);
  /** Scroll the table into view on a page change. */
  readonly scrollToTopOnPageChange = input(false, {
    transform: booleanAttribute,
  });
  /** Who sorts, see `TableSortMode`. Unset resolves to `'server'`: the table emits `(sortChange)`
   *  and reorders nothing. */
  readonly sortMode = input<TableSortMode | null>(null);
  /** Who filters, see `TableFilterMode`. Unset resolves to `'server'`: the table tracks
   *  `columnFilters` and runs no local pass. */
  readonly filterMode = input<TableFilterMode | null>(null);
  /** Full value domain per column key for a header filter the table cannot derive; without it the
   *  checklist offers only the values on the current page. */
  readonly columnFilterOptions = input<ReadonlyMap<string, readonly string[]>>(
    new Map(),
  );
  protected readonly filterModeResolved = computed<TableFilterMode>(
    () => this.filterMode() ?? 'server',
  );
  protected readonly sortModeResolved = computed<TableSortMode>(
    () => this.sortMode() ?? 'server',
  );
  readonly borderedResolved = resolveWithConfig(
    this.bordered,
    (config) => config.table?.bordered,
    false,
  );
  readonly stickyScrollbarResolved = resolveWithConfig(
    this.stickyScrollbar,
    (config) => config.table?.stickyScrollbar,
    false,
  );
  /** Where the sticky horizontal scrollbar rests, as a CSS length. Unset, the table cancels its
   *  scroll container's bottom padding. Falls back to `DS_CONFIG.table.stickyScrollbarOffset`;
   *  `--ds-table-sticky-scrollbar-offset` wins over both. */
  readonly stickyScrollbarOffset = input<string | null>(null);
  readonly stickyScrollbarOffsetResolved = resolveWithConfig(
    this.stickyScrollbarOffset,
    (config) => config.table?.stickyScrollbarOffset,
    null,
  );

  /** Pin the first data column (and the select column) on horizontal scroll. */
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });

  /** Render only the rows in view, padding the rest with spacer rows. Needs `maxHeight` (dev-warned,
   *  nothing virtualizes without a bounded scroller). Every row must be `virtualRowSize` tall, so
   *  virtual mode forces `table-layout: fixed`, single-line cells and no expansion panel. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** Row height in px in virtual mode. Drives the CSS height, so it must match the rendered rows. */
  readonly virtualRowSize = input(44);
  /** Fetch rows as they scroll into view. `data` becomes a SPARSE array `total` long: put each
   *  fetched row at its absolute index; every gap in the window renders a skeleton row and
   *  `(lazyLoad)` asks for its range. Needs `virtualScroll` and `total`. */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** The on-screen range with gaps in `data`; write fetched rows back at their absolute indices.
   *  Re-emits only when the range moves. */
  readonly lazyLoad = output<{ first: number; rows: number }>();

  /** Fires with the row on click (or Enter/Space when `rowInteractive`). */
  readonly rowClicked = output<T>();
  /** Fires whenever sort key/direction changes, in every `sortMode` but `'none'`. */
  readonly sortChange = output<SortChangeEvent>();

  /** Row-action items rendered as a trailing kebab column; empty: no column. Menu clicks never
   *  trigger `rowClicked`. */
  readonly rowActions = input<readonly TableRowAction<T>[]>([]);
  /** Fires with the chosen action and its row when a kebab menu item is selected. */
  readonly rowActionSelected = output<TableRowActionEvent<T>>();

  /** Fires when an `editable` cell is committed (Enter or blur) with the new value. */
  readonly cellEdited = output<TableCellEditEvent<T>>();

  /** Cell templates as an explicit map, for wrappers whose `<ng-content>` hides projected
   *  `dsCellTemplate` directives from this component's content query. Overrides projected ones. */
  readonly cellTemplateMap = input<
    Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>>
  >({});

  /** Empty-state template, alternative to the `[empty]` slot for wrappers that cannot re-project. */
  readonly emptyTemplate = input<TemplateRef<unknown> | null>(null);

  /** Each row renders a leading chevron that toggles an inline expansion panel. */
  readonly expandableRows = input(false, { transform: booleanAttribute });

  /** Two-way set of currently expanded row ids. */
  readonly expandedIds = model<Set<string>>(new Set<string>());

  /** `'single'` collapses the open row when another expands. Enforced on interaction only: a set
   *  seeded with several ids is left alone (dev-warned). */
  readonly expandMode = input<TableExpandMode>('multiple');

  /** Expand-all/collapse-all chevron in the expander header, page-scoped when paginating. Suppressed
   *  under `expandMode="single"`. */
  readonly expandAllToggle = input(false, { transform: booleanAttribute });

  /** Fires with the row when an expander opens it, including each row opened by expand-all. */
  readonly rowExpanded = output<T>();

  /** Fires with the row when an expander closes it, including the row auto-closed by
   *  `expandMode="single"`. An id whose row left `data()` (server paging) is cleared silently, so
   *  `expandedIds` is the complete signal. */
  readonly rowCollapsed = output<T>();

  /** Template rendered inside an expanded row's panel; `$implicit` and `row` are the row. */
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
    if (this.stickyHeader()) {
      parts.push('sticky-header');
    }
    if (this.density() === 'compact') {
      parts.push('compact');
    }
    if (this.zebra()) {
      parts.push('zebra');
    }
    if (this.virtualizing()) {
      parts.push('virtual');
    }

    return parts.join(' ');
  });

  protected readonly isSkeletonLoading = computed(
    () => this.loadingMode() === 'skeleton',
  );
  protected readonly isOverlayLoading = computed(
    () => this.loadingMode() === 'overlay',
  );
  /** Withheld in either loading mode: `overlay` is what a list uses on every read after the
   *  first, so suppressing only under `skeleton` paints "No rows yet" under the spinner. */
  protected readonly showsEmptyRow = computed(
    () => this.loadingMode() === false && !this.filteredData().length,
  );

  protected readonly showsLoadingSpace = computed(
    () =>
      this.loadingMode() !== false &&
      this.loadingMode() !== 'skeleton' &&
      !this.filteredData().length,
  );

  protected readonly layout = inject<DsTableLayout<T>>(DsTableLayout);
  protected readonly intl = inject(DS_INTL);

  private readonly emptyCell = viewChild<ElementRef<HTMLElement>>('emptyCell');
  // null until the empty row has rendered, so the live region never speaks a fallback it replaces.
  private readonly emptyCellText = signal<string | null>(null);
  private readonly toolbarAnchor = viewChild('toolbarAnchor', {
    read: ViewContainerRef,
  });
  private readonly headerUtilityAnchor = viewChild('headerUtilityAnchor', {
    read: ViewContainerRef,
  });
  private readonly overlaysAnchor = viewChild('overlaysAnchor', {
    read: ViewContainerRef,
  });
  private readonly columnWidthControls = viewChild<
    TemplateRef<{ $implicit: TableColumn<T> }>
  >('columnWidthControls');

  protected readonly visibleColumns = computed<readonly TableColumn<T>[]>(() =>
    this.layout.foldColumns(this.columns()),
  );

  /** Content-fit mode, unless the reader has dragged this column — a drag is a deliberate
   *  pixel width and must win over the declared intent. */
  protected fitsContent(col: TableColumn<T>): boolean {
    return (
      col.width === 'content' &&
      this.layout.resize()?.widthOverride(col.key) === undefined
    );
  }

  protected readonly hasUtilityColumn = computed(
    () => this.hasRowActions() || this.layout.wantsUtilityColumn(),
  );

  private readonly columnFilterPopover = viewChild<PopoverComponent>(
    'columnFilterPopover',
  );
  // Gated on configuration, never on the clicked column: a handler that raises its own `@if`
  // reads the viewChild back before change detection has created it and loses the click.
  protected readonly hasAnyColumnFilter = computed(() =>
    this.columns().some((col) => this.hasColumnFilter(col)),
  );
  protected readonly filterColumn = signal<TableColumn<T> | null>(null);
  protected readonly filterSearch = signal('');

  private readonly headerFilters = contentChildren(HeaderFilterDirective);

  private readonly headerFilterByKey = computed(() => {
    const map = new Map<string, HeaderFilterDirective>();
    for (const filter of this.headerFilters()) {
      map.set(filter.dsHeaderFilter(), filter);
    }

    return map;
  });

  protected headerFilterFor(
    col: TableColumn<T>,
  ): HeaderFilterDirective | undefined {
    return this.headerFilterByKey().get(col.key);
  }

  protected hasColumnFilter(col: TableColumn<T>): boolean {
    if (this.filterModeResolved() === 'none') {
      return false;
    }

    return col.filter === 'set' || !!this.headerFilterFor(col);
  }

  protected isFilterPanelOpen(col: TableColumn<T>): boolean {
    return (
      this.filterColumn()?.key === col.key &&
      (this.columnFilterPopover()?.opened() ?? false)
    );
  }

  protected isColumnFiltered(col: TableColumn<T>): boolean {
    // A projected filter owns its criterion, so only the host can say whether it is set.
    const projected = this.headerFilterFor(col);
    if (projected) {
      return projected.active();
    }
    const allowed = this.columnFilters().get(col.key);

    return !!allowed && allowed.size < this.optionsFor(col).length;
  }

  private optionsFor(col: TableColumn<T>): readonly string[] {
    const supplied = this.columnFilterOptions().get(col.key);
    if (supplied) {
      return supplied;
    }
    const seen = new Set<string>();
    for (const row of this.data()) {
      seen.add(this.cellValue(row, col));
    }

    return [...seen].sort((a, b) => a.localeCompare(b));
  }

  protected readonly filterValues = computed<readonly string[]>(() => {
    const col = this.filterColumn();
    if (!col) {
      return [];
    }
    const needle = this.filterSearch().trim().toLowerCase();
    const values = this.optionsFor(col);

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

    return allowed ? allowed.size : this.optionsFor(col).length;
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
    const distinct = this.optionsFor(col);
    const current = new Set(this.columnFilters().get(col.key) ?? distinct);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    const next = new Map(this.columnFilters());
    // No entry means unfiltered, so a full set is dropped rather than stored.
    if (current.size >= distinct.length) {
      next.delete(col.key);
    } else {
      next.set(col.key, current);
    }
    this.columnFilters.set(next);
  }

  protected headerFilterContext(col: TableColumn<T>): {
    $implicit: unknown;
    column: unknown;
    close: () => void;
  } {
    return {
      $implicit: col,
      column: col,
      close: () => this.columnFilterPopover()?.close(),
    };
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
  private readonly destroyRef = inject(DestroyRef);
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

  private readonly headerMetrics = signal<HeaderMetrics | null>(null);
  private readonly wrapWidth = signal(0);
  private readonly contentWidths = signal<ReadonlyMap<string, number>>(
    new Map(),
  );
  private readonly fontsLoaded = signal(false);

  /** One per visible column; `null` leaves the column to share the slack with the others. Read
   *  from the columns, the header labels and the container, never from the rows. */
  protected readonly columnWidths = computed<readonly (number | null)[]>(() => {
    const columns = this.visibleColumns();
    const metrics = this.headerMetrics();
    const resize = this.layout.resize();
    const contentWidths = this.contentWidths();
    const floorOf = (col: TableColumn<T>): number =>
      Math.max(metrics?.floors.get(col.key) ?? 0, col.minWidth ?? 0);
    const declared = columns.map((col): number | null | undefined => {
      const dragged = resize?.widthOverride(col.key);
      if (dragged !== undefined) {
        return dragged;
      }
      if (typeof col.width === 'number') {
        return col.width;
      }
      if (col.width === 'content') {
        return contentWidths.get(col.key) ?? null;
      }
      if (col.kind && col.kind !== 'text') {
        return Math.max(KIND_WIDTH_PX[col.kind], floorOf(col));
      }

      return undefined;
    });
    if (!metrics) {
      return declared.map((width) => width ?? null);
    }
    let space =
      Math.max(this.wrapWidth(), metrics.tableMinWidth) -
      metrics.utilityWidth -
      declared.reduce<number>((sum, width) => sum + (width ?? 0), 0);
    const textIndexes = declared.flatMap((width, index) =>
      width === undefined ? [index] : [],
    );
    const floorTotal = textIndexes.reduce(
      (sum, index) => sum + floorOf(columns[index]),
      0,
    );
    if (floorTotal > space) {
      return declared.map((width, index) => {
        if (width !== undefined) {
          return width;
        }
        const col = columns[index];

        return col.truncate && col.minWidth === undefined
          ? Math.max(floorOf(col), SCROLLING_CLIP_TEXT_PX + metrics.cellPadding)
          : floorOf(col);
      });
    }
    // An equal share narrower than a column's floor holds that column at its floor; the rest share
    // what is left, widest floor first.
    const widths: (number | null)[] = declared.map((width) => width ?? null);
    const byFloor = [...textIndexes].sort(
      (left, right) => floorOf(columns[right]) - floorOf(columns[left]),
    );
    let sharing = byFloor.length;
    for (const index of byFloor) {
      const floor = floorOf(columns[index]);
      if (floor * sharing <= space) {
        break;
      }
      widths[index] = floor;
      space -= floor;
      sharing -= 1;
    }

    return widths;
  });

  /** In auto layout at max-content, `tbody` hidden or shown, so a cell gives the width it asks
   *  for. Restores the scroll position the narrower table may have clamped. */
  private measureAtMaxContent(
    wrap: HTMLElement,
    table: HTMLTableElement,
    withRows: boolean,
    read: (headCells: readonly HTMLTableCellElement[]) => void,
  ): void {
    const scrollLeft = wrap.scrollLeft;
    const measuringClass = withRows ? 'measuring-rows' : 'measuring-head';
    table.classList.add(measuringClass);
    read(Array.from(table.tHead?.rows[0]?.cells ?? []));
    table.classList.remove(measuringClass);
    wrap.scrollLeft = scrollLeft;
  }

  private measureHeader(wrap: HTMLElement, table: HTMLTableElement): void {
    const floors = new Map<string, number>();
    let utilityWidth = 0;
    let cellPadding = 0;
    this.measureAtMaxContent(wrap, table, false, (headCells) => {
      for (const head of headCells) {
        const width = head.getBoundingClientRect().width;
        const key = head.dataset['colKey'];
        if (key === undefined) {
          utilityWidth += width;
          continue;
        }
        floors.set(key, Math.ceil(width));
        if (!cellPadding) {
          const style = getComputedStyle(head);
          cellPadding =
            parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        }
      }
    });
    const wrapStyle = getComputedStyle(wrap);
    this.wrapWidth.set(
      wrap.clientWidth -
        parseFloat(wrapStyle.paddingLeft) -
        parseFloat(wrapStyle.paddingRight),
    );
    this.headerMetrics.set({
      floors,
      utilityWidth,
      cellPadding,
      tableMinWidth: parseFloat(getComputedStyle(table).minWidth) || 0,
    });
  }

  private measureContentColumns(
    wrap: HTMLElement,
    table: HTMLTableElement,
    keys: readonly string[],
  ): void {
    const measured = new Map<string, number>();
    this.measureAtMaxContent(wrap, table, true, (headCells) => {
      for (const head of headCells) {
        const key = head.dataset['colKey'];
        if (key !== undefined && keys.includes(key)) {
          measured.set(key, Math.ceil(head.getBoundingClientRect().width));
        }
      }
    });
    const previous = untracked(() => this.contentWidths());
    const changed =
      previous.size !== measured.size ||
      [...measured].some(([key, width]) => previous.get(key) !== width);
    if (changed) {
      this.contentWidths.set(measured);
    }
  }

  protected readonly filteredData = computed<readonly T[]>(() => {
    const query = this.filterQuery().trim().toLowerCase();
    // In 'server' mode the host has already filtered. `filterQuery` is a separate input and is
    // deliberately left alone.
    const setFilters =
      this.filterModeResolved() === 'client'
        ? this.columnFilters()
        : new Map<string, ReadonlySet<string>>();
    const columns = this.columns();
    if (!query && setFilters.size === 0) {
      return this.layout.foldRows(this.data());
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

  protected readonly sortedData = computed<readonly T[]>(() => {
    const rows = this.filteredData();
    if (this.sortModeResolved() !== 'client') {
      return rows;
    }
    const key = this.activeSortKey();
    const dir = this.activeSortDir();
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

      // Blanks sink in both directions: `direction` is deliberately not applied here.
      if (aValue === null || bValue === null) {
        if (aValue === null && bValue === null) {
          return 0;
        }

        return aValue === null ? 1 : -1;
      }

      return compareSortValues(aValue, bValue) * direction;
    });
  });

  protected readonly pagedData = computed<readonly T[]>(() => {
    const size = this.pageSize();
    if (size === null || this.total() !== null) {
      return this.sortedData();
    }
    const start = (this.page() - 1) * size;

    return this.sortedData().slice(start, start + size);
  });

  protected readonly displayData = computed<readonly T[]>(() =>
    this.pageSize() !== null ? this.pagedData() : this.sortedData(),
  );

  // Loading wins while it lasts. `aria-live="polite"` does not announce a region's initial
  // content, so the unsorted first render is silent; only real changes speak.

  protected readonly statusMessage = computed<string>(() => {
    if (this.loadingMode() !== false) {
      return this.intl().table.loading;
    }

    // A contributed line wins while it has one: "Export failed" must survive until the reader
    // moves on.
    return this.layout.status() || this.eventMessages();
  });

  private readonly eventMessages = computed<string>(() =>
    [this.sortMessage(), this.rangeMessage(), this.expansionMessage()]
      .filter(Boolean)
      .join('. '),
  );

  /** Only from two rows up: a single expander announces itself through `aria-expanded`. */
  private readonly expansionMessage = computed<string>(() => {
    const open = this.expandedIds();
    if (open.size < 2) {
      return '';
    }
    const onPage = this.displayData().filter((row) =>
      open.has(this.rowKey(row)),
    ).length;

    return onPage < 2 ? '' : this.intl().table.rowsExpanded(onPage);
  });

  private readonly sortMessage = computed<string>(() => {
    const key = this.activeSortKey();
    const dir = this.activeSortDir();
    if (!key) {
      return '';
    }
    const label = this.columns().find((col) => col.key === key)?.label ?? key;

    return this.sortAnnouncementResolved()(label, dir);
  });

  private readonly rangeMessage = computed<string>(() => {
    const size = this.pageSize();
    if (size === null) {
      return '';
    }
    const rows = this.displayData().length;
    const total = this.total() ?? this.filteredData().length;
    if (rows === 0) {
      const emptyText = this.emptyCellText();
      if (total !== 0 || emptyText === null) {
        return '';
      }

      return emptyText || this.rangeAnnouncementResolved()(0, 0, 0);
    }
    const first = (this.page() - 1) * size + 1;

    return this.rangeAnnouncementResolved()(first, first + rows - 1, total);
  });

  protected readonly virtualizing = computed(
    () => this.virtualScroll() && !!this.maxHeight(),
  );

  protected readonly virtualRowHeight = computed(
    () => `${this.virtualRowSize()}px`,
  );

  /** Lazy counts the rows that exist, not the ones that have arrived, or the scrollbar
   *  understates the list. */
  protected readonly virtualCount = computed(() =>
    this.lazy()
      ? (this.total() ?? this.displayData().length)
      : this.displayData().length,
  );

  protected readonly virtualWindow = computed(() => {
    if (!this.virtualizing()) {
      return null;
    }
    const rowSize = Math.max(1, this.virtualRowSize());
    const count = this.virtualCount();
    const height = this.viewportHeight() || VIRTUAL_FALLBACK_HEIGHT;
    const firstVisible = Math.floor(this.scrollTop() / rowSize);
    const start = Math.max(0, firstVisible - VIRTUAL_OVERSCAN);
    const end = Math.min(
      count,
      firstVisible + Math.ceil(height / rowSize) + VIRTUAL_OVERSCAN,
    );

    return {
      start,
      end,
      padTop: start * rowSize,
      padBottom: Math.max(0, count - end) * rowSize,
    };
  });

  /** What the row loop walks: a `null` row is a gap the host has not filled. The index is absolute
   *  because striping parity, the skeleton seed and the `(lazyLoad)` range need it. */
  protected readonly rowSlots = computed<
    readonly { row: T | null; index: number }[]
  >(() => {
    const window = this.virtualWindow();
    const data = this.displayData();
    const start = window ? window.start : 0;
    const end = window ? window.end : data.length;
    const slots: { row: T | null; index: number }[] = [];
    for (let index = start; index < end; index++) {
      slots.push({ row: data[index] ?? null, index });
    }

    return slots;
  });

  /** Parity from the absolute index; `:nth-child` cannot see past windowing. 1-based like `:nth-child(odd)`. */
  protected isStriped(absoluteIndex: number): boolean {
    return !!this.virtualWindow() && absoluteIndex % 2 === 0;
  }

  protected readonly allSelected = computed(() => {
    const data = this.displayData();
    if (data.length === 0) {
      return false;
    }
    const sel = this.selectedIds();

    return data.every((row) => sel.has(this.rowKey(row)));
  });

  // Header checkbox indeterminate predicate; `anySelected` answers "is a selection live".
  protected readonly someSelected = computed(() => {
    const data = this.displayData();
    const sel = this.selectedIds();

    return data.some((row) => sel.has(this.rowKey(row))) && !this.allSelected();
  });

  protected readonly anySelected = computed(() => this.selectedIds().size > 0);

  protected readonly selectAllLabel = computed(() =>
    this.intl().table.selectAllRows(this.pageSize() !== null),
  );

  protected readonly allExpanded = computed(() => {
    const data = this.displayData();
    if (data.length === 0) {
      return false;
    }
    const open = this.expandedIds();

    return data.every((row) => open.has(this.rowKey(row)));
  });

  protected readonly expandAllVisible = computed(
    () => this.expandAllToggle() && this.expandMode() !== 'single',
  );

  protected readonly expandAllLabel = computed(() => {
    const words = this.intl().table;
    const onThisPage = this.pageSize() !== null;

    return this.allExpanded()
      ? words.collapseAllRows(onThisPage)
      : words.expandAllRows(onThisPage);
  });

  protected readonly skeletonArray = computed(() =>
    Array(this.skeletonRows()).fill(0),
  );

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
  protected readonly menuRow = signal<T | null>(null);
  private readonly rowMenuPopover =
    viewChild<PopoverComponent>('rowMenuPopover');
  private readonly columnPickerPopover = viewChild<PopoverComponent>(
    'columnPickerPopover',
  );

  protected readonly hasTruncate = computed(() =>
    this.columns().some((col) => col.truncate),
  );

  private readonly scrollWrap =
    viewChild.required<ElementRef<HTMLElement>>('scrollWrap');
  private readonly hscrollProxy =
    viewChild<ElementRef<HTMLElement>>('hscrollProxy');
  private readonly tableHead = viewChild<ElementRef<HTMLElement>>('tableHead');

  private publishHeadHeight(head: HTMLElement): void {
    this.hostElement.nativeElement.style.setProperty(
      '--_table-head-measured',
      `${head.getBoundingClientRect().height}px`,
    );
  }
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  private scrollAncestor(): HTMLElement | null {
    for (
      let element = this.hostElement.nativeElement.parentElement;
      element;
      element = element.parentElement
    ) {
      const overflowY = getComputedStyle(element).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return element;
      }
    }

    return document.scrollingElement as HTMLElement | null;
  }

  protected readonly hscrollContentWidth = signal(0);
  protected readonly hscrollNeeded = signal(false);
  private readonly scrollTop = signal(0);
  private readonly viewportHeight = signal(0);
  private lastLazyRequest: { first: number; rows: number } | null = null;

  constructor() {
    // A directive has no view for an ng-template, so the panel's width buttons are declared here.
    effect(() => {
      const template = this.columnWidthControls();
      if (template) {
        this.layout.registerPanelRowTemplate(template);
      }
    });

    // Publishing here is early enough: a directive on the same element is constructed after this
    // component. Anchors go over as signals: a viewChild is undefined until the view exists.
    this.layout.publish({
      visibleColumns: this.visibleColumns,
      sortedRows: this.sortedData,
      declaredColumns: this.columns,
      scrollViewport: computed(() => this.scrollWrap()?.nativeElement),
      cellText: (row, column) => this.cellValue(row, column),
      anchor: (name) =>
        name === 'toolbar'
          ? this.toolbarAnchor
          : name === 'header-utility'
            ? this.headerUtilityAnchor
            : this.overlaysAnchor,
    });

    // The scrim starts below the header. Measured, not summed: `vertical-align: middle` on the inline-flex
    // label adds a font-metric amount no calc() can carry. Read after render, or it publishes 0px; the
    // second effect re-reads before the scrim appears, so a load never depends on the observer.
    afterRenderEffect((onCleanup) => {
      const head = this.tableHead()?.nativeElement;
      if (!head || typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver(() => this.publishHeadHeight(head));
      observer.observe(head);
      onCleanup(() => observer.disconnect());
    });
    afterRenderEffect((onCleanup) => {
      const cell = this.emptyCell()?.nativeElement;
      if (!cell) {
        this.emptyCellText.set(null);

        return;
      }
      const readText = () =>
        this.emptyCellText.set((cell.textContent ?? '').trim());
      readText();
      const observer = new MutationObserver(readText);
      observer.observe(cell, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      onCleanup(() => observer.disconnect());
    });
    // Header labels are measured when the column set or the density changes, never per row.
    afterRenderEffect(() => {
      this.visibleColumns();
      this.tableClasses();
      this.selectable();
      this.expandableRows();
      this.hasUtilityColumn();
      this.layout.resize();
      this.fontsLoaded();
      const wrap = this.scrollWrap().nativeElement;
      const table = wrap.querySelector('table');
      if (table) {
        untracked(() => this.measureHeader(wrap, table));
      }
    });
    // `width: 'content'` is the one width that follows the rows, so only it re-measures with them.
    afterRenderEffect(() => {
      this.rowSlots();
      this.fontsLoaded();
      const keys = this.visibleColumns()
        .filter((col) => this.fitsContent(col))
        .map((col) => col.key);
      const wrap = this.scrollWrap().nativeElement;
      const table = wrap.querySelector('table');
      if (!table || keys.length === 0) {
        if (untracked(() => this.contentWidths().size)) {
          this.contentWidths.set(new Map());
        }

        return;
      }
      untracked(() => this.measureContentColumns(wrap, table, keys));
    });
    afterNextRender(() => {
      void document.fonts?.ready.then(() => this.fontsLoaded.set(true));
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const wrap = this.scrollWrap().nativeElement;
      let frame = 0;
      // A frame later: widths written inside the callback move the wrap's scrollbar and loop the
      // observer.
      const observer = new ResizeObserver(([entry]) => {
        const width = entry.contentRect.width;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.wrapWidth.set(width));
      });
      observer.observe(wrap);
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      });
    });
    afterRenderEffect(() => {
      this.isOverlayLoading();
      const head = this.tableHead()?.nativeElement;
      if (head) {
        this.publishHeadHeight(head);
      }
    });
    // Restore cannot run in the constructor: inputs are not set yet, so storageKey() is still ''
    // and it would silently no-op. The first run with a usable key restores; later runs save.
    effect(() => {
      const key = this.layoutKey();
      const stored = Object.fromEntries(
        this.layout.persistedSlices().map((slice) => [slice.key, slice.read()]),
      );
      if (!key) {
        return;
      }
      if (!this.layoutRestored) {
        this.layoutRestored = true;
        this.restoreLayout(key);

        return;
      }
      this.saveLayout(key, stored);
    });

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      devWarn(() =>
        this.sortMode() === null &&
        this.total() === null &&
        this.columns().some((col) => col.sortable)
          ? '[ds-table] sortable columns default to sortMode="server", so a header click only emits (sortChange) and the table reorders nothing itself. This table binds no `total`, which usually means it holds every row — declare sortMode="client" to sort them in place.'
          : null,
      );

      devWarn(() =>
        this.filterMode() === null &&
        this.total() === null &&
        this.columns().some((col) => col.filter === 'set')
          ? '[ds-table] a header filter defaults to filterMode="server", so ticking a value only updates `columnFilters` and filters nothing locally. This table binds no `total`, which usually means it holds every row — declare filterMode="client" to filter them in place.'
          : null,
      );
    }

    effect((onCleanup) => {
      if (!this.virtualizing()) {
        return;
      }
      const wrap = this.scrollWrap().nativeElement;
      const onScroll = (): void => this.scrollTop.set(wrap.scrollTop);
      const measure = (): void => this.viewportHeight.set(wrap.clientHeight);
      wrap.addEventListener('scroll', onScroll, { passive: true });
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(wrap);
      measure();
      onScroll();
      onCleanup(() => {
        wrap.removeEventListener('scroll', onScroll);
        resizeObserver.disconnect();
      });
    });

    // Keyed on the range, so scrolling within an already-requested window stays quiet and a
    // request in flight is not repeated while the host answers slowly.
    effect(() => {
      if (!this.lazy()) {
        return;
      }
      const slots = this.rowSlots();
      const gaps = slots.filter((slot) => slot.row === null);
      if (gaps.length === 0) {
        return;
      }
      const first = gaps[0].index;
      const rows = gaps[gaps.length - 1].index - first + 1;
      // Contained, not equal: the viewport is measured after first paint, so the window grows
      // by an overscan or two and an exact-match guard would fetch the same rows twice.
      const covered =
        this.lastLazyRequest &&
        first >= this.lastLazyRequest.first &&
        first + rows <= this.lastLazyRequest.first + this.lastLazyRequest.rows;
      if (covered) {
        return;
      }
      this.lastLazyRequest = { first, rows };
      this.lazyLoad.emit({ first, rows });
    });

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      devWarn(() =>
        this.lazy() && !this.virtualScroll()
          ? '[ds-table] lazy needs virtualScroll: without a window there is no range to fetch, so every gap in `data` renders a skeleton row and (lazyLoad) never narrows. Set virtualScroll (and maxHeight), or hand the table its rows outright.'
          : null,
      );
      devWarn(() =>
        this.lazy() && this.total() === null
          ? '[ds-table] lazy needs `total`: the scroller is sized from the rows that EXIST, and without it the spacers collapse to the slice that has arrived — the scrollbar then lies about the length of the list.'
          : null,
      );
      devWarn(() =>
        this.lazy() && this.sortMode() === 'client'
          ? '[ds-table] lazy with sortMode="client" sorts only the rows that happen to have arrived, which is a different order every time a window loads. The server owns the order here — drop sortMode or declare "server".'
          : null,
      );
      devWarn(() =>
        this.virtualScroll() && !this.maxHeight()
          ? '[ds-table] virtualScroll needs maxHeight — without a bounded scroller there is no viewport to window against, so every row renders and nothing is virtualized. Set maxHeight (e.g. "480px").'
          : null,
      );
      devWarn(() =>
        this.virtualScroll() && this.expandableRows()
          ? '[ds-table] virtualScroll and expandableRows do not combine: an expanded row is taller than virtualRowSize, and every offset after it would be wrong. The expander renders but the panel is suppressed — move the detail into a modal or a drawer, or drop virtualScroll.'
          : null,
      );
      devWarn(() =>
        this.expandAllToggle() && this.expandMode() === 'single'
          ? '[ds-table] expandAllToggle contradicts expandMode="single" — expanding every row is the one thing single mode exists to prevent. The header toggle is suppressed; drop one of the two.'
          : null,
      );
      devWarn(() =>
        this.expandAllToggle() && !this.expandableRows()
          ? '[ds-table] expandAllToggle needs expandableRows — without it there is no expander column to put the toggle in, so it renders nothing. Set expandableRows.'
          : null,
      );
      devWarn(() =>
        this.expandMode() === 'single' && this.expandedIds().size > 1
          ? '[ds-table] expandMode="single" was given expandedIds holding several rows. A two-way model is the host\'s to write, so it is left as passed rather than rewritten — the next expander click collapses back to one.'
          : null,
      );
      devWarn(() =>
        this.virtualScroll() && this.pageSize() !== null
          ? '[ds-table] virtualScroll with pageSize paginates a window of a page. Virtual scrolling is what pagination was for on a long list — pick one.'
          : null,
      );
    }

    // A sticky `bottom` resolves against the scrollport's content box, so anything stuck to the
    // bottom rests one padding-bottom above the visible edge; the scrollbar proxy and the bulk bar
    // subtract this. Measured, not a token: the padding can change with a media query.
    effect((onCleanup) => {
      const host = this.hostElement.nativeElement;
      const scroller = this.scrollAncestor();
      const publish = (): void =>
        host.style.setProperty(
          '--_table-scroller-pad-bottom',
          scroller ? getComputedStyle(scroller).paddingBottom : '0px',
        );
      publish();
      if (!scroller) {
        return;
      }
      const observer = new ResizeObserver(publish);
      observer.observe(scroller);
      onCleanup(() => observer.disconnect());
    });

    // A custom property, not a binding on the proxy: the proxy is behind an `@if`, and the
    // stylesheet must be able to out-rank it with --ds-table-sticky-scrollbar-offset.
    effect(() => {
      const host = this.hostElement.nativeElement;
      const resolved = this.stickyScrollbarOffsetResolved();
      if (resolved === null) {
        host.style.removeProperty('--_table-sticky-scrollbar-offset');

        return;
      }
      host.style.setProperty('--_table-sticky-scrollbar-offset', resolved);
    });

    // Assigning an equal scrollLeft fires no scroll event, so the mirrors cannot loop.
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
        // Both are rounded integers: a fractional width makes an unscrollable wrap report 1px more.
        this.hscrollNeeded.set(wrap.scrollWidth > wrap.clientWidth + 1);
      };
      // The wrap's own box never changes with content; watch the table too.
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

    // The observer fires pre-paint, so freezing the old height stops the jump being painted.
    // Disconnect during the animation so its own resizes do not re-trigger it; `clip`, not
    // `hidden`, avoids creating a scroll container.
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
        // Only a height change at a stable width is a row-set swap, not a resize.
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
        // glyph-clip-guard: only while the height animates between two row sets; cleared on finish
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

    // Client-side paging only (with `total` set the host owns the clamp).
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

  /** Called from the trigger's own gate as well as the menu, so a row with nothing applicable
   *  shows no kebab. */
  protected actionsFor(row: T): readonly TableRowAction<T>[] {
    return this.rowActions().filter((action) => !action.hidden?.(row));
  }

  protected hasActionsFor(row: T): boolean {
    return this.actionsFor(row).length > 0;
  }

  protected readonly visibleRowActions = computed<readonly TableRowAction<T>[]>(
    () => {
      const row = this.menuRow();

      return row === null ? [] : this.actionsFor(row);
    },
  );

  protected actionLabel(action: TableRowAction<T>): string {
    const label = action.label;
    if (typeof label !== 'function') {
      return label;
    }
    const row = this.menuRow();

    return row === null ? '' : label(row);
  }

  /** Empty unless the item is disabled for this row: a reason on a live item reads as a caveat. */
  protected actionReason(action: TableRowAction<T>): string {
    const row = this.menuRow();
    if (row === null || !action.disabled?.(row)) {
      return '';
    }
    const reason = action.disabledReason;

    return typeof reason === 'function' ? reason(row) : (reason ?? '');
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
    const key = this.rowKey(row);
    const open = this.expandedIds();

    if (open.has(key)) {
      const next = new Set<string>(open);
      next.delete(key);
      this.expandedIds.set(next);
      this.rowCollapsed.emit(row);

      return;
    }

    if (this.expandMode() === 'single') {
      // `data()` rather than `displayData()` so a row left open on another page is reported too.
      // An id whose row is not loaded is dropped: see `rowCollapsed`.
      const closing =
        open.size > 0
          ? this.data().filter((other) => open.has(this.rowKey(other)))
          : [];
      this.expandedIds.set(new Set<string>([key]));
      closing.forEach((other) => this.rowCollapsed.emit(other));
      this.rowExpanded.emit(row);

      return;
    }

    const next = new Set<string>(open);
    next.add(key);
    this.expandedIds.set(next);
    this.rowExpanded.emit(row);
  }

  protected onToggleExpandAll(): void {
    const rows = this.displayData();
    const open = this.expandedIds();
    const collapsing = this.allExpanded();
    const changed = rows.filter(
      (row) => open.has(this.rowKey(row)) === collapsing,
    );
    if (changed.length === 0) {
      return;
    }

    const next = new Set<string>(open);
    rows.forEach((row) => {
      if (collapsing) {
        next.delete(this.rowKey(row));
      } else {
        next.add(this.rowKey(row));
      }
    });
    this.expandedIds.set(next);

    changed.forEach((row) =>
      collapsing ? this.rowCollapsed.emit(row) : this.rowExpanded.emit(row),
    );
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
    // Only a selection created by this gesture blocks the click: a stale one that mousedown
    // cannot collapse (user-select:none content) must not wedge rows.
    const selection = window.getSelection()?.toString() ?? '';
    if (selection && selection !== this.selectionBeforeGesture) {
      return;
    }
    this.rowClicked.emit(row);
  }

  protected onRowKey(row: T, event: Event): void {
    // A key pressed on a control inside a cell belongs to that control.
    if (!this.rowInteractive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.rowClicked.emit(row);
  }

  protected rowAriaLabel(row: T): string {
    const first = this.visibleColumns()[0];

    return first ? this.cellValue(row, first) : '';
  }

  /** Row identity: the `rowId` accessor when given, else `row.id`. Public so a host can compute the same keys. */
  rowKey(row: T): string {
    const accessor = this.rowId();
    if (accessor) {
      return accessor(row);
    }

    return String((row as { id?: unknown }).id ?? '');
  }

  protected sortableCol(col: TableColumn<T>): boolean {
    return !!col.sortable && this.sortModeResolved() !== 'none';
  }

  protected ariaSort(
    col: TableColumn<T>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!this.sortableCol(col)) {
      return null;
    }
    if (this.activeSortKey() === col.key && this.activeSortDir()) {
      return this.activeSortDir() === 'asc' ? 'ascending' : 'descending';
    }

    return 'none';
  }

  protected onSort(col: TableColumn<T>): void {
    if (!this.sortableCol(col)) {
      return;
    }
    const order = this.sortingOrder();
    const currentKey = this.activeSortKey();
    let dir: SortDirection;
    if (currentKey !== col.key) {
      dir = order[0] ?? null;
    } else {
      const currentIndex = order.indexOf(this.activeSortDir());
      dir = order[(currentIndex + 1) % order.length] ?? null;
    }
    // The key survives `dir === null`: nulling it would send a host mapping off `sortKey` back
    // to its default sort.
    this.sortState.set({ key: col.key, dir });
    this.sortKeyChange.emit(col.key);
    this.sortDirectionChange.emit(dir);
    this.sortChange.emit({ key: col.key, dir });
  }

  protected headerClasses(col: TableColumn<T>): string {
    const parts: string[] = [];
    if (this.sortableCol(col)) {
      parts.push('sortable');
    }
    if (this.activeSortKey() === col.key && this.activeSortDir()) {
      parts.push(`sorted-${this.activeSortDir()}`);
    }

    return parts.join(' ');
  }

  protected sortIcon(col: TableColumn<T>): 'sortAsc' | 'sortDesc' | 'sort' {
    if (this.activeSortKey() !== col.key || !this.activeSortDir()) {
      return 'sort';
    }

    return this.activeSortDir() === 'asc' ? 'sortAsc' : 'sortDesc';
  }

  protected cellValue(row: T, col: TableColumn<T>): string {
    if (col.cell) {
      return col.cell(row);
    }

    return String((row as Record<string, unknown>)[col.key] ?? '');
  }

  protected cellLink(
    row: T,
    col: TableColumn<T>,
  ): string | readonly unknown[] | null {
    return col.link?.(row) ?? null;
  }

  private layoutKey(): string | null {
    const key = this.storageKey().trim();

    return this.persistLayout() && key ? `ds-table:${key}` : null;
  }

  private layoutRestored = false;

  private restoreLayout(key: string): void {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return;
      }
      const saved = JSON.parse(raw) as Record<string, unknown>;
      // Only what was stored and is owned: an unrearranged table keeps its declared order and
      // `hidden` flags, and a stale slice is not forced on a table that lost the feature.
      for (const slice of this.layout.persistedSlices()) {
        const value = saved[slice.key];
        if (value !== undefined && value !== null) {
          slice.write(value);
        }
      }
    } catch {
      // Unreadable or from an older shape: fall back to the declared layout.
    }
  }

  private saveLayout(key: string, stored: Record<string, unknown>): void {
    try {
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // Full or blocked: a lost column layout is not worth an error.
    }
  }

  /** Serialises the visible columns as a CSV download via the export feature. Pass `rows` to export a
   *  set you fetched yourself. Needs `dsTableExport`. */
  exportCsv(filename = 'table.csv', rows?: readonly T[]): void {
    if (!this.layout.exportCsv(filename, rows)) {
      this.warnNoExport('exportCsv');
    }
  }

  /** Runs the export: awaits `exportFetcher` when given, downloads, drives `exporting()`, emits
   *  `exportFailed`. Public so a button can live anywhere. */
  async runExport(): Promise<void> {
    const running = this.layout.runExport();
    if (!running) {
      this.warnNoExport('runExport');

      return;
    }
    await running;
  }

  // A click handler is outside an injection context, where `devWarn`'s effect throws.
  private warnNoExport(called: string): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      reportDevWarning(
        `[ds-table] ${called}() found no export feature. Add the dsTableExport directive to the table.`,
      );
    }
  }

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
