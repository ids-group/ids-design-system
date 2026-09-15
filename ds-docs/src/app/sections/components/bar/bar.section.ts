import { Component, ViewEncapsulation } from '@angular/core';
import { BarComponent } from 'ds/bar';
import { CellTemplateDirective, TableComponent } from 'ds/table';
import type { TableColumn } from 'ds/table';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface MicrositeRow {
  readonly name: string;
  readonly requests: number;
  readonly rate: number;
}

const ROWS: readonly MicrositeRow[] = [
  { name: 'Northgate refresh', requests: 1240, rate: 7.2 },
  { name: 'Harbour Point', requests: 864, rate: 5.1 },
  { name: 'Claremont Row', requests: 512, rate: 3.4 },
  { name: 'Eastfield Gardens', requests: 188, rate: 1.2 },
];

@Component({
  selector: 'section-components-bar',
  standalone: true,
  imports: [
    BarComponent,
    TableComponent,
    CellTemplateDirective,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './bar.section.html',
  styleUrl: './bar.section.scss',
})
export class BarSection {
  protected readonly rows = ROWS;
  protected readonly rateCeiling = Math.max(...ROWS.map((row) => row.rate));
  protected readonly columns: TableColumn<MicrositeRow>[] = [
    { key: 'name', label: 'Microsite' },
    { key: 'requests', label: 'Requests', align: 'right', width: 'content' },
    { key: 'rate', label: 'Rate', width: 'content' },
  ];

  protected asRow(row: unknown): MicrositeRow {
    return row as MicrositeRow;
  }
}
