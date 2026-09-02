import * as React from 'react';
import { Accordion, AccordionItem, Badge } from '@ids-group-ltd/ids-design-system';

const factsList: React.CSSProperties = { margin: '8px 0 0', paddingLeft: 18 };

/** Multi-open (default) — several sections can be expanded at once. */
export const Default = () => (
  <div style={{ maxWidth: 560 }}>
    <Accordion>
      <AccordionItem title="Delivery windows" expanded>
        First trunk run departs <strong>06:40</strong> from Depot 12 and covers 22 drops
        across Sheffield S1 2HE and Rotherham S60 1TG.
        <ul className="t-s" style={factsList}>
          <li>AM window — 07:00–12:00, residential drops</li>
          <li>PM window — 13:00–17:30, trade counters</li>
          <li>Timed slots — booked via the customer portal</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Depot access" badge={<Badge withDot>Updated</Badge>}>
        Gatehouse opens <strong>05:30</strong> for agency drivers. Vehicle passes are
        issued per tractor unit, not per driver.
        <ul className="t-s" style={factsList}>
          <li>North gate — artics and double-deckers only</li>
          <li>South gate — vans and 7.5-tonners</li>
          <li>Out-of-hours — shift manager sign-off required</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Driver contacts">
        Transport office on ext. 200; out-of-hours escalation goes to the duty manager,
        <strong> Amelia Barnes</strong>.
        <ul className="t-s" style={factsList}>
          <li>Radio channel 4 — yard and loading bays</li>
          <li>Channel 6 — trunking and linehaul</li>
        </ul>
      </AccordionItem>
    </Accordion>
  </div>
);

/** Single-open (`multi={false}`) — opening one section collapses the rest. */
export const SingleOpen = () => (
  <div style={{ maxWidth: 560 }}>
    <Accordion multi={false}>
      <AccordionItem title="Booking cut-offs" expanded>
        Next-day pallets must be booked by <strong>16:00</strong>. Opening another
        section collapses this one automatically.
      </AccordionItem>

      <AccordionItem title="Surcharges">
        London congestion and Scottish Highlands zones carry a per-pallet uplift.
      </AccordionItem>

      <AccordionItem title="Claims process">
        Damage claims need photos and the POD reference within 48 hours.
      </AccordionItem>
    </Accordion>
  </div>
);

/** Expanded, disabled and collapsed items in one stack. */
export const States = () => (
  <div style={{ maxWidth: 560 }}>
    <Accordion>
      <AccordionItem title="Route summary" expanded>
        Leeds LS1 4AP → Manchester M1 2AB · 14 pallets · ETA 14:30.
      </AccordionItem>

      <AccordionItem title="Customs paperwork (locked)" disabled>
        Content hidden — this item cannot be toggled.
      </AccordionItem>

      <AccordionItem title="Proof of delivery">
        Collapsed and interactive.
      </AccordionItem>
    </Accordion>
  </div>
);
