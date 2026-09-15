import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BarChartComponent } from 'ds/bar-chart';
import type { BarChartRow } from 'ds/bar-chart';
import { DocsChartDataEditorComponent } from '../../shared/docs-chart-data-editor.component';
import { DocsReplayButtonComponent } from '../../shared/docs-replay-button.component';
import { DocsSectionComponent } from '../../shared/docs-section.component';

const SPECIMEN_ROWS: readonly BarChartRow[] = [
  { label: 'Unique visitors', value: 3204 },
  { label: 'Scrolled ≥ 50% of the page', value: 1961 },
  { label: 'Read ≥ 1 content section', value: 1543 },
  { label: 'Expanded a product option', value: 1008 },
  {
    label: 'Requested an agent',
    value: 702,
    color: 'var(--ds-chart-series-accent-color)',
  },
];

// Departments of one budget: the categories genuinely divide a total, which is what makes a share
// of it a real quantity rather than arithmetic on an imaginary sum.
const SHARE_ROWS: readonly BarChartRow[] = [
  { label: 'Engineering', value: 412000 },
  { label: 'Sales', value: 268000 },
  { label: 'Marketing', value: 154000 },
  { label: 'Support', value: 96000 },
  { label: 'Operations', value: 70000 },
];

const ONE_ROW: readonly BarChartRow[] = [
  { label: 'Total sessions', value: 4820 },
];

const ALL_ZEROS_ROWS: readonly BarChartRow[] = [
  { label: 'Step one', value: 0 },
  { label: 'Step two', value: 0 },
  { label: 'Step three', value: 0 },
];

const NEGATIVE_ROWS: readonly BarChartRow[] = [
  { label: 'New signups', value: 340 },
  { label: 'Churned accounts', value: -50 },
  { label: 'Net change', value: 290 },
];

const HUGE_OUTLIER_ROWS: readonly BarChartRow[] = [
  { label: 'Team A', value: 40 },
  { label: 'Team B', value: 45 },
  { label: 'Team C', value: 50 },
  { label: 'Team D', value: 50000 },
];

const LONG_LABEL_ROWS: readonly BarChartRow[] = [
  { label: 'Requested a callback from a senior agent', value: 214 },
];

const NINE_DIGIT_VALUE_ROWS: readonly BarChartRow[] = [
  { label: 'Total page views (12 months)', value: 987654321 },
];

const CUSTOM_COLOR_ROWS: readonly BarChartRow[] = [
  { label: 'Organic', value: 620 },
  { label: 'Paid', value: 410 },
  { label: 'Referral', value: 275, color: 'var(--ds-chart-series-5-color)' },
];

const DATA_TABLE_ROWS: readonly BarChartRow[] = [
  ...LONG_LABEL_ROWS,
  ...NINE_DIGIT_VALUE_ROWS,
];

const SEGMENT_ROWS: readonly BarChartRow[] = [
  {
    label: 'Engineering',
    value: 412000,
    segments: [
      { label: 'Salaries', value: 291000 },
      { label: 'Tooling', value: 74000 },
      { label: 'Travel', value: 47000 },
    ],
  },
  {
    label: 'Sales',
    value: 268000,
    segments: [
      { label: 'Salaries', value: 154000 },
      { label: 'Tooling', value: 38000 },
      { label: 'Travel', value: 76000 },
    ],
  },
  {
    label: 'Support',
    value: 96000,
    segments: [
      { label: 'Salaries', value: 71000 },
      { label: 'Tooling', value: 19000 },
      { label: 'Travel', value: 6000 },
    ],
  },
];

const DETAIL_ROWS: readonly BarChartRow[] = [
  { label: 'Organic', value: 12400, detail: '456 requests · 3.7%' },
  { label: 'Paid', value: 8130, detail: '402 requests · 4.9%' },
  { label: 'Referral', value: 2740, detail: '198 requests · 7.2%' },
];

const MAX_BELOW_DATA_ROWS: readonly BarChartRow[] = [
  { label: 'This quarter', value: 350 },
  { label: 'Last quarter', value: 150 },
];

@Component({
  selector: 'section-charts-bar-chart',
  standalone: true,
  imports: [
    BarChartComponent,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
    DocsReplayButtonComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './charts.section.html',
  styleUrls: ['../../shared/section-demo.scss', './charts.section.scss'],
})
export class BarChartSection {
  protected readonly specimenRows =
    signal<readonly BarChartRow[]>(SPECIMEN_ROWS);
  protected readonly customColorRows =
    signal<readonly BarChartRow[]>(CUSTOM_COLOR_ROWS);
  protected readonly shareRows = signal<readonly BarChartRow[]>(SHARE_ROWS);
  protected readonly pinRows = signal<readonly BarChartRow[]>(SPECIMEN_ROWS);
  protected readonly percentRows =
    signal<readonly BarChartRow[]>(SPECIMEN_ROWS);
  protected readonly interactionRows =
    signal<readonly BarChartRow[]>(SPECIMEN_ROWS);
  protected readonly staggerRows =
    signal<readonly BarChartRow[]>(SPECIMEN_ROWS);
  protected readonly lastRow = signal('');
  protected readonly dataTableRows =
    signal<readonly BarChartRow[]>(DATA_TABLE_ROWS);
  protected readonly emptyRows = signal<readonly BarChartRow[]>([]);
  protected readonly loadingRows =
    signal<readonly BarChartRow[]>(SPECIMEN_ROWS);
  protected readonly oneRow = signal<readonly BarChartRow[]>(ONE_ROW);
  protected readonly allZerosRows =
    signal<readonly BarChartRow[]>(ALL_ZEROS_ROWS);
  protected readonly negativeRows =
    signal<readonly BarChartRow[]>(NEGATIVE_ROWS);
  protected readonly hugeOutlierRows =
    signal<readonly BarChartRow[]>(HUGE_OUTLIER_ROWS);
  protected readonly longLabelRows =
    signal<readonly BarChartRow[]>(LONG_LABEL_ROWS);
  protected readonly nineDigitValueRows = signal<readonly BarChartRow[]>(
    NINE_DIGIT_VALUE_ROWS,
  );
  protected readonly segmentRows = signal<readonly BarChartRow[]>(SEGMENT_ROWS);
  protected readonly detailRows = signal<readonly BarChartRow[]>(DETAIL_ROWS);
  protected readonly segmentKey = [
    { label: 'Salaries', color: 'var(--ds-chart-series-1-color)' },
    { label: 'Tooling', color: 'var(--ds-chart-series-2-color)' },
    { label: 'Travel', color: 'var(--ds-chart-series-3-color)' },
  ];
  protected readonly maxBelowDataRows =
    signal<readonly BarChartRow[]>(MAX_BELOW_DATA_ROWS);
}
