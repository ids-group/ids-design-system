import { Component, ViewEncapsulation } from '@angular/core';
import {
  ChartComponent,
  ColumnSeriesComponent,
  LineSeriesComponent,
  ReferenceLabelComponent,
  ReferenceLineComponent,
} from 'ds/chart';
import type { ColumnSeriesPoint, LineSeriesData } from 'ds/chart';
import { ChartTooltipDirective } from 'ds/chart-tooltip';
import type { ChartThreshold } from 'ds/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const LATENCY_WEEKS: readonly string[] = [
  'Wk 1',
  'Wk 2',
  'Wk 3',
  'Wk 4',
  'Wk 5',
  'Wk 6',
];

const LATENCY_COLUMNS: readonly ColumnSeriesPoint[] = [
  { id: 'wk1', label: 'Wk 1', value: 210 },
  { id: 'wk2', label: 'Wk 2', value: 260 },
  { id: 'wk3', label: 'Wk 3', value: 240 },
  { id: 'wk4', label: 'Wk 4', value: 330 },
  { id: 'wk5', label: 'Wk 5', value: 480 },
  { id: 'wk6', label: 'Wk 6', value: 290 },
];

const LATENCY_THRESHOLDS: readonly ChartThreshold[] = [
  { value: 0, to: 300, label: 'Within target' },
  { value: 500, label: 'Breach', dash: 'dotted' },
];

const ORDER_MONTHS: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
];

const ORDER_COLUMNS: readonly ColumnSeriesPoint[] = [
  { id: 'jan', label: 'Jan', value: 620 },
  { id: 'feb', label: 'Feb', value: 710 },
  { id: 'mar', label: 'Mar', value: 680 },
  { id: 'apr', label: 'Apr', value: 840 },
  { id: 'may', label: 'May', value: 790 },
  { id: 'jun', label: 'Jun', value: 960 },
];

const BASKET_SERIES: readonly LineSeriesData[] = [
  {
    id: 'basket',
    label: 'Average order value',
    data: [82, 88, 91, 86, 104, 118],
    axis: 'secondary',
    color: 'var(--ds-chart-series-4-color)',
  },
];

@Component({
  selector: 'section-charts-chart',
  standalone: true,
  imports: [
    ChartComponent,
    ChartTooltipDirective,
    ColumnSeriesComponent,
    DocsSectionComponent,
    LineSeriesComponent,
    ReferenceLabelComponent,
    ReferenceLineComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './chart.section.scss'],
})
export class ChartSection {
  protected readonly latencyWeeks = LATENCY_WEEKS;
  protected readonly latencyColumns = LATENCY_COLUMNS;
  protected readonly latencyThresholds = LATENCY_THRESHOLDS;
  protected readonly latencySummary =
    'p95 response time over six weeks, against a target band of 0 to 300 milliseconds and a breach line at 500. Readings: 210, 260, 240, 330, 480, 290 milliseconds.';

  protected readonly orderMonths = ORDER_MONTHS;
  protected readonly orderColumns = ORDER_COLUMNS;
  protected readonly basketSeries = BASKET_SERIES;
  protected readonly columnAxisColor = 'var(--ds-chart-series-1-color)';
  protected readonly lineAxisColor = 'var(--ds-chart-series-4-color)';
  protected readonly ordersSummary =
    'Orders a month on the left axis - 620, 710, 680, 840, 790, 960 - against average order value on the right axis - 82, 88, 91, 86, 104, 118 pounds.';
}
