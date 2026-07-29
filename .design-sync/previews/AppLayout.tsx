import * as React from 'react';
import {
  AppLayout,
  Avatar,
  Card,
  IconButton,
  Search,
  Sidenav,
  SidenavFooter,
  SidenavGroup,
  SidenavItem,
  Stat,
  Topbar,
} from '@ids-group-ltd/ids-design-system';

/** The shell pins itself to 100dvh — previews cap it via the public
 *  `--ds-app-layout-height` hook so the whole frame fits a card. */
const frame = (height: number): React.CSSProperties =>
  ({
    '--ds-app-layout-height': `${height}px`,
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    overflow: 'hidden',
  }) as React.CSSProperties;

const rail = (collapsed: boolean) => (
  <Sidenav brand="Dispatch" logoLetter="D" collapsed={collapsed}>
    <SidenavItem icon="home" label="Dashboard" active />
    <SidenavItem icon="truck" label="Shipments" badge={12} />
    <SidenavItem icon="map" label="Depots" />
    <SidenavItem icon="users" label="Drivers" hasAlert />
    <SidenavGroup label="Admin">
      <SidenavItem icon="chart" label="Reports" />
      <SidenavItem icon="settings" label="Settings" />
    </SidenavGroup>
    <SidenavFooter
      userName="Amelia Barnes"
      userRole="Dispatch manager"
      alerts
      collapsed={collapsed}
    />
  </Sidenav>
);

const bar = (
  <Topbar
    title="Dashboard"
    search={
      <Search
        placeholder="Search shipments, drivers, depots…"
        shortcut="⌘K"
        ariaLabel="Search"
      />
    }
    actions={
      <>
        <IconButton icon="help" ariaLabel="Help" size="sm" />
        <IconButton icon="bell" ariaLabel="Notifications" size="sm" />
        <Avatar initials="AB" size="sm" />
      </>
    }
  />
);

/** Page-header-ish content mock so the scrolling content region reads real. */
const content = (
  <>
    <div className="t-overline">Operations</div>
    <h2 className="t-h3" style={{ margin: '4px 0' }}>
      Today&rsquo;s dispatch
    </h2>
    <p className="t-s" style={{ margin: '0 0 16px', color: 'var(--text-secondary)' }}>
      Friday 24 July — 3 trunk runs in progress, 2 vehicles held at Leeds LS1 4AP.
    </p>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
      }}
    >
      <Card elevation="raised" padding="sm">
        <Stat label="Active shipments" value={42} delta={6} deltaLabel="vs yesterday" />
      </Card>
      <Card elevation="raised" padding="sm">
        <Stat label="On-time rate" value="94.2" unit="%" delta={-1.4} deltaLabel="vs last week" />
      </Card>
      <Card elevation="raised" padding="sm">
        <Stat label="Vehicles on road" value={18} caption="of 22 available" />
      </Card>
    </div>
  </>
);

/** Default geometry — the rail spans the full height on the left and the
 *  topbar sits above the content column only. Only `.content` scrolls. */
export const FullShell = () => (
  <div style={frame(600)}>
    <AppLayout sidenav={rail(false)} topbar={bar}>
      {content}
    </AppLayout>
  </div>
);

/** `topbarSpan="full"` lifts the bar across the whole width; the rail (here
 *  collapsed to its icon rail) and content sit beneath it. */
export const TopbarFullSpan = () => (
  <div style={frame(600)}>
    <AppLayout topbarSpan="full" sidenav={rail(true)} topbar={bar}>
      {content}
    </AppLayout>
  </div>
);
