import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ColumnChartComponent } from 'ds/column-chart';
import type { ColumnChartPoint } from 'ds/column-chart';
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
  protected readonly emptyPoints = signal<readonly ColumnChartPoint[]>([]);
  protected readonly loadingPoints =
    signal<readonly ColumnChartPoint[]>(SPECIMEN_POINTS);
  protected readonly onePoint = signal<readonly ColumnChartPoint[]>(ONE_POINT);
  protected readonly allZerosPoints =
    signal<readonly ColumnChartPoint[]>(ALL_ZEROS_POINTS);
  protected readonly negativePoints =
    signal<readonly ColumnChartPoint[]>(NEGATIVE_POINTS);
  protected readonly hugeOutlierPoints =
    signal<readonly ColumnChartPoint[]>(HUGE_OUTLIER_POINTS);
  protected readonly longLabelPoints =
    signal<readonly ColumnChartPoint[]>(LONG_LABEL_POINTS);
  protected readonly nineDigitValuePoints = signal<readonly ColumnChartPoint[]>(
    NINE_DIGIT_VALUE_POINTS,
  );
}
