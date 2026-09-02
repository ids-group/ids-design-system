import * as React from 'react';
import { Button, Menu, MenuDivider, MenuItem, Popover } from '@ids-group-ltd/ids-design-system';

/** Right-aligned keyboard hint inside an item label. The label span sits in a
 *  flex row that doesn't stretch, so the hint anchors to the positioned
 *  wrapper around the menu instead. */
const Shortcut = ({ keys }: { keys: string }) => (
  <span
    style={{
      position: 'absolute',
      right: 12,
      color: 'var(--text-tertiary)',
      fontSize: 12,
      fontWeight: 400,
    }}
  >
    {keys}
  </span>
);

/** The typical account-menu shape — icons, a divider before the destructive
 *  item, one tabbable item for the roving tabindex. */
export const Canonical = () => (
  <div style={{ width: 224 }}>
    <Menu>
      <MenuItem icon="users">Profile settings</MenuItem>
      <MenuItem icon="settings">Preferences</MenuItem>
      <MenuItem icon="bell">Notifications</MenuItem>
      <MenuDivider />
      <MenuItem icon="x" error>Sign out</MenuItem>
    </Menu>
  </div>
);

/** Keyboard shortcuts as muted trailing hints. */
export const WithShortcuts = () => (
  <div style={{ position: 'relative', width: 248 }}>
    <Menu>
      <MenuItem icon="edit">
        Rename route
        <Shortcut keys="F2" />
      </MenuItem>
      <MenuItem icon="copy">
        Duplicate
        <Shortcut keys="Ctrl+D" />
      </MenuItem>
      <MenuItem icon="download">
        Export manifest
        <Shortcut keys="Ctrl+E" />
      </MenuItem>
      <MenuDivider />
      <MenuItem icon="trash" error>
        Delete route
        <Shortcut keys="Del" />
      </MenuItem>
    </Menu>
  </div>
);

/** Disabled and destructive rows. */
export const States = () => (
  <div style={{ width: 224 }}>
    <Menu>
      <MenuItem icon="edit">Rename</MenuItem>
      <MenuItem icon="copy" disabled>Duplicate</MenuItem>
      <MenuItem icon="download">Export</MenuItem>
      <MenuDivider />
      <MenuItem icon="trash" error>Delete job</MenuItem>
    </Menu>
  </div>
);

/** Nested menu forced open with `submenuOpen` — it renders inline to the
 *  right of its parent item (right padding reserves room in the card). */
export const SubmenuOpen = () => (
  <div style={{ paddingRight: 180 }}>
    <div style={{ width: 224 }}>
      <Menu>
        <MenuItem icon="edit">Rename</MenuItem>
        <MenuItem
          icon="copy"
          submenuOpen
          submenu={
            <Menu>
              <MenuItem>PDF</MenuItem>
              <MenuItem>CSV</MenuItem>
              <MenuItem>Excel (.xlsx)</MenuItem>
            </Menu>
          }
        >
          Export as
        </MenuItem>
        <MenuItem icon="download">Download</MenuItem>
        <MenuDivider />
        <MenuItem icon="x" error>Delete</MenuItem>
      </Menu>
    </div>
  </div>
);

/** Canonical dropdown composition — `Popover > Menu`: the DS CSS drops the
 *  menu's own frame and the panel padding so nothing double-borders. */
export const InPopover = () => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
    <Button color="neutral" variant="outline" trailingIcon="chevronDown">
      Account
    </Button>
    <Popover>
      <div style={{ width: 224 }}>
        <Menu>
          <MenuItem icon="users">Profile settings</MenuItem>
          <MenuItem icon="settings">Preferences</MenuItem>
          <MenuItem icon="bell">Notifications</MenuItem>
          <MenuDivider />
          <MenuItem icon="x" error>Sign out</MenuItem>
        </Menu>
      </div>
    </Popover>
  </div>
);
