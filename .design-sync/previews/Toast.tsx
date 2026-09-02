import * as React from 'react';
import { Toast } from '@ids-group-ltd/ids-design-system';

const stack: React.CSSProperties = { display: 'grid', gap: 12, maxWidth: 420 };

/** One toast per severity — info, success, warning, error, plus the spinner
 *  `loading` variant used while an async job runs. */
export const Variants = () => (
  <div style={stack}>
    <Toast
      variant="info"
      title="Recompute queued"
      message="3 logistics plans will update in a moment."
      dismissible
    />
    <Toast
      variant="success"
      title="Manifest saved"
      message="12 resource allocations updated."
      dismissible
    />
    <Toast variant="warning" title="Volume nearing limit" message="92% / 95% on Lane 04." />
    <Toast variant="error" title="Inventory sync failed" message="Connection timed out — retrying in 30s." />
    <Toast variant="loading" message="Generating delivery report…" />
  </div>
);

/** Trailing action button (`action: { label, handler }`) — invoking it also
 *  dismisses the toast. */
export const WithAction = () => (
  <div style={stack}>
    <Toast
      variant="success"
      title="Shipment deleted"
      message="Order #48211 removed from tonight's run."
      dismissible
      action={{ label: 'Undo', handler: () => {} }}
    />
    <Toast
      variant="error"
      title="POD upload failed"
      message="proof-of-delivery-48211.jpg could not be sent."
      action={{ label: 'Retry', handler: () => {} }}
    />
  </div>
);
