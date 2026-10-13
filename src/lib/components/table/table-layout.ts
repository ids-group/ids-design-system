import {
  Injectable,
  Signal,
  TemplateRef,
  ViewContainerRef,
  signal,
} from '@angular/core';
import type { TableColumn } from './table.types';

/** A column pipeline stage: ordering, hiding, widths. */
export type DsTableColumnStage<T> = (
  columns: readonly TableColumn<T>[],
) => readonly TableColumn<T>[];

/** A row pipeline stage, run ahead of the substring search. */
export type DsTableRowStage<T> = (rows: readonly T[]) => readonly T[];

/** Where in the table a feature may put markup. */
export type DsTableAnchor = 'toolbar' | 'header-utility' | 'overlays';

/** What a resize feature hands the table: width overrides and the header separator's handlers. */
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
  /** Where the dragged column's edge runs, in the scroll container's content box: drawn down
   *  the whole table while a drag lasts. `null` between drags. */
  readonly guide?: Signal<{ x: number; height: number } | null>;
}

/**
 * What a feature may read back out of the table. This state is `protected` on the component,
 * so it is published here instead of widening the public API.
 */
export interface DsTableView<T> {
  /** As declared, before any stage runs; `visibleColumns` would fold a feature's own stage back in. */
  readonly declaredColumns: Signal<readonly TableColumn<T>[]>;
  readonly visibleColumns: Signal<readonly TableColumn<T>[]>;
  readonly sortedRows: Signal<readonly T[]>;
  readonly cellText: (row: T, column: TableColumn<T>) => string;
  /** Container a feature creates its control in. Undefined until the view exists. */
  readonly anchor: (
    name: DsTableAnchor,
  ) => Signal<ViewContainerRef | undefined>;
  /** The scroll container. */
  readonly scrollViewport: Signal<HTMLElement | undefined>;
}

/**
 * One named piece of the persisted column layout. The stored shape is `{ order, widths, hidden }`
 * and `key` IS the JSON key.
 */
export interface DsTablePersistedSlice {
  readonly key: string;
  /** Serialisable. Read inside the caller's effect, so what it touches is tracked. */
  readonly read: () => unknown;
  readonly write: (value: unknown) => void;
  /** Back to the declared layout. */
  readonly reset: () => void;
}

/** What an export feature hands the table. */
export interface DsTableExportContribution<T> {
  readonly run: () => Promise<void>;
  readonly csv: (filename?: string, rows?: readonly T[]) => void;
  readonly exporting: Signal<boolean>;
}

/**
 * The seam an opt-in table feature writes into, so the table never names the feature.
 *
 * @internal Not API. Provided by `ds-table` on itself, so two tables on one screen stay
 * independent.
 */
@Injectable()
export class DsTableLayout<T = unknown> {
  private readonly columnStages = signal<readonly DsTableColumnStage<T>[]>([]);
  private readonly rowStages = signal<readonly DsTableRowStage<T>[]>([]);
  private readonly statusFragments = signal<readonly Signal<string>[]>([]);

  /** Register once, at construction. The fold runs in the table's `computed`, so signals a stage reads are tracked. */
  addColumnStage(stage: DsTableColumnStage<T>): void {
    this.columnStages.update((stages) => [...stages, stage]);
  }

  addRowStage(stage: DsTableRowStage<T>): void {
    this.rowStages.update((stages) => [...stages, stage]);
  }

  private readonly utilityColumnWanted = signal(false);

  /** Without it the utility cell a picker trigger anchors into is never rendered. */
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

  registerPanelRowTemplate(
    template: TemplateRef<{ $implicit: TableColumn<T> }>,
  ): void {
    this.rowTemplate.set(template);
  }

  panelRowTemplate(): TemplateRef<{ $implicit: TableColumn<T> }> | null {
    return this.rowTemplate();
  }

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

  status(): string {
    return this.statusFragments()
      .map((fragment) => fragment())
      .filter(Boolean)
      .join('. ');
  }

  private published: DsTableView<T> | null = null;
  private readonly exportContribution =
    signal<DsTableExportContribution<T> | null>(null);

  /** Called by the table before any directive asks: a directive on the same element is constructed after the component. */
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

  setExport(contribution: DsTableExportContribution<T>): void {
    this.exportContribution.set(contribution);
  }

  runExport(): Promise<void> | null {
    return this.exportContribution()?.run() ?? null;
  }

  /** False when no export feature is present. */
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

  resize(): DsTableResizeContribution<T> | null {
    return this.resizeContribution();
  }
}
