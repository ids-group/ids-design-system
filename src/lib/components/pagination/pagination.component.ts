import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SelectComponent } from '@ids-group-ltd/ids-design-system/components/select';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  DsSize,
  PaginationLayout,
} from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-pagination',
  standalone: true,
  imports: [FormsModule, IconComponent, SelectComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PaginationComponent {
  /** Total item count, used to compute the page count. */
  readonly total = input.required<number>();
  /** Items per page, two-way bound. */
  readonly pageSize = model<number>(10);
  /** 1-based active page, two-way bound; a page change (incl. the reset to 1
   *  after a size change) emits via the implicit `currentPageChange`. */
  readonly currentPage = model<number>(1);
  /** Preset choices offered in the page-size dropdown. */
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  /** Shows the "Showing X–Y of Z" range label. */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /** Shows the rows-per-page dropdown. Turn it off for a screen with a fixed
   *  page size — otherwise the control offers a choice the host won't honour. */
  readonly showPageSize = input(true, { transform: booleanAttribute });
  /** Control height - sm/md/lg. A pager under a full-width table wants targets bigger than the
   *  dense default. Unset falls back to `DS_CONFIG.pagination.size`, then
   *  `DS_CONFIG.control.size`, then `'sm'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.pagination?.size ?? config.control?.size,
    'sm' as DsSize,
  );
  /** `'grouped'` keeps the label beside the controls. `'spread'` pushes them to opposite edges
   *  of whatever width the nav is given. Unset falls back to `DS_CONFIG.pagination.layout`,
   *  then `'grouped'`. */
  readonly layout = input<PaginationLayout | null>(null);
  readonly layoutResolved = resolveWithConfig(
    this.layout,
    (config) => config.pagination?.layout,
    'grouped' as PaginationLayout,
  );

  protected readonly navClass = computed(() =>
    ['pagination', this.sizeResolved(), this.layoutResolved()]
      .filter((part) => part !== 'grouped')
      .join(' '),
  );

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  protected readonly pageItems = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items: (number | 'ellipsis')[] = [1];
    if (current > 3) {
      items.push('ellipsis');
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    if (current < total - 2) {
      items.push('ellipsis');
    }
    items.push(total);

    return items;
  });

  protected readonly rangeLabel = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.total());

    return `Showing ${start}–${end} of ${this.total()}`;
  });

  protected readonly sizeOptions = computed(() => {
    const presets = this.pageSizeOptions();
    const current = this.pageSize();
    const merged = presets.includes(current)
      ? presets
      : [current, ...presets].sort((a, b) => a - b);

    return merged.map((size) => ({
      label: `${size} per page`,
      value: String(size),
    }));
  });

  protected readonly pageSizeStr = computed(() => String(this.pageSize()));

  protected goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }
    this.currentPage.set(page);
  }

  protected onSizeChange(value: string): void {
    const next = Number(value);
    this.pageSize.set(next);
    this.currentPage.set(1);
  }
}
