import * as React from 'react';
import { Sidenav, SidenavGroup, SidenavItem } from '@ids-group-ltd/ids-design-system';

/** Fixed-height frame so the rail reads as a full-height column; the border
 *  hugs the rail's own width (240px expanded, icon rail collapsed). */
const frame: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  width: 'fit-content',
  height: 520,
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  overflow: 'hidden',
};

/** Brand mark on top, badge + alert-dot items, two labelled groups, one item
 *  active. */
export const Canonical = () => (
  <div style={frame}>
    <Sidenav brand="Dispatch" logoLetter="D">
      <SidenavItem icon="home" label="Dashboard" active />
      <SidenavItem icon="truck" label="Shipments" badge={12} />
      <SidenavItem icon="map" label="Depots" />
      <SidenavItem icon="users" label="Drivers" hasAlert />
      <SidenavGroup label="Planning">
        <SidenavItem icon="layers" label="Load planning" />
        <SidenavItem icon="pin" label="Route planning" />
      </SidenavGroup>
      <SidenavGroup label="Admin">
        <SidenavItem icon="activity" label="Activity" />
        <SidenavItem icon="settings" label="Settings" />
      </SidenavGroup>
    </Sidenav>
  </div>
);

/** `expandable` groups render a toggle header with an icon and caret — the
 *  Operations group is open, Admin starts closed. */
export const ExpandableGroups = () => (
  <div style={frame}>
    <Sidenav brand="Dispatch" logoLetter="D">
      <SidenavItem icon="home" label="Dashboard" active />
      <SidenavGroup label="Operations" icon="truck" expandable>
        <SidenavItem icon="calendar" label="Delivery runs" />
        <SidenavItem icon="package" label="Consignments" badge={4} />
        <SidenavItem icon="map" label="Depots" />
      </SidenavGroup>
      <SidenavGroup label="Admin" icon="settings" expandable expanded={false}>
        <SidenavItem icon="users" label="Team" />
        <SidenavItem icon="activity" label="Audit log" />
      </SidenavGroup>
    </Sidenav>
  </div>
);

/** Collapsed icon rail — labels, badges and group headings hide; the active
 *  ring and the alert dot survive. (The hover label tooltip is not statically
 *  renderable.) */
export const Collapsed = () => (
  <div style={frame}>
    <Sidenav brand="Dispatch" logoLetter="D" collapsed>
      <SidenavItem icon="home" label="Dashboard" active />
      <SidenavItem icon="truck" label="Shipments" badge={12} />
      <SidenavItem icon="map" label="Depots" />
      <SidenavItem icon="users" label="Drivers" hasAlert />
      <SidenavGroup label="Admin">
        <SidenavItem icon="activity" label="Activity" />
        <SidenavItem icon="settings" label="Settings" />
      </SidenavGroup>
    </Sidenav>
  </div>
);
