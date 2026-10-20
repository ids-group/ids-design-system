import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  BadgeComponent,
  SidenavComponent,
  SidenavItemComponent,
  SortChangeEvent,
  TableColumn,
  TableComponent,
} from '@ids-group-ltd/ids-design-system';
import { Order, OrdersService, OrderStatus } from './orders.service';
import { NotificationService } from '../core/notification.service';

type StatusFilter = 'all' | OrderStatus;

@Component({
  selector: 'app-orders-page',
  imports: [RouterLink, BadgeComponent, SidenavComponent, SidenavItemComponent, TableComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss',
})
export class OrdersPageComponent implements OnInit {
  private readonly orders = inject(OrdersService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly columns: TableColumn<Order>[] = [
    { key: 'reference', label: 'Order', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'placedAt', label: 'Placed', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total', sortable: true },
  ];

  readonly orderId = (order: Order) => order.id;
  readonly rows = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly statusFilter = signal<StatusFilter>('all');
  readonly sortKey = signal<string | null>('placedAt');
  readonly sortDirection = signal<'asc' | 'desc' | null>('desc');
  readonly highlightedId = signal<string | null>(null);

  readonly visibleRows = computed(() => {
    const filter = this.statusFilter();
    return filter === 'all'
      ? this.rows()
      : this.rows().filter((order) => order.status === filter);
  });

  readonly statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    const highlighted = this.route.snapshot.queryParamMap.get('highlight');
    this.load();
    if (highlighted) {
      this.highlightedId.set(highlighted);
      setTimeout(() => this.highlightedId.set(null), 4000);
    }
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.orders
      .list({ sortBy: this.sortKey(), direction: this.sortDirection() })
      .pipe(
        catchError(() => {
          this.loadFailed.set(true);
          return of([] as Order[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders) => {
        this.rows.set(orders);
        this.loading.set(false);
      });
  }

  onSort(event: SortChangeEvent): void {
    this.sortKey.set(event.dir ? event.key : null);
    this.sortDirection.set(event.dir);
    this.load();
  }

  selectStatus(value: StatusFilter): void {
    this.statusFilter.set(value);
  }

  openOrder(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  async cancelOrder(order: Order): Promise<void> {
    try {
      await this.orders.cancel(order.id);
      this.notifications.success(`Order ${order.reference} cancelled`);
      this.load();
    } catch (error) {
      this.notifications.error('The order could not be cancelled. Try again.');
      console.error(error);
    }
  }
}
