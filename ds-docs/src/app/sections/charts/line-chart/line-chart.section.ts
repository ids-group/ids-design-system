import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  signal,
} from '@angular/core';
import { LineChartComponent } from 'ds/line-chart';
import type { LineChartAnnotation, LineChartSeries } from 'ds/line-chart';
import { DocsLineChartDataEditorComponent } from '../../../shared/docs-line-chart-data-editor.component';
import { DocsReplayButtonComponent } from '../../../shared/docs-replay-button.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const MANY_CATEGORY_COUNT = 36;

const SPECIMEN_CATEGORIES: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
];

const SPECIMEN_SERIES: readonly LineChartSeries[] = [
  {
    id: 'sessions',
    label: 'Sessions',
    data: [3200, 3850, 4400, 4120, 4760, 5000],
    area: true,
  },
  { id: 'signups', label: 'Signups', data: [820, 960, 1180, 1040, 1320, 1450] },
];

const ONE_SERIES: readonly LineChartSeries[] = [
  {
    id: 'sessions',
    label: 'Sessions',
    data: [3200, 3850, 4400, 4120, 4760, 5000],
  },
];

const AREA_SERIES: readonly LineChartSeries[] = [
  {
    id: 'balance',
    label: 'Balance',
    data: [3200, 3850, 4400, 4120, 4760, 5000],
    area: true,
  },
];

// 5,000 against 75 is not decoration: it gives the primary axis five intervals, which
// is what puts the secondary on 0·20·40·60·80·100 under `rounded` and 0·15·30·45·60·75
// under `exact` — the labels the states below claim. Change either peak and both break.
const DUAL_AXIS_SERIES: readonly LineChartSeries[] = [
  {
    id: 'sessions',
    label: 'Sessions',
    data: [3200, 3850, 4400, 4120, 4760, 5000],
  },
  {
    id: 'conversion-rate',
    label: 'Conversion rate',
    data: [42, 51, 63, 58, 70, 75],
    axis: 'secondary',
  },
];

const GAP_CATEGORIES: readonly string[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

// A rate that holds between readings and a peak with a plateau either side: the first is what
// `step` is for, the second is where a Catmull-Rom would invent a dip and a monotone cubic does not.
// Deck 10's composition-over-time case: three delivery tiers whose sum is the quantity that
// matters, which is what a stack says and a set of separate lines does not.
// Deck 8's own demonstration: the SAME six months, drawn twice, with only the right axis's ceiling
// moved. The crossing point walks from April to January - so it is a property of the scale that was
// chosen, not a fact in the data.
const ARTEFACT_CATEGORIES: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
];

const ARTEFACT_SERIES: readonly LineChartSeries[] = [
  {
    id: 'sessions',
    label: 'Sessions',
    data: [3200, 3850, 4400, 4120, 4760, 5000],
  },
  {
    id: 'rate',
    label: 'Conversion rate',
    data: [4.6, 4.1, 3.8, 3.3, 3.0, 2.6],
    axis: 'secondary',
  },
];

const STACK_CATEGORIES: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
];

const STACK_SERIES: readonly LineChartSeries[] = [
  {
    id: 'economy',
    label: 'Economy',
    data: [1200, 1320, 1280, 1450, 1520, 1480],
    area: true,
  },
  {
    id: 'standard',
    label: 'Standard',
    data: [860, 980, 1010, 1120, 1290, 1340],
    area: true,
  },
  {
    id: 'express',
    label: 'Express',
    data: [420, 510, 590, 640, 710, 820],
    area: true,
  },
];

const CURVE_CATEGORIES: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
];

const CURVE_SERIES: readonly LineChartSeries[] = [
  {
    id: 'rate',
    label: 'Base rate',
    data: [4.5, 4.5, 5.25, 5.25, 5.25, 4.75],
  },
];

const GAP_SERIES: readonly LineChartSeries[] = [
  {
    id: 'visits',
    label: 'Visits',
    data: [420, 510, null, 480, 530, 610, 590],
  },
];

const MANY_CATEGORIES: readonly string[] = Array.from(
  { length: MANY_CATEGORY_COUNT },
  (unusedEntry, index) => `Day ${index + 1}`,
);

const MANY_CATEGORY_SERIES: readonly LineChartSeries[] = [
  {
    id: 'active-users',
    label: 'Active users',
    data: Array.from(
      { length: MANY_CATEGORY_COUNT },
      (unusedEntry, index) =>
        600 + index * 12 + Math.round(220 * Math.sin(index / 4)),
    ),
  },
];

// A series that never leaves the low hundreds: on a derived axis it fills the plot and reads as a
// dramatic climb, which is exactly the misreading a pinned maximum removes.
const PINNED_AXIS_LOW_SERIES: readonly LineChartSeries[] = [
  {
    id: 'requests',
    label: 'Requests',
    data: [180, 210, 195, 240, 225, 260],
  },
];

@Component({
  selector: 'section-charts-line-chart',
  standalone: true,
  imports: [
    RouterLink,
    DocsReplayButtonComponent,
    DocsLineChartDataEditorComponent,
    DocsSectionComponent,
    LineChartComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line-chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './line-chart.section.scss'],
})
export class LineChartSection {
  protected readonly specimenCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly tickCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly tickSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);
  protected readonly pinnedAxisCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly pinnedAxisLowSeries = signal<readonly LineChartSeries[]>(
    PINNED_AXIS_LOW_SERIES,
  );
  protected readonly staggerCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly staggerSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);
  protected readonly noVisibleCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly noVisibleSeriesData =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);
  protected readonly allHidden = signal<readonly string[]>(
    SPECIMEN_SERIES.map((series) => series.id),
  );
  protected readonly specimenSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);

  protected readonly specimenAnnotations: readonly LineChartAnnotation[] = [
    { categoryIndex: 5, label: 'Peak' },
  ];

  protected readonly gapBreakCategories =
    signal<readonly string[]>(GAP_CATEGORIES);
  protected readonly gapBreakSeries =
    signal<readonly LineChartSeries[]>(GAP_SERIES);

  protected readonly artefactCategories = ARTEFACT_CATEGORIES;
  protected readonly artefactSeries = ARTEFACT_SERIES;

  protected readonly stackedCategoriesDemo =
    signal<readonly string[]>(STACK_CATEGORIES);
  protected readonly stackedSeriesDemo =
    signal<readonly LineChartSeries[]>(STACK_SERIES);

  protected readonly normalizedCategories =
    signal<readonly string[]>(STACK_CATEGORIES);
  protected readonly normalizedSeries =
    signal<readonly LineChartSeries[]>(STACK_SERIES);

  protected readonly curveLinearCategories =
    signal<readonly string[]>(CURVE_CATEGORIES);
  protected readonly curveLinearSeries =
    signal<readonly LineChartSeries[]>(CURVE_SERIES);

  protected readonly curveStepCategories =
    signal<readonly string[]>(CURVE_CATEGORIES);
  protected readonly curveStepSeries =
    signal<readonly LineChartSeries[]>(CURVE_SERIES);

  protected readonly curveSmoothCategories =
    signal<readonly string[]>(CURVE_CATEGORIES);
  protected readonly curveSmoothSeries =
    signal<readonly LineChartSeries[]>(CURVE_SERIES);

  protected readonly gapZeroCategories =
    signal<readonly string[]>(GAP_CATEGORIES);
  protected readonly gapZeroSeries =
    signal<readonly LineChartSeries[]>(GAP_SERIES);

  protected readonly roundedCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly roundedSeries =
    signal<readonly LineChartSeries[]>(DUAL_AXIS_SERIES);

  protected readonly exactCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly exactSeries =
    signal<readonly LineChartSeries[]>(DUAL_AXIS_SERIES);

  protected readonly independentCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly independentSeries =
    signal<readonly LineChartSeries[]>(DUAL_AXIS_SERIES);

  protected readonly stackedCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly stackedSeries =
    signal<readonly LineChartSeries[]>(DUAL_AXIS_SERIES);

  protected readonly markersCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly markersSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);

  protected readonly areaFillCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly areaFillSeries =
    signal<readonly LineChartSeries[]>(AREA_SERIES);

  protected readonly areaFadeSeries = computed(() =>
    this.areaFillSeries().map((series) =>
      series.area ? { ...series, area: 'fade' as const } : series,
    ),
  );

  protected readonly manyCategories =
    signal<readonly string[]>(MANY_CATEGORIES);
  protected readonly manyCategorySeries =
    signal<readonly LineChartSeries[]>(MANY_CATEGORY_SERIES);

  protected readonly dataTableCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly dataTableSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);

  protected readonly emptyCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly emptySeries = signal<readonly LineChartSeries[]>([]);

  protected readonly loadingCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly loadingSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);

  protected readonly oneSeriesCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly oneSeries = signal<readonly LineChartSeries[]>(ONE_SERIES);

  protected readonly legendCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly legendSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);
  protected readonly hiddenSeries = signal<readonly string[]>([]);
  protected readonly isolateHidden = signal<readonly string[]>([]);
  protected readonly toggleHidden = signal<readonly string[]>([]);
  protected readonly interactiveCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly interactiveSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);
  protected readonly lastPoint = signal('');
  protected readonly patternCategories =
    signal<readonly string[]>(SPECIMEN_CATEGORIES);
  protected readonly patternSeries =
    signal<readonly LineChartSeries[]>(SPECIMEN_SERIES);
  protected readonly rescaledHiddenSeries = signal<readonly string[]>([]);
}
