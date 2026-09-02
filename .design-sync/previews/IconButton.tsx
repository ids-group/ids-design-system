import * as React from 'react';
import { IconButton } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

/** The four fill variants — standard (chromeless), filled, tonal, outlined. */
export const Variants = () => (
  <div style={row}>
    <IconButton icon="edit" ariaLabel="Edit shipment" />
    <IconButton icon="edit" ariaLabel="Edit shipment" variant="filled" />
    <IconButton icon="edit" ariaLabel="Edit shipment" variant="tonal" />
    <IconButton icon="edit" ariaLabel="Edit shipment" variant="outlined" />
  </div>
);

/** `color` recolours the accent each fill consumes (same axis as Button). */
export const Colors = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    <div style={row}>
      <IconButton icon="bell" ariaLabel="Notifications" variant="filled" />
      <IconButton icon="truck" ariaLabel="Dispatch van" variant="filled" color="secondary" />
      <IconButton icon="sparkle" ariaLabel="Route insights" variant="filled" color="tertiary" />
      <IconButton icon="check" ariaLabel="Approve order" variant="filled" color="success" />
      <IconButton icon="trash" ariaLabel="Delete order" variant="filled" color="error" />
    </div>
    <div style={row}>
      <IconButton icon="archive" ariaLabel="Archive shipment" variant="tonal" color="neutral" />
      <IconButton icon="warn" ariaLabel="Hold order" variant="tonal" color="warning" />
      <IconButton icon="trash" ariaLabel="Remove stop" variant="outlined" color="error" />
      <IconButton icon="x" ariaLabel="Dismiss" color="neutral" />
    </div>
  </div>
);

/** sm 32 / md 40 (default) / lg 48 — aligned with the field/button scale. */
export const Sizes = () => (
  <div style={row}>
    <IconButton icon="settings" ariaLabel="Settings" variant="outlined" size="sm" />
    <IconButton icon="settings" ariaLabel="Settings" variant="outlined" />
    <IconButton icon="settings" ariaLabel="Settings" variant="outlined" size="lg" />
  </div>
);

/** `selected` renders the pressed toggle look and sets aria-pressed. */
export const Toggle = () => (
  <div style={row}>
    <IconButton icon="star" ariaLabel="Bookmark depot" />
    <IconButton icon="star" ariaLabel="Bookmark depot" selected />
    <IconButton icon="pin" ariaLabel="Pin route" variant="tonal" selected />
  </div>
);

/** Disabled is a muted tint of each variant's own colour, not a flat grey. */
export const Disabled = () => (
  <div style={row}>
    <IconButton icon="trash" ariaLabel="Delete" disabled />
    <IconButton icon="trash" ariaLabel="Delete" variant="filled" disabled />
    <IconButton icon="trash" ariaLabel="Delete" variant="tonal" disabled />
    <IconButton icon="trash" ariaLabel="Delete" variant="outlined" disabled />
  </div>
);
