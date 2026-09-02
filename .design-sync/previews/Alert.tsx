import * as React from 'react';
import { Alert, Button } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 12, width: 560 };

/** All five severity tones with their default icons. */
export const Variants = () => (
  <div style={col}>
    <Alert variant="info">
      Sync is running in the background — changes will appear shortly.
    </Alert>
    <Alert variant="success">
      Allocation saved — 3 logistics plans updated successfully.
    </Alert>
    <Alert variant="warning">
      Lane 04 is at 92% capacity — review before scheduling new pickups.
    </Alert>
    <Alert variant="error">
      Resource conflict detected — resolve before saving.
    </Alert>
    <Alert variant="neutral">
      Maintenance window scheduled — read-only Sunday 02:00–04:00 UTC.
    </Alert>
  </div>
);

/** Optional bold `title` above the message body. */
export const WithTitle = () => (
  <div style={col}>
    <Alert variant="warning" title="Approaching capacity limit">
      Lane 04 is at 92% of the 95% volume cap. Re-balance before scheduling
      new pickups.
    </Alert>
    <Alert variant="error" title="Validation failed">
      3 fields require attention before the form can be submitted.
    </Alert>
  </div>
);

/** `dismissible` adds a close button; `onClosed` fires when it's clicked. */
export const Dismissible = () => (
  <div style={col}>
    <Alert variant="info" title="Schedule updated" dismissible>
      Changes go live in 5 minutes.
    </Alert>
    <Alert variant="success" dismissible>
      Consignment IDS-48211 delivered to EC1A 1BB — signed by Amelia Barnes.
    </Alert>
  </div>
);

/** Follow-up CTAs in the `actions` slot. */
export const WithActions = () => (
  <div style={col}>
    <Alert
      variant="warning"
      title="Recompute required"
      actions={
        <>
          <Button size="sm">Preview impact</Button>
          <Button color="neutral" variant="outline" size="sm">
            Dismiss
          </Button>
        </>
      }
    >
      Changing the build start will recompute 3 logistics plans.
    </Alert>
  </div>
);
