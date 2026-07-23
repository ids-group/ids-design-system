import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  BadgeComponent,
  ButtonComponent,
  CellTemplateDirective,
  DrawerComponent,
  EmptyStateComponent,
  IconComponent,
  TableComponent,
  type TableColumn,
  type TableRowAction,
  type TableRowActionEvent,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

interface EventRow {
  readonly id: string;
  readonly project: string;
  readonly date: string;
  readonly venue: string;
  readonly status: 'active' | 'confirmed' | 'planning' | 'completed';
  readonly statusLabel: string;
  readonly capacity: string;
}

interface ProjectRow {
  id: string;
  project: string;
  owner: string;
  status: string;
  budget: number;
}

@Component({
  selector: 'section-components-table',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CellTemplateDirective,
    DocsSectionComponent,
    DocsTruncationComponent,
    DrawerComponent,
    EmptyStateComponent,
    IconComponent,
    TableComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './table.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './table.section.scss',
  ],
})
export class TableSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Cell text',
      behaviour:
        'Single line, ellipsis at column width. Tooltip on hover when clipped.',
    },
    { field: 'Header label', behaviour: 'Single line, no clip.' },
    { field: 'Action column', behaviour: 'No clip — icon-only buttons.' },
  ];
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
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Dates' },
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

  protected readonly expandColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'date', label: 'Dates' },
    { key: 'venue', label: 'Venue' },
    { key: 'statusLabel', label: 'Status' },
  ];

  protected readonly expandRows: readonly EventRow[] = this.events.slice(0, 4);

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
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      error: true,
      disabled: (row) => row.status === 'completed',
    },
  ];

  protected readonly lastRowClick = signal<string | null>(null);
  protected readonly lastRowAction = signal<string | null>(null);

  protected onRowAction(event: TableRowActionEvent<EventRow>): void {
    this.lastRowAction.set(`${event.action.label} · ${event.row.project}`);
  }
}
