import {
  isDevMode,
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
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { PopoverComponent } from '../popover/popover.component';
import { MenuComponent } from '../menu/menu.component';
import { MenuItemComponent } from '../menu/menu-item.component';
import { CellTemplateDirective } from './cell-template.directive';
import { HeaderFilterDirective } from './header-filter.directive';
import type {
  SortChangeEvent,
  SortDir,
  TableCellEditEvent,
  TableColumn,
  TableRowAction,
  TableRowActionEvent,
  TableFilterMode,
  TableSortMode,
} from './table.types';

const NUMERIC = /^-?\d+(\.\d+)?$/;

// Assumed viewport until the scroller has been measured. Tall enough to fill a
// laptop screen, so the first paint is not visibly short, and nowhere near the
// row count a virtualized table is reached for.
const VIRTUAL_FALLBACK_HEIGHT = 720;

// Rows kept rendered past each edge of the viewport, so a flick does not expose
// blank space before the next range lands.
const VIRTUAL_OVERSCAN = 6;

/** Rendered values that read as "no data", matched case-insensitively. The list
 *  is wider than the empty string because consumers render placeholders; these
 *  are the ones mm-broker had to enumerate itself before `sortValue` existed. */
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

  // `sensitivity: 'base'` so "Ångström" sorts next to "Angstrom" and casing does
  // not split a column into two runs. Taken from the comparator mm-broker is
  // retiring, which is also where BLANK_CELL above came from — without it a
  // column whose `sortValue` returns strings reorders on migration.
  return firstText.localeCompare(secondText, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

@Component({
  selector: 'ds-table',
  standalone: true,
  imports: [
    ButtonComponent,
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
  /**
   * Wording for the sort announcement, so it can be translated. Receives the
   * column's label and the new direction; return an empty string to say nothing.
   */
  readonly sortAnnouncement = input<(label: string, dir: SortDir) => string>(
    (label, dir) =>
      dir
        ? `Sorted by ${label}, ${dir === 'asc' ? 'ascending' : 'descending'}`
        : `Sorting cleared`,
  );
  /**
   * Wording for the row-range announcement, so it can be translated. Receives
   * the 1-based first and last row on screen and the total; return an empty
   * string to say nothing.
   */
  readonly rangeAnnouncement = input<
    (first: number, last: number, total: number) => string
  >((first, last, total) => `Showing ${first}–${last} of ${total}`);
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

  /** Round-trip `columnOrder`, `columnWidths` and `hiddenKeys` through
   *  `localStorage`, so a reader's column layout survives a reload. Needs
   *  `storageKey` — without one there is nothing to key a screen by, and two
   *  tables would overwrite each other. Off by default. */
  readonly persistLayout = input(false, { transform: booleanAttribute });
  /** Screen id the persisted layout is stored under. Pick something stable per
   *  table, not per route instance. */
  readonly storageKey = input<string>('');

  /** Render an export button above the table. Off by default; `exportCsv()`
   *  stays available for a consumer's own button. */
  readonly exportButton = input(false, { transform: booleanAttribute });
  /** Filename the export button downloads as. */
  readonly exportFilename = input<string>('table.csv');
  /**
   * Where the export button gets its data. A server-paged table only HAS the
   * current page, so exporting without this silently exports one page.
   *
   * Return ROWS and the table serializes them the same way it serializes its
   * own. Return a `Blob` (or a URL string) and the table just downloads it —
   * which is what you want when the backend already formatted the file with its
   * own number formats, its own columns, or a sheet the table never held.
   */
  readonly exportFetcher = input<
    (() => Promise<readonly T[] | Blob | string>) | null
  >(null);
  /** Fires when `exportFetcher` rejects. Without it a failed export is silent —
   *  the button simply re-enables and no file arrives. */
  readonly exportFailed = output<unknown>();
  /** True while `exportFetcher` is in flight, so the button can disable itself. */
  protected readonly exporting = signal(false);
  /** Announced in the table's live region while an export is running or after it
   *  failed, so the button's own disabled state is not the only signal. */
  protected readonly exportStatus = signal('');

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
  /** Who sorts — see `TableSortMode`. Unset resolves to `'client'`, so a column
   *  marked `sortable` always does something; declare `'server'` when the host
   *  reorders, or `'none'` to drop the affordance entirely. */
  readonly sortMode = input<TableSortMode | null>(null);
  /** Who filters — see `TableFilterMode`. Unset resolves to `'client'`. Declare
   *  `'server'` when the host turns `columnFilters` into a request: the table
   *  then tracks the selection and runs no local pass. */
  readonly filterMode = input<TableFilterMode | null>(null);
  /**
   * The full value domain per column key, for a header filter the table cannot
   * derive itself. Without it the checklist is built from the rows in hand,
   * which on a server-paged table offers only the values that happen to be on
   * the current page.
   */
  readonly columnFilterOptions = input<ReadonlyMap<string, readonly string[]>>(
    new Map(),
  );
  protected readonly filterModeResolved = computed<TableFilterMode>(
    () => this.filterMode() ?? 'client',
  );
  protected readonly sortModeResolved = computed<TableSortMode>(
    () => this.sortMode() ?? 'client',
  );
  /** Pin the first data column (and the select column) on horizontal scroll. */
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });

  /**
   * Render only the rows in view, padding the rest with two spacer rows. Opt-in,
   * and it needs `maxHeight` — without a bounded scroller there is no viewport to
   * window against, so nothing is virtualized (dev-warned).
   *
   * Every row must be the same height, which is `virtualRowSize`: the arithmetic
   * that decides what is in view has no other way to know where a row starts. So
   * virtual mode forces `table-layout: fixed` and single-line cells, and the
   * expansion panel is suppressed — a row that can grow breaks the maths.
   */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** Row height in px in virtual mode. Must match what the rows actually
   *  measure, so it drives the CSS height rather than merely describing it. */
  readonly virtualRowSize = input(44);

  /** Fires with the row on click (or Enter/Space when `rowInteractive`). */
  readonly rowClicked = output<T>();
  /** Fires whenever sort key/direction changes, in every `sortMode` but `'none'`. */
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
    if (this.virtualizing()) {
      parts.push('virtual');
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

  private readonly headerFilters = contentChildren(HeaderFilterDirective);

  private readonly headerFilterByKey = computed(() => {
    const map = new Map<string, HeaderFilterDirective>();
    for (const filter of this.headerFilters()) {
      map.set(filter.dsHeaderFilter(), filter);
    }

    return map;
  });

  /** The projected filter for a column, when the host supplied one. */
  protected headerFilterFor(
    col: TableColumn<T>,
  ): HeaderFilterDirective | undefined {
    return this.headerFilterByKey().get(col.key);
  }

  /** A projected filter makes the column filterable on its own — the host does
   *  not also have to mark it `filter: 'set'` to get the header button. */
  protected hasColumnFilter(col: TableColumn<T>): boolean {
    if (this.filterModeResolved() === 'none') {
      return false;
    }

    return col.filter === 'set' || !!this.headerFilterFor(col);
  }

  /** A column is "actively filtered" when at least one of its values is unchecked. */
  protected isColumnFiltered(col: TableColumn<T>): boolean {
    // A projected filter owns its own criterion, so only the host can say
    // whether it is set; the table still draws the highlight.
    const projected = this.headerFilterFor(col);
    if (projected) {
      return projected.active();
    }
    const allowed = this.columnFilters().get(col.key);

    return !!allowed && allowed.size < this.optionsFor(col).length;
  }

  /** The checklist's domain: what the host declared, else what is in hand. */
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

  /** Distinct values of the open column, narrowed by the popover search box. */
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
    // Every value checked again → drop the entry so the column reads unfiltered.
    if (current.size >= distinct.length) {
      next.delete(col.key);
    } else {
      next.set(col.key, current);
    }
    this.columnFilters.set(next);
  }

  /** Context handed to a projected header filter. Rebuilt per open, which is
   *  cheap and keeps `close` bound to the popover that is actually showing. */
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

  // One notch is a comfortable nudge; a page is roughly a short column.
  private static readonly RESIZE_STEP = 16;
  private static readonly RESIZE_PAGE = 64;
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
    this.lockMeasuredWidths(header);
    this.resizeState = {
      key: col.key,
      startX: event.clientX,
      startWidth: header.offsetWidth,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  /**
   * Freeze the columns at what they currently measure, once, before the first
   * drag moves anything.
   *
   * Without it only the dragged column has a width and the rest are still
   * auto-sized, so the browser redistributes the remainder across them and
   * columns the reader never touched visibly jump. Measuring first means the
   * drag changes one column and leaves the others where they were — the
   * auto-sized geometry is kept rather than lost at the first grab.
   *
   * Runs only while something is unmeasured, so a second drag is untouched, and
   * it reads the header row that is actually on screen rather than assuming a
   * column order.
   */
  private lockMeasuredWidths(from: HTMLElement): void {
    const columns = this.visibleColumns();
    if (columns.every((col) => this.columnWidth(col) !== null)) {
      return;
    }
    const headerRow = from.parentElement;
    if (!headerRow) {
      return;
    }
    const widths = new Map(this.columnWidths());
    for (const col of columns) {
      if (this.columnWidth(col) !== null) {
        continue;
      }
      const cell = headerRow.querySelector<HTMLElement>(
        `th[data-col-key="${CSS.escape(col.key)}"]`,
      );
      if (cell) {
        widths.set(
          col.key,
          Math.max(TableComponent.MIN_COLUMN_WIDTH, cell.offsetWidth),
        );
      }
    }
    this.columnWidths.set(widths);
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

  /** Current rendered width, for the keyboard path and the handle's
   *  `aria-valuenow`. Falls back to the DOM when the column was auto-sized and
   *  has neither an override nor a declared width. */
  protected resolvedColumnWidth(
    col: TableColumn<T>,
    from?: HTMLElement,
  ): number {
    const known = this.columnWidth(col);
    if (known !== null) {
      return known;
    }

    return from?.closest('th')?.offsetWidth ?? TableComponent.MIN_COLUMN_WIDTH;
  }

  /**
   * Keyboard resizing. A drag handle that only answers to a pointer makes a
   * resizable column unusable without a mouse, which is an a11y gap rather than
   * a missing nicety — hence Arrow for fine steps, PageUp/PageDown for coarse
   * ones and Home to hand the column back to automatic sizing.
   */
  protected onResizeKey(col: TableColumn<T>, event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const header = target.closest('th');
    if (header) {
      this.lockMeasuredWidths(header);
    }
    const current = this.resolvedColumnWidth(col, target);
    let next: number | null = current;
    switch (event.key) {
      case 'ArrowLeft':
        next = current - TableComponent.RESIZE_STEP;
        break;
      case 'ArrowRight':
        next = current + TableComponent.RESIZE_STEP;
        break;
      case 'PageDown':
        next = current - TableComponent.RESIZE_PAGE;
        break;
      case 'PageUp':
        next = current + TableComponent.RESIZE_PAGE;
        break;
      case 'Home':
        next = null;
        break;
      default:
        return;
    }
    event.preventDefault();
    const widths = new Map(this.columnWidths());
    if (next === null) {
      widths.delete(col.key);
    } else {
      widths.set(
        col.key,
        Math.max(TableComponent.MIN_COLUMN_WIDTH, Math.round(next)),
      );
    }
    this.columnWidths.set(widths);
  }

  /** Client-side filter over the full data set — combines the `filterQuery`
   *  substring search with any per-column set filters. Sorting and pagination
   *  run on the filtered rows. */
  protected readonly filteredData = computed<readonly T[]>(() => {
    const query = this.filterQuery().trim().toLowerCase();
    // In 'server' mode the host has already filtered; running the set filters
    // again here would filter the filtered. `filterQuery` is deliberately left
    // alone — it is a separate input with its own client/server story.
    const setFilters =
      this.filterModeResolved() === 'client'
        ? this.columnFilters()
        : new Map<string, ReadonlySet<string>>();
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

  /** Client-side sort over the filtered data set — only in `'client'` mode. */
  protected readonly sortedData = computed<readonly T[]>(() => {
    const rows = this.filteredData();
    if (this.sortModeResolved() !== 'client') {
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

  /**
   * The single live-region line. Loading wins while it lasts — a sort
   * announcement over rows that are being replaced tells the reader about a
   * state they cannot inspect yet. Otherwise it carries the sort state and the
   * row range, which are the two things a sighted user reads off the header and
   * the pager and a screen-reader user was told nothing about.
   *
   * `aria-live="polite"` does not announce a region's INITIAL content, so the
   * unsorted first render is silent; only real changes speak.
   */
  protected readonly statusMessage = computed<string>(() => {
    if (this.loading() !== false) {
      return 'Loading…';
    }
    const exportState = this.exportStatus();
    if (exportState) {
      return exportState;
    }
    const parts = [this.sortMessage(), this.rangeMessage()].filter(Boolean);

    return parts.join('. ');
  });

  private readonly sortMessage = computed<string>(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    if (!key) {
      return '';
    }
    const label = this.columns().find((col) => col.key === key)?.label ?? key;

    return this.sortAnnouncement()(label, dir);
  });

  private readonly rangeMessage = computed<string>(() => {
    const size = this.pageSize();
    if (size === null) {
      return '';
    }
    const rows = this.displayData().length;
    if (rows === 0) {
      return '';
    }
    const first = (this.page() - 1) * size + 1;
    const total = this.total() ?? this.filteredData().length;

    return this.rangeAnnouncement()(first, first + rows - 1, total);
  });

  /** Virtual mode needs a bounded scroller to window against. */
  protected readonly virtualizing = computed(
    () => this.virtualScroll() && !!this.maxHeight(),
  );

  /** Drives the CSS row height from the same number the arithmetic uses, so the
   *  two cannot drift — which would make every offset progressively wrong. */
  protected readonly virtualRowHeight = computed(
    () => `${this.virtualRowSize()}px`,
  );

  /** `null` when not virtualizing — the row loop then walks `displayData()` whole. */
  protected readonly virtualWindow = computed(() => {
    if (!this.virtualizing()) {
      return null;
    }
    const rowSize = Math.max(1, this.virtualRowSize());
    const count = this.displayData().length;
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

  /** The rows the template actually renders. */
  protected readonly windowData = computed<readonly T[]>(() => {
    const window = this.virtualWindow();
    const data = this.displayData();

    return window ? data.slice(window.start, window.end) : data;
  });

  /** Zebra striping cannot come from `:nth-child` while windowing — the parity
   *  of a rendered row depends on its ABSOLUTE index, and the spacer rows are
   *  children too. Matches `:nth-child(odd)`, which is 1-based. */
  protected isStriped(rowIndex: number): boolean {
    const window = this.virtualWindow();

    return !!window && (window.start + rowIndex) % 2 === 0;
  }

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
    if (!TableComponent.isClipped(element)) {
      return;
    }
    event.stopPropagation();
    this.cellPopoverText.set(this.cellValue(row, col));
    this.cellTextPopover()?.toggle(element);
  }

  /** Clipped horizontally — itself or anything it renders. A `dsCellTemplate`
   *  puts the ellipsis on a descendant, so testing only the wrapper misses it. */
  private static isClipped(element: HTMLElement): boolean {
    if (element.scrollWidth > element.clientWidth) {
      return true;
    }

    return [...element.querySelectorAll<HTMLElement>('*')].some(
      (child) => child.scrollWidth > child.clientWidth,
    );
  }

  /**
   * A header narrowed by resizing clips its own label, and the label is the only
   * thing naming the column — so the full text has to stay reachable. Set on
   * enter rather than always, because a `title` on every header would fire a
   * tooltip on hover for text that is perfectly readable.
   */
  protected onHeaderEnter(event: Event, col: TableColumn<T>): void {
    const element = event.currentTarget as HTMLElement;
    const label = element.querySelector<HTMLElement>('.th-label') ?? element;
    if (TableComponent.isClipped(label)) {
      element.setAttribute('title', col.label);
    } else {
      element.removeAttribute('title');
    }
  }

  private readonly scrollWrap =
    viewChild.required<ElementRef<HTMLElement>>('scrollWrap');
  private readonly hscrollProxy =
    viewChild<ElementRef<HTMLElement>>('hscrollProxy');
  protected readonly hscrollContentWidth = signal(0);
  protected readonly hscrollNeeded = signal(false);
  private readonly scrollTop = signal(0);
  private readonly viewportHeight = signal(0);

  constructor() {
    // One effect for both halves, because the restore CANNOT run in the
    // constructor: input signals are not set yet there, so storageKey() is still
    // '' and the restore silently no-ops. The first run with a usable key
    // restores; every later run saves.
    effect(() => {
      const key = this.layoutKey();
      const order = this.columnOrder();
      const widths = this.columnWidths();
      const hidden = this.hiddenKeys();
      if (!key) {
        return;
      }
      if (!this.layoutRestored) {
        this.layoutRestored = true;
        this.restoreLayout(key);

        return;
      }
      this.saveLayout(key, order, widths, hidden);
    });

    if (isDevMode()) {
      effect(() => {
        // Only when the mode was never DECLARED: a table that asks for 'client'
        // with server paging has made that choice knowingly.
        if (
          this.sortMode() === null &&
          this.total() !== null &&
          this.columns().some((col) => col.sortable)
        ) {
          console.warn(
            '[ds-table] sortable columns default to sortMode="client", but `total` is set, so this table is server-paged and only the CURRENT PAGE would sort — the rows would look sorted and not be. Declare sortMode="server" and reorder in the (sortChange) handler, or sortMode="client" if page-local sorting is really what you want.',
          );
        }
        // Same trap one column over: a header filter on a server-paged table
        // offers only the values that happen to be on this page, and then
        // filters locally on top of what the server already filtered.
        if (
          this.filterMode() === null &&
          this.total() !== null &&
          this.columns().some((col) => col.filter === 'set')
        ) {
          console.warn(
            '[ds-table] a header filter defaults to filterMode="client", but `total` is set, so this table is server-paged: the checklist lists only the values on the CURRENT PAGE and then filters what the server already filtered. Declare filterMode="server" and turn `columnFilters` into your request, and pass the full domain through `columnFilterOptions`.',
          );
        }
      });
    }

    // Virtual mode's two measurements. Only wired while virtualizing, so a
    // normal table pays for neither the scroll listener nor the observer.
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

    if (isDevMode()) {
      effect(() => {
        if (!this.virtualScroll()) {
          return;
        }
        if (!this.maxHeight()) {
          console.warn(
            '[ds-table] virtualScroll needs maxHeight — without a bounded scroller there is no viewport to window against, so every row renders and nothing is virtualized. Set maxHeight (e.g. "480px").',
          );
        }
        if (this.expandableRows()) {
          console.warn(
            '[ds-table] virtualScroll and expandableRows do not combine: an expanded row is taller than virtualRowSize, and every offset after it would be wrong. The expander renders but the panel is suppressed — move the detail into a modal or a drawer, or drop virtualScroll.',
          );
        }
        if (this.pageSize() !== null) {
          console.warn(
            '[ds-table] virtualScroll with pageSize paginates a window of a page. Virtual scrolling is what pagination was for on a long list — pick one.',
          );
        }
      });
    }

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

  /** Whether this column's header is an actual sort control right now. */
  protected sortableCol(col: TableColumn<T>): boolean {
    return !!col.sortable && this.sortModeResolved() !== 'none';
  }

  protected ariaSort(
    col: TableColumn<T>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!this.sortableCol(col)) {
      return null;
    }
    if (this.sortKey() === col.key && this.sortDir()) {
      return this.sortDir() === 'asc' ? 'ascending' : 'descending';
    }

    return 'none';
  }

  protected onSort(col: TableColumn<T>): void {
    if (!this.sortableCol(col)) {
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
    if (this.sortableCol(col)) {
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
  exportCsv(filename = 'table.csv', rows?: readonly T[]): void {
    if (typeof document === 'undefined') {
      return;
    }
    const columns = this.visibleColumns();
    const escapeCell = (value: string): string =>
      /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const header = columns.map((col) => escapeCell(col.label));
    const body = (rows ?? this.sortedData()).map((row) =>
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

  // localStorage, not session: a column layout the reader arranged should still
  // be there tomorrow. Every access is guarded — Safari private mode throws on
  // write, and a quota error must not take the table down with it.
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
      const saved = JSON.parse(raw) as {
        order?: string[] | null;
        widths?: [string, number][];
        hidden?: string[] | null;
      };
      // Only apply what was actually stored: a table that has never been
      // rearranged must keep its declaration order and `hidden` flags.
      if (saved.order) {
        this.columnOrder.set(saved.order);
      }
      if (saved.widths) {
        this.columnWidths.set(new Map(saved.widths));
      }
      if (saved.hidden) {
        this.hiddenKeys.set(new Set(saved.hidden));
      }
    } catch {
      // Unreadable or from an older shape: fall back to the declared layout.
    }
  }

  private saveLayout(
    key: string,
    order: string[] | null,
    widths: Map<string, number>,
    hidden: Set<string> | null,
  ): void {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          order,
          widths: [...widths],
          hidden: hidden ? [...hidden] : null,
        }),
      );
    } catch {
      // Full or blocked: a lost column layout is not worth an error.
    }
  }

  /** Export button handler: awaits `exportFetcher` when one is given, so a
   *  server-paged table exports the whole set rather than the page it holds. */
  protected async runExport(): Promise<void> {
    const fetcher = this.exportFetcher();
    if (!fetcher) {
      this.exportCsv(this.exportFilename());

      return;
    }
    this.exporting.set(true);
    this.exportStatus.set('Preparing export…');
    try {
      const result = await fetcher();
      if (typeof result === 'string' || result instanceof Blob) {
        this.downloadFile(result, this.exportFilename());
      } else {
        this.exportCsv(this.exportFilename(), result);
      }
      this.exportStatus.set('Export ready');
    } catch (error) {
      // Swallowing this is what made a failed export indistinguishable from a
      // slow one: the button re-enabled and no file ever arrived.
      this.exportStatus.set('Export failed');
      this.exportFailed.emit(error);
    } finally {
      this.exporting.set(false);
    }
  }

  /** Hands a ready-made file to the browser. Only a Blob gets its object URL
   *  revoked — a URL the caller supplied is theirs to manage. */
  private downloadFile(source: Blob | string, filename: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    const url = source instanceof Blob ? URL.createObjectURL(source) : source;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    if (source instanceof Blob) {
      URL.revokeObjectURL(url);
    }
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
