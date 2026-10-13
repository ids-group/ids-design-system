import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SelectComponent } from '@ids-group-ltd/ids-design-system/components/select';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { focusRescue } from '@ids-group-ltd/ids-design-system/components';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  DsSize,
  PaginationLayout,
} from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-pagination',
  standalone: true,
  imports: [FormsModule, IconComponent, SelectComponent, SkeletonComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PaginationComponent {
  /** Total item count; drives the page count. */
  readonly total = input.required<number>();
  /** Items per page, two-way bound. */
  readonly pageSize = model<number>(10);
  /** 1-based active page. Resets to 1 after a page-size change. */
  readonly currentPage = model<number>(1);
  /** Choices in the page-size dropdown. */
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  /** Shows the range label, `DS_INTL.pagination.range`: "Showing X-Y of Z", or "Showing 0 of 0"
   *  on an empty list. */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /** Shows the rows-per-page dropdown. Turn it off when the host fixes the page size. */
  readonly showPageSize = input(true, { transform: booleanAttribute });
  /** Unset falls back to `DS_CONFIG.pagination.size`, then
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
  /** The host is still fetching: the page buttons take `aria-disabled` and ignore presses while
   *  staying focusable, the size select disables, the range label is masked with a `<ds-skeleton>`
   *  so a stale `total` is never quoted, and the nav reports `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly intl = inject(DS_INTL);
  private readonly rescueFocus = focusRescue();

  protected readonly navClass = computed(() =>
    ['pagination', this.sizeResolved(), this.layoutResolved()]
      .filter((part) => part !== 'grouped')
      .join(' '),
  );

  protected readonly empty = computed(() => this.total() === 0);

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
    if (this.empty()) {
      return this.intl().pagination.range(0, 0, 0);
    }
    const total = this.total();
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);

    return this.intl().pagination.range(start, end, total);
  });

  protected readonly sizeOptions = computed(() => {
    const presets = this.pageSizeOptions();
    const current = this.pageSize();
    const merged = presets.includes(current)
      ? presets
      : [current, ...presets].sort((a, b) => a - b);

    return merged.map((size) => ({
      label: this.intl().pagination.perPage(size),
      value: String(size),
    }));
  });

  protected readonly pageSizeStr = computed(() => String(this.pageSize()));

  protected goTo(page: number, nav: HTMLElement): void {
    if (
      this.loading() ||
      page < 1 ||
      page > this.totalPages() ||
      page === this.currentPage()
    ) {
      return;
    }
    this.currentPage.set(page);
    // Previous or Next disables under focus at the first or last page.
    this.rescueFocus(() =>
      nav.querySelector<HTMLElement>('[aria-current="page"]'),
    );
  }

  protected onSizeChange(value: string): void {
    const next = Number(value);
    this.pageSize.set(next);
    this.currentPage.set(1);
  }
}
