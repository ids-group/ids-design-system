import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import {
  CHART_DEFAULT_AXIS_GUTTER,
  CHART_DEFAULT_VALUE_SPACE,
  ChartComponent,
  ColumnSeriesComponent,
} from '@ids-group-ltd/ids-design-system/components/chart';
import type { ColumnSeriesPoint } from '@ids-group-ltd/ids-design-system/components/chart';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
import {
  ChartSkeletonComponent,
  ChartStatesComponent,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ChartItemTooltipTrigger } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { waterfallSteps } from './waterfall-chart.math';
import { WaterfallMarksComponent } from './waterfall-marks.component';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import {
  chartRenderGate,
  CHART_RENDER_GATE_PASSED,
  CHART_SKELETON_COUNT,
  DsChartBase,
  skeletonMarkCount,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  WaterfallChartBar,
  WaterfallChartStep,
} from './waterfall-chart.types';

/** A total is the neutral series colour because it is not a change. */
const DIRECTION_COLORS: Record<WaterfallChartStep['direction'], string> = {
  increase: 'var(--ds-chart-positive-color)',
  decrease: 'var(--ds-chart-negative-color)',
  total: 'var(--ds-chart-series-default-color)',
};

/** A running total, bar by bar: what a figure started at, what moved it, and what it ended at. */
@Component({
  selector: 'ds-waterfall-chart',
  standalone: true,
  exportAs: 'dsWaterfallChart',
  imports: [
    ChartComponent,
    ChartSkeletonComponent,
    ChartStatesComponent,
    ColumnSeriesComponent,
    WaterfallMarksComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './waterfall-chart.component.html',
  styleUrl: './waterfall-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: CHART_RENDER_GATE_PASSED, useValue: true }],
})
export class WaterfallChartComponent
  extends DsChartBase
  implements
    ChartDimmable,
    ChartStaggered,
    ChartWithDataTable,
    ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  /** The bars in reading order; never sorted. */
  readonly data = input<readonly WaterfallChartBar[]>([]);

  /** Prints each bar's own reading above it, with its sign. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** The dashed rule chaining one bar to the next. */
  readonly showConnectors = input(true, { transform: booleanAttribute });

  /** Dims every OTHER bar while one is hovered or focused. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Whether a hovered or focused bar opens a tooltip. `'axis'` is not offered: each bar is its
   *  own category. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** How many value-axis ticks to aim for; ticks snap to a round step. */
  readonly tickCount = input(5, { transform: numberAttribute });

  /** How many steps the loading skeleton draws before the data is known: a total, the deltas, a total. */
  readonly skeletonCount = input(CHART_SKELETON_COUNT, {
    transform: (raw: unknown) => numberAttribute(raw, CHART_SKELETON_COUNT),
  });

  /** The annex table under the plot: each step's direction, reading and running total. Unset falls back to `DS_CONFIG.chart.dataTable`. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** Milliseconds between one step's entrance and the next; the step narrows to finish within 260ms. `0` turns it off. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  protected readonly series = viewChild(ColumnSeriesComponent);

  protected readonly pinned = computed(
    () => this.series()?.activeMark.pinned() ?? false,
  );

  /** The clicked datum, as it was given. Fires on click and on Enter or Space. */
  readonly barClicked = output<WaterfallChartBar>();

  readonly dataTableResolved = this.defaults.dataTable;

  protected readonly isEmpty = computed(() => this.data().length === 0);

  protected readonly steps = computed(() => waterfallSteps(this.data()));

  protected readonly categories = computed(() =>
    this.steps().map((step) => step.label),
  );

  protected readonly offsets = computed(() =>
    this.steps().map((step) => ({ from: step.from, to: step.to })),
  );

  /** What each bar's label prints: a delta's change, a total's running sum. */
  protected readonly labelValues = computed(() =>
    this.steps().map((step, index) =>
      step.direction === 'total' ? step.to : (this.data()[index]?.value ?? 0),
    ),
  );

  protected readonly points = computed<readonly ColumnSeriesPoint[]>(() => {
    const format = this.valueFormatResolved();
    const values = this.labelValues();

    return this.steps().map((step, index) => {
      const datum = this.data()[index];
      const reading = values[index];
      const sign = step.direction === 'increase' && reading > 0 ? '+' : '';

      return {
        id: datum?.id ?? String(index),
        // The word carries the meaning where colour cannot: forced colours, print, screen readers.
        label: `${step.label}, ${this.intl().chart[step.direction]} ${sign}${format(reading, 'tooltip')}`,
        value: reading,
        color: DIRECTION_COLORS[step.direction],
      };
    });
  });

  protected readonly accessibleName = computed(() => {
    const given = this.summary();
    if (given) {
      return given;
    }
    const words = this.intl().chart;
    const steps = this.steps();
    if (steps.length === 0) {
      return this.caption() ?? words.waterfallTitle;
    }
    const format = this.valueFormatResolved();
    const last = steps[steps.length - 1];
    const spoken = steps
      .map(
        (step, index) =>
          `${step.label} ${words[step.direction]} ${format(this.labelValues()[index], 'tooltip')}`,
      )
      .join(', ');

    return `${this.caption() ?? words.waterfallCaption}: ${spoken}. ${words.endsAt(format(last.to, 'tooltip'))}`;
  });

  protected readonly dataTableRows = computed<readonly ChartDataRow[]>(() =>
    this.tableRows().map((row) => ({
      key: row.key,
      cells: [
        row.label,
        row.direction,
        row.formattedValue,
        row.formattedRunningTotal,
      ],
    })),
  );

  protected readonly tableRows = computed(() => {
    const format = this.valueFormatResolved();
    const values = this.labelValues();

    return this.steps().map((step, index) => ({
      key: `${index}-${step.label}`,
      label: step.label,
      direction: this.intl().chart[step.direction],
      formattedValue: format(values[index], 'tooltip'),
      formattedRunningTotal: format(step.to, 'tooltip'),
    }));
  });

  protected readonly skeletonMarks = computed(() =>
    skeletonMarkCount(this.data().length, this.skeletonCount()),
  );

  protected readonly skeletonValueSpace = CHART_DEFAULT_VALUE_SPACE;
  protected readonly skeletonAxisGutter = CHART_DEFAULT_AXIS_GUTTER;

  protected onPointClicked(point: ColumnSeriesPoint): void {
    const datum = this.data().find(
      (entry, index) => (entry.id ?? String(index)) === point.id,
    );
    if (datum) {
      this.barClicked.emit(datum);
    }
  }
}
