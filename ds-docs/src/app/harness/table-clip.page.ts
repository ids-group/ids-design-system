import { Component, Directive, ViewEncapsulation, signal } from '@angular/core';
import { provideDsConfig } from 'ds/core';
import { BadgeComponent } from 'ds/badge';
import { CellTemplateDirective, TableComponent } from 'ds/table';
import type { TableColumn, TableColumnKind, TableRowAction } from 'ds/table';
import { DsTableResize } from 'ds/table-resize';
import { TooltipDirective } from 'ds/tooltip';
import { LAYOUT_CASES } from './table-layout.cases';

interface Row {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly city?: string;
  readonly status?: string;
  readonly amount?: string;
  readonly notes?: string;
  readonly policy?: string;
  readonly step?: string;
  readonly enrollment?: string;
  readonly [field: string]: string | undefined;
}

interface HarnessCase {
  readonly id: string;
  readonly title: string;
  readonly width: number;
  readonly columns: readonly TableColumn<Row>[];
  readonly data: readonly Row[];
  /** Swapped in for `data` by the case's "Page 2" button, as a server-paged host does. */
  readonly pageTwo?: readonly Row[];
  readonly density?: 'default' | 'compact';
  readonly selectable?: boolean;
  readonly zebra?: boolean;
  readonly maxHeight?: string | null;
  readonly stickyFirstColumn?: boolean;
  readonly rowActions?: readonly TableRowAction<Row>[];
  readonly virtualScroll?: boolean;
  readonly pageSize?: number;
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

const shortRecords: readonly Row[] = records.map((row, index) => ({
  ...row,
  id: `rec-p2-${index}`,
  groups: 'Q3',
  first_name: 'Ann',
  last_name: 'Fox',
  email: 'a@b.io',
  address_line_1: '1 High St',
  city: 'Ely',
  product: 'Motor',
}));
const recordKinds: Readonly<Record<string, TableColumnKind>> = {
  policy_id: 'id',
  postcode: 'id',
  premium: 'number',
  renewal_date: 'date',
};

const deltaNames = [
  ['Margaret', 'Whitfield'],
  ['Oluwaseun', 'Adeyemi-Clarke'],
  ['Hannah', 'Kowalczyk'],
  ['Rajesh', 'Venkataraman'],
  ['Siobhan', "O'Donoghue"],
  ['Tomasz', 'Wojciechowski'],
  ['Grace', 'Pemberton'],
  ['Mateo', 'Fernandez-Lopez'],
  ['Yuki', 'Tanaka'],
  ['Elif', 'Yilmaz'],
  ['Joseph', 'Quigley'],
];
// Two pages of one paged table: the same columns, short values on the first, long on the second.
const pageOne: readonly Row[] = people
  .slice(1, 3)
  .concat(
    people.slice(1, 3).map((row, index) => ({ ...row, id: `p1-${index}` })),
  );
const pageTwo: readonly Row[] = [
  people[0],
  people[3],
  people[0],
  people[3],
].map((row, index) => ({ ...row, id: `p2-${index}` }));
const pagingColumns: readonly TableColumn<Row>[] = [
  { key: 'name', label: 'Policyholder' },
  { key: 'email', label: 'Email', truncate: true },
  { key: 'city', label: 'City' },
  { key: 'status', label: 'Status', kind: 'status' },
  { key: 'amount', label: 'Amount', align: 'right', kind: 'number' },
];

// A consumer's delta review records: name + key/policy line, one address of about 290px per row.
const deltaRecords: readonly Row[] = deltaNames.map(([first, last], index) => ({
  id: `NYL-QA308-${String(index + 1).padStart(4, '0')}`,
  name: `${first} ${last}`,
  policy: `POL-308-${String(117 + index * 7).padStart(6, '0')}`,
  email: `${first}.${last}@nyl-qa308.example.com`
    .toLowerCase()
    .replace("'", ''),
  step: index % 2 ? 'Wave 2 · Reminder email' : 'Wave 1 · Welcome pack',
  enrollment: index % 3 ? 'active' : 'completed',
  comms: String(index % 4),
}));

const ACTIONS: readonly TableRowAction<Row>[] = [
  { id: 'open', label: 'Open' },
  { id: 'delete', label: 'Delete', error: true },
];

@Directive({
  selector: '[docsAutoLayoutConfig]',
  standalone: true,
  providers: [provideDsConfig({ table: { layout: 'auto' } })],
})
class AutoLayoutConfigDirective {}

@Component({
  selector: 'page-table-clip-harness',
  standalone: true,
  imports: [
    TableComponent,
    CellTemplateDirective,
    DsTableResize,
    BadgeComponent,
    TooltipDirective,
    AutoLayoutConfigDirective,
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
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    page-table-clip-harness .site-name,
    page-table-clip-harness .site-slug {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    page-table-clip-harness .site-name {
      font-weight: 600;
    }
    page-table-clip-harness .site-slug {
      font-size: 12px;
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
    page-table-clip-harness .delta-review .ph-cell {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    page-table-clip-harness .delta-review .ph-cell__name {
      font-weight: var(--font-weight-medium);
    }
    page-table-clip-harness .delta-review .ph-cell__meta {
      font-size: 11px;
      color: var(--text-tertiary);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    page-table-clip-harness .delta-review .step-cell {
      display: flex;
      flex-direction: column;
    }
    page-table-clip-harness .delta-review .step-cell__meta {
      font-size: 11px;
      color: var(--text-tertiary);
    }
    page-table-clip-harness [data-case='delta-review-unchanged-hug'] table {
      width: auto !important;
    }
    page-table-clip-harness .min-width-token {
      --ds-table-min-width: 1100px;
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
  protected readonly layoutCases = LAYOUT_CASES;
  protected readonly secondPageShown = signal<ReadonlySet<string>>(new Set());
  protected readonly hiddenPanelShown = signal(true);
  protected readonly hiddenPanelRows = signal<readonly Row[]>(people);
  protected readonly hiddenPanelColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Policyholder' },
    { key: 'status', label: 'Status', width: 'content' },
    { key: 'email', label: 'Email' },
  ];

  protected caseData(item: HarnessCase): readonly Row[] {
    return item.pageTwo && this.secondPageShown().has(item.id)
      ? item.pageTwo
      : item.data;
  }

  protected showPageTwo(id: string): void {
    this.secondPageShown.update((shown) => new Set(shown).add(id));
  }
  protected readonly perfRows = signal<readonly Row[]>([]);
  protected readonly perfColumns =
    signal<readonly TableColumn<Row>[]>(pagingColumns);
  // The clip as it is without the fit: a numeric width clips at 240px of text.
  protected readonly perfFixedColumns: readonly TableColumn<Row>[] =
    pagingColumns.map((col) => (col.truncate ? { ...col, width: 272 } : col));

  protected loadPerf(count: number, fixed: boolean): void {
    this.perfColumns.set(fixed ? this.perfFixedColumns : pagingColumns);
    this.perfRows.set(many(count));
  }
  protected readonly many = many(200);
  protected readonly records = records;
  protected readonly deltaRecords = deltaRecords;
  protected readonly deltaRemoved = deltaRecords.slice(0, 1);

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
      pageTwo: shortRecords,
      columns: ['groups', ...recordFields].map((key) => ({
        key,
        label: key,
        truncate: true,
        kind: recordKinds[key],
      })),
    },
    {
      id: 'equal-stretch',
      title: 'Three short auto columns share the slack',
      width: 1200,
      data: people,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'status', label: 'Status' },
      ],
    },
    {
      id: 'header-longer',
      title: 'Header labels longer than their content',
      width: 900,
      data: people,
      columns: [
        { key: 'name', label: 'Name' },
        {
          key: 'status',
          label: 'Current enrolment status',
          truncate: true,
        },
        {
          key: 'amount',
          label: 'Communications received',
          width: 'content',
          align: 'right',
        },
        { key: 'city', label: 'Preferred branch city' },
      ],
    },
    {
      id: 'content-wide',
      title: "width 'content' without truncate, long text, 600px",
      width: 600,
      data: people,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', width: 'content' },
        { key: 'status', label: 'Status' },
      ],
    },
    {
      id: 'numeric-truncate-narrow',
      title: 'Numeric width with truncate and auto wrap, 600px',
      width: 600,
      data: people,
      columns: [
        { key: 'email', label: 'Email', width: 160, truncate: true },
        { key: 'notes', label: 'Notes' },
        { key: 'amount', label: 'Amount', width: 110, align: 'right' },
      ],
    },
    {
      id: 'paging-page-1',
      title: 'One paged table, page 1: short values',
      width: 1100,
      data: pageOne,
      columns: pagingColumns,
    },
    {
      id: 'paging-page-2',
      title: 'Same table, page 2: long values',
      width: 1100,
      data: pageTwo,
      columns: pagingColumns,
    },
    {
      id: 'truncate-link',
      title: 'Truncate column whose cells are links, 700px',
      width: 700,
      data: people,
      columns: [
        { key: 'name', label: 'Policyholder' },
        {
          key: 'email',
          label: 'Email',
          truncate: true,
          link: (row) => `/harness/table-clip#${row.id}`,
        },
        { key: 'city', label: 'City' },
      ],
    },
    {
      id: 'paging-pager',
      title: 'Same table with pageSize 4: page 1 short, page 2 long',
      width: 1100,
      data: [...pageOne, ...pageTwo],
      columns: pagingColumns,
      pageSize: 4,
    },
    {
      id: 'paging-all',
      title: 'Same table, both pages at once',
      width: 1100,
      data: [...pageOne, ...pageTwo],
      columns: pagingColumns,
    },
    {
      id: 'paging-server',
      title:
        'One server-paged table: the host swaps data from page 1 to page 2',
      width: 1100,
      data: pageOne,
      pageTwo,
      columns: pagingColumns,
    },
    {
      id: 'short-text',
      title: 'Short values on page 1, longer names on page 2, 1100px',
      width: 1100,
      data: pageOne,
      pageTwo,
      columns: [
        { key: 'name', label: 'Policyholder' },
        { key: 'city', label: 'City' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'amount', label: 'Amount', align: 'right', kind: 'number' },
      ],
    },
    {
      id: 'min-width-column',
      title: 'Truncate column with minWidth 160, 600px',
      width: 600,
      data: people,
      columns: [
        { key: 'name', label: 'Policyholder' },
        { key: 'email', label: 'Email', truncate: true, minWidth: 160 },
        { key: 'notes', label: 'Notes' },
        { key: 'amount', label: 'Amount', align: 'right' },
      ],
    },
    {
      id: 'min-width-column-off',
      title: 'Same columns without minWidth, 600px',
      width: 600,
      data: people,
      columns: [
        { key: 'name', label: 'Policyholder' },
        { key: 'email', label: 'Email', truncate: true },
        { key: 'notes', label: 'Notes' },
        { key: 'amount', label: 'Amount', align: 'right' },
      ],
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

  protected readonly expandColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'amount', label: 'Amount', align: 'right', width: 120 },
  ];

  protected readonly resizeContentColumns: readonly TableColumn<Row>[] = [
    { key: 'name', label: 'Name', width: 'content' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'notes', label: 'Notes' },
    { key: 'amount', label: 'Amount', width: 120, align: 'right' },
  ];

  protected readonly deltaReviewUnchanged: readonly TableColumn<Row>[] = [
    { key: 'policyholder', label: 'Policyholder', width: 'content' },
    { key: 'email', label: 'Email' },
  ];

  protected readonly deltaReviewRemoved: readonly TableColumn<Row>[] = [
    { key: 'policyholder', label: 'Policyholder', width: 'content' },
    { key: 'email', label: 'Email' },
    { key: 'step', label: 'Journey step', width: 200 },
    {
      key: 'comms',
      label: 'Communications received',
      width: 'content',
      align: 'right',
    },
  ];

  protected readonly deltaReviewUnchangedTruncate: readonly TableColumn<Row>[] =
    [
      { key: 'policyholder', label: 'Policyholder', width: 'content' },
      { key: 'email', label: 'Email', truncate: true },
    ];

  protected readonly deltaReviewRemovedTruncate: readonly TableColumn<Row>[] = [
    { key: 'policyholder', label: 'Policyholder', width: 'content' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'step', label: 'Journey step', width: 200 },
    {
      key: 'comms',
      label: 'Communications received',
      width: 'content',
      align: 'right',
    },
  ];

  protected readonly deltaReviewUnchangedPlain: readonly TableColumn<Row>[] = [
    { key: 'policyholder', label: 'Policyholder' },
    { key: 'email', label: 'Email' },
  ];

  protected readonly deltaReviewUnchangedBothAuto: readonly TableColumn<Row>[] =
    [
      { key: 'policyholder', label: 'Policyholder' },
      { key: 'email', label: 'Email', truncate: true },
    ];

  /** A consumer's delta review at the panel widths of a 1710, 1280 and 1024 px window. `shipped` renders its
   *  zero-width `.value` span; without it the column is `truncate: true` and nothing else. */
  protected readonly deltaReviewCases = [
    {
      id: 'delta-review-unchanged-shipped',
      width: 1349,
      columns: this.deltaReviewUnchanged,
      data: deltaRecords,
      shipped: true,
    },
    {
      id: 'delta-review-removed-shipped',
      width: 1349,
      columns: this.deltaReviewRemoved,
      data: deltaRecords.slice(0, 1),
      shipped: true,
    },
    {
      id: 'delta-review-removed-shipped-663',
      width: 663,
      columns: this.deltaReviewRemoved,
      data: deltaRecords.slice(0, 1),
      shipped: true,
    },
    {
      id: 'delta-review-unchanged-truncate',
      width: 1349,
      columns: this.deltaReviewUnchangedTruncate,
      data: deltaRecords,
      shipped: false,
    },
    {
      id: 'delta-review-removed-truncate',
      width: 1349,
      columns: this.deltaReviewRemovedTruncate,
      data: deltaRecords.slice(0, 1),
      shipped: false,
    },
    {
      id: 'delta-review-removed-truncate-919',
      width: 919,
      columns: this.deltaReviewRemovedTruncate,
      data: deltaRecords.slice(0, 1),
      shipped: false,
    },
    {
      id: 'delta-review-removed-truncate-663',
      width: 663,
      columns: this.deltaReviewRemovedTruncate,
      data: deltaRecords.slice(0, 1),
      shipped: false,
    },
    {
      id: 'delta-review-unchanged-hug',
      width: 1349,
      columns: this.deltaReviewUnchangedPlain,
      data: deltaRecords,
      shipped: false,
    },
    {
      id: 'delta-review-unchanged-both-auto',
      width: 1349,
      columns: this.deltaReviewUnchangedBothAuto,
      data: deltaRecords,
      shipped: false,
    },
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
