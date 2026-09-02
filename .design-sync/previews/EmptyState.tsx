import * as React from 'react';
import { EmptyState, Button } from '@ids-group-ltd/ids-design-system';

/** Canonical composition — icon tile, title, one-line body, primary CTA. */
export const Canonical = () => (
  <div style={{ width: 440 }}>
    <EmptyState
      title="No assets allocated yet"
      body="Pick from the asset register to start building this sub-record."
      actions={
        <Button size="sm" icon="plus">
          Allocate resources
        </Button>
      }
    />
  </div>
);

/** The five variants — each tints the icon tile and swaps the default icon;
 *  `loading` additionally covers the block with a spinner scrim. */
export const Variants = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 250px)',
      gap: 16,
      alignItems: 'stretch',
    }}
  >
    <EmptyState variant="none" title="No data" body="This section is empty." />
    <EmptyState variant="loading" title="Loading" body="Data refetching." />
    <EmptyState variant="error" title="Error" body="Something went wrong." />
    <EmptyState variant="locked" title="No access" body="Permission denied." />
    <EmptyState
      variant="success"
      title="All caught up"
      body="Every consignment has been scanned."
    />
  </div>
);

/** Error state with a retry CTA. */
export const ErrorRetry = () => (
  <div style={{ width: 440 }}>
    <EmptyState
      variant="error"
      title="Couldn't load resource allocations"
      body="Network error — the request timed out after 30 seconds."
      actions={
        <Button size="sm" icon="rotate">
          Retry
        </Button>
      }
    />
  </div>
);
