import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {
  ChartComponent,
  ColumnSeriesComponent,
  LineSeriesComponent,
} from 'ds/chart';
import type { ColumnSeriesPoint, LineSeriesData } from 'ds/chart';
import { ColumnChartComponent } from 'ds/column-chart';
import type { ColumnChartPoint, ColumnChartSeries } from 'ds/column-chart';
import type { ChartThreshold, ChartValueFormat } from 'ds/core';
import { DocsChartDataEditorComponent } from '../../../shared/docs-chart-data-editor.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const SPECIMEN_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Jan', value: 1840 },
  { label: 'Feb', value: 2260 },
  { label: 'Mar', value: 2105 },
  { label: 'Apr', value: 2740 },
  { label: 'May', value: 3180, color: 'var(--ds-chart-series-accent-color)' },
];

const ONE_POINT: readonly ColumnChartPoint[] = [{ label: 'Jan', value: 1840 }];

const ALL_ZEROS_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Jan', value: 0 },
  { label: 'Feb', value: 0 },
  { label: 'Mar', value: 0 },
];

const NEGATIVE_POINTS: readonly ColumnChartPoint[] = [
  { label: 'New accounts', value: 640 },
  { label: 'Closed accounts', value: -180 },
  { label: 'Net change', value: 460 },
];

const PL_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Q1', value: -120 },
  { label: 'Q2', value: 40 },
  { label: 'Q3', value: -30 },
  { label: 'Q4', value: 80 },
];

const PROJECTED_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Jan', value: 1840 },
  { label: 'Feb', value: 2260 },
  { label: 'Mar', value: 2105 },
  { label: 'Apr', value: 2740 },
  { label: 'May', value: 3180 },
  { label: 'Jun', value: 3020 },
  { label: 'Jul', value: 3400, fill: 'hatched' },
  { label: 'Aug', value: 3610, fill: 'hatched' },
  { label: 'Sep', value: 3880, fill: 'hatched' },
];

const PAIRED_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
];

const PAIRED_SERIES: readonly ColumnChartSeries[] = [
  {
    id: 'billed',
    label: 'Billed',
    data: [2410, 2680, 2530, 2960, 3120, 3040, 2880, 3010, 3260].map(
      (value, index) => ({ label: PAIRED_MONTHS[index], value }),
    ),
  },
  {
    id: 'committed',
    label: 'Committed',
    fill: 'hatched',
    data: [0, 0, 0, 0, 0, 0, 3940, 4210, 4480].map((value, index) => ({
      label: PAIRED_MONTHS[index],
      value,
    })),
  },
];

const PAIRED_THRESHOLDS: readonly ChartThreshold[] = [
  { value: 3000, label: 'Run rate' },
  { value: 4200, label: 'Stretch', dash: 'dotted' },
];

const CHANNEL_MONTHS = ['Q1', 'Q2', 'Q3', 'Q4'];

const CHANNEL_SERIES: readonly ColumnChartSeries[] = [
  { id: 'direct', label: 'Direct', data: [820, 940, 1010, 1180] },
  { id: 'partner', label: 'Partner', data: [610, 580, 720, 690] },
  { id: 'online', label: 'Online', data: [340, 460, 520, 780] },
].map((series) => ({
  ...series,
  data: series.data.map((value, index) => ({
    label: CHANNEL_MONTHS[index],
    value,
  })),
}));

const HUGE_OUTLIER_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Direct', value: 62 },
  { label: 'Search', value: 58 },
  { label: 'Social', value: 71 },
  { label: 'Partner campaign', value: 71000 },
];

const LONG_LABEL_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Accounts that cleared the identity check', value: 1420 },
  { label: 'Pending', value: 610 },
  { label: 'Rejected', value: 180 },
];

const NINE_DIGIT_VALUE_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Page views', value: 987654321 },
  { label: 'Sessions', value: 412870655 },
];

const UPTIME_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Jan', value: 81 },
  { label: 'Feb', value: 88 },
  { label: 'Mar', value: 74 },
  { label: 'Apr', value: 91 },
  { label: 'May', value: 69 },
];

const UPTIME_THRESHOLDS: readonly ChartThreshold[] = [
  { value: 85, label: 'Target', color: 'var(--ds-chart-series-6-color)' },
  {
    value: 73,
    label: 'Escalation',
    color: 'var(--ds-chart-series-1-color)',
    dash: 'dotted',
  },
  {
    value: 95,
    label: 'Stretch',
    color: 'var(--ds-chart-series-3-color)',
    dash: 'solid',
  },
];

const UPTIME_BAND: readonly ChartThreshold[] = [
  { value: 78, to: 88, label: 'Agreed range' },
];

const COMBO_MONTHS: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
];

const COMBO_MONTHLY = [
  9200, 11800, 14500, 16200, 18900, 21400, 27500, 32600, 37800,
];

let runningTotal = 0;
const COMBO_RUNNING_TOTAL = COMBO_MONTHLY.map(
  (value) => (runningTotal += value),
);

const COMBO_COLUMNS: readonly ColumnSeriesPoint[] = COMBO_MONTHLY.map(
  (value, index) => ({
    id: COMBO_MONTHS[index],
    label: COMBO_MONTHS[index],
    value,
    color: 'var(--ds-chart-series-1-color)',
    fill: index >= 6 ? 'hatched' : 'solid',
  }),
);

const COMBO_CUMULATIVE: readonly LineSeriesData[] = [
  {
    id: 'cumulative',
    label: 'Running total',
    axis: 'secondary',
    color: 'var(--ds-chart-series-4-color)',
    data: COMBO_RUNNING_TOTAL,
  },
];

// Pinned to en-US because the `$` in front of it is: under a ru-RU browser the same call returns
// `40 тыс.`, and the axis then reads `$40 тыс.`.
const DOLLARS: ChartValueFormat = (value) =>
  `$${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`;

const CUSTOM_COLOR_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Organic', value: 620 },
  { label: 'Paid', value: 410 },
  { label: 'Referral', value: 275, color: 'var(--ds-chart-series-5-color)' },
];

@Component({
  selector: 'section-charts-column-chart',
  standalone: true,
  imports: [
    RouterLink,
    ChartComponent,
    ColumnChartComponent,
    ColumnSeriesComponent,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
    LineSeriesComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './column-chart.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './column-chart.section.scss',
  ],
})
export class ColumnChartSection {
  protected readonly specimenPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly tickCountPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly showValuesPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly customColorPoints =
    signal<readonly ColumnChartPoint[]>(CUSTOM_COLOR_POINTS);
  protected readonly dataTablePoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly pinPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly anchorPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly lastPoint = signal('');
  protected readonly emptyPoints = signal<readonly ColumnChartPoint[]>([]);
  protected readonly loadingPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly onePoint = signal<readonly ColumnChartPoint[]>(ONE_POINT);
  protected readonly allZerosPoints =
    signal<readonly ColumnChartPoint[]>(ALL_ZEROS_POINTS);
  protected readonly negativePoints =
    signal<readonly ColumnChartPoint[]>(NEGATIVE_POINTS);
  protected readonly plPoints = signal<readonly ColumnChartPoint[]>(PL_POINTS);
  protected readonly projectedPoints =
    signal<readonly ColumnChartPoint[]>(PROJECTED_POINTS);
  protected readonly hugeOutlierPoints =
    signal<readonly ColumnChartPoint[]>(HUGE_OUTLIER_POINTS);
  protected readonly longLabelPoints =
    signal<readonly ColumnChartPoint[]>(LONG_LABEL_POINTS);
  protected readonly nineDigitValuePoints = signal<readonly ColumnChartPoint[]>(
    NINE_DIGIT_VALUE_POINTS,
  );

  protected readonly pairedSeries = PAIRED_SERIES;
  protected readonly pairedThresholds = PAIRED_THRESHOLDS;
  protected readonly channelSeries = CHANNEL_SERIES;

  protected readonly uptimePoints =
    signal<readonly ColumnChartPoint[]>(UPTIME_POINTS);
  protected readonly uptimeThresholds = UPTIME_THRESHOLDS;
  protected readonly uptimeBand = UPTIME_BAND;

  protected readonly comboMonths = COMBO_MONTHS;
  protected readonly comboColumns = COMBO_COLUMNS;
  protected readonly comboCumulative = COMBO_CUMULATIVE;
  protected readonly dollars = DOLLARS;
  protected readonly columnColor = 'var(--ds-chart-series-1-color)';
  protected readonly lineColor = 'var(--ds-chart-series-4-color)';
  protected readonly comboSummary =
    'Revenue a month, January to September, against its running total. ' +
    'July to September are projections.';

  protected readonly staggerOffPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly staggerOnPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
}
