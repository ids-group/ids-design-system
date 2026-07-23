import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import {
  SearchComponent,
  ButtonComponent,
  IconComponent,
  SelectComponent,
  TableComponent,
  TagComponent,
  type SelectOption,
  type TableColumn,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface RecordRow {
  readonly id: string;
  readonly project: string;
  readonly venue: string;
  readonly status: string;
  readonly statusLabel: string;
}

@Component({
  selector: 'pattern-filter-bar',
  standalone: true,
  imports: [
    DocsSectionComponent,
    SearchComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    TableComponent,
    TagComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './filter-bar.section.html',
  styleUrl: './filter-bar.section.scss',
})
export class FilterBarSection {
  protected readonly lede =
    'Search, dropdown facets, applied-filter tags and a clear-all escape hatch — composed above any list view. Reflows to a stacked variant on narrow viewports.';

  protected readonly statusOptions: SelectOption[] = [
    { label: 'All statuses', value: '' },
    { label: 'Planning', value: 'planning' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  protected readonly memberOptions: SelectOption[] = [
    { label: 'All members', value: '' },
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'North Site Co.', value: 'north' },
    { label: 'Delta Partners', value: 'delta' },
  ];

  protected readonly filterQuery = signal('');
  protected readonly filterStatus = signal('');

  protected readonly recordColumns: TableColumn<RecordRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'venue', label: 'Venue' },
    { key: 'statusLabel', label: 'Status' },
  ];

  protected readonly recordRows: readonly RecordRow[] = [
    {
      id: 'ORD-2026-0142',
      project: 'Project Alpha',
      venue: 'North Site',
      status: 'active',
      statusLabel: 'Active',
    },
    {
      id: 'ORD-2026-0156',
      project: 'Project Beta',
      venue: 'East Campus',
      status: 'confirmed',
      statusLabel: 'Confirmed',
    },
    {
      id: 'ORD-2026-0157',
      project: 'Q3 Initiative',
      venue: 'South Hub',
      status: 'confirmed',
      statusLabel: 'Confirmed',
    },
    {
      id: 'ORD-2026-0188',
      project: 'Annual Summit',
      venue: 'HQ Auditorium',
      status: 'planning',
      statusLabel: 'Planning',
    },
    {
      id: 'EVT-2026-0091',
      project: 'Download 2026',
      venue: 'Donington Park',
      status: 'completed',
      statusLabel: 'Completed',
    },
    {
      id: 'EVT-2026-0104',
      project: 'Field Day',
      venue: 'West Pavilion',
      status: 'active',
      statusLabel: 'Active',
    },
  ];

  /** Status facet only — free-text search rides the table's own [filterQuery]. */
  protected readonly statusFilteredRows = computed<readonly RecordRow[]>(() => {
    const status = this.filterStatus();

    return status
      ? this.recordRows.filter((row) => row.status === status)
      : this.recordRows;
  });

  protected statusLabel(value: string): string {
    return (
      this.statusOptions.find((option) => option.value === value)?.label ??
      value
    );
  }

  protected clearFilters(): void {
    this.filterQuery.set('');
    this.filterStatus.set('');
  }
}
