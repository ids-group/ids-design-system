import {
  Component,
  type TemplateRef,
  ViewEncapsulation,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { ButtonComponent } from 'ds/button';
import { DrawerComponent } from 'ds/drawer';
import { EmptyStateComponent } from 'ds/empty-state';
import { SearchComponent } from 'ds/search';
import { CellTemplateDirective, TableComponent } from 'ds/table';
import { DsTableColumns } from 'ds/table-columns';
import { DsTableResize } from 'ds/table-resize';
import { DsTableExport } from 'ds/table-export';
import type {
  TableCellEditEvent,
  TableColumn,
  TableRowAction,
  TableRowActionEvent,
} from 'ds/table';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface EventRow {
  readonly id: string;
  readonly project: string;
  readonly date: string;
  readonly venue: string;
  readonly status: 'active' | 'confirmed' | 'planning' | 'completed';
  readonly statusLabel: string;
  readonly capacity: string;
}

interface DeliveryRow {
  readonly channel: string;
  readonly sentAt: string;
  readonly recipient: string;
  readonly outcome: string;
}

interface ProjectRow {
  id: string;
  project: string;
  owner: string;
  status: string;
  budget: number;
}

const BULK_SUBJECTS = [
  'intake review',
  'renewal',
  'audit',
  'onboarding',
  'settlement',
];
const BULK_OWNERS = [
  'Ann Fletcher',
  'Raj Patel',
  'Mei Lin',
  'Tomas Novak',
  'Sara Okafor',
];
const BULK_STATUSES = ['Open', 'Pending', 'Closed'];

@Component({
  selector: 'section-components-table',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CellTemplateDirective,
    DocsSectionComponent,
    DrawerComponent,
    EmptyStateComponent,
    SearchComponent,
    TableComponent,
    DsTableExport,
    DsTableColumns,
    DsTableResize,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './table.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './table.section.scss'],
})
export class TableSection {
  protected readonly loadingColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'date', label: 'Dates' },
    { key: 'venue', label: 'Venue' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'capacity', label: 'Capacity', align: 'right' },
  ];

  // project / id / status carry custom cell templates (bold, mono, badge).
  protected readonly defaultColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    // A fixed-format identifier and a date range are exactly what width: 'content'
    // is for: on a phone the auto layout squeezed them to 68px and 76px and broke
    // ORD-2026-0142 across three lines, which took every row to six lines tall.
    { key: 'id', label: 'ID', width: 'content' },
    { key: 'date', label: 'Dates', width: 'content' },
    { key: 'venue', label: 'Venue' },
    { key: 'status', label: 'Status' },
    { key: 'capacity', label: 'Capacity', align: 'right' },
  ];

  protected readonly selectionColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'date', label: 'Dates' },
    { key: 'venue', label: 'Venue' },
    { key: 'status', label: 'Status' },
  ];

  protected readonly stateColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
  ];

  protected readonly linkCellColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', interactive: true },
    { key: 'venue', label: 'Venue' },
  ];

  protected readonly linkColumns: TableColumn<EventRow>[] = [
    {
      key: 'project',
      label: 'Record',
      // A planning record has no page to open yet, and returning null leaves that
      // cell as plain text — which is how a partly-reachable list stays one column.
      link: (row) =>
        row.status === 'planning'
          ? null
          : ['/components/table', { record: row.project }],
    },
    { key: 'venue', label: 'Venue' },
    { key: 'status', label: 'Status' },
  ];

  protected readonly sortStateColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', sortable: true },
  ];

  protected readonly sortableColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', sortable: true },
    { key: 'date', label: 'Dates', sortable: true },
    { key: 'venue', label: 'Venue', sortable: true },
    { key: 'capacity', label: 'Capacity', align: 'right', sortable: true },
  ];

  protected readonly hintColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', sortable: true },
    {
      key: 'venue',
      label: 'Venue',
      hint: 'Where the event takes place; a site with several halls is listed once.',
    },
    {
      key: 'capacity',
      label: 'Capacity',
      align: 'right',
      sortable: true,
      hint: 'Seated places at the venue, not tickets sold.',
    },
  ];

  protected readonly noRows: readonly EventRow[] = [];

  protected readonly events: readonly EventRow[] = [
    {
      id: 'ORD-2026-0142',
      project: 'Project Alpha',
      date: '30 Apr – 3 May 2026',
      venue: 'North Site',
      status: 'active',
      statusLabel: 'Active',
      capacity: '1,200',
    },
    {
      id: 'ORD-2026-0156',
      project: 'Project Beta',
      date: '22 – 25 May 2026',
      venue: 'East Campus',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      capacity: '680',
    },
    {
      id: 'ORD-2026-0157',
      project: 'Q3 Initiative',
      date: '22 – 25 Aug 2026',
      venue: 'South Hub',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      capacity: '420',
    },
    {
      id: 'ORD-2026-0188',
      project: 'Annual Summit',
      date: '5 – 9 Sep 2026',
      venue: 'HQ Auditorium',
      status: 'planning',
      statusLabel: 'Planning',
      capacity: '900',
    },
    {
      id: 'EVT-2026-0091',
      project: 'Download 2026',
      date: '13 – 16 Jun 2026',
      venue: 'Donington Park',
      status: 'completed',
      statusLabel: 'Completed',
      capacity: '4,500',
    },
    {
      id: 'EVT-2026-0104',
      project: 'Field Day',
      date: '8 – 9 Jul 2026',
      venue: 'West Pavilion',
      status: 'active',
      statusLabel: 'Active',
      capacity: '320',
    },
  ];

  protected readonly longList: readonly EventRow[] = [
    ...this.events,
    {
      id: 'EVT-2026-0119',
      project: 'Autumn Forum',
      date: '14 – 16 Oct 2026',
      venue: 'North Site',
      status: 'planning',
      statusLabel: 'Planning',
      capacity: '540',
    },
    {
      id: 'EVT-2026-0126',
      project: 'Year-End Gala',
      date: '12 Dec 2026',
      venue: 'HQ Auditorium',
      status: 'planning',
      statusLabel: 'Planning',
      capacity: '1,800',
    },
    {
      id: 'EVT-2025-0220',
      project: 'Winter Retreat',
      date: '18 – 21 Dec 2025',
      venue: 'Lakeside Lodge',
      status: 'completed',
      statusLabel: 'Completed',
      capacity: '180',
    },
    {
      id: 'EVT-2025-0204',
      project: 'Q4 Review',
      date: '5 Nov 2025',
      venue: 'HQ Auditorium',
      status: 'completed',
      statusLabel: 'Completed',
      capacity: '260',
    },
  ];

  protected readonly selectionRows: readonly EventRow[] = this.events.slice(
    0,
    4,
  );
  protected readonly bulkSelected = signal(
    new Set(this.events.slice(0, 3).map((row) => row.id)),
  );

  protected clearBulkSelection(): void {
    this.bulkSelected.set(new Set());
  }

  protected readonly stateRow: readonly EventRow[] = this.events.slice(0, 1);
  protected readonly stateSelectedIds = signal(new Set([this.events[0].id]));
  protected readonly sortableRows: readonly EventRow[] = this.events.slice(
    0,
    4,
  );

  protected readonly filterColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'venue', label: 'Venue', filter: 'set' },
    { key: 'statusLabel', label: 'Status', filter: 'set' },
    { key: 'capacity', label: 'Capacity', align: 'right' },
  ];

  protected readonly editColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', editable: true },
    { key: 'venue', label: 'Venue', editable: true },
    { key: 'statusLabel', label: 'Status' },
    { key: 'capacity', label: 'Capacity', align: 'right', editable: true },
  ];

  protected readonly editRows = signal<EventRow[]>(
    this.events.slice(0, 4).map((row) => ({ ...row })),
  );

  protected onCellEdited(event: TableCellEditEvent<EventRow>): void {
    this.editRows.update((rows) =>
      rows.map((row) =>
        row.id === event.row.id
          ? ({ ...row, [event.key]: event.value } as EventRow)
          : row,
      ),
    );
  }

  protected readonly projectColumns: TableColumn<ProjectRow>[] = [
    { key: 'project', label: 'Project', sortable: true },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status' },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      align: 'right',
      cell: (row) => '£' + row.budget.toLocaleString(),
      sortValue: (row) => row.budget,
    },
  ];

  protected readonly projectRows: ProjectRow[] = [
    {
      id: '1',
      project: 'Apollo',
      owner: 'M. Whitfield',
      status: 'Active',
      budget: 124000,
    },
    {
      id: '2',
      project: 'Borealis',
      owner: 'J. Okafor',
      status: 'Planning',
      budget: 87500,
    },
    {
      id: '3',
      project: 'Cirrus',
      owner: 'S. Patel',
      status: 'Active',
      budget: 210000,
    },
    {
      id: '4',
      project: 'Delphi',
      owner: 'R. Chen',
      status: 'On hold',
      budget: 45000,
    },
    {
      id: '5',
      project: 'Echo',
      owner: 'M. Whitfield',
      status: 'Active',
      budget: 310000,
    },
    {
      id: '6',
      project: 'Fenix',
      owner: 'L. Kowalski',
      status: 'Planning',
      budget: 63000,
    },
    {
      id: '7',
      project: 'Gravity',
      owner: 'J. Okafor',
      status: 'Active',
      budget: 178000,
    },
    {
      id: '8',
      project: 'Helios',
      owner: 'T. Nguyen',
      status: 'On hold',
      budget: 92000,
    },
    {
      id: '9',
      project: 'Indigo',
      owner: 'S. Patel',
      status: 'Planning',
      budget: 140000,
    },
    {
      id: '10',
      project: 'Janus',
      owner: 'R. Chen',
      status: 'Active',
      budget: 255000,
    },
    {
      id: '11',
      project: 'Kestrel',
      owner: 'L. Kowalski',
      status: 'Planning',
      budget: 38000,
    },
    {
      id: '12',
      project: 'Lynx',
      owner: 'T. Nguyen',
      status: 'Active',
      budget: 196000,
    },
  ];

  protected readonly projectSelected = signal(new Set<string>());
  protected readonly emptyAnnouncementQuery = signal('');
  protected readonly toolbarQuery = signal('');
  protected readonly pagerSkeletonLoading = signal(false);

  // Deliberately keyless: an audit line has no id of its own, which is the case `[rowId]` exists
  // for. Two rows share a channel and two share a timestamp, so only the pair identifies a row.
  protected readonly deliveries: readonly DeliveryRow[] = [
    {
      channel: 'email',
      sentAt: '09:12',
      recipient: 'ops@northsite',
      outcome: 'Delivered',
    },
    {
      channel: 'email',
      sentAt: '09:40',
      recipient: 'ops@eastcampus',
      outcome: 'Delivered',
    },
    {
      channel: 'sms',
      sentAt: '09:12',
      recipient: '+44 7700 900461',
      outcome: 'Failed',
    },
    {
      channel: 'push',
      sentAt: '10:05',
      recipient: 'field-app',
      outcome: 'Delivered',
    },
  ];

  protected readonly deliveryColumns: TableColumn<DeliveryRow>[] = [
    { key: 'channel', label: 'Channel' },
    { key: 'sentAt', label: 'Sent' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'outcome', label: 'Outcome' },
  ];

  protected readonly deliveryRowId = (row: DeliveryRow): string =>
    `${row.channel}-${row.sentAt}`;

  protected readonly deliverySelected = signal(new Set<string>());

  // The map and the empty template are read as viewChild rather than projected, because that is
  // the situation they exist for: a wrapper's own <ng-content> hides projected directives from the
  // table's content query, so the wrapper has to hand them over as inputs.
  private readonly outcomeCell =
    viewChild.required<TemplateRef<{ $implicit: unknown; row: unknown }>>(
      'outcomeCell',
    );
  private readonly noDeliveries =
    viewChild.required<TemplateRef<unknown>>('noDeliveries');

  protected readonly handedOverTemplates = computed(() => ({
    outcome: this.outcomeCell(),
  }));
  protected readonly handedOverEmpty = computed(() => this.noDeliveries());
  protected readonly wrapperRows = signal<readonly DeliveryRow[]>([]);

  protected readonly fitColumns: TableColumn<ProjectRow>[] = [
    { key: 'project', label: 'Project' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status', width: 'content' },
    {
      key: 'budget',
      label: 'Budget',
      align: 'right',
      width: 'content',
      cell: (row) => '£' + row.budget.toLocaleString(),
    },
  ];

  protected readonly serverSortColumns: TableColumn<ProjectRow>[] = [
    { key: 'project', label: 'Project', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];
  /** The host's own sort state, one-way bound into the table — a stand-in for the
   *  computed over the URL a real list keeps. Its default is owner/desc, and a
   *  cleared sort returns to it, which is the case that used to desync. */
  protected readonly serverSortKey = signal<string>('owner');
  protected readonly serverSortDir = signal<'asc' | 'desc' | null>('desc');
  protected readonly serverSortedRows = computed<readonly ProjectRow[]>(() => {
    const key = this.serverSortKey() as keyof ProjectRow;
    const dir = this.serverSortDir();
    const rows = this.projectRows.slice(0, 6);
    if (!dir) {
      return rows;
    }

    return rows.sort(
      (left, right) =>
        String(left[key]).localeCompare(String(right[key])) *
        (dir === 'asc' ? 1 : -1),
    );
  });

  /** The same server shape with NO handler: the table writes these directly, so
   *  the host reads its sort state back rather than deciding it. `dir` reaching
   *  null is the trade — see the demo above, which keeps a handler for exactly
   *  that case. */
  protected readonly twoWaySortKey = signal<string>('project');
  protected readonly twoWaySortDir = signal<'asc' | 'desc' | null>('asc');
  protected readonly twoWaySortedRows = computed<readonly ProjectRow[]>(() => {
    const key = this.twoWaySortKey() as keyof ProjectRow;
    const dir = this.twoWaySortDir();
    const rows = this.projectRows.slice(0, 6);
    if (!dir) {
      return rows;
    }

    return rows
      .slice()
      .sort(
        (left, right) =>
          String(left[key]).localeCompare(String(right[key])) *
          (dir === 'asc' ? 1 : -1),
      );
  });

  protected onServerSort(event: {
    key: string;
    dir: 'asc' | 'desc' | null;
  }): void {
    if (!event.dir) {
      this.serverSortKey.set('owner');
      this.serverSortDir.set('desc');

      return;
    }
    this.serverSortKey.set(event.key);
    this.serverSortDir.set(event.dir);
  }

  /** Slow on purpose: the demo is about the in-flight state an OUTSIDE button
   *  can now read, which a fetch that resolves at once never shows. */
  protected readonly slowExportFetcher = async (): Promise<
    readonly ProjectRow[]
  > => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return this.projectRows;
  };

  protected readonly expandColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'date', label: 'Dates' },
    { key: 'venue', label: 'Venue' },
    { key: 'statusLabel', label: 'Status' },
  ];

  protected readonly expandRows: readonly EventRow[] = this.events.slice(0, 4);

  protected readonly expandLog = signal<string>('nothing yet');

  protected readonly singleExpanded = signal(new Set<string>());

  protected onRowExpanded(row: unknown): void {
    this.expandLog.set(`expanded ${(row as EventRow).project}`);
  }

  protected onRowCollapsed(row: unknown): void {
    this.expandLog.set(`collapsed ${(row as EventRow).project}`);
  }

  /** Narrows the `unknown` row a projected `dsCellTemplate` receives back to EventRow. */
  protected asEvent(row: unknown): EventRow {
    return row as EventRow;
  }

  protected readonly detailOpen = signal(false);
  protected readonly detailRow = signal<EventRow | null>(null);

  protected openDetail(row: EventRow): void {
    this.detailRow.set(row);
    this.detailOpen.set(true);
  }

  protected readonly rowActions: TableRowAction<EventRow>[] = [
    { id: 'view', label: 'View', icon: 'eye' },
    { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
    { id: 'archive', label: 'Archive', icon: 'archive' },
    {
      id: 'relaunch',
      label: 'Relaunch',
      icon: 'refresh',
      hidden: (row) => row.status !== 'completed',
    },
    {
      id: 'suspend',
      label: (row) => (row.status === 'active' ? 'Pause' : 'Resume'),
      icon: 'refresh',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      error: true,
      divider: true,
      disabled: (row) => row.status === 'completed',
      disabledReason: 'A completed run is kept for the audit trail',
    },
  ];

  protected readonly lastRowClick = signal<string | null>(null);
  protected readonly lastRowAction = signal<string | null>(null);

  protected readonly truncateColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', truncate: true, width: 220 },
    { key: 'date', label: 'Dates' },
    { key: 'venue', label: 'Venue', truncate: true },
    { key: 'statusLabel', label: 'Status' },
  ];

  protected readonly truncateRows: readonly EventRow[] = [
    {
      id: 'ORD-2026-0201',
      project:
        'Multi-year infrastructure modernisation programme for the northern logistics corridor',
      date: '3 – 7 Mar 2026',
      venue: 'International Conference & Exhibition Centre, Hall 4',
      status: 'active',
      statusLabel: 'Active',
      capacity: '2,400',
    },
    {
      id: 'ORD-2026-0202',
      project: 'Quarterly stakeholder alignment and budget review',
      date: '18 Mar 2026',
      venue: 'HQ Auditorium',
      status: 'planning',
      statusLabel: 'Planning',
      capacity: '160',
    },
    {
      id: 'ORD-2026-0203',
      project:
        'Cross-regional field operations safety certification workshop series',
      date: '2 – 4 Apr 2026',
      venue: 'Westgate Training & Development Campus, Building C',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      capacity: '380',
    },
  ];

  protected readonly wideColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record', width: 260 },
    { key: 'id', label: 'ID', width: 200 },
    { key: 'date', label: 'Dates', width: 220 },
    { key: 'venue', label: 'Venue', width: 220 },
    { key: 'statusLabel', label: 'Status', width: 160 },
    { key: 'capacity', label: 'Capacity', align: 'right', width: 140 },
  ];

  protected readonly pickerColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'id', label: 'ID', hideable: true, hidden: true },
    { key: 'date', label: 'Dates', hideable: true },
    { key: 'venue', label: 'Venue', hideable: true },
    { key: 'statusLabel', label: 'Status', hideable: true },
    { key: 'capacity', label: 'Capacity', align: 'right', hideable: true },
  ];

  protected readonly bulkColumns: TableColumn<ProjectRow>[] = [
    { key: 'id', label: 'ID', width: 120 },
    { key: 'project', label: 'Record', width: 320, sortable: true },
    { key: 'owner', label: 'Owner', width: 200, sortable: true },
    { key: 'status', label: 'Status', width: 160 },
    { key: 'budget', label: 'Budget', align: 'right', width: 160 },
  ];

  /** 10 000 rows — the size at which rendering every row tanks scroll and paint. */
  protected readonly bulkRows: ProjectRow[] = Array.from(
    { length: 10_000 },
    (_, index) => ({
      id: `REC-${String(index + 1).padStart(5, '0')}`,
      project: `Record ${index + 1} · ${BULK_SUBJECTS[index % BULK_SUBJECTS.length]}`,
      owner: BULK_OWNERS[index % BULK_OWNERS.length],
      status: BULK_STATUSES[index % BULK_STATUSES.length],
      budget: 1000 + ((index * 37) % 90_000),
    }),
  );

  protected onRowAction(event: TableRowActionEvent<EventRow>): void {
    const { label } = event.action;
    const actionLabel = typeof label === 'function' ? label(event.row) : label;
    this.lastRowAction.set(`${actionLabel} · ${event.row.project}`);
  }

  /** Lazy demo: the same 10 000 records, but the table starts with NONE of them
   *  and the array is filled at the absolute indices each request covers. */
  protected readonly lazyTotal = 10_000;
  protected readonly lazyRows = signal<ProjectRow[]>(
    new Array<ProjectRow>(this.lazyTotal),
  );
  protected readonly lazyRequests = signal<string[]>([]);

  protected onLazyLoad(range: { first: number; rows: number }): void {
    this.lazyRequests.update((log) =>
      [`first ${range.first} · rows ${range.rows}`, ...log].slice(0, 4),
    );
    // A real host would fetch here; the delay is what makes the skeleton rows
    // visible, which is the whole point of the demo.
    setTimeout(() => {
      this.lazyRows.update((rows) => {
        const next = rows.slice();
        for (
          let index = range.first;
          index < range.first + range.rows;
          index++
        ) {
          next[index] = this.bulkRows[index];
        }

        return next;
      });
    }, 600);
  }
}
