import { Injectable, type Signal, signal } from '@angular/core';
import type { BreadcrumbItem } from './breadcrumbs.types';

/**
 * Breadcrumb state that `<ds-breadcrumbs>` reads when no `[items]` input is provided.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
  private readonly _items = signal<BreadcrumbItem[]>([]);
  readonly items: Signal<BreadcrumbItem[]> = this._items.asReadonly();

  set(items: BreadcrumbItem[]): void {
    this._items.set(items);
  }

  push(item: BreadcrumbItem): void {
    this._items.update((arr) => [...arr, item]);
  }

  pop(): void {
    this._items.update((arr) => arr.slice(0, -1));
  }

  replaceLast(item: BreadcrumbItem): void {
    this._items.update((arr) =>
      arr.length ? [...arr.slice(0, -1), item] : [item],
    );
  }

  clear(): void {
    this._items.set([]);
  }
}
