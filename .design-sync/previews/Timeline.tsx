import * as React from 'react';
import { Timeline, TimelineItem } from '@ids-group-ltd/ids-design-system';

/** Shipment activity feed — headings, body copy, timestamps, icons and mixed
 *  semantic tones. TimelineItems must be DIRECT children (spine relies on
 *  :host(:last-child)). */
export const ShipmentFeed = () => (
  <div style={{ width: 380 }}>
    <Timeline>
      <TimelineItem heading="Order confirmed" time="Mon 20 Jul · 09:41" icon="check" tone="primary" />
      <TimelineItem heading="Packed & ready" time="Mon 20 Jul · 11:20" icon="box" tone="success">
        3 parcels · Warehouse B, Leeds LS10 1AB
      </TimelineItem>
      <TimelineItem heading="Held at hub" time="Tue 21 Jul · 06:05" icon="warn" tone="warning">
        Adverse weather on the M62 — rebooked to the next trunk run
      </TimelineItem>
      <TimelineItem heading="Out for delivery" time="Wed 22 Jul · 07:52" icon="truck">
        Driver Amelia Barnes · Route R-114
      </TimelineItem>
      <TimelineItem heading="Delivery window" time="Estimated Wed · 12:00–14:00" icon="clock" tone="muted" />
    </Timeline>
  </div>
);

/** One entry per tone: primary · success · warning · error · muted · default. */
export const Tones = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 180px)', gap: 16 }}>
    <Timeline>
      <TimelineItem heading="Confirmed" time="09:41" icon="check" tone="primary" />
    </Timeline>
    <Timeline>
      <TimelineItem heading="Delivered" time="11:20" icon="check" tone="success" />
    </Timeline>
    <Timeline>
      <TimelineItem heading="Delayed" time="14:05" icon="bell" tone="warning" />
    </Timeline>
    <Timeline>
      <TimelineItem heading="Failed attempt" time="15:30" icon="error" tone="error" />
    </Timeline>
    <Timeline>
      <TimelineItem heading="Awaiting slot" time="—" icon="clock" tone="muted" />
    </Timeline>
    <Timeline>
      <TimelineItem heading="Scheduled" time="Tomorrow" icon="flag" tone="default" />
    </Timeline>
  </div>
);

/** Icon omitted — the marker falls back to a plain dot. */
export const PlainMarkers = () => (
  <div style={{ width: 380 }}>
    <Timeline>
      <TimelineItem heading="Note added" time="Today · 10:14">
        “Leave with reception if no answer.” — dispatch
      </TimelineItem>
      <TimelineItem heading="Address updated" time="Today · 09:02">
        Unit 4 → Unit 7, Riverside Industrial Estate
      </TimelineItem>
      <TimelineItem heading="Booking created" time="Yesterday · 16:48" />
    </Timeline>
  </div>
);
