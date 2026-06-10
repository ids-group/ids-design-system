import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  input,
  model,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../../icons/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { CellTemplateDirective } from './cell-template.directive';
import type { SortChangeEvent, SortDir, TableColumn } from './table.types';

@Component({
  selector: 'ds-table',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, SkeletonComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.bordered]': 'bordered()',
  },
})
export class TableComponent<T extends { id: string }> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly selectable = input<boolean>(false);
  /** Opt-in outer border + radius. Off by default so tables flush inside a
   *  `<ds-card padding="none">` (workspaces, programs-list) don't double-border.
   *  When `true`, the scroll-wrap gets a `var(--border-default)` outline and
   *  `var(--radius-md)` radius — useful when the table stands alone in a padded card. */
  readonly bordered = input<boolean>(false);
  /** false  — no loading state.
   *  'skeleton' — first-load placeholder; rows are replaced with shimmer
   *  rows that read the global --skeleton-shimmer-x driver.
   *  'overlay'  — re-fetch indicator; existing rows stay visible behind
   *  a translucent overlay with a centred spinner. */
  readonly loading = input<false | 'skeleton' | 'overlay'>(false);
  readonly stickyHeader = input<boolean>(true);
  readonly selectedIds = model<Set<string>>(new Set<string>());
  readonly sortKey = model<string | null>(null);
  readonly sortDir = model<SortDir>(null);
  readonly skeletonRows = input<number>(5);
  /** Accessible name for the table (rendered as a visually-hidden caption).
   *  Without it, screen-reader users get an unlabelled table. */
  readonly caption = input<string>('');
  /** When true, each row becomes a keyboard-operable control (role=button,
   *  tabindex, Enter/Space → rowClick) with an accessible name from the first
   *  column. Off by default so non-navigating tables don't advertise a false
   *  click affordance. */
  readonly rowInteractive = input<boolean>(false);

  readonly rowClick = output<T>();
  readonly sortChange = output<SortChangeEvent>();

  /** Cell templates supplied as an explicit map instead of (or in addition to)
   *  projected `dsCellTemplate` directives. Lets a wrapper component (e.g.
   *  ids-data-table) collect the directives itself and pass them down, since
   *  content projected through a wrapper's `<ng-content>` is not seen by this
   *  component's content query. Entries here override projected ones. */
  readonly cellTemplateMap = input<
    Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>>
  >({});

  /** Empty-state template, as an alternative to the `[empty]` content slot —
   *  again for wrappers that can't rely on slot re-projection. */
  readonly emptyTemplate = input<TemplateRef<unknown> | null>(null);

  protected readonly cellTemplateDirectives = contentChildren(CellTemplateDirective);

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>>
  >(() => {
    const map: Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>> = {};
    for (const dir of this.cellTemplateDirectives()) {
      map[dir.dsCellTemplate()] = dir.template;
    }
    return { ...map, ...this.cellTemplateMap() };
  });

  protected cellTemplate(col: TableColumn<T>): TemplateRef<{ $implicit: unknown; row: unknown }> | null {
    return this.cellTemplates()[col.key] ?? null;
  }

  protected readonly tableClasses = computed(() => {
    const parts = ['table'];
    if (this.loading() === 'skeleton') parts.push('skeleton-mode');
    return parts.join(' ');
  });

  protected readonly isSkeletonLoading = computed(() => this.loading() === 'skeleton');
  protected readonly isOverlayLoading = computed(() => this.loading() === 'overlay');

  protected readonly allSelected = computed(() => {
    const data = this.data();
    if (data.length === 0) return false;
    const sel = this.selectedIds();
    return data.every((row) => sel.has(row.id));
  });

  protected readonly someSelected = computed(() => {
    const data = this.data();
    const sel = this.selectedIds();
    return data.some((row) => sel.has(row.id)) && !this.allSelected();
  });

  protected readonly skeletonArray = computed(() => Array(this.skeletonRows()).fill(0));

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(row.id);
  }

  protected onToggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>(this.selectedIds());
    if (checked) {
      this.data().forEach((row) => next.add(row.id));
    } else {
      this.data().forEach((row) => next.delete(row.id));
    }
    this.selectedIds.set(next);
  }

  protected onToggleRow(row: T, event: Event): void {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>(this.selectedIds());
    if (checked) {
      next.add(row.id);
    } else {
      next.delete(row.id);
    }
    this.selectedIds.set(next);
  }

  protected onRowClick(row: T, event: Event): void {
    if ((event.target as HTMLElement).closest('input')) return;
    this.rowClick.emit(row);
  }

  protected onRowKey(row: T, event: Event): void {
    if (!this.rowInteractive()) return;
    event.preventDefault();
    this.rowClick.emit(row);
  }

  /** Accessible name for an interactive row, taken from the first column. */
  protected rowAriaLabel(row: T): string {
    const first = this.columns()[0];
    return first ? this.cellValue(row, first) : '';
  }

  /** `aria-sort` value for a header: only meaningful on sortable columns. */
  protected ariaSort(col: TableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) return null;
    if (this.sortKey() === col.key && this.sortDir()) {
      return this.sortDir() === 'asc' ? 'ascending' : 'descending';
    }
    return 'none';
  }

  protected onSort(col: TableColumn<T>): void {
    if (!col.sortable) return;
    const currentKey = this.sortKey();
    const currentDir = this.sortDir();
    let dir: SortDir;
    if (currentKey !== col.key) {
      dir = 'asc';
    } else if (currentDir === 'asc') {
      dir = 'desc';
    } else if (currentDir === 'desc') {
      dir = null;
    } else {
      dir = 'asc';
    }
    this.sortKey.set(dir ? col.key : null);
    this.sortDir.set(dir);
    this.sortChange.emit({ key: col.key, dir });
  }

  protected headerClasses(col: TableColumn<T>): string {
    const parts: string[] = [];
    if (col.sortable) parts.push('sortable');
    if (this.sortKey() === col.key && this.sortDir()) {
      parts.push(`sorted-${this.sortDir()}`);
    }
    return parts.join(' ');
  }

  protected sortIcon(col: TableColumn<T>): 'sortAsc' | 'sortDesc' | 'sort' {
    if (this.sortKey() !== col.key || !this.sortDir()) return 'sort';
    return this.sortDir() === 'asc' ? 'sortAsc' : 'sortDesc';
  }

  protected cellValue(row: T, col: TableColumn<T>): string {
    if (col.cell) return col.cell(row);
    return String((row as Record<string, unknown>)[col.key] ?? '');
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
