import * as React from 'react';
import { Badge, DescriptionItem, DescriptionList } from '@ids-group-ltd/ids-design-system';

/** Term column beside the value — dense record details. */
export const Horizontal = () => (
  <div style={{ maxWidth: 520 }}>
    <DescriptionList orientation="horizontal">
      <DescriptionItem term="Status">
        <Badge withDot>In transit</Badge>
      </DescriptionItem>

      <DescriptionItem term="Order">ORD-2026-0142</DescriptionItem>

      <DescriptionItem term="Customer">Whitfield &amp; Co Ltd</DescriptionItem>

      <DescriptionItem term="Origin">Depot 12 · Leeds LS1 4AP</DescriptionItem>

      <DescriptionItem term="Destination">Manchester M1 2AB</DescriptionItem>

      <DescriptionItem term="Booked">18 Jul 2026 · 14 pallets</DescriptionItem>
    </DescriptionList>
  </div>
);

/** Term above the value — suits narrow containers and long values. */
export const Stacked = () => (
  <div style={{ maxWidth: 360 }}>
    <DescriptionList orientation="stacked">
      <DescriptionItem term="Status">
        <Badge withDot>In transit</Badge>
      </DescriptionItem>

      <DescriptionItem term="Driver">Amelia Barnes · Route 12</DescriptionItem>

      <DescriptionItem term="Delivery instructions">
        Rear loading bay off Whitworth Street — book in at the gatehouse and ask for
        goods-in before 15:00.
      </DescriptionItem>

      <DescriptionItem term="ETA">24 Jul 2026, 14:30</DescriptionItem>
    </DescriptionList>
  </div>
);

/** `copyValue` renders an inline copy button next to the value. */
export const CopyValues = () => (
  <div style={{ maxWidth: 520 }}>
    <DescriptionList orientation="horizontal">
      <DescriptionItem term="Tracking ref" copyValue="TRK-GB-2026-0142-8817">
        TRK-GB-2026-0142-8817
      </DescriptionItem>

      <DescriptionItem term="Consignment ID" copyValue="cons_01J8KQPVXZ3R5TNMW4BGHF6YDE">
        cons_01J8KQPVXZ···6YDE
      </DescriptionItem>
    </DescriptionList>
  </div>
);
