import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { PaginationComponent } from '../pagination/pagination.component';
import type {
  SortChangeEvent,
  SortDir,
  TableColumn,
} from '../table/table.types';

const NUMERIC = /^-?\d+(\.\d+)?$/;

@Component({
  selector: 'ds-data-grid',
  standalone: true,
  imports: [IconComponent, PaginationComponent],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.selectable]': 'selectable()',
    '[class.pinned]': 'stickyFirstColumn()',
  },
})
export class DataGridComponent<T extends { id: string }> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly selectable = input(false, { transform: booleanAttribute });
  // Pin the first data column (and the select column) while scrolling sideways.
  readonly stickyFirstColumn = input(true, { transform: booleanAttribute });
  readonly pageSize = model<number>(10);
  readonly page = model<number>(1);
  readonly sortKey = model<string | null>(null);
  readonly sortDir = model<SortDir>(null);
  readonly selectedIds = model<Set<string>>(new Set<string>());
  readonly caption = input<string>('');

  readonly sortChange = output<SortChangeEvent>();

  protected readonly colspan = computed(
    () => this.columns().length + (this.selectable() ? 1 : 0),
  );

  // Client-side sort over the full data set.
  protected readonly sortedData = computed<readonly T[]>(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    const rows = this.data();
    if (!key || !dir) {
      return rows;
    }
    const column = this.columns().find((col) => col.key === key);
    if (!column) {
      return rows;
    }
    const sorted = rows.slice().sort((a, b) => {
      const aValue = this.cellValue(a, column);
      const bValue = this.cellValue(b, column);
      const comparison =
        NUMERIC.test(aValue) && NUMERIC.test(bValue)
          ? Number(aValue) - Number(bValue)
          : aValue.localeCompare(bValue);

      return dir === 'asc' ? comparison : -comparison;
    });

    return sorted;
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.data().length / this.pageSize())),
  );

  // The current page's slice of the sorted rows.
  protected readonly pagedData = computed<readonly T[]>(() => {
    const size = this.pageSize();
    const start = (this.page() - 1) * size;

    return this.sortedData().slice(start, start + size);
  });

  protected readonly allSelected = computed(() => {
    const page = this.pagedData();
    if (page.length === 0) {
      return false;
    }
    const selected = this.selectedIds();

    return page.every((row) => selected.has(row.id));
  });

  protected readonly someSelected = computed(() => {
    const page = this.pagedData();
    const selected = this.selectedIds();

    return page.some((row) => selected.has(row.id)) && !this.allSelected();
  });

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(row.id);
  }

  /** Accessible name for a row's checkbox, taken from the first column. */
  protected rowAriaLabel(row: T): string {
    const first = this.columns()[0];

    return first ? this.cellValue(row, first) : '';
  }

  protected onToggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>(this.selectedIds());
    for (const row of this.pagedData()) {
      if (checked) {
        next.add(row.id);
      } else {
        next.delete(row.id);
      }
    }
    this.selectedIds.set(next);
  }

  protected onToggleRow(row: T, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>(this.selectedIds());
    if (checked) {
      next.add(row.id);
    } else {
      next.delete(row.id);
    }
    this.selectedIds.set(next);
  }

  protected onSort(column: TableColumn<T>): void {
    if (!column.sortable) {
      return;
    }
    const currentKey = this.sortKey();
    const currentDir = this.sortDir();
    let dir: SortDir;
    if (currentKey !== column.key) {
      dir = 'asc';
    } else if (currentDir === 'asc') {
      dir = 'desc';
    } else if (currentDir === 'desc') {
      dir = null;
    } else {
      dir = 'asc';
    }
    this.sortKey.set(dir ? column.key : null);
    this.sortDir.set(dir);
    this.sortChange.emit({ key: column.key, dir });
  }

  protected ariaSort(
    column: TableColumn<T>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) {
      return null;
    }
    if (this.sortKey() === column.key && this.sortDir()) {
      return this.sortDir() === 'asc' ? 'ascending' : 'descending';
    }

    return 'none';
  }

  protected headerClasses(column: TableColumn<T>): string {
    const parts: string[] = [];
    if (column.sortable) {
      parts.push('sortable');
    }
    if (this.sortKey() === column.key && this.sortDir()) {
      parts.push(`sorted-${this.sortDir()}`);
    }

    return parts.join(' ');
  }

  protected sortIcon(column: TableColumn<T>): 'sortAsc' | 'sortDesc' | 'sort' {
    if (this.sortKey() !== column.key || !this.sortDir()) {
      return 'sort';
    }

    return this.sortDir() === 'asc' ? 'sortAsc' : 'sortDesc';
  }

  protected cellValue(row: T, column: TableColumn<T>): string {
    if (column.cell) {
      return column.cell(row);
    }

    return String((row as Record<string, unknown>)[column.key] ?? '');
  }
}
