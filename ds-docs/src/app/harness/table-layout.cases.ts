import type { TableColumn } from 'ds/table';

// Kept free of anything newer than 0.15.0, so a checkout of that tag renders the same tables for
// `node tools/table-clip-harness.mjs layout`. `kind` goes through `as const` for the same reason:
// 0.15.0's `TableColumn` has no such key and a typed literal would not compile there.

export interface LayoutRow {
  readonly id: string;
  readonly [field: string]: string;
}

export interface LayoutCase {
  readonly id: string;
  readonly title: string;
  readonly width: number;
  readonly density: 'default' | 'compact';
  readonly columns: readonly TableColumn<LayoutRow>[];
  readonly data: readonly LayoutRow[];
}

const textNumberColumns = [
  { key: 'name', label: 'Policyholder' },
  { key: 'city', label: 'City' },
  { key: 'premium', label: 'Premium', align: 'right', kind: 'number' },
  { key: 'claims', label: 'Claims', align: 'right' },
  { key: 'status', label: 'Status', kind: 'status' },
] as const;

const truncateColumns = [
  { key: 'name', label: 'Policyholder' },
  { key: 'email', label: 'Email', truncate: true },
  { key: 'city', label: 'City' },
  { key: 'premium', label: 'Premium', align: 'right' },
] as const;

const engagementColumns = [
  {
    key: 'label',
    label: 'Section',
    hint: 'A section the uploaded bundle marks for tracking, listed in page order.',
  },
  {
    key: 'read',
    label: 'Read',
    hint: 'Recipients who read the section at least once in this period. The share is against unique visitors.',
  },
  {
    key: 'dwell',
    label: 'Avg dwell',
    hint: 'How long the section held attention on an average visit, counting only the time it was on screen.',
  },
  {
    key: 'stopped',
    label: 'Stopped here',
    hint: 'Recipients for whom this was the furthest section read, in the page order.',
  },
] as const;

const policyholders: readonly LayoutRow[] = [
  {
    id: 'p1',
    name: 'Margaret Whitfield',
    email: 'margaret.whitfield@claims-department.northwind-insurance.co.uk',
    city: 'Manchester',
    premium: '£1,240.00',
    claims: '2',
    status: 'Active',
  },
  {
    id: 'p2',
    name: 'Jo Avery',
    email: 'j.avery@acme.io',
    city: 'Leeds',
    premium: '£86.50',
    claims: '0',
    status: 'Lapsed',
  },
  {
    id: 'p3',
    name: 'Bartholomew Featherstonehaugh-Smythe',
    email: 'bartholomew.featherstonehaugh@example.com',
    city: 'Newcastle upon Tyne',
    premium: '£12,904.75',
    claims: '11',
    status: 'Pending review',
  },
  {
    id: 'p4',
    name: 'Priya Natarajan',
    email: 'priya.n@contoso.co.uk',
    city: 'Bristol',
    premium: '£430.00',
    claims: '1',
    status: 'Active',
  },
];

const sections: readonly LayoutRow[] = [
  {
    id: 's1',
    label: 'Hero banner',
    read: '412 (63%)',
    dwell: '8s',
    stopped: '96 (15%)',
  },
  {
    id: 's2',
    label: 'Your benefits',
    read: '355 (54%)',
    dwell: '41s',
    stopped: '120 (18%)',
  },
  {
    id: 's3',
    label: 'Coverage options',
    read: '214 (33%)',
    dwell: '1m 12s',
    stopped: '88 (13%)',
  },
  {
    id: 's4',
    label: 'Contact us',
    read: '108 (16%)',
    dwell: '—',
    stopped: '108 (16%)',
  },
];

export const LAYOUT_CASES: readonly LayoutCase[] = [
  {
    id: 'layout-text-number',
    title: 'Text and number columns',
    width: 1100,
    density: 'default',
    columns: textNumberColumns,
    data: policyholders,
  },
  {
    id: 'layout-truncate',
    title: 'A truncate column',
    width: 900,
    density: 'default',
    columns: truncateColumns,
    data: policyholders,
  },
  {
    id: 'layout-engagement',
    title: 'Engagement by content section, compact, hint headers',
    width: 1296,
    density: 'compact',
    columns: engagementColumns,
    data: sections,
  },
];
