import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  type ComponentRef,
  DestroyRef,
  Directive,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  DsTableLayout,
  type TableColumn,
} from '@ids-group-ltd/ids-design-system/components/table';
import { TableColumnsPanelComponent } from './table-columns-panel.component';
import { TableColumnsTriggerComponent } from './table-columns-trigger.component';

/**
 * Showing, hiding and reordering columns for `<ds-table>`, as a directive so a table that does
 * none of it never carries the panel — nor `@angular/cdk/drag-drop`, which comes with the drag
 * handle:
 *
 * ```html
 * <ds-table dsTableColumns [reorderableColumns]="true" [columns]="cols" [data]="rows" />
 * ```
 *
 * Hiding needs no input: a column marked `hideable` becomes hideable the moment this directive is
 * present. `[(hiddenKeys)]` and `[(columnOrder)]` are two-way, so the layout can be driven from
 * the host, and both round-trip through `persistLayout` on the table.
 */
@Directive({
  selector: '[dsTableColumns]',
  standalone: true,
})
export class DsTableColumns<T extends object> {
  private readonly layout = inject<DsTableLayout<T>>(DsTableLayout);

  /** Adds the drag handle and the move buttons. Hiding works without it. */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });

  /** Keys the reader has hidden. Unset falls back to the columns' own `hidden` flags. */
  readonly hiddenKeys = model<Set<string> | null>(null);

  /** Column keys in the reader's order. Unset keeps the declaration order. */
  readonly columnOrder = model<string[] | null>(null);

  private readonly coarsePointerState = signal(false);
  private readonly coarsePointer = this.coarsePointerState.asReadonly();

  private readonly effectiveHiddenKeys = computed<ReadonlySet<string>>(
    () => this.hiddenKeys() ?? new Set(this.hiddenByDeclaration()),
  );

  private readonly declaredColumns = computed<readonly TableColumn<T>[]>(() =>
    this.layout.view().declaredColumns(),
  );

  private hiddenByDeclaration(): readonly string[] {
    return this.declaredColumns()
      .filter((column) => column.hidden)
      .map((column) => column.key);
  }

  /** Declaration order with the reader's order applied first, then anything they never moved. */
  private readonly ordered = computed<readonly TableColumn<T>[]>(() => {
    const order = this.columnOrder();
    const columns = this.declaredColumns();
    if (!order) {
      return columns;
    }
    const byKey = new Map(columns.map((column) => [column.key, column]));
    const placed = new Set<string>();
    const out: TableColumn<T>[] = [];
    for (const key of order) {
      const column = byKey.get(key);
      if (column && !placed.has(key)) {
        out.push(column);
        placed.add(key);
      }
    }
    for (const column of columns) {
      if (!placed.has(column.key)) {
        out.push(column);
      }
    }

    return out;
  });

  private readonly visible = computed<readonly TableColumn<T>[]>(() =>
    this.ordered().filter(
      (column) => !this.effectiveHiddenKeys().has(column.key),
    ),
  );

  constructor() {
    this.layout.addColumnStage(() => this.visible());
    this.layout.requestUtilityColumn();
    this.layout.addPersistedSlice({
      key: 'order',
      read: () => this.columnOrder(),
      write: (value) => this.columnOrder.set(value as string[]),
      reset: () => this.columnOrder.set(null),
    });
    this.layout.addPersistedSlice({
      key: 'hidden',
      read: () => (this.hiddenKeys() ? [...this.hiddenKeys()!] : null),
      write: (value) => this.hiddenKeys.set(new Set(value as string[])),
      reset: () => this.hiddenKeys.set(null),
    });

    const trigger = this.layout.view().anchor('header-utility');
    const overlays = this.layout.view().anchor('overlays');
    let panel: ComponentRef<TableColumnsPanelComponent<T>> | null = null;
    let button: ComponentRef<TableColumnsTriggerComponent> | null = null;

    effect(() => {
      const host = overlays();
      if (!host || panel) {
        return;
      }
      panel = host.createComponent(TableColumnsPanelComponent<T>);
      panel.instance.toggled.subscribe((column) => this.toggleColumn(column));
      panel.instance.moved.subscribe(({ column, delta }) =>
        this.moveColumn(column, delta),
      );
      panel.instance.dropped.subscribe((event) => this.onDrop(event));
      panel.instance.resetRequested.subscribe(() =>
        this.layout.resetPersisted(),
      );
    });

    effect(() => {
      const host = trigger();
      if (!host || button) {
        return;
      }
      button = host.createComponent(TableColumnsTriggerComponent);
      button.instance.pressed.subscribe((event: Event) =>
        panel?.instance.toggle(event.currentTarget as HTMLElement),
      );
    });

    // Both are separate views, so the host's change detection does not reach them: every input
    // they read has to be written when it moves.
    effect(() => {
      panel?.setInput('columns', this.ordered());
      panel?.setInput('reorderable', this.reorderableColumns());
      panel?.setInput('coarsePointer', this.coarsePointer());
      panel?.setInput('rowExtras', this.layout.panelRowTemplate());
      panel?.setInput('isVisible', (column: TableColumn<T>) =>
        this.isVisible(column),
      );
      panel?.setInput('isLocked', (column: TableColumn<T>) =>
        this.isLocked(column),
      );
      button?.setInput('opened', panel?.instance.opened() ?? false);
    });

    if (typeof window !== 'undefined' && window.matchMedia) {
      const query = window.matchMedia('(hover: none) and (pointer: coarse)');
      const sync = (): void => this.coarsePointerState.set(query.matches);
      sync();
      query.addEventListener('change', sync);
      inject(DestroyRef).onDestroy(() =>
        query.removeEventListener('change', sync),
      );
    }

    inject(DestroyRef).onDestroy(() => {
      panel?.destroy();
      button?.destroy();
    });
  }

  private isVisible(column: TableColumn<T>): boolean {
    return !this.effectiveHiddenKeys().has(column.key);
  }

  /** The last visible column cannot be hidden — an all-hidden grid is useless. */
  private isLocked(column: TableColumn<T>): boolean {
    return this.isVisible(column) && this.visible().length === 1;
  }

  private toggleColumn(column: TableColumn<T>): void {
    if (!column.hideable || this.isLocked(column)) {
      return;
    }
    const next = new Set(this.effectiveHiddenKeys());
    if (next.has(column.key)) {
      next.delete(column.key);
    } else {
      next.add(column.key);
    }
    this.hiddenKeys.set(next);
  }

  private moveColumn(column: TableColumn<T>, delta: -1 | 1): void {
    const keys = this.ordered().map((each) => each.key);
    const from = keys.indexOf(column.key);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= keys.length) {
      return;
    }
    moveItemInArray(keys, from, to);
    this.columnOrder.set(keys);
  }

  private onDrop(event: CdkDragDrop<unknown>): void {
    const keys = this.ordered().map((each) => each.key);
    moveItemInArray(keys, event.previousIndex, event.currentIndex);
    this.columnOrder.set(keys);
  }
}
