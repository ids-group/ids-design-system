import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ApiResult } from '@app/common';
import { BaseListParams } from '../store/helpers';
import {
  ItemDto,
  ItemFormModel,
  ItemListItem,
  dtoToListItem,
} from '../../features/items/models';

export interface ItemListResult {
  items: ItemListItem[];
  total: number;
}

/**
 * Demo data access — in-memory so the starter runs with no backend. Replace the
 * bodies with `HttpService` calls (see HttpAuthProvider for the pattern); the
 * `ApiResult<T>` envelope and store wiring stay the same.
 */
@Injectable({ providedIn: 'root' })
export class ItemApi {
  private items: ItemDto[] = [
    { id: '1', name: 'Widget', category: 'Hardware', quantity: 12 },
    { id: '2', name: 'Gadget', category: 'Hardware', quantity: 7 },
    { id: '3', name: 'Manual', category: 'Docs', quantity: 30 },
  ];
  private seq = 4;

  list(params: BaseListParams): Observable<ApiResult<ItemListResult>> {
    let rows = this.items.map(dtoToListItem);

    const search = params.search.toLowerCase();
    if (search) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.category.toLowerCase().includes(search),
      );
    }

    const dir = params.sortOrder === 'Asc' ? 1 : -1;
    const key = params.sortField as keyof ItemListItem;
    rows = [...rows].sort((a, b) => {
      if (a[key] > b[key]) {
        return dir;
      }
      if (a[key] < b[key]) {
        return -dir;
      }

      return 0;
    });

    // 600ms (> debouncedLoading's 300ms show-delay) so the list's loading state
    // is actually exercised in the demo. A real API replaces this with HttpService.
    return of<ApiResult<ItemListResult>>({
      isSuccess: true,
      data: { items: rows, total: rows.length },
    }).pipe(delay(600));
  }

  get(id: string): Observable<ApiResult<ItemDto>> {
    const found = this.items.find((i) => i.id === id);

    return of<ApiResult<ItemDto>>(
      found
        ? { isSuccess: true, data: { ...found } }
        : { isSuccess: false, failure: { message: 'Item not found' } },
    ).pipe(delay(150));
  }

  create(form: ItemFormModel): Observable<ApiResult<ItemDto>> {
    const created: ItemDto = { id: String(this.seq++), ...form };
    this.items = [...this.items, created];

    return of<ApiResult<ItemDto>>({ isSuccess: true, data: created }).pipe(
      delay(150),
    );
  }

  update(id: string, form: ItemFormModel): Observable<ApiResult<ItemDto>> {
    this.items = this.items.map((i) => (i.id === id ? { ...i, ...form } : i));
    const updated = this.items.find((i) => i.id === id);

    return of<ApiResult<ItemDto>>(
      updated
        ? { isSuccess: true, data: { ...updated } }
        : { isSuccess: false, failure: { message: 'Item not found' } },
    ).pipe(delay(150));
  }

  delete(id: string): Observable<ApiResult> {
    this.items = this.items.filter((i) => i.id !== id);

    return of<ApiResult>({ isSuccess: true }).pipe(delay(150));
  }
}
