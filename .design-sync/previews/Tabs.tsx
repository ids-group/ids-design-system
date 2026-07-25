import * as React from 'react';
import { Tabs, Tab } from '@ids-group-ltd/ids-design-system';

const stage: React.CSSProperties = { width: 560 };
const pad: React.CSSProperties = { margin: 0, padding: '12px 4px' };

/** Line (primary navigation) and pills (compact filter row) variants. */
export const Variants = () => (
  <div style={{ display: 'grid', gap: 24, ...stage }}>
    <Tabs>
      <Tab label="Overview">
        <p style={pad}>Shipment SHP-20481 at a glance — 3 parcels, next-day service.</p>
      </Tab>
      <Tab label="Consignments">
        <p style={pad}>Linked consignments.</p>
      </Tab>
      <Tab label="Route history">
        <p style={pad}>Scans along the route.</p>
      </Tab>
      <Tab label="Activity">
        <p style={pad}>Activity feed.</p>
      </Tab>
    </Tabs>
    <Tabs variant="pills">
      <Tab label="All">
        <p style={pad}>All shipments.</p>
      </Tab>
      <Tab label="In transit">
        <p style={pad}>Shipments currently moving.</p>
      </Tab>
      <Tab label="At depot">
        <p style={pad}>Held at a depot.</p>
      </Tab>
      <Tab label="Delivered">
        <p style={pad}>Completed deliveries.</p>
      </Tab>
    </Tabs>
  </div>
);

/** Trailing count chip, leading glyph, and a disabled tab on the line variant. */
export const IconsAndCounts = () => (
  <div style={stage}>
    <Tabs>
      <Tab label="Inbox" icon="inbox" count={12}>
        <p style={pad}>12 new booking requests await triage.</p>
      </Tab>
      <Tab label="Flagged" icon="flag">
        <p style={pad}>Flagged consignments.</p>
      </Tab>
      <Tab label="Drafts" count={3}>
        <p style={pad}>Draft bookings.</p>
      </Tab>
      <Tab label="Archive" icon="archive" disabled />
    </Tabs>
  </div>
);

/** closable adds a per-tab close button; closing emits onTabClosed and never
 *  switches the active tab. */
export const Closable = () => (
  <div style={stage}>
    <Tabs closable>
      <Tab label="SHP-20481" value="shp-20481">
        <p style={pad}>3 parcels · Leeds LS10 1AB → London EC1A 1BB.</p>
      </Tab>
      <Tab label="SHP-20492" value="shp-20492">
        <p style={pad}>Pallet · Manchester M1 2WD.</p>
      </Tab>
      <Tab label="SHP-20510" value="shp-20510">
        <p style={pad}>Documents · Glasgow G2 1DU.</p>
      </Tab>
    </Tabs>
  </div>
);

/** Vertical orientation — tab list in a column beside the panel, the active
 *  indicator along the right edge. */
export const Vertical = () => (
  <div style={stage}>
    <Tabs orientation="vertical" selectedIndex={1} onSelectedIndexChange={() => {}}>
      <Tab label="Overview">
        <p style={pad}>Depot at a glance.</p>
      </Tab>
      <Tab label="Drivers">
        <p style={pad}>14 drivers on shift — Amelia Barnes covering route R-114.</p>
      </Tab>
      <Tab label="Fleet">
        <p style={pad}>Vehicles and trailers.</p>
      </Tab>
      <Tab label="Settings">
        <p style={pad}>Depot configuration.</p>
      </Tab>
    </Tabs>
  </div>
);
