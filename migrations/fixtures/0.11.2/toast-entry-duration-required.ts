import type { ToastEntry } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2741
export const entry: ToastEntry = { id: 1, body: 'Saved', variant: 'success', dismissible: true };

// @ts-expect-error before TS2741
// @ts-expect-error after TS2739
export const partial: ToastEntry = { id: 2, body: 'Saved', variant: 'success' };
