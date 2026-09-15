import { Component, ViewEncapsulation, signal } from '@angular/core';
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

@Component({
  selector: 'section-charts-line-chart',
  standalone: true,
  imports: [
    DocsReplayButtonComponent,
    DocsLineChartDataEditorComponent,
    DocsSectionComponent,
    LineChartComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
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
