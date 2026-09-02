import * as React from 'react';
import { Search } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 360 };

/** Empty and filled quick-filter bars. */
export const Basic = () => (
  <div style={col}>
    <Search placeholder="Search shipments, drivers, depots…" ariaLabel="Search" />
    <Search value="IDS-88412" ariaLabel="Search" />
  </div>
);

/** Trailing kbd badge advertises the global open shortcut. */
export const WithShortcut = () => (
  <div style={col}>
    <Search placeholder="Search shipments, drivers, depots…" shortcut="⌘K" ariaLabel="Search" />
  </div>
);

/** clearable shows an inline × once there's a value. */
export const Clearable = () => (
  <div style={col}>
    <Search value="Amelia Barnes" clearable ariaLabel="Search drivers" />
  </div>
);

/** Icon omitted — for bars inside an already-labelled search region. */
export const NoIcon = () => (
  <div style={col}>
    <Search placeholder="Filter routes…" showIcon={false} shortcut="/" ariaLabel="Filter routes" />
  </div>
);
