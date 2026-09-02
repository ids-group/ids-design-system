import * as React from 'react';
import { ToastRegion, type ToastEntry } from '@ids-group-ltd/ids-design-system';

const feed: ToastEntry[] = [
  {
    id: 1,
    variant: 'success',
    title: 'POD uploaded',
    body: 'Proof of delivery attached to order #48211.',
    dismissible: true,
  },
  {
    id: 2,
    variant: 'info',
    body: 'Recompute queued — 3 logistics plans affected.',
    dismissible: true,
  },
  {
    id: 3,
    variant: 'error',
    title: 'Depot sync failed',
    body: 'LDS-02 unreachable — retrying in 30s.',
    dismissible: false,
    action: { label: 'Retry now', handler: () => {} },
  },
];

/** Data-driven stack, oldest first — in the app this sits fixed in a viewport
 *  corner and the ToastService feeds it. */
export const Stacked = () => (
  <div style={{ maxWidth: 420 }}>
    <ToastRegion toasts={feed} onClosed={() => {}} />
  </div>
);
