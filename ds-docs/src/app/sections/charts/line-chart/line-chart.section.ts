import { Component, ViewEncapsulation } from '@angular/core';
import { LineChartComponent } from 'ds/line-chart';
import type { LineChartSeries } from 'ds/line-chart';
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
  imports: [LineChartComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './line-chart.section.html',
  styleUrl: './line-chart.section.scss',
})
export class LineChartSection {
  protected readonly specimenCategories = SPECIMEN_CATEGORIES;
  protected readonly specimenSeries = SPECIMEN_SERIES;
  protected readonly emptySeries: readonly LineChartSeries[] = [];
  protected readonly oneSeries = ONE_SERIES;
  protected readonly areaSeries = AREA_SERIES;
  protected readonly dualAxisSeries = DUAL_AXIS_SERIES;
  protected readonly gapCategories = GAP_CATEGORIES;
  protected readonly gapSeries = GAP_SERIES;
  protected readonly manyCategories = MANY_CATEGORIES;
  protected readonly manyCategorySeries = MANY_CATEGORY_SERIES;
}
