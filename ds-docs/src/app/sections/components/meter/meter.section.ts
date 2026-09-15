import { Component, ViewEncapsulation } from '@angular/core';
import { MeterComponent } from 'ds/meter';
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
  selector: 'section-components-meter',
  standalone: true,
  imports: [
    MeterComponent,
    TableComponent,
    CellTemplateDirective,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './meter.section.html',
  styleUrl: './meter.section.scss',
})
export class MeterSection {
  protected readonly rows = ROWS;
  protected readonly rateCeiling = Math.max(...ROWS.map((row) => row.rate));
  protected readonly columns: TableColumn<MicrositeRow>[] = [
    { key: 'name', label: 'Microsite' },
    { key: 'requests', label: 'Requests', align: 'right', width: 'content' },
    { key: 'rate', label: 'Request rate' },
  ];

  protected asRow(row: unknown): MicrositeRow {
    return row as MicrositeRow;
  }
}
