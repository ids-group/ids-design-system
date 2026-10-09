import { Component } from '@angular/core';
import {
  HeatmapChartComponent,
  LineChartComponent,
} from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-chart-range',
  imports: [HeatmapChartComponent, LineChartComponent],
  template: `
    <!-- expect: both TS2322 -->
    <ds-heatmap-chart [data]="[]" min="0" max="100" />
    <!-- expect: both TS2322 -->
    <ds-line-chart [categories]="[]" [series]="[]" max="100" maxSecondary="10" />
    <ds-heatmap-chart [data]="[]" [min]="0" [max]="100" />
  `,
})
export class AppChartRange {}
