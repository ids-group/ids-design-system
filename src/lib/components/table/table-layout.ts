import {
  Injectable,
  Signal,
  TemplateRef,
  ViewContainerRef,
  signal,
} from '@angular/core';
import type { TableColumn } from './table.types';

/** A stage in the column pipeline: ordering, hiding, widths. */
export type DsTableColumnStage<T> = (
  columns: readonly TableColumn<T>[],
) => readonly TableColumn<T>[];

/** A stage in the row pipeline: the set filters, ahead of the substring search. */
export type DsTableRowStage<T> = (rows: readonly T[]) => readonly T[];

/**
 * Where in the table a feature may put markup: the toolbar, the utility header cell, and the
 * end of the host where overlays belong.
 */
export type DsTableAnchor = 'toolbar' | 'header-utility' | 'overlays';

/** Everything a resize feature hands the table: the width it overrides, and the handlers the
 *  header's separator calls. */
export interface DsTableResizeContribution<T> {
  readonly widthOverride: (key: string) => number | undefined;
  readonly range: (
    column: TableColumn<T>,
  ) => { now: number; min: number; max: number } | null;
  readonly onStart: (column: TableColumn<T>, event: PointerEvent) => void;
  readonly onMove: (event: PointerEvent) => void;
  readonly onEnd: () => void;
  readonly onFocus: (column: TableColumn<T>, event: FocusEvent) => void;
  readonly onBlur: () => void;
  readonly onKey: (column: TableColumn<T>, event: KeyboardEvent) => void;
  readonly step: (column: TableColumn<T>, delta: number | 'auto') => void;
}

/**
 * What a feature is allowed to read back out of the table, and where it may put markup.
 *
 * The derived state a feature needs (`visibleColumns`, `sortedRows`, `cellText`) is `protected`
 * on the component and unreachable from a directive, so it is published here instead of
 * widening the component's public API.
 */
export interface DsTableView<T> {
  /** As declared, before any feature reorders or hides. A feature that OWNS the order needs the
   *  unfolded list - reading `visibleColumns` would fold its own stage back in. */
  readonly declaredColumns: Signal<readonly TableColumn<T>[]>;
  readonly visibleColumns: Signal<readonly TableColumn<T>[]>;
  readonly sortedRows: Signal<readonly T[]>;
  readonly cellText: (row: T, column: TableColumn<T>) => string;
  /** A directive cannot insert markup into another component's template, so a feature with a
   *  control of its own creates it in one of these. Undefined until the view exists. */
  readonly anchor: (
    name: DsTableAnchor,
  ) => Signal<ViewContainerRef | undefined>;
  /** The scroll container. A width ceiling has to be the viewport, and the header cells are
   *  looked up inside it. */
  readonly scrollViewport: Signal<HTMLElement | undefined>;
}

/**
 * One named piece of the persisted column layout.
 *
 * The stored shape is `{ order, widths, hidden }` and the key IS the JSON key, so a saved layout
 * still restores. Persistence walks whatever is registered.
 */
export interface DsTablePersistedSlice {
  readonly key: string;
  /** Serialisable. Read inside the caller's effect, so whatever it touches is tracked. */
  readonly read: () => unknown;
  readonly write: (value: unknown) => void;
  /** Back to the declared layout. "Reset to default" has to reach every slice, and only the
   *  slice knows what its own default is. */
  readonly reset: () => void;
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
 * The table owns derived values (`visibleColumns`, `filteredData`, the live region) that a
 * feature contributes to; a registry of contributions expresses that where moving methods out
 * one at a time cannot.
 *
 * @internal Not API. Provided by `ds-table` on itself, so a directive on the same element injects
 * the instance it belongs to and two tables on one screen stay independent.
 */
@Injectable()
export class DsTableLayout<T = unknown> {
  private readonly columnStages = signal<readonly DsTableColumnStage<T>[]>([]);
  private readonly rowStages = signal<readonly DsTableRowStage<T>[]>([]);
  private readonly statusFragments = signal<readonly Signal<string>[]>([]);

  /** Register once, at the contributing directive's construction. The fold runs inside the
   *  table's `computed`, so signals a stage reads are tracked there. */
  addColumnStage(stage: DsTableColumnStage<T>): void {
    this.columnStages.update((stages) => [...stages, stage]);
  }

  addRowStage(stage: DsTableRowStage<T>): void {
    this.rowStages.update((stages) => [...stages, stage]);
  }

  private readonly utilityColumnWanted = signal(false);

  /** The table knows about the row-action kebab but must be told about the picker trigger, or
   *  the utility cell it anchors into is never rendered. */
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

  resetPersisted(): void {
    for (const slice of this.slices()) {
      slice.reset();
    }
  }

  private readonly rowTemplate = signal<TemplateRef<{
    $implicit: TableColumn<T>;
  }> | null>(null);

  /** A per-column control in the column panel, for a feature the panel must not name - resize
   *  puts its width buttons there. */
  registerPanelRowTemplate(
    template: TemplateRef<{ $implicit: TableColumn<T> }>,
  ): void {
    this.rowTemplate.set(template);
  }

  panelRowTemplate(): TemplateRef<{ $implicit: TableColumn<T> }> | null {
    return this.rowTemplate();
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

  /** `runExport()` and `exporting()` stay public on the table and delegate here, so "no export
   *  directive" is distinguishable from "nothing to export". */
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

  private readonly resizeContribution =
    signal<DsTableResizeContribution<T> | null>(null);

  setResize(contribution: DsTableResizeContribution<T>): void {
    this.resizeContribution.set(contribution);
  }

  /** Null when no resize feature is present, which is what the header's `@if` reads. */
  resize(): DsTableResizeContribution<T> | null {
    return this.resizeContribution();
  }
}
