import * as React from 'react';
import { Button, IconButton, Tooltip } from '@ids-group-ltd/ids-design-system';

/* The open panel is absolutely positioned off the trigger (it escapes layout
 * flow), so every story pads the placement side to keep it inside the frame. */

/** All four placements, forced open with `open` — the placement class also
 *  sets the arrow direction on the dark panel. */
export const Placements = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, max-content)',
      justifyItems: 'start',
      alignItems: 'center',
      gap: '72px 150px',
      padding: '52px 150px',
    }}
  >
    <Tooltip text="Recompute pending — 3 affected" placement="top" open>
      <Button color="neutral" variant="outline" size="sm">Top</Button>
    </Tooltip>
    <Tooltip text="Last synced 14 min ago" placement="bottom" open>
      <Button color="neutral" variant="outline" size="sm">Bottom</Button>
    </Tooltip>
    <Tooltip text="Locked" placement="left" open>
      <Button color="neutral" variant="outline" size="sm">Left</Button>
    </Tooltip>
    <Tooltip text="3 stops affected" placement="right" open>
      <Button color="neutral" variant="outline" size="sm">Right</Button>
    </Tooltip>
  </div>
);

/** Canonical real usage — naming an icon-only control in a toolbar. Only the
 *  middle trigger is forced open; the others show on hover/focus. */
export const IconToolbar = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 56 }}>
    <Tooltip text="Refresh depot feed">
      <IconButton icon="refresh" ariaLabel="Refresh depot feed" color="neutral" />
    </Tooltip>
    <Tooltip text="Print labels for this run" open>
      <IconButton icon="download" ariaLabel="Print labels for this run" color="neutral" />
    </Tooltip>
    <Tooltip text="Delete shipment">
      <IconButton icon="trash" ariaLabel="Delete shipment" color="neutral" />
    </Tooltip>
  </div>
);

/** Long text wraps at the DS max-width token — keep tooltips to one short
 *  clarification; richer content belongs in Popover. */
export const LongText = () => (
  <div style={{ display: 'flex', paddingBottom: 96, paddingLeft: 130 }}>
    <Tooltip
      text="ETA recalculated after the A34 closure — 6 deliveries moved to tomorrow's AM run"
      placement="bottom"
      open
    >
      <Button color="neutral" variant="outline" size="sm">ETA 11:15</Button>
    </Tooltip>
  </div>
);
