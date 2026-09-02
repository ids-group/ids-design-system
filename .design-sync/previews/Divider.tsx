import * as React from 'react';
import { Divider } from '@ids-group-ltd/ids-design-system';

/** Hairline vs strong rule between content blocks. */
export const Horizontal = () => (
  <div style={{ width: 320 }} className="t-s">
    <p style={{ margin: 0 }}>ORD-2026-0142 · Leeds LS1 4AP</p>
    <Divider />
    <p style={{ margin: 0 }}>ORD-2026-0156 · Manchester M1 2AB</p>
    <Divider variant="strong" spacing="lg" />
    <p style={{ margin: 0 }}>ORD-2026-0161 · Sheffield S1 2HE</p>
  </div>
);

/** `label` renders children as an uppercase caption between rule segments. */
export const Labelled = () => (
  <div style={{ width: 320 }} className="t-s">
    <p style={{ margin: 0 }}>ORD-2026-0178 · delivered 09:12</p>
    <Divider variant="label">Earlier deliveries</Divider>
    <p style={{ margin: 0 }}>ORD-2026-0142 · delivered yesterday</p>
  </div>
);

/** `vertical` stretches inside a flex row (align-self: stretch). */
export const Vertical = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="t-s">
    <span>Depot 12 · Leeds</span>
    <Divider variant="vertical" spacing="none" />
    <span>14 pallets</span>
    <Divider variant="vertical" spacing="none" />
    <span>ETA 11:15</span>
  </div>
);
