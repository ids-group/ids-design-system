import * as React from 'react';
import { Badge, Button, Table } from '@ids-group-ltd/ids-design-system';

interface Shipment {
  id: string;
  ref: string;
  origin: string;
  destination: string;
  pallets: number;
  eta: string;
  status: string;
}

const asShipment = (row: unknown) => row as Shipment;

const shipments: Shipment[] = [
  { id: 's1', ref: 'ORD-2026-0142', origin: 'Leeds LS1 4AP', destination: 'Manchester M1 2AB', pallets: 14, eta: '24 Jul 14:30', status: 'In transit' },
  { id: 's2', ref: 'ORD-2026-0156', origin: 'Birmingham B4 7DA', destination: 'Bristol BS1 5TR', pallets: 9, eta: '24 Jul 16:05', status: 'Loading' },
  { id: 's3', ref: 'ORD-2026-0161', origin: 'Sheffield S1 2HE', destination: 'Rotherham S60 1TG', pallets: 22, eta: '25 Jul 08:15', status: 'Scheduled' },
  { id: 's4', ref: 'ORD-2026-0178', origin: 'Carlisle CA1 1EH', destination: 'Glasgow G1 3SL', pallets: 6, eta: '25 Jul 11:40', status: 'In transit' },
  { id: 's5', ref: 'ORD-2026-0183', origin: 'Norwich NR1 3QQ', destination: 'Ipswich IP1 1DH', pallets: 11, eta: '25 Jul 15:20', status: 'Delayed' },
  { id: 's6', ref: 'ORD-2026-0190', origin: 'Plymouth PL1 2AA', destination: 'Exeter EX1 1GE', pallets: 17, eta: '26 Jul 09:00', status: 'Delivered' },
];

/** Five columns — with the select column added this still fits the card
 *  without wrapping (the full six-column set is used where there is no
 *  checkbox column). */
const shipmentColumns = [
  { key: 'ref', label: 'Reference', sortable: true },
  { key: 'destination', label: 'Destination' },
  { key: 'pallets', label: 'Pallets', align: 'right' as const, sortable: true },
  { key: 'eta', label: 'ETA' },
  { key: 'status', label: 'Status' },
];

const backlogColumns = [
  { key: 'ref', label: 'Reference', sortable: true },
  { key: 'origin', label: 'Origin' },
  { key: 'destination', label: 'Destination' },
  { key: 'pallets', label: 'Pallets', align: 'right' as const, sortable: true },
  { key: 'eta', label: 'ETA' },
  { key: 'status', label: 'Status' },
];

const cellTemplates = {
  ref: (row: unknown) => <span className="t-s-bold">{asShipment(row).ref}</span>,
  status: (row: unknown) => <Badge withDot>{asShipment(row).status}</Badge>,
};

/** Canonical shipments list — sorted header (asc), zebra rows, selection with
 *  two rows checked so the bulk-action bar shows. */
export const Shipments = () => (
  <Table
    caption="Active shipments"
    data={shipments}
    columns={shipmentColumns}
    cellTemplateMap={cellTemplates}
    selectable
    selectedIds={new Set(['s1', 's4'])}
    sortKey="ref"
    sortDir="asc"
    clientSort
    zebra
    stickyHeader={false}
    bulkActions={
      <>
        <Button color="neutral" variant="outline" size="sm" icon="archive">
          Archive
        </Button>

        <Button color="neutral" variant="outline" size="sm" icon="download">
          Export
        </Button>
      </>
    }
  />
);

/** First-load placeholder — shimmer skeleton rows in place of data. */
export const LoadingSkeleton = () => (
  <Table
    caption="Loading shipments"
    data={[] as Shipment[]}
    columns={backlogColumns}
    loading="skeleton"
    skeletonRows={5}
    stickyHeader={false}
  />
);

const backlog: Shipment[] = [
  ...shipments,
  { id: 's7', ref: 'ORD-2026-0204', origin: 'Cardiff CF10 1EP', destination: 'Swansea SA1 1NW', pallets: 8, eta: '26 Jul 13:45', status: 'Scheduled' },
  { id: 's8', ref: 'ORD-2026-0211', origin: 'Newcastle NE1 4ST', destination: 'Edinburgh EH1 1BB', pallets: 19, eta: '27 Jul 07:50', status: 'Scheduled' },
];

/** `pageSize` slices rows client-side and renders the pagination footer
 *  (footer requires the rebuilt bindings bundle — see learnings). */
export const Paginated = () => (
  <Table
    caption="Shipment backlog"
    data={backlog}
    columns={backlogColumns}
    cellTemplateMap={cellTemplates}
    pageSize={5}
    clientSort
    bordered
    stickyHeader={false}
  />
);
