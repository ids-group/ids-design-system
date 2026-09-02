import * as React from 'react';
import { Icon, type IconName } from '@ids-group-ltd/ids-design-system';

const common: IconName[] = [
  'search', 'plus', 'check', 'x', 'chevronDown', 'chevronRight', 'menu',
  'info', 'warn', 'error', 'success', 'bell', 'settings', 'user', 'users',
  'home', 'calendar', 'truck', 'box', 'map', 'folder', 'edit', 'trash',
  'copy', 'download', 'upload', 'eye', 'filter', 'star', 'clock',
];

/** A sample of the 85-name built-in set (stroke icons, `currentColor`). */
export const CommonIcons = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 96px)', gap: 12 }}>
    {common.map((name) => (
      <div
        key={name}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }}
      >
        <Icon name={name} size={20} />
        <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
      </div>
    ))}
  </div>
);

/** Icon sizes — default 16, scaled via the `size` prop. */
export const IconSizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Icon name="bell" size={14} />
    <Icon name="bell" size={16} />
    <Icon name="bell" size={20} />
    <Icon name="bell" size={24} />
    <Icon name="bell" size={32} />
  </div>
);
