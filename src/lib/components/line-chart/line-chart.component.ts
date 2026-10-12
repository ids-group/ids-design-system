import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  describeSeries,
  chartRenderGate,
  CHART_RENDER_GATE_PASSED,
  DsChartBase,
  readOnHostResize,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
  CHART_DEFAULT_AXIS_GUTTER,
  CHART_DEFAULT_VALUE_SPACE,
  ChartComponent,
  LineSeriesComponent,
  SeriesAnnotationComponent,
  chartViewHeight,
} from '@ids-group-ltd/ids-design-system/components/chart';
import type {
  ChartAnnotation,
  LineSeriesData,
} from '@ids-group-ltd/ids-design-system/components/chart';
import { formatPercent } from '@ids-group-ltd/ids-design-system/components';
import { stackOffsets } from '@ids-group-ltd/ids-design-system/components/chart';
import type {
  ChartDataTable,
  ChartValueFormat,
  ChartAxisMode,
  ChartGaps,
  ChartCurve,
} from '@ids-group-ltd/ids-design-system/core';
import { ChartLegendComponent } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type { ChartLegendItem } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import {
  CHART_SKELETON_CATEGORY_BAND,
  CHART_UNPIN_DRAWN_BY_HOST,
  ChartSkeletonComponent,
  ChartStatesComponent,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartTooltipContext,
  ChartTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  LINE_CHART_DEFAULT_TICK_COUNT,
  alignSeriesValues,
  domainMaxOf,
  paletteIndexFor,
} from './line-chart.math';

/** Default of `--ds-line-chart-plot-height`, used before the first style read and under SSR. */
const DEFAULT_PLOT_HEIGHT = 240;

function readPlotHeight(host: HTMLElement): number {
  const parsed = Number.parseFloat(
    getComputedStyle(host).getPropertyValue('--_line-chart-plot-height'),
  );

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PLOT_HEIGHT;
}
import type {
  LineChartAnnotation,
  LineChartStack,
  LineChartReading,
  LineChartSeries,
} from './line-chart.types';

interface ResolvedSeries {
  readonly series: LineChartSeries;
  readonly values: readonly (number | null)[];
  /** Where this series' band starts on the value axis, per category. `null` while unstacked. */
  readonly lowerValues: readonly (number | null)[] | null;
  readonly onSecondaryAxis: boolean;
  readonly color: string;
  /** `null` while `patterns` is off. */
  readonly dash: string | null;
}

const SERIES_DASH_ARRAYS = [
  'none',
  '7 4',
  '2 3',
  '11 4 2 4',
  '1 4',
  '8 3 2 3',
  '4 2',
  '14 5',
];

@Component({
  selector: 'ds-line-chart',
  standalone: true,
  imports: [
    SkeletonComponent,
    ChartSkeletonComponent,
    ChartComponent,
    LineSeriesComponent,
    SeriesAnnotationComponent,
    ChartLegendComponent,
    ChartDataTableComponent,
    ChartStatesComponent,
  ],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '[style.--_line-chart-view-height]': 'viewHeightPx()',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    { provide: CHART_RENDER_GATE_PASSED, useValue: true },
    { provide: CHART_UNPIN_DRAWN_BY_HOST, useValue: true },
  ],
})
export class LineChartComponent
  extends DsChartBase
  implements
    ChartDimmable,
    ChartStaggered,
    ChartWithDataTable,
    ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  /** X labels. Every series' `data` is read against this length. */
  readonly categories = input<readonly string[]>([]);

  /** One line per entry, read against `categories`: a longer series loses its tail, a shorter one ends early. */
  readonly series = input<readonly LineChartSeries[]>([]);

  /** How a secondary axis relates to the primary one. */
  readonly yAxisMode = input<ChartAxisMode>('aligned');

  /** Draws a dot at every reading. Off, the dots appear on hover and on focus only. */
  readonly showMarkers = input(true, { transform: booleanAttribute });

  /** Lays the lines and their markers on a band of the background colour. */
  readonly outline = input(true, { transform: booleanAttribute });

  /** Labels pinned over their readings. Drawn `aria-hidden`; their text is appended to the accessible name. */
  readonly annotations = input<readonly LineChartAnnotation[]>([]);

  /** The point clicked or activated with Enter or Space, whether or not `interactive` is set. */
  readonly pointClicked = output<LineChartReading>();

  /** Dims every OTHER mark while one is hovered or focused. Dimmed marks lose separation between
   *  them (three series: worst pair dE 14.8 to 2.1 at `--ds-chart-dim-opacity` 0.3, measured 2026-09-13). */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** What a `null` reading draws. The default `'break'` does not assert a missing reading is zero. */
  readonly gaps = input<ChartGaps>('break');

  /** How the line joins its readings. `'linear'` asserts nothing between readings; a curve does. */
  readonly curve = input<ChartCurve>('linear');

  /** How several series share the value axis. Stacking runs per axis. */
  readonly stack = input<LineChartStack>('none');

  /** Names the first axis's unit beside it. */
  readonly yAxisLabel = input<string | null>(null);

  /** `yAxisLabel` for the second axis. */
  readonly secondaryAxisLabel = input<string | null>(null);

  /** How many value-axis ticks to aim for; ticks snap to a round step. */
  readonly tickCount = input(LINE_CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`,
   *  then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Pins the primary value axis maximum so separate renders are comparable; `maxSecondary` pins
   *  the second. Null keeps the derived axis. A maximum below the data does not clip it. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the secondary value axis. See `max`. */
  readonly maxSecondary = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  readonly dataTableResolved = this.defaults.dataTable;

  protected readonly resolvedSeries = computed<readonly ResolvedSeries[]>(
    () => {
      const categoryCount = this.categories().length;
      const gaps = this.gaps();

      const patterns = this.patterns();

      return this.series().map((series, index) => {
        const slot = paletteIndexFor(
          series.slot,
          index,
          CHART_SERIES_COLORS.length,
        );

        return {
          series,
          values: alignSeriesValues(series.data, categoryCount, gaps),
          lowerValues: null,
          onSecondaryAxis: series.axis === 'secondary',
          color: CHART_SERIES_COLORS[slot],
          dash: patterns ? SERIES_DASH_ARRAYS[slot] : null,
        };
      });
    },
  );

  /** Ids of the series the legend has switched off. */
  readonly hiddenSeries = model<readonly string[]>([]);

  /** Whether hiding a series re-scales the value axis to what is left. */
  readonly rescaleOnHide = input(false, { transform: booleanAttribute });

  /** Whether the legend switches series off. Off leaves it a plain key. */
  readonly legendFilters = input(false, { transform: booleanAttribute });

  /** What a legend control does. `'isolate'` shows one series and hides the rest (radios);
   *  `'toggle'` hides one and leaves the rest (checkboxes). */
  readonly legendMode = input<'toggle' | 'isolate'>('isolate');

  /** Shown in place of the plot once the legend has switched every series off. Unset falls back to
   *  `DS_INTL.chart.noVisibleSeries`. */
  readonly noVisibleSeriesText = input<string | null>(null);

  readonly noVisibleSeriesTextResolved = computed(
    () => this.noVisibleSeriesText() ?? this.intl().chart.noVisibleSeries,
  );

  /** Gives every series a dash pattern, so lines differ by shape as well as colour. */
  readonly patterns = input(false, { transform: booleanAttribute });

  /** Lets a press dragged across categories select them: a band, the sum and mean of every reading in
   *  it, and the readings outside faded. Escape or a press outside clears it. Off by default. */
  readonly selectRange = input(false, { transform: booleanAttribute });

  /** On the hovered reading, thickens the stretch from the reading before it in the rising or falling
   *  colour and prints the change in percent; with several series, for the one singled out. */
  readonly showChange = input(false, { transform: booleanAttribute });

  /** Milliseconds between one series' entrance and the next; `0` turns it off. The step narrows
   *  so the last series still starts within the stagger budget. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  protected readonly highlightedSeries = signal<string | null>(null);

  /** Every series with its band's span, stacked per axis. Hiding a series does not re-pile the
   *  rest. A `null` stays a hole and adds nothing to the pile. */
  protected readonly stackedSeries = computed<readonly ResolvedSeries[]>(() => {
    const mode = this.stack();
    const entries = this.resolvedSeries();
    if (mode === 'none') {
      return entries;
    }

    const spans = new Map<ResolvedSeries, { from: number; to: number }[]>();
    for (const secondary of [false, true]) {
      const onThisAxis = entries.filter(
        (entry) => entry.onSecondaryAxis === secondary,
      );
      const offsets = stackOffsets(
        onThisAxis.map((entry) => entry.values.map((value) => value ?? 0)),
        mode,
      );
      onThisAxis.forEach((entry, index) =>
        spans.set(entry, [...offsets[index]]),
      );
    }

    return entries.map((entry) => {
      const span = spans.get(entry);
      if (!span) {
        return entry;
      }

      return {
        ...entry,
        values: entry.values.map((value, category) =>
          value === null ? null : span[category].to,
        ),
        lowerValues: entry.values.map((value, category) =>
          value === null ? null : span[category].from,
        ),
      };
    });
  });

  protected readonly visibleSeries = computed<readonly ResolvedSeries[]>(() => {
    const hidden = this.hiddenSeries();

    return this.stackedSeries().filter(
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

  /** A normalized stack draws shares, so the axis prints percentages; tooltip and table values stay
   *  the reading. */
  protected readonly axisFormat = computed<ChartValueFormat>(() =>
    this.stack() === 'normalized'
      ? (value: number) => formatPercent(value, 1, this.defaults.locale)
      : this.valueFormatResolved(),
  );

  private readonly axisTint = computed(() => {
    if (!this.hasSecondaryAxis() || this.yAxisMode() === 'split') {
      return { primary: null, secondary: null };
    }
    const find = (onSecondaryAxis: boolean) =>
      this.visibleSeries().find(
        (entry) => entry.onSecondaryAxis === onSecondaryAxis,
      )?.color ?? null;

    return { primary: find(false), secondary: find(true) };
  });

  protected readonly primaryAxisFill = computed(() => this.axisTint().primary);

  protected readonly secondaryAxisFill = computed(
    () => this.axisTint().secondary,
  );

  protected readonly stacksSeries = computed(() => this.stack() !== 'none');

  protected readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  /** Whether the plot opens a tooltip, and for what. `'axis'` names every series at the category
   *  under the pointer; `'item'` names only the marker itself. */
  readonly tooltip = input<ChartTooltipTrigger>('axis');

  // The category cursor is the one hover area over the plot and names every series, so a
  // marker-only or silent tooltip needs it off.
  protected readonly plotCursor = computed(() =>
    this.tooltip() === 'axis' ? 'category' : 'none',
  );

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  /** Where the tooltip anchors while `tooltip` is `'axis'` (default); with `'item'` the panel
   *  hangs on the marker and this does nothing. `'reading'` (default) is the highest reading in the
   *  category, so the panel stays put within one band; `'pointer'` follows the cursor. */
  readonly tooltipAnchor = input<'reading' | 'pointer'>('reading');

  protected readonly dataTableColumns = computed<readonly string[]>(() => [
    this.intl().chart.categoryColumn,
    ...this.resolvedSeries().map((entry) => entry.series.label),
  ]);

  protected readonly dataTableRows = computed<readonly ChartDataRow[]>(() =>
    this.tableRows().map((row) => ({
      key: row.category,
      cells: [row.category, ...row.cells],
    })),
  );

  protected readonly tableRows = computed(() => {
    const format = this.valueFormatResolved();

    return this.categories().map((category, index) => ({
      category,
      cells: this.resolvedSeries().map((entry) => {
        const value = entry.values[index];

        return value === null || value === undefined
          ? '—'
          : format(value, 'tooltip');
      }),
    }));
  });

  protected readonly accessibleName = computed(() => {
    const summary = this.summary();
    if (summary !== null) {
      return summary;
    }

    const words = this.intl().chart;
    const title = this.caption() ?? words.title;
    const format = (value: number) =>
      this.valueFormatResolved()(value, 'tooltip');
    const categories = this.categories();
    const sentences = this.resolvedSeries().map((entry) =>
      describeSeries(
        words,
        entry.series.label,
        entry.values.flatMap((value, index) =>
          value === null ? [] : [{ label: categories[index] ?? '', value }],
        ),
        format,
        false,
      ),
    );
    const pointer =
      this.dataTableResolved() === 'none' ? '' : ` ${words.tableFollows}`;
    // Annotation text sits inside an `aria-hidden` svg, so it reaches assistive tech only through the name.
    const notes = this.markAnnotations().map((note) => note.label);
    const noted = notes.length ? ` ${words.noted(notes)}` : '';

    return sentences.length === 0
      ? describeSeries(
          words,
          title,
          [],
          format,
          this.dataTableResolved() !== 'none',
        )
      : `${title}. ${sentences.join(' ')}${noted}${pointer}`;
  });

  private readonly plot = viewChild(ChartComponent);

  protected readonly pinnedCategory = computed(
    () => this.plot()?.cursorPinned() ?? false,
  );

  protected releaseCategoryPin(): void {
    this.plot()?.releaseCursor();
  }

  // Hidden series stay drawn, flagged, so a line erases itself instead of vanishing.
  protected readonly markSeries = computed<readonly LineSeriesData[]>(() => {
    const hidden = this.hiddenSeries();

    return this.stackedSeries().map((entry) => ({
      id: entry.series.id,
      label: entry.series.label,
      data: entry.values,
      axis: entry.onSecondaryAxis
        ? ('secondary' as const)
        : ('primary' as const),
      area: entry.series.area,
      lower: entry.lowerValues ?? undefined,
      color: entry.color,
      hidden: hidden.includes(entry.series.id),
    }));
  });

  protected readonly dashPatterns = computed<readonly string[]>(() =>
    this.stackedSeries().map((entry) => entry.dash ?? ''),
  );

  protected readonly markAnnotations = computed<readonly ChartAnnotation[]>(
    () =>
      this.annotations().flatMap((annotation) => {
        const visible = this.visibleSeries();
        const entry = annotation.seriesId
          ? visible.find(
              (candidate) => candidate.series.id === annotation.seriesId,
            )
          : visible[0];
        const value = entry?.values[annotation.categoryIndex];
        if (!entry || typeof value !== 'number') {
          return [];
        }

        return [
          {
            categoryIndex: annotation.categoryIndex,
            value,
            label: annotation.label,
            axis: entry.onSecondaryAxis
              ? ('secondary' as const)
              : ('primary' as const),
          },
        ];
      }),
  );

  protected readonly hasSecondaryAxis = computed(() =>
    this.visibleSeries().some((entry) => entry.onSecondaryAxis),
  );

  /** The ceiling handed to the container, which only raises its domain to it. Unless `rescaleOnHide`,
   *  it spans every series, so hiding one does not move the gridlines. */
  protected readonly axisMax = computed(() =>
    this.rescaleOnHide() ? this.max() : this.ceilingOf(false, this.max()),
  );

  protected readonly axisMaxSecondary = computed(() =>
    this.rescaleOnHide()
      ? this.maxSecondary()
      : this.ceilingOf(true, this.maxSecondary()),
  );

  private ceilingOf(onSecondaryAxis: boolean, asked: number | null): number {
    const derived = domainMaxOf(
      this.stackedSeries()
        .filter((entry) => entry.onSecondaryAxis === onSecondaryAxis)
        .map((entry) => entry.values),
    );

    return asked !== null && Number.isFinite(asked) && asked > derived
      ? asked
      : derived;
  }

  protected readonly plotHeight = readOnHostResize(
    inject<ElementRef<HTMLElement>>(ElementRef),
    readPlotHeight,
    DEFAULT_PLOT_HEIGHT,
    Object.is,
  );

  protected readonly viewHeightPx = computed(
    () => `${chartViewHeight(this.plotHeight(), CHART_DEFAULT_VALUE_SPACE)}px`,
  );

  protected onPointClicked(reading: {
    series: LineSeriesData;
    categoryIndex: number;
    value: number;
  }): void {
    const series = this.series().find(
      (candidate) => candidate.id === reading.series.id,
    );
    if (!series) {
      return;
    }
    this.pointClicked.emit({
      series,
      categoryIndex: reading.categoryIndex,
      category: this.categories()[reading.categoryIndex] ?? '',
      value: reading.value,
    });
  }

  protected readonly isEmpty = computed(
    () => this.series().length === 0 || this.categories().length === 0,
  );

  protected readonly showLegend = computed(() => this.series().length > 1);

  protected readonly noVisibleSeries = computed(
    () => this.series().length > 0 && this.visibleSeries().length === 0,
  );

  protected readonly skeletonPoints = computed(
    () => this.categories().length || 7,
  );

  protected readonly skeletonValueSpace = CHART_DEFAULT_VALUE_SPACE;
  /** `--ds-line-chart-placeholder-height` sizes the whole skeleton; the plot takes what the labels leave. */
  protected readonly skeletonPlotHeight = `calc(var(--_line-chart-skeleton-height) - ${CHART_DEFAULT_VALUE_SPACE + CHART_SKELETON_CATEGORY_BAND}px)`;
  protected readonly skeletonAxisGutter = CHART_DEFAULT_AXIS_GUTTER;

  protected readonly skeletonSeries = computed(() =>
    Array.from({ length: Math.max(this.series().length, 3) }),
  );
}
