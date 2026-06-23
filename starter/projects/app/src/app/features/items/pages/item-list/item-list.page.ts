import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ButtonComponent,
  InputComponent,
} from '@ids-group-ltd/ids-design-system';
import { debouncedLoading } from '@app/common';
import { ItemStore } from '../../../../core/store/item.store';
import { ItemActionsService } from '../../services/item-actions.service';
import { ItemListItem } from '../../models';

@Component({
  selector: 'app-item-list-page',
  imports: [RouterLink, ButtonComponent, InputComponent],
  templateUrl: './item-list.page.html',
  styleUrl: './item-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListPage {
  private readonly store = inject(ItemStore);
  private readonly actions = inject(ItemActionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly items = this.store.items;
  // Anti-flicker: only shows after 300ms, then stays ≥500ms (no flash on fast loads).
  protected readonly loading = debouncedLoading(this.store.listLoading);
  protected readonly params = this.store.params;
  protected readonly searchTerm = signal('');

  constructor() {
    // URL is the source of truth — react to query-param changes (incl. initial load).
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((qp) => {
      this.searchTerm.set((qp['search'] as string) ?? '');
      this.store.applyQueryParams(qp as Record<string, string>);
    });
  }

  protected applySearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: this.searchTerm() || null },
      queryParamsHandling: 'merge',
    });
  }

  protected sortBy(field: string): void {
    const current = this.params();
    const order =
      current.sortField === field && current.sortOrder === 'Asc'
        ? 'Desc'
        : 'Asc';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: field, order },
      queryParamsHandling: 'merge',
    });
  }

  protected remove(item: ItemListItem): void {
    void this.actions.deleteItem(item.id, item.name);
  }
}
