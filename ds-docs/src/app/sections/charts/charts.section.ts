import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  signal,
} from '@angular/core';
import { BarChartComponent } from 'ds/bar-chart';
import type { BarChartRow } from 'ds/bar-chart';
import { RadioComponent, RadioGroupComponent } from 'ds/radio-group';
import { SliderComponent } from 'ds/slider';
import { DocsChartDataEditorComponent } from '../../shared/docs-chart-data-editor.component';
import { DocsReplayButtonComponent } from '../../shared/docs-replay-button.component';
import { DocsSectionComponent } from '../../shared/docs-section.component';

// A floating bar: each row starts where its own period does, so the bars compare DURATION and
// PLACEMENT at once, which a bar from zero cannot do.
const RANGE_ROWS: readonly BarChartRow[] = [
  { id: 'discovery', label: 'Discovery', value: [0, 3] },
  { id: 'build', label: 'Build', value: [2, 9] },
  { id: 'pilot', label: 'Pilot', value: [8, 12] },
  { id: 'rollout', label: 'Rollout', value: [11, 16] },
];

// A bullet: the bar is the reading, the tick is the goal, and the bands say what the reading
// MEANS where the number alone does not.
const BULLET_ROWS: readonly BarChartRow[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: 268,
    target: 250,
    ranges: [150, 220, 300],
  },
  {
    id: 'margin',
    label: 'Margin',
    value: 172,
    target: 210,
    ranges: [150, 220, 300],
  },
  {
    id: 'orders',
    label: 'Orders',
    value: 224,
    target: 210,
    ranges: [150, 220, 300],
  },
];

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
      { id: 'salaries', label: 'Salaries', value: 291000 },
      { id: 'tooling', label: 'Tooling', value: 74000 },
      { id: 'travel', label: 'Travel', value: 47000 },
    ],
  },
  {
    label: 'Sales',
    value: 268000,
    segments: [
      { id: 'salaries', label: 'Salaries', value: 154000 },
      { id: 'tooling', label: 'Tooling', value: 38000 },
      { id: 'travel', label: 'Travel', value: 76000 },
    ],
  },
  {
    label: 'Support',
    value: 96000,
    segments: [
      { id: 'salaries', label: 'Salaries', value: 71000 },
      { id: 'tooling', label: 'Tooling', value: 19000 },
      { id: 'travel', label: 'Travel', value: 6000 },
    ],
  },
];

const DETAIL_ROWS: readonly BarChartRow[] = [
  { label: 'Organic', value: 12400, detail: '456 requests · 3.7%' },
  { label: 'Paid', value: 8130, detail: '402 requests · 4.9%' },
  { label: 'Referral', value: 2740, detail: '198 requests · 7.2%' },
];

// A journey funnel: every row a share of the first, a group of content blocks under the microsite
// row, and a closing total that is not a step of the funnel.
const JOURNEY_ROWS: readonly BarChartRow[] = [
  {
    id: 'policyholders',
    label: 'Policyholders',
    value: 51402,
    emphasis: true,
    hint: 'Active policyholders in the segment. Every other row is a share of this one.',
  },
  {
    id: 'scheduled',
    label: 'Scheduled for communication',
    value: 48110,
    hint: 'Queued for at least one message in the period.',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    value: 44210,
    hint: 'Messages the provider confirmed as delivered.',
  },
  { id: 'opened', label: 'Opened', value: 18730 },
  {
    id: 'microsite',
    label: 'Microsite accessed',
    value: 6420,
    percent: 100,
    showPercent: true,
    children: [
      { id: 'how', label: 'How conversions work', value: 2210 },
      { id: 'compare', label: 'Compare plans', value: 1630 },
      { id: 'faq', label: 'FAQ', value: 940 },
    ],
  },
  { id: 'agent', label: 'Agent requested', value: 1180 },
  { id: 'form', label: 'Form submitted', value: 640 },
  { id: 'conversion', label: 'Conversion or new policy', value: Number.NaN },
  {
    id: 'finished',
    label: 'Completed or exited',
    value: 9870,
    emphasis: true,
    detached: true,
    color: 'var(--ds-chart-series-2-color)',
  },
];

const EXIT_ROWS: readonly BarChartRow[] = [
  {
    label: 'Completed the journey',
    value: 6120,
    color: 'var(--ds-chart-series-2-color)',
  },
  {
    label: 'Program ended',
    value: 1830,
    color: 'var(--ds-chart-series-3-color)',
  },
  { label: 'Unsubscribed', value: 1240, color: 'var(--warning)' },
  { label: 'Suppressed', value: 1340 },
  { label: 'Converted existing coverage', value: Number.NaN },
];

const MAX_BELOW_DATA_ROWS: readonly BarChartRow[] = [
  { label: 'This quarter', value: 350 },
  { label: 'Last quarter', value: 150 },
];

@Component({
  selector: 'section-charts-bar-chart',
  standalone: true,
  imports: [
    RouterLink,
    BarChartComponent,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
    DocsReplayButtonComponent,
    RadioComponent,
    RadioGroupComponent,
    SliderComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './charts.section.html',
  styleUrls: ['../../shared/section-demo.scss', './charts.section.scss'],
})
export class BarChartSection {
  protected readonly rangeRows = signal<readonly BarChartRow[]>(RANGE_ROWS);
  protected readonly bulletRows = signal<readonly BarChartRow[]>(BULLET_ROWS);

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
    {
      id: 'salaries',
      label: 'Salaries',
      color: 'var(--ds-chart-series-1-color)',
    },
    {
      id: 'tooling',
      label: 'Tooling',
      color: 'var(--ds-chart-series-2-color)',
    },
    { id: 'travel', label: 'Travel', color: 'var(--ds-chart-series-3-color)' },
  ];

  /** `'all'` rather than `null`, because a radio group always has one answer selected. */
  protected readonly segmentChoice = signal<unknown>('all');
  protected readonly singledOutSegment = computed(() => {
    const choice = this.segmentChoice();

    return typeof choice === 'string' && choice !== 'all' ? choice : null;
  });
  protected readonly journeyRows = signal<readonly BarChartRow[]>(JOURNEY_ROWS);
  protected readonly startRows = signal<readonly BarChartRow[]>(
    JOURNEY_ROWS.slice(0, 4).map(({ id, label, value }) => ({
      id,
      label,
      value,
    })),
  );
  protected readonly groupRows = signal<readonly BarChartRow[]>(
    JOURNEY_ROWS.slice(3, 6),
  );
  protected readonly termRows = signal<readonly BarChartRow[]>(
    JOURNEY_ROWS.slice(0, 3),
  );
  protected readonly emphasisRows = signal<readonly BarChartRow[]>(
    [JOURNEY_ROWS[0], JOURNEY_ROWS[2], JOURNEY_ROWS[6], JOURNEY_ROWS[8]].map(
      ({ id, label, value, emphasis }) => ({ id, label, value, emphasis }),
    ),
  );
  protected readonly detachedRows = signal<readonly BarChartRow[]>(
    JOURNEY_ROWS.slice(6),
  );
  protected readonly exitRows = signal<readonly BarChartRow[]>(EXIT_ROWS);
  protected readonly loadingCompareRows = signal<readonly BarChartRow[]>(
    JOURNEY_ROWS.slice(1, 4).map(({ id, label, value }) => ({
      id,
      label,
      value,
    })),
  );
  protected readonly trackHeight = signal(6);
  protected readonly maxBelowDataRows =
    signal<readonly BarChartRow[]>(MAX_BELOW_DATA_ROWS);
}
