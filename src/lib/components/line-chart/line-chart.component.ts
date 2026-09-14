import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  describeSeries,
  bandScale,
  formatTick,
  focusMark,
  formatValue,
  nextRovingIndex,
  staggerDelay,
  tickStep,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { ChartLegendComponent } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type { ChartLegendItem } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type {
  ChartTooltipContext,
  ChartTooltipOrigin,
  ChartTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  LINE_CHART_AXIS_LABEL_GAP,
  LINE_CHART_DEFAULT_TICK_COUNT,
  LINE_CHART_VIEW_HEIGHT,
  LINE_CHART_VIEW_WIDTH,
  type LinePoint,
  type PlotArea,
  alignSeriesValues,
  areaPath,
  axisLayout,
  categoryCenters,
  categoryLabelStride,
  chartLayout,
  domainMaxOf,
  lineSegments,
  paletteIndexFor,
  polylinePoints,
  seriesPoints,
  valueY,
} from './line-chart.math';
import type {
  LineChartAxisMode,
  LineChartGaps,
  LineChartPoint,
  LineChartSeries,
} from './line-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

interface ResolvedSeries {
  readonly series: LineChartSeries;
  readonly values: readonly (number | null)[];
  readonly onSecondaryAxis: boolean;
  readonly color: string;
}

interface PlottedSeries extends ResolvedSeries {
  readonly polylines: readonly string[];
  readonly areaPaths: readonly string[];
  readonly markers: readonly LinePoint[];
}

interface AxisTick {
  readonly y: number;
  readonly label: string;
}

interface CategoryLabel {
  readonly x: number;
  readonly text: string;
}

function baselineOf(plot: PlotArea): number {
  return plot.top + plot.height;
}

@Component({
  selector: 'ds-line-chart',
  standalone: true,
  imports: [SkeletonComponent, ChartTooltipDirective, ChartLegendComponent],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent {
  /** X labels. Every series' `data` is read against this length. */
  readonly categories = input.required<readonly string[]>();

  readonly series = input.required<readonly LineChartSeries[]>();

  /** How a secondary axis relates to the primary one. */
  readonly yAxisMode = input<LineChartAxisMode>('rounded');

  readonly showMarkers = input(true, { transform: booleanAttribute });

  /** Makes every reading focusable and clickable. A series drawn without markers grows invisible
   *  ones so there is something to land on; they appear on hover and on focus.
   *
   *  The click output fires whether or not this is set, so a consumer that binds the output and
   *  forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  readonly pointClicked = output<LineChartPoint>();

  /** What a `null` reading draws. The default refuses to assert that a missing
   *  reading is a zero. */
  readonly gaps = input<LineChartGaps>('break');

  readonly tickCount = input(LINE_CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  readonly dataTable = input<'toggle' | 'visible' | 'none'>('toggle');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input<string>('No data');

  readonly error = input(false, { transform: booleanAttribute });

  readonly errorText = input<string>('Could not load the data');
  readonly valueFormat = input<(value: number) => string>(defaultValueFormat);

  protected readonly viewBox = `0 0 ${LINE_CHART_VIEW_WIDTH} ${LINE_CHART_VIEW_HEIGHT}`;

  protected readonly resolvedSeries = computed<readonly ResolvedSeries[]>(
    () => {
      const categoryCount = this.categories().length;
      const gaps = this.gaps();

      return this.series().map((series, index) => ({
        series,
        values: alignSeriesValues(series.data, categoryCount, gaps),
        onSecondaryAxis: series.axis === 'secondary',
        color:
          CHART_SERIES_COLORS[
            paletteIndexFor(series.slot, index, CHART_SERIES_COLORS.length)
          ],
      }));
    },
  );

  /** Ids of the series the legend has switched off. Two-way, so a page can drive it from a URL
   *  parameter and read back what the reader chose. */
  readonly hiddenSeries = model<readonly string[]>([]);

  /** Whether hiding a series re-scales the value axis to what is left. Default `false`: a silent
   *  rescale turns a period-over-period comparison into a different claim, and a comparison
   *  dashboard is the common case. */
  readonly rescaleOnHide = input(false, { transform: booleanAttribute });

  /** Whether the legend switches series off. Off leaves it a plain key. */
  readonly legendFilters = input(false, { transform: booleanAttribute });

  /** Shown in place of the plot once the legend has switched every series off. Without it the
   *  reader is left with an empty grid and nothing saying why. */
  readonly noVisibleSeriesText = input<string>('All series are hidden');

  /** Milliseconds between one series' entrance and the next. `0`, the default, is no stagger at
   *  all; `40` is the documented non-zero step. The total is capped, so a long list of series does
   *  not crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  protected readonly highlightedSeries = model<string | null>(null);

  protected readonly visibleSeries = computed<readonly ResolvedSeries[]>(() => {
    const hidden = this.hiddenSeries();

    return this.resolvedSeries().filter(
      (entry) => !hidden.includes(entry.series.id),
    );
  });

  protected readonly legendItems = computed<readonly ChartLegendItem[]>(() =>
    this.resolvedSeries().map((entry) => ({
      id: entry.series.id,
      label: entry.series.label,
      color: entry.color,
    })),
  );

  protected isDimmed(seriesId: string): boolean {
    const highlighted = this.highlightedSeries();

    return highlighted !== null && highlighted !== seriesId;
  }

  protected readonly hasSecondaryAxis = computed(() =>
    this.visibleSeries().some((entry) => entry.onSecondaryAxis),
  );

  protected readonly layout = computed(() =>
    chartLayout(this.yAxisMode(), this.hasSecondaryAxis()),
  );

  protected readonly axes = computed(() => {
    // The axis is scaled from every series unless `rescaleOnHide` says otherwise, so switching one
    // off does not move the gridlines under the ones still drawn.
    const entries = this.rescaleOnHide()
      ? this.visibleSeries()
      : this.resolvedSeries();
    const valuesOn = (secondary: boolean) =>
      entries
        .filter((entry) => entry.onSecondaryAxis === secondary)
        .map((entry) => entry.values);

    return axisLayout(
      domainMaxOf(valuesOn(false)),
      this.hasSecondaryAxis() ? domainMaxOf(valuesOn(true)) : null,
      this.yAxisMode(),
      this.tickCount(),
    );
  });

  protected readonly categoryPositions = computed(() =>
    categoryCenters(this.categories().length, this.layout().primaryPlot),
  );

  protected readonly plottedSeries = computed<readonly PlottedSeries[]>(() => {
    const axes = this.axes();
    const centers = this.categoryPositions();

    return this.visibleSeries().map((entry) => {
      const plot = this.plotFor(entry.onSecondaryAxis);
      const axisMax =
        entry.onSecondaryAxis && axes.secondary
          ? axes.secondary.max
          : axes.primary.max;
      const segments = lineSegments(
        seriesPoints(entry.values, axisMax, plot, centers),
      );
      const baselineY = plot.top + plot.height;

      return {
        ...entry,
        polylines: segments
          .map((segment) => polylinePoints(segment))
          .filter((points) => points.length > 0),
        areaPaths: entry.series.area
          ? segments
              .map((segment) => areaPath(segment, baselineY))
              .filter((path) => path.length > 0)
          : [],
        markers: segments.flat(),
      };
    });
  });

  protected readonly primaryTicks = computed(() =>
    this.ticksFor(this.axes().primary.ticks, this.axes().primary.max, false),
  );

  protected readonly secondaryTicks = computed<readonly AxisTick[]>(() => {
    const secondary = this.axes().secondary;

    return secondary ? this.ticksFor(secondary.ticks, secondary.max, true) : [];
  });

  /** Drawn only when the two axes do not share the primary's gridlines, and only
   *  when the axis has more than the single tick a degenerate domain leaves. */
  protected readonly showSecondaryGridlines = computed(
    () => !this.axes().alignedTicks && this.secondaryTicks().length > 1,
  );

  protected readonly stacked = computed(() => this.layout().stacked);
  protected readonly categoryLabelY = computed(
    () => this.layout().categoryLabelY,
  );

  /** The category under the pointer, or -1. */
  protected readonly activeCategory = signal(-1);

  protected readonly categoryBands = computed(() =>
    bandScale(this.categories().length, this.layout().primaryPlot.width, 0),
  );

  protected readonly activeBandX = computed(
    () =>
      this.layout().primaryPlot.left +
      this.categoryBands().position(this.activeCategory()),
  );

  protected readonly activeBandWidth = computed(
    () => this.categoryBands().bandWidth,
  );

  protected readonly activeCategoryX = computed(
    () => this.activeBandX() + this.activeBandWidth() / 2,
  );

  protected onPlotPointer(event: PointerEvent): void {
    const canvas = event.currentTarget as SVGSVGElement;
    const screen = canvas.getScreenCTM();
    if (!screen) {
      return;
    }
    // Client pixels are not viewBox units — the plot scales to the card's width.
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      screen.inverse(),
    );
    const plot = this.layout().primaryPlot;
    this.activeCategory.set(this.categoryBands().indexAt(point.x - plot.left));
    this.tooltipOrigin.set({ x: event.clientX, y: event.clientY });
  }

  protected clearActiveCategory(): void {
    this.activeCategory.set(-1);
    this.tooltipOrigin.set(null);
  }

  /** Whether the plot opens a tooltip, and for what. `'axis'` names every series at the
   *  category under the pointer, which is the reading a multi-series line is compared on;
   *  `'item'` names only the marker itself. */
  readonly tooltip = input<ChartTooltipTrigger>('axis');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  protected readonly tooltipOrigin = signal<ChartTooltipOrigin | null>(null);

  /** The series focus is on, or -1 for the whole category. A pointer answers for every
   *  series at once; a focused marker answers for its own. */
  protected readonly activeSeries = signal(-1);

  /** One tab stop PER SERIES, keyed by series id — each line is a strand the reader walks with
   *  the arrows. WCAG 2.1.1's Understanding is explicit that not every mouse-operable control has
   *  to be separately focusable, which is what keeps a 12-category, 2-series plot from being
   *  twenty-four stops in the page's tab order. */
  protected readonly rovingByCategory = signal<ReadonlyMap<string, number>>(
    new Map(),
  );

  protected isTabStop(seriesId: string, categoryIndex: number): boolean {
    return (this.rovingByCategory().get(seriesId) ?? 0) === categoryIndex;
  }

  protected onMarkerFocus(
    seriesIndex: number,
    categoryIndex: number,
    event: FocusEvent,
  ): void {
    if (event.currentTarget instanceof Element) {
      this.tooltipOrigin.set(event.currentTarget);
    }
    this.activeSeries.set(seriesIndex);
    this.activeCategory.set(categoryIndex);
    this.setRoving(seriesIndex, categoryIndex);
  }

  protected onMarkerNavigation(
    event: KeyboardEvent,
    seriesIndex: number,
    categoryIndex: number,
  ): void {
    const markers = this.plottedSeries()[seriesIndex]?.markers ?? [];
    const positions = markers.map((marker) => marker.categoryIndex);
    const current = positions.indexOf(categoryIndex);
    const next = nextRovingIndex(event.key, current, positions.length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    const nextCategory = positions[next];
    this.setRoving(seriesIndex, nextCategory);
    focusMark(
      (event.currentTarget as Element).closest('svg'),
      nextCategory,
      `[data-series-index="${seriesIndex}"]`,
    );
  }

  private setRoving(seriesIndex: number, categoryIndex: number): void {
    const seriesId = this.plottedSeries()[seriesIndex]?.series.id;
    if (seriesId === undefined) {
      return;
    }
    const next = new Map(this.rovingByCategory());
    next.set(seriesId, categoryIndex);
    this.rovingByCategory.set(next);
  }

  protected onMarkerBlur(): void {
    this.activeSeries.set(-1);
    this.clearActiveCategory();
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const categoryIndex = this.activeCategory();
      const categories = this.categories();
      if (
        this.tooltip() === 'none' ||
        categoryIndex < 0 ||
        categoryIndex >= categories.length
      ) {
        return null;
      }
      const format = this.valueFormat();
      const focusedSeries = this.activeSeries();
      const perSeries =
        this.tooltip() === 'item' || focusedSeries >= 0
          ? this.visibleSeries().slice(
              Math.max(focusedSeries, 0),
              Math.max(focusedSeries, 0) + 1,
            )
          : this.visibleSeries();

      return {
        category: categories[categoryIndex],
        entries: perSeries
          .map((entry) => ({ entry, value: entry.values[categoryIndex] }))
          .filter(
            (
              reading,
            ): reading is {
              entry: (typeof perSeries)[number];
              value: number;
            } =>
              typeof reading.value === 'number' &&
              Number.isFinite(reading.value),
          )
          .map(({ entry, value }) => ({
            label: entry.series.label,
            value,
            formatted: format(value),
            color: entry.color,
          })),
      };
    },
  );

  protected readonly plotLeft = computed(() => this.layout().primaryPlot.left);
  protected readonly plotRight = computed(
    () => this.layout().primaryPlot.left + this.layout().primaryPlot.width,
  );

  protected readonly primaryTopY = computed(
    () => this.layout().primaryPlot.top,
  );
  protected readonly secondaryTopY = computed(
    () => this.layout().secondaryPlot.top,
  );

  protected readonly primaryBaselineY = computed(() =>
    baselineOf(this.layout().primaryPlot),
  );

  protected readonly secondaryBaselineY = computed(() =>
    baselineOf(this.layout().secondaryPlot),
  );

  protected readonly primaryLabelX = computed(
    () => this.layout().primaryPlot.left - LINE_CHART_AXIS_LABEL_GAP,
  );

  protected readonly secondaryLabelX = computed(() => {
    const layout = this.layout();

    return layout.stacked
      ? layout.secondaryPlot.left - LINE_CHART_AXIS_LABEL_GAP
      : layout.primaryPlot.left +
          layout.primaryPlot.width +
          LINE_CHART_AXIS_LABEL_GAP;
  });

  protected readonly secondaryLabelAnchor = computed(() =>
    this.layout().stacked ? 'end' : 'start',
  );

  protected readonly categoryLabels = computed<readonly CategoryLabel[]>(() => {
    const categories = this.categories();
    const centers = this.categoryPositions();
    const stride = categoryLabelStride(categories.length);
    const labels: CategoryLabel[] = [];
    for (let index = 0; index < categories.length; index += stride) {
      labels.push({ x: centers[index], text: categories[index] });
    }

    return labels;
  });

  protected readonly tableRows = computed(() => {
    const format = this.valueFormat();

    return this.categories().map((category, index) => ({
      category,
      cells: this.resolvedSeries().map((entry) => {
        const value = entry.values[index];

        return value === null || value === undefined ? '—' : format(value);
      }),
    }));
  });

  protected readonly accessibleName = computed(() => {
    const summary = this.summary();
    if (summary !== null) {
      return summary;
    }

    const title = this.caption() ?? 'Chart';
    const format = this.valueFormat();
    const categories = this.categories();
    const sentences = this.resolvedSeries().map((entry) =>
      describeSeries(
        entry.series.label,
        entry.values.flatMap((value, index) =>
          value === null ? [] : [{ label: categories[index] ?? '', value }],
        ),
        format,
      ),
    );

    return sentences.length === 0
      ? describeSeries(title, [], format)
      : `${title}. ${sentences.join(' ')}`;
  });

  protected pointOf(entry: PlottedSeries, marker: LinePoint): LineChartPoint {
    return {
      series: entry.series,
      categoryIndex: marker.categoryIndex,
      category: this.categories()[marker.categoryIndex] ?? '',
      value: marker.value,
    };
  }

  protected markerLabel(entry: PlottedSeries, marker: LinePoint): string {
    const point = this.pointOf(entry, marker);

    return `${entry.series.label}, ${point.category}, ${this.valueFormat()(marker.value)}`;
  }

  protected onMarkerKey(
    entry: PlottedSeries,
    marker: LinePoint,
    event: Event,
  ): void {
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.pointClicked.emit(this.pointOf(entry, marker));
  }

  protected readonly isEmpty = computed(
    () => this.series().length === 0 || this.categories().length === 0,
  );

  protected readonly showLegend = computed(() => this.series().length > 1);

  protected readonly noVisibleSeries = computed(
    () => this.series().length > 0 && this.visibleSeries().length === 0,
  );

  /** Placeholder legend rows while loading. Follows the real series count so the
   *  chart does not resize when the data lands; falls back to three when `series`
   *  is still empty. */
  protected readonly skeletonSeries = computed(() =>
    Array.from({ length: Math.max(this.series().length, 3) }),
  );

  private plotFor(onSecondaryAxis: boolean): PlotArea {
    const layout = this.layout();

    return onSecondaryAxis && layout.stacked
      ? layout.secondaryPlot
      : layout.primaryPlot;
  }

  private ticksFor(
    ticks: readonly number[],
    axisMax: number,
    onSecondaryAxis: boolean,
  ): AxisTick[] {
    const plot = this.plotFor(onSecondaryAxis);
    const step = tickStep(ticks);
    const format = this.valueFormat();

    return ticks.map((value) => ({
      y: valueY(value, axisMax, plot),
      label:
        format === defaultValueFormat ? formatTick(value, step) : format(value),
    }));
  }
}
