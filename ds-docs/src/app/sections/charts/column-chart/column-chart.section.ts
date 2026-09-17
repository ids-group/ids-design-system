import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ColumnChartComponent } from 'ds/column-chart';
import type { ColumnChartPoint } from 'ds/column-chart';
import type { ChartThreshold } from 'ds/core';
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
];

const UPTIME_BAND: readonly ChartThreshold[] = [
  { value: 78, to: 88, label: 'Agreed range' },
];

const CUSTOM_COLOR_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Organic', value: 620 },
  { label: 'Paid', value: 410 },
  { label: 'Referral', value: 275, color: 'var(--ds-chart-series-5-color)' },
];

@Component({
  selector: 'section-charts-column-chart',
  standalone: true,
  imports: [
    ColumnChartComponent,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
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

  protected readonly uptimePoints =
    signal<readonly ColumnChartPoint[]>(UPTIME_POINTS);
  protected readonly uptimeThresholds = UPTIME_THRESHOLDS;
  protected readonly uptimeBand = UPTIME_BAND;

  protected readonly staggerOffPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly staggerOnPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
}
