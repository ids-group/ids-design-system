import * as React from 'react';
import { Radio } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 12, width: 320 };
const row: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' };

/** Standalone radios sharing a native name — selected, unselected, disabled. */
export const States = () => (
  <div style={col}>
    <Radio name="handover" value="doorstep" label="Doorstep handover" />
    <Radio name="handover" value="neighbour" label="Leave with neighbour" checked />
    <Radio name="handover" value="safe-place" label="Safe place (porch box)" />
    <Radio label="Depot collection" disabled />
    <Radio label="Locker drop-off" checked disabled />
  </div>
);

/** sm / md / lg dots with matching label type scale. */
export const Sizes = () => (
  <div style={row}>
    <Radio size="sm" label="Small" />
    <Radio size="md" label="Medium" />
    <Radio size="lg" label="Large" />
  </div>
);

/** Required marker, helper hint, and the invalid (error) treatment on a standalone radio. */
export const Validation = () => (
  <div style={col}>
    <Radio label="Confirm collection slot" required />
    <Radio label="Contact by phone" hint="Used only for delivery-day updates." />
    <Radio label="Contact by phone" hint="A contact preference is required to continue." invalid />
  </div>
);
