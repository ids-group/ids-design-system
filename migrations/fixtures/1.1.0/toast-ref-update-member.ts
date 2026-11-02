import type { ToastRef } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2741
export const fakeToast: ToastRef = { id: 1, dismiss: () => {} };
