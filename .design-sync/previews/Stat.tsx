import * as React from 'react';
import { Stat } from '@ids-group-ltd/ids-design-system';

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
  gap: 16,
  alignItems: 'start',
};

/** Label · value · signed delta (auto arrow + colour) or plain caption. */
export const Tiles = () => (
  <div style={grid}>
    <Stat label="Deliveries this week" value={147} delta={12} deltaLabel="vs last week" />
    <Stat label="Fleet capacity used" value="12.9 t" caption="of 13.45 t available" />
    <Stat label="Delayed shipments" value={3} variant="error" delta={-5} deltaLabel="vs last week" />
    <Stat label="Pending pickups" value={12} caption="Last sync 4m ago" />
  </div>
);

/** sm / md / lg type scale for dense dashboards vs hero KPIs. */
export const Sizes = () => (
  <div style={{ ...grid, gridTemplateColumns: 'repeat(3, minmax(150px, 1fr))' }}>
    <Stat size="sm" label="Compact" value={147} delta={12} />
    <Stat label="Default" value={147} delta={12} />
    <Stat size="lg" label="Hero KPI" value={147} delta={12} />
  </div>
);

/** `unit` sits flush after the value; `deltaTone` overrides the automatic
 *  up/down colouring; `deltaContent` replaces the default delta text. */
export const UnitsAndTones = () => (
  <div style={{ ...grid, gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))' }}>
    <Stat label="On-time deliveries" value={96.4} unit="%" delta={2.1} deltaLabel="vs last week" />
    <Stat label="Empty running" value={8.2} unit="%" delta={-1.4} deltaTone="neutral" deltaLabel="vs Q1" />
    <Stat
      label="Fuel cost / mile"
      value="£0.52"
      delta={3}
      deltaTone="secondary"
      deltaContent={<span>3p vs March baseline</span>}
    />
  </div>
);
