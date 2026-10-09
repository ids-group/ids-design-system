import type { SortDir } from '@ids-group-ltd/ids-design-system';

export class OrdersStore {
  readonly direction = signal<SortDir | null>(null);
}
