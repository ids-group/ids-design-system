import * as React from 'react';
import {
  Badge,
  Button,
  Checkbox,
  DescriptionItem,
  DescriptionList,
  Drawer,
} from '@ids-group-ltd/ids-design-system';

/** `.drawer-root` is `position: fixed; inset: 0` — the transformed wrapper
 *  is its containing block, acting as a mini viewport. */
const miniViewport: React.CSSProperties = {
  position: 'relative',
  transform: 'translateZ(0)',
  overflow: 'hidden',
  height: 480,
  borderRadius: 8,
  border: '1px solid var(--border-default)',
};

const pageBehind = (
  <div style={{ padding: 24 }}>
    <h4 className="t-h5" style={{ margin: '0 0 4px' }}>
      Live runs — Barking depot
    </h4>
    <p className="t-s" style={{ margin: 0 }}>
      22 drops in progress · 3 delayed · next departure 14:20.
    </p>
    <p className="t-s" style={{ margin: '8px 0 0' }}>
      IDS-48211 · London EC1A 1BB — out for delivery
      <br />
      IDS-48214 · Manchester M1 4AE — at depot
      <br />
      IDS-48219 · Leeds LS1 5QS — delayed
    </p>
  </div>
);

/** Canonical detail panel — right placement (default), md · 480 px, with the
 *  `footer` action strip. */
export const ShipmentDetail = () => (
  <div style={miniViewport}>
    {pageBehind}

    <Drawer
      title="Shipment IDS-48211"
      placement="right"
      size="md"
      footer={
        <>
          <Button color="neutral" variant="outline">
            Cancel
          </Button>
          <Button>Save changes</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 16 }}>
        <Badge withDot>Out for delivery</Badge>

        <DescriptionList>
          <DescriptionItem term="Reference" copyValue="IDS-48211">
            IDS-48211
          </DescriptionItem>
          <DescriptionItem term="Collection">
            Barking depot · IG11 8BL
          </DescriptionItem>
          <DescriptionItem term="Delivery">
            14 Finsbury Sq, London EC1A 1BB
          </DescriptionItem>
          <DescriptionItem term="Driver">Amelia Barnes</DescriptionItem>
          <DescriptionItem term="Vehicle">YK24 XQL · 18t rigid</DescriptionItem>
          <DescriptionItem term="ETA">Today, 16:40</DescriptionItem>
        </DescriptionList>

        <p className="t-s" style={{ margin: 0 }}>
          Site contact asked for a call 30 minutes ahead. Tail-lift required —
          no dock at the delivery address.
        </p>
      </div>
    </Drawer>
  </div>
);

/** Left placement, sm · 320 px — a filter side panel. */
export const LeftPanel = () => (
  <div style={miniViewport}>
    {pageBehind}

    <Drawer
      title="Filter runs"
      placement="left"
      size="sm"
      footer={
        <>
          <Button color="neutral" variant="outline">
            Clear
          </Button>
          <Button>Apply filters</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <Checkbox checked label="Delayed only" />
        <Checkbox label="Include completed drops" />
        <Checkbox checked label="Night trunk runs" />
        <Checkbox label="Third-party carriers" />
      </div>
    </Drawer>
  </div>
);
