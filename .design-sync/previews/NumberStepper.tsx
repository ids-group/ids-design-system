import * as React from 'react';
import { NumberStepper } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' };
const cell: React.CSSProperties = { display: 'grid', gap: 6, justifyItems: 'start' };
const caption: React.CSSProperties = { fontSize: 12, color: '#667085' };

/** sm / md / lg — heights aligned with input and select fields. */
export const Sizes = () => (
  <div style={row}>
    <div style={cell}>
      <NumberStepper size="sm" value={2} ariaLabel="Pallet count (small)" />
      <span style={caption}>sm</span>
    </div>
    <div style={cell}>
      <NumberStepper size="md" value={4} ariaLabel="Pallet count" />
      <span style={caption}>md · default</span>
    </div>
    <div style={cell}>
      <NumberStepper size="lg" value={6} ariaLabel="Pallet count (large)" />
      <span style={caption}>lg</span>
    </div>
  </div>
);

/** min/max clamp the value — buttons grey out at the bounds; step sets the increment. */
export const Bounds = () => (
  <div style={row}>
    <div style={cell}>
      <NumberStepper value={0} min={0} max={10} ariaLabel="Parcels per drop" />
      <span style={caption}>at min · decrement disabled</span>
    </div>
    <div style={cell}>
      <NumberStepper value={10} min={0} max={10} ariaLabel="Parcels per drop" />
      <span style={caption}>at max · increment disabled</span>
    </div>
    <div style={cell}>
      <NumberStepper value={25} min={0} max={100} step={5} ariaLabel="Cage capacity" />
      <span style={caption}>step = 5</span>
    </div>
  </div>
);

/** Disabled greys the whole control. */
export const Disabled = () => (
  <div style={row}>
    <NumberStepper value={3} disabled ariaLabel="Pallet count — locked" />
  </div>
);
