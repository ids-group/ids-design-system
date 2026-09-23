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

/** Matches `--ds-line-chart-plot-height`, for the frame before the first style read and for SSR. */
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
  /** Where this series' band starts on the value axis, one entry per category. `null` while the
   *  chart is unstacked, where every band starts at the baseline. */
  readonly lowerValues: readonly (number | null)[] | null;
  readonly onSecondaryAxis: boolean;
  readonly color: string;
  /** `null` while `patterns` is off, which is what keeps a solid line solid. */
  readonly dash: string | null;
}

// One dash per palette slot, in the same order the colours are. Slot 1 stays solid so a
// single-series chart is unchanged by turning patterns on.
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
})
export class LineChartComponent {
  /** X labels. Every series' `data` is read against this length. */
  readonly categories = input.required<readonly string[]>();

  /** One line per entry. Every series is read against `categories`, so a series longer than it
   *  loses its tail and a shorter one ends early. */
  readonly series = input.required<readonly LineChartSeries[]>();

  /** How a secondary axis relates to the primary one. */
  readonly yAxisMode = input<ChartAxisMode>('aligned');

  /** Draws a dot at every reading. Off, the dots appear on hover and on focus only. */
  readonly showMarkers = input(true, { transform: booleanAttribute });

  /** Labels pinned over their readings, for the points that have to read without a pointer. They
   *  are drawn, not announced: the data table already carries every reading, and repeating one in
   *  the plot makes a screen reader say it twice. */
  readonly annotations = input<readonly LineChartAnnotation[]>([]);

  /** Makes every reading focusable and clickable. A series drawn without markers grows invisible
   *  ones so there is something to land on; they appear on hover and on focus.
   *
   *  The click output fires whether or not this is set, so a consumer that binds the output and
   *  forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The point that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly pointClicked = output<LineChartReading>();

  /** Holds the crosshair and its tooltip on the category that was clicked, until Escape or a
   *  press outside releases it. Off by default: a click is already the drill-down hook, and a
   *  crosshair left standing after the pointer has gone needs a reader who knows why. `pointClicked`
   *  fires either way — pinning is a state, not a handler. */
  readonly pinOnClick = input(false, { transform: booleanAttribute });

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** What a `null` reading draws. The default refuses to assert that a missing
   *  reading is a zero. */
  readonly gaps = input<ChartGaps>('break');

  /** How the line joins its readings. `'linear'` by default, which asserts nothing the data does
   *  not say; a curve is a claim about what happened BETWEEN two readings. */
  readonly curve = input<ChartCurve>('linear');

  /** How several series share the value axis. Stacking runs per AXIS, so a series on the secondary
   *  axis never piles onto one measured against the primary. */
  readonly stack = input<LineChartStack>('none');

  /** Names the first axis's unit beside it. On a plot carrying two scales the colour says which
   *  line reads which axis and this says what the numbers ARE - and a reader who has neither is
   *  left comparing two quantities that may not be comparable at all. */
  readonly yAxisLabel = input<string | null>(null);

  /** `yAxisLabel` for the second axis. */
  readonly secondaryAxisLabel = input<string | null>(null);

  /** How many value-axis ticks to aim for. A hint, not a count: ticks snap to a round step, so
   *  the axis may carry one more or one fewer. */
  readonly tickCount = input(LINE_CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it;
   *  `'none'` leaves the chart bare, for one placed inside a card the page has already drawn.
   *  Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards
   *  is one decision per app rather than per plot. */
  readonly frame = input<ChartFrame | null>(null);

  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. Zero, the
   *  default, takes it away at once: a panel that outlives the pointer sits over the plot the
   *  reader has moved on to.
   *
   *  Raise it only for a panel a reader has to REACH — one carrying a link, a figure, or anything
   *  selectable — which is WCAG 1.4.13's hoverable clause. The panel is portaled to the body, so
   *  crossing the gap to it at an ordinary pointer speed needs about 140. Unset falls back to
   *  `DS_CONFIG.chart.tooltipLingerMs`, then 0. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  /** Printed above the plot as the chart's visible title, and reused as the annex table's
   *  caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so
   *  `'none'` belongs only where the same data is already in a table on the page.
   *  Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Pins the value axis instead of deriving it from the data. A panel opened one subject at a
   *  time — one agent, one microsite — derives a different axis for each of them, so two plots with
   *  the same gentle wiggle can be four times apart in value and nothing on screen says so. A fixed
   *  maximum is what makes two renders comparable.
   *
   *  Null, the default, keeps the derived axis. Applies to the primary axis; `maxSecondary` pins
   *  the second one where a series sets `axis: 'secondary'`. A maximum below the data does not clip
   *  it — the larger of the two wins, because silently hiding a reading is worse than a taller axis
   *  than you asked for. */
  readonly max = input<number | null>(null);

  /** Pins the secondary value axis. See `max`. */
  readonly maxSecondary = input<number | null>(null);

  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize
   *  when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_CONFIG.chart.emptyText`, then `'No data'`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`,
   *  because "the request failed" and "there is nothing to show" read the same to a reader and
   *  mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_CONFIG.chart.errorText`, then
   *  `'Could not load the data'`. */
  readonly errorText = input<string | null>(null);
  /** Formats every value the chart prints, the annex table and the generated description
   *  included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then the browser's locale
   *  grouping with a K/M/B suffix past four digits. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  private readonly defaults = resolveChartDefaults(this);
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

  /** Ids of the series the legend has switched off. Two-way, so a page can drive it from a URL
   *  parameter and read back what the reader chose. */
  readonly hiddenSeries = model<readonly string[]>([]);

  /** Whether hiding a series re-scales the value axis to what is left. Default `false`: a silent
   *  rescale turns a period-over-period comparison into a different claim, and a comparison
   *  dashboard is the common case. */
  readonly rescaleOnHide = input(false, { transform: booleanAttribute });

  /** Whether the legend switches series off. Off leaves it a plain key. */
  readonly legendFilters = input(false, { transform: booleanAttribute });

  /** What a legend control does. `'isolate'` shows one series and hides the rest — one action to
   *  answer "show me only this" rather than one per series. `'toggle'` hides one and leaves the
   *  rest, for taking a dominant series out so the others can be read at a usable scale.
   *  Forwarded to `ds-chart-legend`, which renders radios for the first and checkboxes for the
   *  second. */
  readonly legendMode = input<'toggle' | 'isolate'>('isolate');

  /** Shown in place of the plot once the legend has switched every series off. Without it the
   *  reader is left with an empty grid and nothing saying why. */
  readonly noVisibleSeriesText = input<string>('All series are hidden');

  /** Gives every series a dash pattern of its own, so the lines are told apart by shape as well
   *  as by colour — WCAG technique G111. Off by default: the shipped palette clears the
   *  colour-blind separation threshold on its own, so the patterns are for monochrome print, for a
   *  retuned palette, and for a reader who asks for them. */
  readonly patterns = input(false, { transform: booleanAttribute });

  /** Milliseconds between one series' entrance and the next. `0`, the default, is no stagger at
   *  all; `40` is the documented non-zero step. The total is capped, so a long list of series does
   *  not crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  protected readonly highlightedSeries = signal<string | null>(null);

  /** Every series with its band's own span, stacked per axis. Hiding a series does NOT re-pile the
   *  rest, for the same reason `rescaleOnHide` defaults off: switching one off must not move the
   *  ones still drawn. A `null` stays a hole in the line and contributes nothing to the pile. */
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

  /** A normalized stack draws shares, not readings, so the axis has to say so - the value a tooltip
   *  or the annex table prints stays the reading, which is what `valueFormat` goes on formatting. */
  protected readonly axisFormat = computed<ChartValueFormat>(() =>
    this.stack() === 'normalized'
      ? (value: number) => formatPercent(value, 1)
      : this.valueFormatResolved(),
  );

  /** Each axis takes the colour of the series measured against it, but only where two scales share
   *  one plot: on a single-scale chart it would restate the marks' own colour in the furniture,
   *  and under `'split'` the two plots are already apart. The chart knows its own series colours,
   *  so this is derived rather than asked for. */
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

  /** Whether the plot opens a tooltip, and for what. `'axis'` names every series at the
   *  category under the pointer, which is the reading a multi-series line is compared on;
   *  `'item'` names only the marker itself. */
  readonly tooltip = input<ChartTooltipTrigger>('axis');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  /** Where the tooltip is pinned. `'point'`, the default, is the highest reading in the category,
   *  so the panel stays put while the pointer moves within one band. `'pointer'` follows the
   *  cursor. */
  readonly tooltipAnchor = input<'point' | 'pointer'>('point');

  protected readonly dataTableColumns = computed<readonly string[]>(() => [
    'Category',
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

    const title = this.caption() ?? 'Chart';
    const format = (value: number) =>
      this.valueFormatResolved()(value, 'tooltip');
    const categories = this.categories();
    // The pointer belongs to the WHOLE chart, not to each series, or a two-series plot promises
    // the table twice.
    const sentences = this.resolvedSeries().map((entry) =>
      describeSeries(
        entry.series.label,
        entry.values.flatMap((value, index) =>
          value === null ? [] : [{ label: categories[index] ?? '', value }],
        ),
        format,
        false,
      ),
    );
    const pointer =
      this.dataTableResolved() === 'none'
        ? ''
        : ' Full values in the table below.';
    // The plot's own text is inside an `aria-hidden` svg, so an annotation a sighted reader takes
    // as the point of the chart would otherwise reach nobody else.
    const notes = this.markAnnotations().map((note) => note.label);
    const noted = notes.length ? ` Noted: ${notes.join('; ')}.` : '';

    return sentences.length === 0
      ? describeSeries(title, [], format, this.dataTableResolved() !== 'none')
      : `${title}. ${sentences.join(' ')}${noted}${pointer}`;
  });

  private readonly plot = viewChild(ChartComponent);

  /** Whether the category cursor is held. Read off the container, which owns the pin now that it
   *  owns the cursor. */
  protected readonly pinnedCategory = computed(
    () => this.plot()?.cursorPinned() ?? false,
  );

  protected releaseCategoryPin(): void {
    this.plot()?.releaseCursor();
  }

  /** What the series mark draws: the stacked values, the hidden series already filtered out. */
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

  /** The reading each label names, which is what the mark needs: it draws against the scales and
   *  never sees the series list. One whose series is hidden or whose reading is missing is
   *  dropped rather than left floating over the plot. */
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

  /** The ceiling handed to the container, which raises its own domain to it and never lowers.
   *  Unless `rescaleOnHide` says otherwise it is the maximum across EVERY series, so switching
   *  one off does not move the gridlines under the ones still drawn. */
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

  /** `--ds-line-chart-plot-height` reaches an SVG coordinate space only as a number, so it is read
   *  back off the host rather than applied as CSS. */
  protected readonly plotHeight = signal(DEFAULT_PLOT_HEIGHT);

  /** Every state occupies the box the plot would have, so nothing on the page moves when the data
   *  lands, the request fails or the last series is switched off. */
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

  /** Placeholder legend rows while loading. Follows the real series count so the
   *  chart does not resize when the data lands; falls back to three when `series`
   *  is still empty. */
  protected readonly skeletonSeries = computed(() =>
    Array.from({ length: Math.max(this.series().length, 3) }),
  );
}
