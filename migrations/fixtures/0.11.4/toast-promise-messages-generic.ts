import { ToastService, type ToastPromiseMessages } from '@ids-group-ltd/ids-design-system';

interface Order {
  id: number;
}

export const bare: ToastPromiseMessages = { loading: 'Saving', success: 'Saved', error: 'Failed' };

export const typedAgainstBare: ToastPromiseMessages = {
  loading: 'Saving',
  // @ts-expect-error both TS2322
  success: (order: Order) => `Saved #${order.id}`,
  error: 'Failed',
};

// @ts-expect-error before TS2315
export const typed: ToastPromiseMessages<Order> = {
  loading: 'Saving',
  // @ts-expect-error before TS7006
  success: (order) => `Saved #${order.id}`,
  error: 'Failed',
};

const label = (order: Order): string => `Saved #${order.id}`;

export function save(toast: ToastService, loadOrder: () => Promise<Order>): void {
  // @ts-expect-error before TS2345
  toast.promise(loadOrder(), { loading: 'Saving', success: (order) => label(order), error: 'Failed' });
}
