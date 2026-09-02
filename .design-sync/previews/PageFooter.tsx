import * as React from 'react';
import { Button, PageFooter } from '@ids-group-ltd/ids-design-system';

/** default — plain border-top spread: brand text leading, quiet nav links,
 *  a trailing action. The host itself is the space-between flex row. */
export const Default = () => (
  <PageFooter
    brand={<div className="t-s">IDS TrackHub · v2.4.1</div>}
    nav={
      <nav style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <a className="link quiet" href="#depots">
          Depot directory
        </a>
        <a className="link quiet" href="#status">
          Service status
        </a>
        <a className="link quiet" href="#support">
          Support
        </a>
      </nav>
    }
    actions={
      <Button color="neutral" variant="outline" size="sm" icon="mail">
        Feedback
      </Button>
    }
  />
);

/** compact — subtle bordered card; summary text with small actions. */
export const Compact = () => (
  <PageFooter
    variant="compact"
    brand={<div className="t-s">147 consignments scanned · Last hour</div>}
    actions={
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button color="neutral" variant="outline" size="sm">
          Export
        </Button>
        <Button size="sm">Refresh</Button>
      </div>
    }
  />
);

/** save — brand-tinted unsaved-changes bar pinned under a form, with the
 *  Cancel/Save pair on the trailing edge. */
export const SaveBar = () => (
  <PageFooter
    variant="save"
    brand={<div className="t-s">Unsaved changes · 3 fields edited</div>}
    actions={
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button color="neutral" variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save changes</Button>
      </div>
    }
  />
);
