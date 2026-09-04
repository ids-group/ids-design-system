import { Injectable, Signal, signal } from '@angular/core';
import type { TableColumn } from './table.types';

/** A stage in the column pipeline: ordering, hiding, widths. */
export type DsTableColumnStage<T> = (
  columns: readonly TableColumn<T>[],
) => readonly TableColumn<T>[];

/** A stage in the row pipeline: the set filters, ahead of the substring search. */
export type DsTableRowStage<T> = (rows: readonly T[]) => readonly T[];

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
}
