import { Component, ViewEncapsulation } from '@angular/core';
import { BarChartComponent } from 'ds/bar-chart';
import type { BarChartRow } from 'ds/bar-chart';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../shared/docs-section.component';

const SPECIMEN_ROWS: readonly BarChartRow[] = [
  { label: 'Unique visitors', value: 3204 },
  { label: 'Scrolled ≥ 50% of the page', value: 1961 },
  { label: 'Read ≥ 1 content section', value: 1543 },
  { label: 'Expanded a product option', value: 1008 },
  {
    label: 'Requested an agent',
    value: 702,
    color: 'var(--ds-chart-series-2-color)',
  },
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
  { label: 'Referral', value: 275, color: 'var(--chart-categorical-5)' },
];

const DATA_TABLE_ROWS: readonly BarChartRow[] = [
  ...LONG_LABEL_ROWS,
  ...NINE_DIGIT_VALUE_ROWS,
];

const MAX_BELOW_DATA_ROWS: readonly BarChartRow[] = [
  { label: 'This quarter', value: 350 },
  { label: 'Last quarter', value: 150 },
];

@Component({
  selector: 'section-charts-bar-chart',
  standalone: true,
  imports: [BarChartComponent, DocsTruncationComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './charts.section.html',
  styleUrl: './charts.section.scss',
})
export class BarChartSection {
  protected readonly specimenRows = SPECIMEN_ROWS;
  protected readonly emptyRows: readonly BarChartRow[] = [];
  protected readonly oneRow = ONE_ROW;
  protected readonly allZerosRows = ALL_ZEROS_ROWS;
  protected readonly negativeRows = NEGATIVE_ROWS;
  protected readonly hugeOutlierRows = HUGE_OUTLIER_ROWS;
  protected readonly longLabelRows = LONG_LABEL_ROWS;
  protected readonly nineDigitValueRows = NINE_DIGIT_VALUE_ROWS;
  protected readonly customColorRows = CUSTOM_COLOR_ROWS;
  protected readonly dataTableRows = DATA_TABLE_ROWS;
  protected readonly maxBelowDataRows = MAX_BELOW_DATA_ROWS;

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Value',
      behaviour:
        'A negative value draws no bar — the track clamps to zero width — but its printed percent is not clamped and can still read negative.',
    },
    {
      field: 'Max',
      behaviour:
        'Null uses the largest value in the data, so the longest row always fills the track.',
    },
  ];
}
