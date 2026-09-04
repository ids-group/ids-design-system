import { Injectable, Signal, ViewContainerRef, signal } from '@angular/core';
import type { TableColumn } from './table.types';

/** A stage in the column pipeline: ordering, hiding, widths. */
export type DsTableColumnStage<T> = (
  columns: readonly TableColumn<T>[],
) => readonly TableColumn<T>[];

/** A stage in the row pipeline: the set filters, ahead of the substring search. */
export type DsTableRowStage<T> = (rows: readonly T[]) => readonly T[];

/**
 * What a feature is allowed to read back out of the table, and where it may put markup.
 *
 * A feature needs the table's derived state — the export serialises `visibleColumns` and
 * `sortedRows` through `cellText`. Those live on the component as `protected`, which a directive
 * cannot reach, so the contract is published here rather than by widening the component's surface:
 * this way the table's public API does not grow one member per feature.
 */
/**
 * Where in the table a feature may put markup.
 *
 * Three, because the column picker needs three: a trigger in the utility header cell, and its
 * popover and bottom sheet at the end of the host where an overlay belongs. One
 * `ViewContainerRef` was enough for the export button and is not enough for anything else.
 */
export type DsTableAnchor = 'toolbar' | 'header-utility' | 'overlays';

export interface DsTableView<T> {
  readonly visibleColumns: Signal<readonly TableColumn<T>[]>;
  readonly sortedRows: Signal<readonly T[]>;
  readonly cellText: (row: T, column: TableColumn<T>) => string;
  /** A directive cannot insert markup into another component's template, so a feature with a
   *  control of its own creates it in one of these. Undefined until the view exists. */
  readonly anchor: (
    name: DsTableAnchor,
  ) => Signal<ViewContainerRef | undefined>;
}

/**
 * One named piece of the persisted column layout.
 *
 * The stored shape stays `{ order, widths, hidden }`, so a layout saved by an earlier version
 * still restores — the key IS the JSON key. Persistence walks whatever is registered instead of
 * naming the three inputs, which is what lets reorder, the picker and resize move out from under
 * it without the storage code changing.
 */
export interface DsTablePersistedSlice {
  readonly key: string;
  /** Serialisable. Read inside the caller's effect, so whatever it touches is tracked. */
  readonly read: () => unknown;
  readonly write: (value: unknown) => void;
}

/** What an export feature hands the table, so `runExport()` and `exporting()` stay public API
 *  while the implementation lives outside the component. */
export interface DsTableExportContribution<T> {
  readonly run: () => Promise<void>;
  readonly csv: (filename?: string, rows?: readonly T[]) => void;
  readonly exporting: Signal<boolean>;
}

/**
 * The seam an opt-in table feature writes into, so the table never names the feature.
 *
 * The ablation that priced this split (`docs/basic-advanced-split-audit.md` §9) kept hitting the
 * same shape: the table owns a derived value and a feature wants to contribute to it —
 * `visibleColumns` is the chain the column picker writes to, `filteredData` folds the set filters
 * into the substring search, the live region folds in the export state. Moving methods out one at a
 * time cannot express that; a registry of contributions can.
 *
 * @internal Not API. Provided by `ds-table` on itself, so a directive on the same element injects
 * the instance it belongs to and two tables on one screen stay independent.
 */
@Injectable()
export class DsTableLayout<T = unknown> {
  private readonly columnStages = signal<readonly DsTableColumnStage<T>[]>([]);
  private readonly rowStages = signal<readonly DsTableRowStage<T>[]>([]);
  private readonly statusFragments = signal<readonly Signal<string>[]>([]);

  /** Registered once, at the contributing directive's construction — never per change
   *  detection. A stage may read signals of its own: the fold runs inside the table's
   *  `computed`, so whatever the stage touches is tracked by that computed rather than by
   *  this service, which is what lets a feature stay reactive without the table knowing it
   *  exists. */
  addColumnStage(stage: DsTableColumnStage<T>): void {
    this.columnStages.update((stages) => [...stages, stage]);
  }

  addRowStage(stage: DsTableRowStage<T>): void {
    this.rowStages.update((stages) => [...stages, stage]);
  }

  private readonly utilityColumnWanted = signal(false);

  /** The utility column carries the row-action kebab and the picker trigger. The table knows
   *  about the first and must be told about the second, or the cell it anchors into is never
   *  rendered and the feature has nowhere to go. */
  requestUtilityColumn(): void {
    this.utilityColumnWanted.set(true);
  }

  wantsUtilityColumn(): boolean {
    return this.utilityColumnWanted();
  }

  private readonly slices = signal<readonly DsTablePersistedSlice[]>([]);

  addPersistedSlice(slice: DsTablePersistedSlice): void {
    this.slices.update((registered) => [...registered, slice]);
  }

  persistedSlices(): readonly DsTablePersistedSlice[] {
    return this.slices();
  }

  /** A line for the live region, folded in ahead of the table's own events. */
  addStatusFragment(fragment: Signal<string>): void {
    this.statusFragments.update((fragments) => [...fragments, fragment]);
  }

  foldColumns(columns: readonly TableColumn<T>[]): readonly TableColumn<T>[] {
    return this.columnStages().reduce(
      (carried, stage) => stage(carried),
      columns,
    );
  }

  foldRows(rows: readonly T[]): readonly T[] {
    return this.rowStages().reduce((carried, stage) => stage(carried), rows);
  }

  /** Empty when nothing contributes, so the table's own message is unchanged. */
  status(): string {
    return this.statusFragments()
      .map((fragment) => fragment())
      .filter(Boolean)
      .join('. ');
  }

  private published: DsTableView<T> | null = null;
  private readonly exportContribution =
    signal<DsTableExportContribution<T> | null>(null);

  /** Called by the table itself, before any directive can ask for it: a directive on the same
   *  element is constructed after the component that provides this service. */
  publish(view: DsTableView<T>): void {
    this.published = view;
  }

  view(): DsTableView<T> {
    if (!this.published) {
      throw new Error(
        'DsTableLayout was read before ds-table published its view — a feature directive must sit on the ds-table element.',
      );
    }

    return this.published;
  }

  /** The table keeps `runExport()` and `exporting()` as public API, because their docblocks
   *  promise a button outside the table can drive them. The implementation is the feature's, so
   *  the table asks here and can tell the difference between "no export directive" and "nothing
   *  to export" — which is the one silent failure this whole shape is prone to. */
  setExport(contribution: DsTableExportContribution<T>): void {
    this.exportContribution.set(contribution);
  }

  runExport(): Promise<void> | null {
    return this.exportContribution()?.run() ?? null;
  }

  /** True when it ran, so the caller can tell "no feature" from "nothing to export". */
  exportCsv(filename?: string, rows?: readonly T[]): boolean {
    const contribution = this.exportContribution();
    contribution?.csv(filename, rows);

    return contribution !== null;
  }

  exporting(): boolean {
    return this.exportContribution()?.exporting() ?? false;
  }
}
