import type {
  ChartDimmable,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  decimationTarget,
  linearScale,
  listenForMarkFocus,
  leaveMark,
  lttbDecimate,
  markOf,
  minMaxDecimate,
  needsDecimating,
  niceDomain,
  tickValues,
  chartRenderGate,
  DsChartBase,
} from '@ids-group-ltd/ids-design-system/components';
import type { MarkHit } from '@ids-group-ltd/ids-design-system/components';
import { ChartLegendComponent } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type { ChartLegendItem } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
  CHART_PIN_GAP,
  CHART_PIN_RADIUS,
  ChartPinMarkerComponent,
  ChartTooltipDirective,
  ChartStatesComponent,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
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
import type {
  ScatterChartDecimator,
  ScatterChartReading,
  ScatterChartSeries,
  ScatterPoint,
} from './scatter-chart.types';

const AXIS_GUTTER = 52;
const CATEGORY_GUTTER = 34;
const EDGE_GUTTER = 12;
// Clearance past the point's default radius, `--chart-dot-radius`.
const PIN_POINT_CLEARANCE = 4;
// Screen pixels from the pointer to a point's centre within which hover answers.
const HOVER_REACH_PX = 16;

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

/** Two continuous quantities against each other. Past four times the plot's width in marks a series is decimated, and the chart says so. */
@Component({
  selector: 'ds-scatter-chart',
  standalone: true,
  exportAs: 'dsScatterChart',
  imports: [
    ChartLegendComponent,
    ChartTooltipDirective,
    ChartPinMarkerComponent,
    ChartStatesComponent,
    SkeletonComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './scatter-chart.component.html',
  styleUrl: './scatter-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScatterChartComponent
  extends DsChartBase
  implements ChartDimmable, ChartWithDataTable, ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  protected readonly leaveMark = leaveMark;

  /** One entry per series. */
  readonly data = input<readonly ScatterChartSeries[]>([]);

  /** Names the horizontal quantity under the plot. */
  readonly xLabel = input<string | null>(null);

  /** Names the vertical quantity beside the plot. */
  readonly yLabel = input<string | null>(null);

  /** Which decimator thins a series past the budget. See `ScatterChartDecimator`. */
  readonly decimator = input<ScatterChartDecimator>('minMax');

  /** A hint, not a count, applied to both axes. Ticks snap to a round step. */
  readonly tickCount = input(SCATTER_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** The annex table under the plot; lists every reading, including those decimation left out. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** Whether a hovered or focused mark opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** Fades every mark but the one under the pointer; on a scatter this hides pile-ups. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The clicked reading, with the series it belongs to. Fires on click and on Enter or Space. */
  readonly pointClicked = output<ScatterChartReading>();

  readonly dataTableResolved = this.defaults.dataTable;

  protected readonly activeMark = chartActiveMark(
    () => this.defaults.tooltipLingerMs(),
    () => this.defaults.hoverDelayMs(),
  );

  protected readonly viewBox = `0 0 ${SCATTER_VIEW_WIDTH} ${SCATTER_VIEW_HEIGHT}`;

  protected readonly plot: ScatterPlot = {
    left: AXIS_GUTTER,
    top: EDGE_GUTTER,
    width: SCATTER_VIEW_WIDTH - AXIS_GUTTER - EDGE_GUTTER,
    height: SCATTER_VIEW_HEIGHT - CATEGORY_GUTTER - EDGE_GUTTER,
  };

  protected readonly plotBottom = this.plot.top + this.plot.height;
  protected readonly plotRight = this.plot.left + this.plot.width;

  protected readonly isEmpty = computed(() =>
    this.data().every((series) => series.data.length === 0),
  );

  /** One mark per drawn unit of plot width is the ceiling. */
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

  /** How many readings were dropped, over every series. */
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

  protected readonly multiSeries = computed(() => this.data().length > 1);

  /** The series named in the legend under the pointer, which fades the rest. */
  protected readonly highlightedSeries = signal<string | null>(null);

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
    const words = this.intl().chart;
    const format = this.valueFormatResolved();
    const { xMin, xMax, yMin, yMax } = this.domains();
    const counted = this.series().reduce(
      (total, entry) => total + entry.points.length,
      0,
    );
    const axes = `${words.scatterAxis(this.xLabel() ?? 'x', format(xMin, 'tooltip'), format(xMax, 'tooltip'))}, ${words.scatterAxis(this.yLabel() ?? 'y', format(yMin, 'tooltip'), format(yMax, 'tooltip'))}`;
    const dropped = this.droppedCount();

    return words.scatterSummary(
      this.caption() ?? words.scatterTitle,
      counted,
      axes,
      dropped,
    );
  });

  protected readonly dataTableColumns = computed<readonly string[]>(() => [
    this.intl().chart.seriesColumn,
    this.xLabel() ?? 'x',
    this.yLabel() ?? 'y',
  ]);

  /** Built only while the disclosure is open. */
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

  /** `<details>` keeps its children in the DOM while shut, so rows exist only while it is open. */
  protected readonly tableOpen = signal(false);

  protected readonly tableIsOpen = computed(
    () => this.tableOpen() || this.dataTableResolved() === 'visible',
  );

  /** Where the drawn chart puts its grid lines and labels, as shares of the box, which keeps the
   *  drawn chart's aspect ratio. Marks are left out: no dots while loading. */
  protected readonly skeletonLayout = (() => {
    const share = (value: number, of: number) => `${(value / of) * 100}%`;
    const steps = [0, 0.25, 0.5, 0.75, 1];

    return {
      plotLeft: share(this.plot.left, SCATTER_VIEW_WIDTH),
      plotWidth: share(this.plot.width, SCATTER_VIEW_WIDTH),
      labelEnd: share(
        SCATTER_VIEW_WIDTH - this.plot.left + 8,
        SCATTER_VIEW_WIDTH,
      ),
      categoryTop: share(this.plotBottom + 10, SCATTER_VIEW_HEIGHT),
      titleTop: share(this.plotBottom + 26, SCATTER_VIEW_HEIGHT),
      rows: steps.map((step) =>
        share(this.plot.top + step * this.plot.height, SCATTER_VIEW_HEIGHT),
      ),
      columns: steps.map((step) =>
        share(this.plot.left + step * this.plot.width, SCATTER_VIEW_WIDTH),
      ),
    };
  })();

  /** Flattened so one index addresses a mark (`chartActiveMark` counts marks). */
  private readonly flatMarks = computed(() =>
    this.series().flatMap((entry) =>
      entry.points.map((mark) => ({ entry, mark })),
    ),
  );

  /** Where each series starts in `flatMarks`. */
  protected readonly seriesStart = computed(() => {
    const starts = new Map<string, number>();
    let next = 0;
    for (const entry of this.series()) {
      starts.set(entry.key, next);
      next += entry.points.length;
    }

    return starts;
  });

  constructor() {
    super();
    listenForMarkFocus(inject(ElementRef), (event, hit) =>
      this.activeMark.enter(hit.index, event, undefined, hit.element),
    );
  }

  private hoveredIndex = -1;

  // Entered on every move, not only on change: the active mark schedules a clear on any
  // `pointerover` outside the point's element, and re-entering cancels it.
  protected onCanvasPointer(event: PointerEvent): void {
    const canvas = event.currentTarget;
    const nearest =
      canvas instanceof SVGSVGElement ? this.nearestMark(canvas, event) : null;
    if (nearest) {
      this.hoveredIndex = nearest.index;
      this.activeMark.enter(nearest.index, event, undefined, nearest.element);
    } else {
      this.onCanvasLeave();
    }
  }

  protected onCanvasLeave(): void {
    if (this.hoveredIndex !== -1) {
      this.hoveredIndex = -1;
      this.activeMark.leave();
    }
  }

  // ponytail: linear scan per pointer move, over marks already capped by decimation; a spatial
  // index if that cap is ever raised far enough to show in a trace.
  private nearestMark(
    canvas: SVGSVGElement,
    event: PointerEvent,
  ): MarkHit | null {
    const matrix = canvas.getScreenCTM();
    if (!matrix) {
      return null;
    }
    const pointer = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    const reach = HOVER_REACH_PX / matrix.a;
    let nearestIndex = -1;
    let nearestDistance = reach * reach;
    this.flatMarks().forEach(({ mark }, index) => {
      const distance = (mark.cx - pointer.x) ** 2 + (mark.cy - pointer.y) ** 2;
      if (distance <= nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });
    const element =
      nearestIndex === -1
        ? null
        : canvas.querySelector(`[data-mark-index="${nearestIndex}"]`);

    return element ? { element, index: nearestIndex } : null;
  }

  protected onPointPress(event: Event): void {
    const hit = markOf(event);
    if (hit && this.defaults.pinOnClick()) {
      this.activeMark.pin(hit.index, event, undefined, hit.element);
    }
    this.onPointActivate(event);
  }

  protected readonly pinnedPoint = computed(() =>
    this.activeMark.pinned()
      ? (this.flatMarks()[this.activeMark.index()]?.mark ?? null)
      : null,
  );

  protected readonly pinLift =
    CHART_PIN_RADIUS + CHART_PIN_GAP + PIN_POINT_CLEARANCE;

  protected onPointActivate(event: Event): void {
    const held = this.flatMarks()[markOf(event)?.index ?? -1];
    if (held) {
      this.onPointClick(held.entry.series, held.mark.point);
    }
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
