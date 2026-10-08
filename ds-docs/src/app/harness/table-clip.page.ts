import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { CellTemplateDirective, TableComponent } from 'ds/table';
import type { TableColumn, TableRowAction } from 'ds/table';
import { DsTableResize } from 'ds/table-resize';

interface Row {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly city?: string;
  readonly status?: string;
  readonly amount?: string;
  readonly notes?: string;
  readonly [field: string]: string | undefined;
}

interface HarnessCase {
  readonly id: string;
  readonly title: string;
  readonly width: number;
  readonly columns: readonly TableColumn<Row>[];
  readonly data: readonly Row[];
  readonly density?: 'default' | 'compact';
  readonly selectable?: boolean;
  readonly zebra?: boolean;
  readonly maxHeight?: string | null;
  readonly stickyFirstColumn?: boolean;
  readonly rowActions?: readonly TableRowAction<Row>[];
  readonly virtualScroll?: boolean;
}

const LONG_EMAIL =
  'alexandra.montgomery-fitzgerald@claims-department.northwind-insurance.co.uk';
const SHORT_EMAIL = 'j.avery@acme.io';
const URL =
  'https://portal.example-insurance.co.uk/programs/2026/renewals/segment-builder?groupId=8f2c1d7a-91be-4c3e-b0aa-5d1e2f3a4b5c';
const LONG_WORD =
  'Supercalifragilisticexpialidocious-Antidisestablishmentarianism-Pneumonoultramicroscopic';
const SENTENCE =
  'Program published to wave 3 after the suppression file was replaced and the library content re-approved by compliance';

const people: readonly Row[] = [
  {
    id: 'r1',
    name: 'Alexandra Montgomery',
    email: LONG_EMAIL,
    city: 'London',
    status: 'Active',
    amount: '12,480.00',
    notes: SENTENCE,
  },
  {
    id: 'r2',
    name: 'Jordan Avery',
    email: SHORT_EMAIL,
    city: 'Leeds',
    status: 'Paused',
    amount: '310.50',
    notes: 'Short note',
  },
  {
    id: 'r3',
    name: 'Li Wei',
    email: 'li.wei@example.com',
    city: 'Manchester',
    status: 'Active',
    amount: '7.00',
    notes: '',
  },
  {
    id: 'r4',
    name: 'Bartholomew Featherstonehaugh',
    email: 'b.featherstonehaugh@legal.example.org',
    city: '—',
    status: 'Closed',
    amount: '1,000,000.00',
    notes: URL,
  },
  {
    id: 'r5',
    name: 'Ann Fletcher',
    email: '',
    city: 'Bristol',
    status: 'Active',
    amount: '0.00',
    notes: LONG_WORD,
  },
];

const many = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    ...people[index % people.length],
    id: `m${index}`,
  }));

const recordFields = [
  'policy_id',
  'first_name',
  'last_name',
  'email',
  'address_line_1',
  'city',
  'postcode',
  'product',
  'premium',
  'renewal_date',
];
const records: readonly Row[] = Array.from({ length: 6 }, (_, index) => ({
  id: `rec${index}`,
  groups:
    index % 2 ? 'Renewals Q3, High value, Lapsed last year' : 'Renewals Q3',
  policy_id: `POL-2026-${100340 + index}`,
  first_name: index === 1 ? 'Bartholomew' : 'Ann',
  last_name: index === 1 ? 'Featherstonehaugh-Montgomery' : 'Fletcher',
  email: index === 1 ? LONG_EMAIL : SHORT_EMAIL,
  address_line_1:
    index === 2
      ? 'Flat 12, The Old Granary, 145 Long Riverside Walk'
      : '1 High St',
  city: 'Kingston upon Thames',
  postcode: 'KT1 1AA',
  product:
    index === 3 ? 'Home & Contents Premier Plus with Legal Cover' : 'Motor',
  premium: '1,240.00',
  renewal_date: '2026-11-01',
}));

const ACTIONS: readonly TableRowAction<Row>[] = [
  { id: 'open', label: 'Open' },
  { id: 'delete', label: 'Delete', error: true },
];

@Component({
  selector: 'page-table-clip-harness',
  standalone: true,
  imports: [
    TableComponent,
    CellTemplateDirective,
    DsTableResize,
    BadgeComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './table-clip.page.html',
  styles: `
    page-table-clip-harness {
      display: block;
      padding: 16px;
    }
    page-table-clip-harness .case {
      margin: 0 0 32px;
      padding: 8px;
      outline: 1px dashed var(--border-default);
    }
    page-table-clip-harness .case h3 {
      margin: 0 0 8px;
      font: 600 13px/1.4 var(--font-sans);
      color: var(--text-secondary);
    }
    page-table-clip-harness .site {
      display: inline-flex;
      gap: 6px;
      align-items: baseline;
    }
    page-table-clip-harness .site code {
      color: var(--text-tertiary);
    }
    page-table-clip-harness .ph {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    page-table-clip-harness .ph small {
      color: var(--text-tertiary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    page-table-clip-harness .value {
      display: block;
      width: 0;
      min-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class TableClipHarnessPage {
  protected readonly people = people;
  protected readonly many = many(200);
  protected readonly records = records;

  protected readonly cases: readonly HarnessCase[] = [
    {
      id: 'auto-mixed',
      title: 'Auto columns, no truncate',
      width: 900,
      data: people,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        { key: 'status', label: 'Status' },
      ],
    },
    {
      id: 'fixed-widths',
      title: 'Fixed widths plus auto, long text wraps',
      width: 900,
      data: people,
      columns: [
        { key: 'name', label: 'Name', width: 180 },
        { key: 'status', label: 'Status', width: 90 },
        { key: 'email', label: 'Email' },
        { key: 'notes', label: 'Notes' },
      ],
    },
    {
      id: 'trunc-room',
      title: 'Truncate without width, table has room',
      width: 1100,
      data: people,
      columns: [
        { key: 'name', label: 'Policyholder' },
        { key: 'email', label: 'Email', truncate: true },
        { key: 'city', label: 'City' },
      ],
    },
    {
      id: 'trunc-tight',
      title: 'Truncate without width, 520px',
      width: 520,
      data: people,
      columns: [
        { key: 'name', label: 'Policyholder' },
        { key: 'email', label: 'Email', truncate: true },
        { key: 'city', label: 'City' },
      ],
    },
    {
      id: 'trunc-tighter',
      title: 'Truncate without width, 340px',
      width: 340,
      data: people,
      columns: [
        { key: 'name', label: 'Policyholder' },
        { key: 'email', label: 'Email', truncate: true },
      ],
    },
    {
      id: 'trunc-content',
      title: "Truncate with width 'content'",
      width: 700,
      data: people,
      columns: [
        { key: 'name', label: 'Name', truncate: true, width: 'content' },
        { key: 'email', label: 'Email' },
        { key: 'amount', label: 'Amount', align: 'right' },
      ],
    },
    {
      id: 'select-sort-actions',
      title: 'Selectable, sortable, row actions, zebra',
      width: 900,
      data: people,
      selectable: true,
      zebra: true,
      rowActions: ACTIONS,
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true, truncate: true },
        { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
        { key: 'status', label: 'Status', width: 100 },
      ],
    },
    {
      id: 'sticky-many',
      title: 'Sticky header and first column, fixed widths overflow',
      width: 600,
      data: many(12),
      maxHeight: '260px',
      stickyFirstColumn: true,
      columns: [
        { key: 'name', label: 'Name', width: 160 },
        { key: 'email', label: 'Email', truncate: true },
        { key: 'city', label: 'City', width: 140 },
        { key: 'status', label: 'Status', width: 120 },
        { key: 'amount', label: 'Amount', width: 140, align: 'right' },
        { key: 'notes', label: 'Notes', truncate: true },
      ],
    },
    {
      id: 'long-words',
      title: 'Long words and URLs, with and without truncate',
      width: 700,
      data: people,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'notes', label: 'Notes (wraps)' },
        { key: 'email', label: 'Email (truncate)', truncate: true },
      ],
    },
    {
      id: 'many-narrow',
      title: 'Ten truncate columns, 640px, compact',
      width: 640,
      density: 'compact',
      maxHeight: '240px',
      data: records,
      columns: recordFields.map((key) => ({ key, label: key, truncate: true })),
    },
    {
      id: 'few-wide',
      title: 'Two columns, 1300px',
      width: 1300,
      data: people,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', truncate: true },
      ],
    },
    {
      id: 'virtual',
      title: 'Virtual scroll with truncate',
      width: 700,
      maxHeight: '300px',
      virtualScroll: true,
      data: many(200),
      columns: [
        { key: 'name', label: 'Name', width: 200 },
        { key: 'email', label: 'Email', truncate: true },
        { key: 'city', label: 'City' },
      ],
    },
    {
      id: 'ecm-audit-history',
      title: 'Consumer: audit history',
      width: 1100,
      data: people.map((row) => ({ ...row, notes: row.notes || SENTENCE })),
      columns: [
        {
          key: 'when',
          label: 'Date & time',
          sortable: true,
          width: 180,
          cell: () => 'Oct 08, 2026 14:32:10',
        },
        { key: 'status', label: 'Event Type' },
        { key: 'city', label: 'Component' },
        { key: 'name', label: 'Actor' },
        { key: 'version', label: 'Version', width: 90, cell: () => 'v12' },
        { key: 'notes', label: 'Details', truncate: true },
      ],
    },
    {
      id: 'ecm-microsite-errors',
      title: 'Consumer: microsite errors',
      width: 1100,
      data: people,
      columns: [
        {
          key: 'when',
          label: 'When (UTC)',
          sortable: true,
          width: 170,
          cell: () => '2026-10-08 14:32:10',
        },
        { key: 'code', label: 'Status', width: 80, cell: () => '404' },
        { key: 'status', label: 'Reason' },
        { key: 'city', label: 'Microsite' },
        {
          key: 'notes',
          label: 'Request',
          truncate: true,
          cell: (row) => `GET ${URL}&ref=${row.id}`,
        },
        { key: 'token', label: 'PURL token', cell: () => 'a8F3kQ9z' },
        { key: 'ip', label: 'Client', cell: () => '192.168.0.0/24' },
      ],
    },
    {
      id: 'ecm-seg-members',
      title: 'Consumer: segment members side pane',
      width: 360,
      density: 'compact',
      data: people,
      columns: [
        { key: 'notes', label: 'Segment name', truncate: true },
        { key: 'amount', label: 'Matching policyholders' },
      ],
    },
    {
      id: 'ecm-seg-records',
      title: 'Consumer: segment records drill-down',
      width: 900,
      density: 'compact',
      maxHeight: '300px',
      data: records,
      columns: ['groups', ...recordFields].map((key) => ({
        key,
        label: key,
        truncate: true,
      })),
    },
  ];

  protected readonly ctaColumns: readonly TableColumn<Row>[] = [
    {
      key: 'name',
      label: 'Microsite',
      sortable: true,
      width: 200,
      truncate: true,
    },
    { key: 'city', label: 'Linked send', sortable: true, width: 170 },
    { key: 'amount', label: 'Visitors', align: 'right', sortable: true },
    {
      key: 'visits',
      label: 'Visits',
      align: 'right',
      sortable: true,
      cell: () => '1,204',
    },
    {
      key: 'ctr',
      label: 'CTR',
      align: 'right',
      sortable: true,
      cell: () => '12.4%',
    },
  ];

  protected readonly hintColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Policyholder', hint: 'Name on the policy' },
    { key: 'status', label: 'Status' },
    {
      key: 'email',
      label: 'Contact email address',
      hint: 'Primary contact',
      truncate: true,
    },
    { key: 'city', label: 'City' },
    { key: 'amount', label: 'Premium', hint: 'Annual, GBP', align: 'right' },
  ];

  protected readonly resizeColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'notes', label: 'Notes', truncate: true, width: 240 },
    { key: 'amount', label: 'Amount', align: 'right' },
  ];

  protected readonly containerColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'status', label: 'Status', width: 100 },
    { key: 'amount', label: 'Amount', align: 'right' },
  ];

  protected readonly brokerColumns: readonly TableColumn<Row>[] = [
    {
      key: 'when',
      label: 'Started',
      sortable: true,
      cell: () => 'Oct 08, 2026 14:32',
    },
    { key: 'name', label: 'User', sortable: true },
    { key: 'status', label: 'Skill', sortable: true },
    {
      key: 'email',
      label: 'Model',
      sortable: true,
      truncate: true,
      width: 240,
    },
    {
      key: 'calls',
      label: 'Calls',
      sortable: true,
      align: 'right',
      cell: () => '42',
    },
    {
      key: 'tokens',
      label: 'In / Out',
      sortable: true,
      align: 'right',
      cell: () => '120,400 / 8,210',
    },
    { key: 'amount', label: 'Cost', sortable: true, align: 'right' },
  ];

  protected readonly deltaWorkaroundColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Policyholder', width: 'content' },
    { key: 'status', label: 'Field', width: 220 },
    { key: 'email', label: 'Old value' },
    { key: 'notes', label: 'New value' },
  ];

  protected readonly deltaTruncateColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Policyholder', width: 'content' },
    { key: 'status', label: 'Field', width: 220 },
    { key: 'email', label: 'Old value', truncate: true },
    { key: 'notes', label: 'New value', truncate: true },
  ];
}
