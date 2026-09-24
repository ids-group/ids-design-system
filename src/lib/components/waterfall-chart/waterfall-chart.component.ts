import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import {
  ChartComponent,
  ColumnSeriesComponent,
} from '@ids-group-ltd/ids-design-system/components/chart';
import type { ColumnSeriesPoint } from '@ids-group-ltd/ids-design-system/components/chart';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { waterfallSteps } from './waterfall-chart.math';
import { WaterfallMarksComponent } from './waterfall-marks.component';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import {
  resolveChartDefaults,
  chartRenderGate,
  CHART_RENDER_GATE_PASSED,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  WaterfallChartBar,
  WaterfallChartStep,
} from './waterfall-chart.types';

/** What each direction is painted with. A total is the neutral series colour because it is not a
 *  change at all, and reading it as one is the mistake the three-colour scheme exists to prevent. */
const DIRECTION_COLORS: Record<WaterfallChartStep['direction'], string> = {
  increase: 'var(--ds-chart-positive-color)',
  decrease: 'var(--ds-chart-negative-color)',
  total: 'var(--ds-chart-series-default-color)',
};

/**
 * A running total, bar by bar: what a figure started at, what moved it, and what it ended at.
 *
 * The one chart in the family that cannot be a mode on another, because it needs three things at
 * once - an accumulating level, bars pinned to zero for the totals, and its own three-colour
 * semantic. Colour never carries that semantic alone: every bar's label prints its own sign and
 * every bar's accessible name says "increase" or "decrease" in words.
 */
@Component({
  selector: 'ds-waterfall-chart',
  standalone: true,
  exportAs: 'dsWaterfallChart',
  imports: [
    ChartComponent,
    ColumnSeriesComponent,
    SkeletonComponent,
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
export class WaterfallChartComponent {
  protected readonly renderReady = chartRenderGate();

  /** The bars in the order they are read, which is the order they happened in - a waterfall is
   *  never sorted, because the sequence is the meaning. */
  readonly data = input<readonly WaterfallChartBar[]>([]);

  /** Prints each bar's own reading above it, with its sign. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** The dashed rule chaining one bar to the next at the level they share. Without it the bars
   *  read as separate columns rather than as one running total. */
  readonly showConnectors = input(true, { transform: booleanAttribute });

  /** Printed above the plot as the visible title, and reused as the annex table's caption. */
  readonly caption = input<string | null>(null);

  /** The accessible name. Generated from the steps when omitted, naming each one's direction in
   *  words and the figure the chain ends at. */
  readonly summary = input<string | null>(null);

  /** A hint, not a count. Ticks snap to a round step. */
  readonly tickCount = input(5, { transform: numberAttribute });

  /** Turns on the click affordance and the keyboard route. `barClicked` fires whether or not
   *  this is set. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card
   *  the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  readonly frame = input<ChartFrame | null>(null);

  /** The annex table under the plot. Unset falls back to `DS_CONFIG.chart.dataTable`, then
   *  `'none'`. It prints each step's direction, its own reading and the running total. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** Skeleton bars at the real count, so the page does not resize when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Separate from an empty `data`: "the request failed" and "there is nothing to show" read the
   *  same and mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shown in place of the plot while `error` is set. Unset falls back to
   *  `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);

  /** Formats every value the chart prints - the axis ticks, the bar labels and the annex table.
   *  The sign a delta carries is added around it, so a formatter never has to know about one. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** The clicked datum, as it was given. Fires on click and on Enter or Space. */
  readonly barClicked = output<WaterfallChartBar>();

  private readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  protected readonly isEmpty = computed(() => this.data().length === 0);

  protected readonly steps = computed(() => waterfallSteps(this.data()));

  protected readonly categories = computed(() =>
    this.steps().map((step) => step.label),
  );

  protected readonly offsets = computed(() =>
    this.steps().map((step) => ({ from: step.from, to: step.to })),
  );

  /** What each bar's label prints: a delta's own change, a total's running sum. The two are
   *  different readings and only one of them takes a sign. */
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
        // The word is what carries the meaning where colour cannot - forced colours, a monochrome
        // print, a reader who cannot tell the two hues apart, and every screen reader.
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

  protected readonly skeletonBars = computed(() =>
    Array.from({ length: Math.max(this.data().length, 5) }),
  );

  protected onPointClicked(point: ColumnSeriesPoint): void {
    const datum = this.data().find(
      (entry, index) => (entry.id ?? String(index)) === point.id,
    );
    if (datum) {
      this.barClicked.emit(datum);
    }
  }
}
