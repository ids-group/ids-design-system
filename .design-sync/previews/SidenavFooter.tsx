import * as React from 'react';
import {
  SidenavFooter,
  type SidenavAlertItem,
  type SidenavSearchResult,
} from '@ids-group-ltd/ids-design-system';

/** Rail-like column the footer normally sits at the bottom of. Wide enough
 *  (320px) for the 300px popover panels the open states render inline. */
const rail: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 320,
  padding: 12,
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  background: 'var(--surface-default)',
};

const hits: SidenavSearchResult[] = [
  {
    id: 'r1',
    label: 'Depots overview',
    sublabel: 'Section',
    icon: 'map',
    group: 'Sections',
    route: '/depots',
  },
  {
    id: 'r2',
    label: 'Leeds central depot',
    sublabel: 'LS1 4AP',
    icon: 'pin',
    group: 'Depots',
    route: '/depots/leeds',
  },
  {
    id: 'r3',
    label: 'Carlisle depot',
    sublabel: 'CA1 1EH',
    icon: 'pin',
    group: 'Depots',
    route: '/depots/carlisle',
  },
];

/** Static, deterministic provider — same shape the app layer supplies. */
const searchProvider = (query: string) =>
  hits.filter((hit) =>
    `${hit.label} ${hit.sublabel ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  );

const alertItems: SidenavAlertItem[] = [
  {
    id: 'a1',
    icon: 'truck',
    variant: 'warning',
    title: 'Run 42 delayed',
    body: 'M62 congestion — ETA now 15:10',
    at: 'Jul 24',
    route: '/runs/42',
  },
  {
    id: 'a2',
    icon: 'package',
    variant: 'success',
    title: 'POD received',
    body: 'ORD-2026-0142 signed at Manchester M1 2AB',
    at: 'Jul 24',
  },
  {
    id: 'a3',
    icon: 'users',
    variant: 'info',
    title: 'New driver added',
    body: 'Amelia Barnes joined the Leeds roster',
    at: 'Jul 23',
  },
];

/** Quick-action rows (unread dot on Alerts) + the signed-in profile block. */
export const QuickActions = () => (
  <div style={rail}>
    <SidenavFooter
      userName="Priya Patel"
      userRole="Fleet coordinator"
      alerts
      alertItems={alertItems}
      searchProvider={searchProvider}
    />
  </div>
);

/** Search popover pinned open with a typed query — grouped results render
 *  inline and push the rows below down. */
export const SearchOpen = () => (
  <div style={rail}>
    <SidenavFooter
      userName="Priya Patel"
      userRole="Fleet coordinator"
      searchProvider={searchProvider}
      searchOpen
    />
  </div>
);

/** Alerts popover pinned open — tinted icon chips per variant, title/time
 *  header and one-line body per alert. */
export const AlertsOpen = () => (
  <div style={rail}>
    <SidenavFooter
      userName="Priya Patel"
      userRole="Fleet coordinator"
      alerts
      alertItems={alertItems}
      searchProvider={searchProvider}
      alertsOpen
    />
  </div>
);

/** Account menu pinned open from the profile row's "more" button. */
export const AccountMenuOpen = () => (
  <div style={rail}>
    <SidenavFooter
      userName="Priya Patel"
      userRole="Fleet coordinator"
      alertItems={alertItems}
      searchProvider={searchProvider}
      profileRoute="/profile"
      accountMenuOpen
    />
  </div>
);
