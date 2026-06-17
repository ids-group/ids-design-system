import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'ds-pagination',
  standalone: true,
  imports: [FormsModule, IconComponent, SelectComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = model<number>(10);
  readonly currentPage = model<number>(1);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly showLabel = input<boolean>(true);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

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
    if (current > 3) {items.push('ellipsis');}
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {items.push(i);}
    if (current < total - 2) {items.push('ellipsis');}
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

    return merged.map((n) => ({ label: `${n} per page`, value: String(n) }));
  });

  protected readonly pageSizeStr = computed(() => String(this.pageSize()));

  protected goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage())
      {return;}
    this.currentPage.set(page);
    this.pageChange.emit(page);
  }

  protected onSizeChange(value: string): void {
    const next = Number(value);
    this.pageSize.set(next);
    this.currentPage.set(1);
    this.pageSizeChange.emit(next);
    this.pageChange.emit(1);
  }
}
