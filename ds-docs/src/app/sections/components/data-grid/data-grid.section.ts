import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TableComponent, type TableColumn } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface ProjectRow {
  id: string;
  project: string;
  owner: string;
  status: string;
  budget: number;
}

@Component({
  selector: 'section-components-data-grid',
  standalone: true,
  imports: [DocsSectionComponent, TableComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './data-grid.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class DataGridSection {
  protected readonly columns: TableColumn<ProjectRow>[] = [
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

  protected readonly rows: ProjectRow[] = [
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

  protected readonly selected = signal(new Set<string>());
}
