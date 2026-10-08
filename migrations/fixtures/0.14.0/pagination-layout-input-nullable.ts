import { input } from '@angular/core';
import { PaginationComponent, type PaginationLayout } from '@ids-group-ltd/ids-design-system';

export function read(pager: PaginationComponent): boolean {
  const grouped = pager.layout() === 'grouped';
  // @ts-expect-error after TS2322
  const layout: PaginationLayout = pager.layout();
  return grouped && layout === 'spread';
}

export class AppPagination extends PaginationComponent {
  // @ts-expect-error after TS2416
  override readonly layout = input<PaginationLayout>('grouped');
}
