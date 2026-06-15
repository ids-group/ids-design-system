import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, ButtonComponent, CheckboxComponent, EmptyStateComponent, IconComponent, TableComponent, type TableColumn } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';

interface EventRow {
  readonly id: string;
  readonly project: string;
  readonly date: string;
  readonly venue: string;
  readonly status: 'active' | 'confirmed' | 'planning' | 'completed';
  readonly statusLabel: string;
  readonly capacity: string;
}

@Component({
  selector: 'section-components-table',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CheckboxComponent, DocsAwaitComponent, EmptyStateComponent, IconComponent, TableComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './table.section.html',
  styleUrl: './table.section.scss',
})
export class TableSection {
  protected readonly loadingColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'date',    label: 'Dates' },
    { key: 'venue',   label: 'Venue' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'capacity', label: 'Capacity', align: 'right' },
  ];

  protected readonly events: readonly EventRow[] = [
    { id: 'ORD-2026-0142', project: 'Project Alpha',  date: '30 Apr – 3 May 2026',  venue: 'North Site',     status: 'active',    statusLabel: 'Active',     capacity: '1,200' },
    { id: 'ORD-2026-0156', project: 'Project Beta',   date: '22 – 25 May 2026',     venue: 'East Campus',    status: 'confirmed', statusLabel: 'Confirmed',  capacity: '680'   },
    { id: 'ORD-2026-0157', project: 'Q3 Initiative',  date: '22 – 25 Aug 2026',     venue: 'South Hub',      status: 'confirmed', statusLabel: 'Confirmed',  capacity: '420'   },
    { id: 'ORD-2026-0188', project: 'Annual Summit',  date: '5 – 9 Sep 2026',       venue: 'HQ Auditorium',  status: 'planning',  statusLabel: 'Planning',   capacity: '900'   },
    { id: 'EVT-2026-0091', project: 'Download 2026',  date: '13 – 16 Jun 2026',     venue: 'Donington Park', status: 'completed', statusLabel: 'Completed',  capacity: '4,500' },
    { id: 'EVT-2026-0104', project: 'Field Day',      date: '8 – 9 Jul 2026',       venue: 'West Pavilion',  status: 'active',    statusLabel: 'Active',     capacity: '320'   },
  ];

  protected readonly longList: readonly EventRow[] = [
    ...this.events,
    { id: 'EVT-2026-0119', project: 'Autumn Forum',   date: '14 – 16 Oct 2026',     venue: 'North Site',     status: 'planning',  statusLabel: 'Planning',   capacity: '540'   },
    { id: 'EVT-2026-0126', project: 'Year-End Gala',  date: '12 Dec 2026',          venue: 'HQ Auditorium',  status: 'planning',  statusLabel: 'Planning',   capacity: '1,800' },
    { id: 'EVT-2025-0220', project: 'Winter Retreat', date: '18 – 21 Dec 2025',     venue: 'Lakeside Lodge', status: 'completed', statusLabel: 'Completed',  capacity: '180'   },
    { id: 'EVT-2025-0204', project: 'Q4 Review',      date: '5 Nov 2025',           venue: 'HQ Auditorium',  status: 'completed', statusLabel: 'Completed',  capacity: '260'   },
  ];
}
