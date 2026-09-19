import { Component, ViewEncapsulation, signal } from '@angular/core';
import { HeatmapChartComponent } from 'ds/heatmap-chart';
import type { HeatmapChartRow } from 'ds/heatmap-chart';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const WEEKDAYS: readonly string[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

const DEPOT_ROWS: readonly HeatmapChartRow[] = [
  { id: 'a', label: 'Depot A', data: [180, 240, 275, 310, 420, 480, 250] },
  { id: 'b', label: 'Depot B', data: [160, 195, 240, 275, 310, 360, 200] },
  { id: 'c', label: 'Depot C', data: [210, 290, 320, 370, 470, 470, 280] },
  { id: 'd', label: 'Depot D', data: [150, 190, 235, 235, 300, 350, 185] },
  { id: 'e', label: 'Depot E', data: [195, 250, 290, 355, 430, 490, 265] },
];

// A depot that opened mid-week and one that reports nothing on Sundays: both are holes, and the
// point of the specimen is that neither reads as a quiet day.
const PARTIAL_ROWS: readonly HeatmapChartRow[] = [
  { id: 'a', label: 'Depot A', data: [180, 240, 275, 310, 420, 480, null] },
  { id: 'f', label: 'Depot F', data: [null, null, null, 290, 380, 410, null] },
  { id: 'c', label: 'Depot C', data: [210, 290, 320, 370, 470, 470, null] },
];

const SMALL_ROWS: readonly HeatmapChartRow[] = [
  { id: 'q1', label: 'Q1', data: [12, 18, 9] },
  { id: 'q2', label: 'Q2', data: [22, 7, 15] },
];

@Component({
  selector: 'section-charts-heatmap-chart',
  standalone: true,
  imports: [DocsSectionComponent, HeatmapChartComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './heatmap-chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss'],
})
export class HeatmapChartSection {
  protected readonly weekdays = WEEKDAYS;
  protected readonly depotRows = DEPOT_ROWS;
  protected readonly partialRows = PARTIAL_ROWS;
  protected readonly smallColumns = ['North', 'Central', 'South'];
  protected readonly smallRows = SMALL_ROWS;

  protected readonly lastClicked = signal<string>('nothing yet');

  protected onCellClicked(cell: {
    row: HeatmapChartRow;
    column: string;
    value: number;
  }): void {
    this.lastClicked.set(`${cell.row.label}, ${cell.column}: ${cell.value}`);
  }
}
