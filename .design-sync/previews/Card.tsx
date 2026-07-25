import * as React from 'react';
import { Badge, Card } from '@ids-group-ltd/ids-design-system';

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
  gap: 16,
  alignItems: 'start',
};

const cardInner = (title: string) => (
  <>
    <div className="t-overline">Shipment</div>
    <h4 className="t-h5" style={{ margin: '4px 0' }}>
      {title}
    </h4>
    <p className="t-s" style={{ margin: 0 }}>
      Leeds LS1 4AP → Manchester M1 2AB · 14 pallets
    </p>
  </>
);

/** flat / raised / hover / interactive surfaces, same content. */
export const Elevations = () => (
  <div style={grid}>
    <Card padding="md">{cardInner('ORD-2026-0142')}</Card>
    <Card elevation="raised" padding="md">
      {cardInner('ORD-2026-0156')}
    </Card>
    <Card elevation="hover" padding="md">
      {cardInner('ORD-2026-0161')}
    </Card>
    <Card elevation="interactive" padding="md">
      {cardInner('ORD-2026-0178')}
    </Card>
  </div>
);

/** sm / md / lg inner padding presets. */
export const Paddings = () => (
  <div style={{ ...grid, gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))' }}>
    <Card elevation="raised" padding="sm">
      {cardInner('ORD-2026-0142')}
    </Card>
    <Card elevation="raised" padding="md">
      {cardInner('ORD-2026-0156')}
    </Card>
    <Card elevation="raised" padding="lg">
      {cardInner('ORD-2026-0161')}
    </Card>
  </div>
);

/** No named slots — head, body and foot compose as plain children. */
export const DashboardCard = () => (
  <div style={{ maxWidth: 360 }}>
    <Card elevation="raised" padding="md">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div className="t-overline">Delivery run</div>
        <Badge withDot>In transit</Badge>
      </div>

      <h4 className="t-h5" style={{ margin: '0 0 4px' }}>
        Trunk run · Depot 12 → Depot 4
      </h4>
      <p className="t-s" style={{ margin: 0 }}>
        Driver Amelia Barnes · departed 06:40 · ETA 11:15. 22 drops across
        Sheffield S1 2HE and Rotherham S60 1TG.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <span className="t-caption">Updated 4m ago</span>
        <span className="t-s link">View manifest</span>
      </div>
    </Card>
  </div>
);
