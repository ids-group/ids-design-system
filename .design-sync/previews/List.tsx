import * as React from 'react';
import { Badge, Icon, List, ListItem } from '@ids-group-ltd/ids-design-system';

/** Clickable navigation rows — leading icons, trailing chevrons, dividers. */
export const Navigation = () => (
  <div style={{ maxWidth: 400 }}>
    <List dividers>
      <ListItem
        title="Active shipments"
        subtitle="42 in transit today"
        clickable
        leading={<Icon name="truck" size={18} />}
        trailing={<Icon name="chevronRight" size={18} />}
      />

      <ListItem
        title="Depots"
        subtitle="12 sites across the UK"
        clickable
        leading={<Icon name="map" size={18} />}
        trailing={<Icon name="chevronRight" size={18} />}
      />

      <ListItem
        title="Drivers"
        subtitle="86 on shift this morning"
        clickable
        leading={<Icon name="users" size={18} />}
        trailing={<Icon name="chevronRight" size={18} />}
      />
    </List>
  </div>
);

/** `selected` highlights the current row in a picker/navigation list. */
export const Selected = () => (
  <div style={{ maxWidth: 400 }}>
    <List dividers>
      <ListItem
        title="Leeds LS1 4AP"
        subtitle="Depot 12 · North hub"
        clickable
        leading={<Icon name="home" size={18} />}
      />

      <ListItem
        title="Manchester M1 2AB"
        subtitle="Depot 4 · Cross-dock"
        clickable
        selected
        leading={<Icon name="home" size={18} />}
      />

      <ListItem
        title="Bristol BS1 5TR"
        subtitle="Depot 7 · South-west hub"
        clickable
        leading={<Icon name="home" size={18} />}
      />
    </List>
  </div>
);

/** Trailing status content and a disabled row. */
export const TrailingContent = () => (
  <div style={{ maxWidth: 400 }}>
    <List dividers>
      <ListItem
        title="Amelia Barnes"
        subtitle="Route 12 · 14 drops remaining"
        leading={<Icon name="user" size={18} />}
        trailing={<Badge withDot>On route</Badge>}
      />

      <ListItem
        title="Callum Reid"
        subtitle="Route 7 · back at depot 16:40"
        leading={<Icon name="user" size={18} />}
        trailing={<Badge withDot>Returning</Badge>}
      />

      <ListItem
        title="Priya Shah"
        subtitle="On leave until 28 Jul"
        clickable
        disabled
        leading={<Icon name="user" size={18} />}
        trailing={<Badge>Off shift</Badge>}
      />
    </List>
  </div>
);
