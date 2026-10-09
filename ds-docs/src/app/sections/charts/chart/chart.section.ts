import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  signal,
} from '@angular/core';
import {
  ChartComponent,
  ColumnSeriesComponent,
  LineSeriesComponent,
  ReferenceLabelComponent,
  ReferenceLineComponent,
  SeriesAnnotationComponent,
} from 'ds/chart';
import type {
  ChartAnnotation,
  ColumnSeriesPoint,
  LineSeriesData,
} from 'ds/chart';
import { ChartDataTableComponent } from 'ds/chart-data-table';
import type { ChartDataRow } from 'ds/chart-data-table';
import type { ChartThreshold } from 'ds/core';
import { RadioComponent, RadioGroupComponent } from 'ds/radio-group';
import { SwitchComponent } from 'ds/switch';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const LATENCY_NOTES: readonly ChartAnnotation[] = [
  { categoryIndex: 4, value: 480, label: 'Cache eviction' },
];

const LATENCY_TABLE_ROWS: readonly ChartDataRow[] = [
  { key: 'wk1', cells: ['Wk 1', '210 ms'] },
  { key: 'wk2', cells: ['Wk 2', '260 ms'] },
  { key: 'wk3', cells: ['Wk 3', '240 ms'] },
  { key: 'wk4', cells: ['Wk 4', '330 ms'] },
  { key: 'wk5', cells: ['Wk 5', '480 ms'] },
  { key: 'wk6', cells: ['Wk 6', '290 ms'] },
];

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

const LATENCY_SERIES: readonly LineSeriesData[] = [
  { id: 'p95', label: 'p95', data: [210, 260, 240, 330, 480, 290] },
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

const VISIT_SERIES: readonly LineSeriesData[] = [
  {
    id: 'visits',
    label: 'Visits',
    data: [12400, 13100, 12800, 14900, 14200, 16100],
    color: 'var(--ds-chart-series-4-color)',
  },
];

const TRAFFIC_SERIES: readonly LineSeriesData[] = [
  {
    id: 'organic',
    label: 'Organic',
    data: [4400, 4610, 4380, 5120, 5460, 5980],
    color: 'var(--ds-chart-series-1-color)',
  },
  {
    id: 'paid',
    label: 'Paid',
    data: [1180, 1340, 1290, 1610, 1520, 1870],
    color: 'var(--ds-chart-series-3-color)',
  },
];

@Component({
  selector: 'section-charts-chart',
  standalone: true,
  imports: [
    RouterLink,
    RadioComponent,
    RadioGroupComponent,
    ChartComponent,
    ChartDataTableComponent,
    ColumnSeriesComponent,
    DocsSectionComponent,
    LineSeriesComponent,
    ReferenceLabelComponent,
    ReferenceLineComponent,
    SeriesAnnotationComponent,
    SwitchComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './chart.section.scss'],
})
export class ChartSection {
  protected readonly latencyWeeks = LATENCY_WEEKS;
  protected readonly latencyColumns = LATENCY_COLUMNS;
  protected readonly latencySeries = LATENCY_SERIES;
  protected readonly latencyLineSummary =
    'p95 response time over six weeks: 210, 260, 240, 330, 480, 290 milliseconds. Week 5 is labelled Cache eviction.';
  protected readonly latencyThresholds = LATENCY_THRESHOLDS;
  protected readonly latencyNotes = LATENCY_NOTES;
  protected readonly latencyTableRows = LATENCY_TABLE_ROWS;
  protected readonly latencyTableColumns = ['Week', 'p95'];
  protected readonly latencySummary =
    'p95 response time over six weeks, against a target band of 0 to 300 milliseconds and a breach line at 500. Readings: 210, 260, 240, 330, 480, 290 milliseconds.';

  protected readonly orderMonths = ORDER_MONTHS;
  protected readonly orderColumns = ORDER_COLUMNS;
  protected readonly basketSeries = BASKET_SERIES;
  protected readonly visitSeries = VISIT_SERIES;
  protected readonly columnAxisColor = 'var(--ds-chart-series-1-color)';
  protected readonly lineAxisColor = 'var(--ds-chart-series-4-color)';
  /** `'all'` rather than `null`, because a radio group always has one answer selected. */
  protected readonly singledOutChoice = signal<unknown>('all');
  protected readonly singledOut = computed(() => {
    const choice = this.singledOutChoice();

    return typeof choice === 'string' && choice !== 'all' ? choice : null;
  });

  protected readonly lineOutline = signal(true);

  protected readonly trafficSeries = TRAFFIC_SERIES;
  protected readonly seriesDashes = ['none', '7 4'];

  protected readonly ordersSummary =
    'Orders a month on the left axis - 620, 710, 680, 840, 790, 960 - against average order value on the right axis - 82, 88, 91, 86, 104, 118 pounds.';

  protected readonly visitsSummary =
    'Visits a month on the left axis - 12,400, 13,100, 12,800, 14,900, 14,200, 16,100 - against orders on the right axis - 620, 710, 680, 840, 790, 960.';
}
