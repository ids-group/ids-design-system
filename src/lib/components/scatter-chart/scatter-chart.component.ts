import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  decimationTarget,
  linearScale,
  lttbDecimate,
  minMaxDecimate,
  needsDecimating,
  niceDomain,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import { ChartLegendComponent } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type { ChartLegendItem } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  SCATTER_DEFAULT_TICK_COUNT,
  SCATTER_VIEW_HEIGHT,
  SCATTER_VIEW_WIDTH,
  scatterExtent,
  scatterPlacement,
} from './scatter-chart.math';
import type { ScatterPlot } from './scatter-chart.math';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';
import type {
  ScatterChartDecimator,
  ScatterChartReading,
  ScatterChartSeries,
  ScatterPoint,
} from './scatter-chart.types';

/** Room for the axis labels outside the plot, in the canvas's own units. */
const AXIS_GUTTER = 52;
const CATEGORY_GUTTER = 34;
const EDGE_GUTTER = 12;

interface PlacedPoint {
  readonly key: string;
  readonly cx: number;
  readonly cy: number;
  readonly point: ScatterPoint;
}

interface PlacedSeries {
  readonly key: string;
  readonly series: ScatterChartSeries;
  readonly color: string;
  readonly points: readonly PlacedPoint[];
}

/**
 * Two continuous quantities against each other: weight against carriage cost, distance against
 * time, volume against conversion. None of the other five charts draws this.
 *
 * It is the only chart in the family whose mark count the CALLER decides - an area has one node per
 * series, a waterfall one per step, a heat map one per cell, and all three are bounded by the
 * question itself. So it is also the only one that thins its own data before drawing: past four
 * times the plot's width in marks the series is decimated, and the chart says so on its face
 * rather than leaving the reader to count points that are not there.
 */
@Component({
  selector: 'ds-scatter-chart',
  standalone: true,
  exportAs: 'dsScatterChart',
  imports: [
    ChartLegendComponent,
    ChartTooltipDirective,
    SkeletonComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './scatter-chart.component.html',
  styleUrl: './scatter-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScatterChartComponent {
  /** One entry per series, each carrying its own readings. Both scales are continuous, so a
   *  point holds its position on each rather than an index into a list of categories. */
  readonly data = input<readonly ScatterChartSeries[]>([]);

  /** Names the horizontal quantity under the plot. Without it the reader has two numbers and no
   *  idea which is which - on a scatter that is the whole reading. */
  readonly xLabel = input<string | null>(null);

  /** Names the vertical quantity beside the plot. */
  readonly yLabel = input<string | null>(null);

  /** Which decimator thins a series past the budget. `'minMax'` by default, because it is the only
   *  one that promises each bucket's extremum survives. */
  readonly decimator = input<ScatterChartDecimator>('minMax');

  /** A hint, not a count, and it applies to BOTH axes. Ticks snap to a round step. */
  readonly tickCount = input(SCATTER_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** Printed above the plot as the visible title, and reused as the annex table's caption. */
  readonly caption = input<string | null>(null);

  /** The accessible name. Generated when omitted, naming both axes' spans, how many readings
   *  were drawn and how many were thinned out. */
  readonly summary = input<string | null>(null);

  /** Makes every mark a button and gives it a keyboard route. `pointClicked` fires whether or
   *  not this is set. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card
   *  the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  readonly frame = input<ChartFrame | null>(null);

  /** The annex table under the plot. It lists EVERY reading, including the ones decimation left
   *  out of the drawing, which is what keeps a thinned chart honest. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** A skeleton at the plot's own height, so the page does not resize when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Separate from empty data: "the request failed" and "there is nothing to show" read the same
   *  and mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** Shown when no series carries a reading. Unset falls back to `DS_CONFIG.chart.emptyText`. */
  readonly emptyText = input<string | null>(null);

  /** Shown in place of the plot while `error` is set. Unset falls back to
   *  `DS_CONFIG.chart.errorText`. */
  readonly errorText = input<string | null>(null);

  /** Formats every number the chart prints - both axes' ticks, the accessible name and the annex
   *  table. Unset falls back to `DS_CONFIG.chart.valueFormat`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** Whether a hovered or focused mark opens a tooltip. A scatter prints no value beside its
   *  marks - there is no room - so this is where a reading is read without the annex table. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** Fades every mark but the one under the pointer. Off by default: on a scatter the pile-up IS
   *  the reading, and dimming the neighbours takes exactly that away. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The clicked reading, with the series it belongs to. Fires on click and on Enter or Space. */
  readonly pointClicked = output<ScatterChartReading>();

  private readonly defaults = resolveChartDefaults(this);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  protected readonly activeMark = chartActiveMark(() => 0);

  protected readonly viewBox = `0 0 ${SCATTER_VIEW_WIDTH} ${SCATTER_VIEW_HEIGHT}`;

  protected readonly plot: ScatterPlot = {
    left: AXIS_GUTTER,
    top: EDGE_GUTTER,
    width: SCATTER_VIEW_WIDTH - AXIS_GUTTER - EDGE_GUTTER,
    height: SCATTER_VIEW_HEIGHT - CATEGORY_GUTTER - EDGE_GUTTER,
  };

  protected readonly isEmpty = computed(() =>
    this.data().every((series) => series.data.length === 0),
  );

  /** One mark per drawn unit of plot width is the ceiling: two marks sharing a pixel are two DOM
   *  nodes a reader cannot tell apart. The viewBox is one unit per pixel at a typical card width. */
  private readonly budget = computed(() => decimationTarget(this.plot.width));

  protected readonly drawnSeries = computed(() => {
    const mode = this.decimator();
    const budget = this.budget();

    return this.data().map((series) => {
      const thin =
        mode !== 'none' && needsDecimating(series.data.length, budget);
      const data = !thin
        ? series.data
        : mode === 'lttb'
          ? lttbDecimate(series.data, budget)
          : minMaxDecimate(series.data, budget);

      return { series, data, thinned: thin ? series.data.length : 0 };
    });
  });

  /** How many readings were dropped, over every series. A decimated chart that does not SAY it is
   *  decimated leaves the reader counting points that were never drawn. */
  protected readonly droppedCount = computed(() =>
    this.drawnSeries().reduce(
      (total, entry) =>
        total + (entry.thinned === 0 ? 0 : entry.thinned - entry.data.length),
      0,
    ),
  );

  private readonly extent = computed(() =>
    scatterExtent(
      this.drawnSeries().map((entry) => ({
        ...entry.series,
        data: entry.data,
      })),
    ),
  );

  private readonly domains = computed(() => {
    const measured = this.extent();
    const ticks = this.tickCount();
    const x = niceDomain(measured.xMin, measured.xMax, ticks);
    const y = niceDomain(measured.yMin, measured.yMax, ticks);

    return {
      xMin: x.min,
      xMax: x.max || measured.xMax,
      yMin: y.min,
      yMax: y.max || measured.yMax,
    };
  });

  protected readonly series = computed<readonly PlacedSeries[]>(() => {
    const extent = this.domains();

    return this.drawnSeries().map((entry, index) => {
      const slot = index % CHART_SERIES_COLORS.length;

      return {
        key: entry.series.id,
        series: entry.series,
        color: entry.series.color ?? CHART_SERIES_COLORS[slot],
        points: entry.data
          .filter(
            (point: ScatterPoint) =>
              Number.isFinite(point.x) && Number.isFinite(point.y),
          )
          .map((point: ScatterPoint, pointIndex: number) => ({
            key: `${entry.series.id}-${pointIndex}`,
            point,
            ...scatterPlacement(point, extent, this.plot),
          })),
      };
    });
  });

  protected readonly xTicks = computed(() => {
    const { xMin, xMax } = this.domains();
    const toX = linearScale(xMin, xMax, this.plot.width);
    const format = this.valueFormatResolved();

    return tickValues(xMin, xMax, this.tickCount()).map((value) => ({
      value,
      x: this.plot.left + toX(value),
      label: format(value, 'tick'),
    }));
  });

  protected readonly yTicks = computed(() => {
    const { yMin, yMax } = this.domains();
    const toY = linearScale(yMin, yMax, this.plot.height);
    const format = this.valueFormatResolved();

    return tickValues(yMin, yMax, this.tickCount()).map((value) => ({
      value,
      y: this.plot.top + this.plot.height - toY(value),
      label: format(value, 'tick'),
    }));
  });

  protected readonly plotBottom = this.plot.top + this.plot.height;
  protected readonly plotRight = this.plot.left + this.plot.width;

  protected readonly multiSeries = computed(() => this.data().length > 1);

  protected readonly legendItems = computed<readonly ChartLegendItem[]>(() =>
    this.series().map((entry) => ({
      id: entry.series.id,
      label: entry.series.label,
      color: entry.color,
    })),
  );

  protected readonly accessibleName = computed(() => {
    const given = this.summary();
    if (given) {
      return given;
    }
    const format = this.valueFormatResolved();
    const { xMin, xMax, yMin, yMax } = this.domains();
    const counted = this.series().reduce(
      (total, entry) => total + entry.points.length,
      0,
    );
    const axes = `${this.xLabel() ?? 'x'} from ${format(xMin, 'tooltip')} to ${format(xMax, 'tooltip')}, ${this.yLabel() ?? 'y'} from ${format(yMin, 'tooltip')} to ${format(yMax, 'tooltip')}`;
    const dropped = this.droppedCount();

    return `${this.caption() ?? 'Scatter chart'}: ${counted} readings drawn, ${axes}.${dropped > 0 ? ` ${dropped} further readings were thinned out to keep the plot drawable; the data table lists every one.` : ''}`;
  });

  protected readonly dataTableColumns = computed<readonly string[]>(() => [
    'Series',
    this.xLabel() ?? 'x',
    this.yLabel() ?? 'y',
  ]);

  /** Built only while the disclosure is open: a scatter carries thousands of readings, and every
   *  one of them as a table row is a cost nobody pays until they ask. */
  protected readonly dataTableRows = computed<readonly ChartDataRow[]>(() =>
    this.tableIsOpen()
      ? this.tableRows().map((row) => ({
          key: row.key,
          cells: [row.series, row.x, row.y],
        }))
      : [],
  );

  protected readonly tableRows = computed(() => {
    const format = this.valueFormatResolved();

    return this.data().flatMap((series) =>
      series.data.map((point, index) => ({
        key: `${series.id}-${index}`,
        series: series.label,
        x: format(point.x, 'tooltip'),
        y: format(point.y, 'tooltip'),
      })),
    );
  });

  /** `<details>` keeps its children in the DOM while it is shut, so a scatter of 12 000 readings
   *  parked 48 000 nodes on the page - three times what decimating the PLOT had just saved. The
   *  rows are built when the disclosure opens and dropped when it shuts; every reading is still
   *  one click away, which is what the table is for. */
  protected readonly tableOpen = signal(false);

  protected readonly tableIsOpen = computed(
    () => this.tableOpen() || this.dataTableResolved() === 'visible',
  );

  protected readonly skeletonHeight = `${SCATTER_VIEW_HEIGHT}`;

  /** Flattened so one index addresses a mark, which is what `chartActiveMark` counts. */
  private readonly flatMarks = computed(() =>
    this.series().flatMap((entry) =>
      entry.points.map((mark) => ({ entry, mark })),
    ),
  );

  protected markIndex(seriesKey: string, pointKey: string): number {
    return this.flatMarks().findIndex(
      (held) => held.entry.key === seriesKey && held.mark.key === pointKey,
    );
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const held = this.flatMarks()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !held) {
        return null;
      }
      const format = this.valueFormatResolved();

      return {
        category: `${this.xLabel() ?? 'x'} ${format(held.mark.point.x, 'tooltip')}`,
        entries: [
          {
            label: held.entry.series.label,
            value: held.mark.point.y,
            formatted: format(held.mark.point.y, 'tooltip'),
            color: held.entry.color,
          },
        ],
      };
    },
  );

  protected onPointClick(
    series: ScatterChartSeries,
    point: ScatterPoint,
  ): void {
    this.pointClicked.emit({ series, point });
  }

  protected pointLabel(
    series: ScatterChartSeries,
    point: ScatterPoint,
  ): string {
    const format = this.valueFormatResolved();

    return `${series.label}, ${this.xLabel() ?? 'x'} ${format(point.x, 'tooltip')}, ${this.yLabel() ?? 'y'} ${format(point.y, 'tooltip')}`;
  }
}
