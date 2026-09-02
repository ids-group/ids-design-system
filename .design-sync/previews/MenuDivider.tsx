import * as React from 'react';
import { Menu, MenuDivider, MenuItem } from '@ids-group-ltd/ids-design-system';

/** Thin `role="separator"` rules splitting a menu into groups — routine
 *  actions, alerts, then the destructive exit. */
export const GroupedActions = () => (
  <div style={{ width: 224 }}>
    <Menu>
      <MenuItem icon="users">Profile settings</MenuItem>
      <MenuItem icon="settings" tabbable={false}>Preferences</MenuItem>
      <MenuDivider />
      <MenuItem icon="bell" tabbable={false}>Notifications</MenuItem>
      <MenuDivider />
      <MenuItem icon="x" error tabbable={false}>Sign out</MenuItem>
    </Menu>
  </div>
);
