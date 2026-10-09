import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
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
  { id: 'a', label: 'Depot A', data: [180, 460, 95, 310, 420, 140, 250] },
  { id: 'b', label: 'Depot B', data: [490, 120, 240, 75, 380, 205, 160] },
  { id: 'c', label: 'Depot C', data: [110, 290, 500, 195, 60, 470, 330] },
  { id: 'd', label: 'Depot D', data: [355, 85, 165, 440, 300, 50, 225] },
  { id: 'e', label: 'Depot E', data: [70, 400, 270, 130, 510, 345, 185] },
];

// A depot that opened mid-week and one that reports nothing on Sundays: both are holes, and the
// point of the specimen is that neither reads as a quiet day.
const PARTIAL_ROWS: readonly HeatmapChartRow[] = [
  { id: 'a', label: 'Depot A', data: [180, 460, 95, 310, 420, 140, null] },
  { id: 'f', label: 'Depot F', data: [null, null, null, 290, 60, 410, null] },
  { id: 'c', label: 'Depot C', data: [110, 290, 500, 195, 60, 470, null] },
];

const SMALL_ROWS: readonly HeatmapChartRow[] = [
  { id: 'q1', label: 'Q1', data: [12, 18, 9] },
  { id: 'q2', label: 'Q2', data: [22, 7, 15] },
];

const LATER_ROWS: readonly HeatmapChartRow[] = [
  { id: 'q3', label: 'Q3', data: [31, 24, 38] },
  { id: 'q4', label: 'Q4', data: [27, 35, 20] },
];

@Component({
  selector: 'section-charts-heatmap-chart',
  standalone: true,
  imports: [RouterLink, DocsSectionComponent, HeatmapChartComponent],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './heatmap-chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss'],
})
export class HeatmapChartSection {
  protected readonly weekdays = WEEKDAYS;
  protected readonly depotRows = DEPOT_ROWS;
  protected readonly partialRows = PARTIAL_ROWS;
  protected readonly smallColumns = ['North', 'Central', 'South'];
  protected readonly smallRows = SMALL_ROWS;
  protected readonly laterRows = LATER_ROWS;

  protected readonly lastClicked = signal<string>('nothing yet');

  protected onCellClicked(cell: {
    row: HeatmapChartRow;
    column: string;
    value: number;
  }): void {
    this.lastClicked.set(`${cell.row.label}, ${cell.column}: ${cell.value}`);
  }
}
