import { Component } from '@angular/core';
import { TableComponent } from 'ds/table';
import type { TableColumn } from 'ds/table';

interface AgentRow {
  readonly id: string;
  readonly name: string;
  readonly office: string;
  readonly leads: number;
  readonly contacted: string;
}

const OFFICES = [
  'Boston General Office',
  'Atlanta General Office',
  'Houston General Office',
  'Nashville General Office',
];

@Component({
  selector: 'app-table-print-harness',
  imports: [TableComponent],
  template: `
    <h2>Paged, sortable</h2>
    <ds-table
      sortMode="client"
      caption="Agents"
      [data]="rows"
      [columns]="columns"
      [pageSize]="25">
      <span toolbar>Toolbar content</span>
    </ds-table>
    <h2>Unpaged, sortable</h2>
    <ds-table
      sortMode="client"
      caption="Agents, unpaged"
      [data]="rows"
      [columns]="columns" />
  `,
})
export class TablePrintHarnessPage {
  protected readonly columns: readonly TableColumn<AgentRow>[] = [
    { key: 'name', label: 'Agent', sortable: true },
    { key: 'office', label: 'Office', sortable: true },
    {
      key: 'leads',
      label: 'Leads',
      sortable: true,
      align: 'right',
      hint: 'Policyholders assigned to the agent',
    },
    { key: 'contacted', label: 'Contacted' },
  ];

  protected readonly rows: readonly AgentRow[] = Array.from(
    { length: 60 },
    (_, index) => ({
      id: `agent-${index + 1}`,
      name: `Agent ${String(index + 1).padStart(2, '0')}`,
      office: OFFICES[index % OFFICES.length],
      leads: (index * 7) % 13,
      contacted: index % 3 === 0 ? 'Yes' : 'No',
    }),
  );
}
