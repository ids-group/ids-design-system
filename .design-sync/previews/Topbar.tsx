import * as React from 'react';
import {
  Avatar,
  Breadcrumbs,
  IconButton,
  Search,
  Topbar,
} from '@ids-group-ltd/ids-design-system';

const actions = (
  <>
    <IconButton icon="help" ariaLabel="Help" size="sm" />
    <IconButton icon="bell" ariaLabel="Notifications" size="sm" />
    <Avatar initials="AB" size="sm" />
  </>
);

/** Full composition — brand title, centred search (flexes to fill), action
 *  cluster with avatar pinned right. */
export const Canonical = () => (
  <Topbar
    title="Dispatch"
    search={
      <Search
        placeholder="Search shipments, drivers, depots…"
        shortcut="⌘K"
        ariaLabel="Search"
      />
    }
    actions={actions}
  />
);

/** Breadcrumb trail anchored left next to the brand — deep record pages where
 *  context outweighs lookup. */
export const WithBreadcrumbs = () => (
  <Topbar
    title="Dispatch"
    breadcrumbs={
      <Breadcrumbs
        items={[
          { label: 'Depots', href: '/depots' },
          { label: 'Leeds LS1 4AP', href: '/depots/leeds' },
          { label: 'Bay 12' },
        ]}
      />
    }
    actions={
      <>
        <IconButton icon="bell" ariaLabel="Notifications" size="sm" />
        <Avatar initials="AB" size="sm" />
      </>
    }
  />
);

/** Brand + actions only — dialogs or shells with a dedicated search route. */
export const Minimal = () => (
  <Topbar
    title="Dispatch"
    actions={
      <>
        <IconButton icon="bell" ariaLabel="Notifications" size="sm" />
        <Avatar initials="AB" size="sm" />
      </>
    }
  />
);
