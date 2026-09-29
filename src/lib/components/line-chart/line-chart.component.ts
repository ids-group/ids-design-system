import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
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
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
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
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
  ChartAxisMode,
  ChartGaps,
  ChartCurve,
} from '@ids-group-ltd/ids-design-system/core';
import { ChartLegendComponent } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type { ChartLegendItem } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';
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

// One dash per palette slot; slot 1 stays solid so a single-series chart is unchanged by patterns.
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
    ChartComponent,
    LineSeriesComponent,
    SeriesAnnotationComponent,
    ChartLegendComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '[style.--_line-chart-view-height]': 'viewHeightPx()',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: CHART_RENDER_GATE_PASSED, useValue: true }],
})
export class LineChartComponent {
  protected readonly renderReady = chartRenderGate();

  /** X labels. Every series' `data` is read against this length. */
  readonly categories = input.required<readonly string[]>();

  /** One line per entry. Every series is read against `categories`, so a series longer than it
   *  loses its tail and a shorter one ends early. */
  readonly series = input.required<readonly LineChartSeries[]>();

  /** How a secondary axis relates to the primary one. */
  readonly yAxisMode = input<ChartAxisMode>('aligned');

  /** Draws a dot at every reading. Off, the dots appear on hover and on focus only. */
  readonly showMarkers = input(true, { transform: booleanAttribute });

  /** Lays the lines and their markers on a band of the surface colour. Off where the plot holds
   *  nothing for them to cross and the band only separates them from the gridlines. */
  readonly outline = input(true, { transform: booleanAttribute });

  /** Labels pinned over their readings, for the points that have to read without a pointer. The plot
   *  draws them `aria-hidden`; their labels are appended to the accessible name instead. */
  readonly annotations = input<readonly LineChartAnnotation[]>([]);

  /** Makes every reading focusable and clickable. A series drawn without markers grows invisible
   *  ones to land on, shown on hover and focus. `pointClicked` fires whether or not this is set. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The point that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly pointClicked = output<LineChartReading>();

  /** Holds the crosshair and its tooltip on the category that was clicked, with a pin disc on it,
   *  until a second click, Escape or a press outside releases it. Unset falls back to
   *  `DS_CONFIG.chart.pinOnClick`, then `true`. `pointClicked` fires either way - pinning is a
   *  state, not a handler. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  /** Dims every OTHER mark while one is hovered or focused. Off by default: it costs the separation
   *  between the dimmed marks (worst pair of three series: dE 14.8 to 2.1 at the default
   *  `--ds-chart-dim-opacity` 0.3, measured 2026-09-13). */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** What a `null` reading draws. The default `'break'` does not assert a missing reading is zero. */
  readonly gaps = input<ChartGaps>('break');

  /** How the line joins its readings. `'linear'` asserts nothing between readings; a curve does. */
  readonly curve = input<ChartCurve>('linear');

  /** How several series share the value axis. Stacking runs per axis. */
  readonly stack = input<LineChartStack>('none');

  /** Names the first axis's unit beside it. On a two-scale plot the colour says which line reads
   *  which axis and this says what the numbers are. */
  readonly yAxisLabel = input<string | null>(null);

  /** `yAxisLabel` for the second axis. */
  readonly secondaryAxisLabel = input<string | null>(null);

  /** How many value-axis ticks to aim for. A hint: ticks snap to a round step. */
  readonly tickCount = input(LINE_CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** `'auto'` draws the chart's own bordered, padded box; `'none'` leaves it bare, for a chart inside
   *  a card. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'`. */
  readonly frame = input<ChartFrame | null>(null);

  /** Whether the tooltip draws a colour dot beside each reading. Unset falls back to
   *  `DS_CONFIG.chart.tooltipSwatches`, then draws them for up to four readings. */
  readonly tooltipSwatches = input<boolean | null>(null, {
    transform: (value: unknown) =>
      value == null ? null : booleanAttribute(value),
  });

  /** Milliseconds the tooltip stays after the pointer leaves the mark, so it can glide to the next
   *  mark instead of reopening. Zero closes it at once. Unset falls back to
   *  `DS_CONFIG.chart.tooltipLingerMs`, then 500. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  /** Printed above the plot as the chart's visible title, and reused as the annex table's
   *  caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'`
   *  opens it, `'none'` renders none. It is the non-visual route to the numbers, so use `'none'`
   *  only where the data is already in a table on the page. Unset falls back to
   *  `DS_CONFIG.chart.dataTable`, then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Pins the value axis maximum so separate renders are comparable. Null keeps the derived axis.
   *  Applies to the primary axis; `maxSecondary` pins the second. A maximum below the data does not
   *  clip it: the larger of the two wins. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the secondary value axis. See `max`. */
  readonly maxSecondary = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Draws skeleton marks in place of the data, at the same count. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `series` or `categories` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Distinct from `loading` and from an empty chart. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);
  /** Formats every value the chart prints, the annex table and the generated description
   *  included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` /
   *  `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  private readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

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

  /** Ids of the series the legend has switched off. Two-way, so a page can drive and read it. */
  readonly hiddenSeries = model<readonly string[]>([]);

  /** Whether hiding a series re-scales the value axis to what is left. Off by default: a silent
   *  rescale changes what a period-over-period comparison claims. */
  readonly rescaleOnHide = input(false, { transform: booleanAttribute });

  /** Whether the legend switches series off. Off leaves it a plain key. */
  readonly legendFilters = input(false, { transform: booleanAttribute });

  /** What a legend control does. `'isolate'` shows one series and hides the rest; `'toggle'` hides
   *  one and leaves the rest. Forwarded to `ds-chart-legend`, which renders radios for the first and
   *  checkboxes for the second. */
  readonly legendMode = input<'toggle' | 'isolate'>('isolate');

  /** Shown in place of the plot once the legend has switched every series off. Unset falls back to
   *  `DS_INTL.chart.noVisibleSeries`. */
  readonly noVisibleSeriesText = input<string | null>(null);

  readonly noVisibleSeriesTextResolved = computed(
    () => this.noVisibleSeriesText() ?? this.intl().chart.noVisibleSeries,
  );

  /** Gives every series a dash pattern of its own, so lines differ by shape as well as colour (WCAG
   *  G111). Off by default: the shipped palette clears the colour-blind separation threshold alone;
   *  use it for monochrome print or a retuned palette. */
  readonly patterns = input(false, { transform: booleanAttribute });

  /** Milliseconds between one series' entrance and the next; `0` turns the stagger off. The step
   *  narrows so the last series still starts within the stagger budget. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  protected readonly highlightedSeries = signal<string | null>(null);

  /** Every series with its band's own span, stacked per axis. Hiding a series does not re-pile the
   *  rest, so the ones still drawn do not move. A `null` stays a hole and adds nothing to the pile. */
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

  /** Each axis takes the colour of its series, but only where two scales share one plot: not on a
   *  single-scale chart, and not under `'split'`. */
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

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  /** Where the tooltip is pinned. `'point'` (default) is the highest reading in the category, so the
   *  panel stays put within one band. `'pointer'` follows the cursor. */
  readonly tooltipAnchor = input<'point' | 'pointer'>('point');

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
    // The table pointer is added once for the chart, not per series.
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

  /** Whether the category cursor is held; the container owns the cursor and its pin. */
  protected readonly pinnedCategory = computed(
    () => this.plot()?.cursorPinned() ?? false,
  );

  protected releaseCategoryPin(): void {
    this.plot()?.releaseCursor();
  }

  protected readonly markSeries = computed<readonly LineSeriesData[]>(() =>
    this.visibleSeries().map((entry) => ({
      id: entry.series.id,
      label: entry.series.label,
      data: entry.values,
      axis: entry.onSecondaryAxis
        ? ('secondary' as const)
        : ('primary' as const),
      area: entry.series.area,
      lower: entry.lowerValues ?? undefined,
      color: entry.color,
    })),
  );

  protected readonly dashPatterns = computed<readonly string[]>(() =>
    this.visibleSeries().map((entry) => entry.dash ?? ''),
  );

  /** Resolves each label to its reading, since the mark never sees the series list. Labels whose
   *  series is hidden or reading is missing are dropped. */
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

  protected readonly markAnchor = computed(() =>
    this.tooltipAnchor() === 'pointer'
      ? ('pointer' as const)
      : ('reading' as const),
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

  /** `--ds-line-chart-plot-height` is read back off the host as a number: the plot is an SVG coordinate space. */
  protected readonly plotHeight = signal(DEFAULT_PLOT_HEIGHT);

  /** Every state occupies the plot's box, so nothing moves when the data lands. */
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

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() => {
      const parsed = Number.parseFloat(
        getComputedStyle(host.nativeElement).getPropertyValue(
          '--_line-chart-plot-height',
        ),
      );
      if (Number.isFinite(parsed) && parsed > 0) {
        this.plotHeight.set(parsed);
      }
    });
  }

  protected readonly isEmpty = computed(
    () => this.series().length === 0 || this.categories().length === 0,
  );

  protected readonly showLegend = computed(() => this.series().length > 1);

  protected readonly noVisibleSeries = computed(
    () => this.series().length > 0 && this.visibleSeries().length === 0,
  );

  /** Placeholder legend rows: the real series count, or three while `series` is empty. */
  protected readonly skeletonSeries = computed(() =>
    Array.from({ length: Math.max(this.series().length, 3) }),
  );
}
