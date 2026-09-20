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
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  defaultChartFormat,
  describeSeries,
  pointScale,
  focusMark,
  nextRovingIndex,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { formatPercent } from '@ids-group-ltd/ids-design-system/components';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import { stackOffsets } from '@ids-group-ltd/ids-design-system/components/chart';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
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
  bandPath,
  axisLayout,
  categoryCenters,
  categoryLabelStride,
  chartLayout,
  domainMaxOf,
  linePath,
  lineSegments,
  paletteIndexFor,
  seriesPoints,
  valueY,
} from './line-chart.math';
import type {
  LineChartAnnotation,
  LineChartAxisMode,
  LineChartCurve,
  LineChartGaps,
  LineChartStack,
  LineChartPoint,
  LineChartSeries,
} from './line-chart.types';

// Long enough to cross the gap between the plot and its panel at an ordinary pointer speed.

// View units between a reading and the label above it, and the margin inside which a label
// anchors to its own edge instead of centring. Both in the 640x320 viewBox.
const ANNOTATION_GAP = 12;
const ANNOTATION_EDGE_GUARD = 48;

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

interface PlottedSeries extends ResolvedSeries {
  readonly linePaths: readonly string[];
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
  // Escape releases a pinned category, the same key that dismisses its panel — otherwise the
  // crosshair would stand on a chart with nothing left on screen to explain why.
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '(document:keydown.escape)': 'releaseCategoryPin()',
    '(document:pointerover)': 'onPointerAnywhere($event)',
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
  readonly yAxisMode = input<LineChartAxisMode>('aligned');

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
  readonly pointClicked = output<LineChartPoint>();

  /** Holds the crosshair and its tooltip on the category that was clicked, until Escape or a
   *  press outside releases it. Off by default: a click is already the drill-down hook, and a
   *  crosshair left standing after the pointer has gone needs a reader who knows why. `pointClicked`
   *  fires either way — pinning is a state, not a handler. */
  readonly pinOnClick = input(false, { transform: booleanAttribute });

  protected readonly pinnedCategory = signal(false);

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** What a `null` reading draws. The default refuses to assert that a missing
   *  reading is a zero. */
  readonly gaps = input<LineChartGaps>('break');

  /** How the line joins its readings. `'linear'` by default, which asserts nothing the data does
   *  not say; a curve is a claim about what happened BETWEEN two readings. */
  readonly curve = input<LineChartCurve>('linear');

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

  readonly frameResolved = resolveWithConfig(
    this.frame,
    (config) => config.chart?.frame,
    'auto' as ChartFrame,
  );
  readonly dataTableResolved = resolveWithConfig(
    this.dataTable,
    (config) => config.chart?.dataTable,
    'none' as ChartDataTable,
  );
  readonly emptyTextResolved = resolveWithConfig(
    this.emptyText,
    (config) => config.chart?.emptyText,
    'No data',
  );
  readonly errorTextResolved = resolveWithConfig(
    this.errorText,
    (config) => config.chart?.errorText,
    'Could not load the data',
  );
  readonly valueFormatResolved = resolveWithConfig(
    this.valueFormat,
    (config) => config.chart?.valueFormat,
    defaultChartFormat,
  );

  protected readonly viewBox = `0 0 ${LINE_CHART_VIEW_WIDTH} ${LINE_CHART_VIEW_HEIGHT}`;

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

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

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

  protected isDimmed(seriesId: string): boolean {
    const highlighted = this.highlightedSeries();

    return this.dimOthers() && highlighted !== null && highlighted !== seriesId;
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
      : this.stackedSeries();
    const valuesOn = (secondary: boolean) =>
      entries
        .filter((entry) => entry.onSecondaryAxis === secondary)
        .map((entry) => entry.values);

    // The pin raises the axis, never lowers it: a maximum under the data would push readings off
    // the top of the plot, and a chart that hides a value is worse than one with headroom.
    const pinned = (asked: number | null, derived: number) =>
      asked !== null && Number.isFinite(asked) && asked > derived
        ? asked
        : derived;

    return axisLayout(
      pinned(this.max(), domainMaxOf(valuesOn(false))),
      this.hasSecondaryAxis()
        ? pinned(this.maxSecondary(), domainMaxOf(valuesOn(true)))
        : null,
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
    const curve = this.curve();

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
        linePaths: segments
          .map((segment) => linePath(segment, curve))
          .filter((path) => path.length > 0),
        areaPaths: entry.series.area
          ? this.areaPathsFor(
              entry,
              segments,
              axisMax,
              plot,
              centers,
              baselineY,
              curve,
            )
          : [],
        markers: segments.flat(),
      };
    });
  });

  /** A stacked series fills DOWN to the series below it, not to the baseline: the areas are drawn
   *  at `--ds-chart-area-opacity`, so painting one over another would show both through each other
   *  rather than hiding what is underneath. */
  private areaPathsFor(
    entry: ResolvedSeries,
    segments: readonly LinePoint[][],
    axisMax: number,
    plot: PlotArea,
    centers: readonly number[],
    baselineY: number,
    curve: LineChartCurve,
  ): readonly string[] {
    const lower = entry.lowerValues;
    if (lower === null) {
      return segments
        .map((segment) => areaPath(segment, baselineY, curve))
        .filter((path) => path.length > 0);
    }

    // `lowerValues` is null in exactly the categories `values` is, so both sides break in the same
    // places and the two segment lists line up index for index.
    const lowerSegments = lineSegments(
      seriesPoints(lower, axisMax, plot, centers),
    );

    return segments
      .map((segment, index) =>
        lowerSegments[index]
          ? bandPath(segment, lowerSegments[index], curve)
          : areaPath(segment, baselineY, curve),
      )
      .filter((path) => path.length > 0);
  }

  /** Annotations resolved onto the markers the plot already computed, so a label sits exactly on
   *  its reading and moves with it. One whose series is hidden or whose reading is missing has no
   *  marker and is dropped — a hidden series must not leave its label floating over the plot. */
  protected readonly placedAnnotations = computed(() => {
    const plotted = this.plottedSeries();

    return this.annotations().flatMap((annotation) => {
      const entry = annotation.seriesId
        ? plotted.find(
            (candidate) => candidate.series.id === annotation.seriesId,
          )
        : plotted[0];
      const marker = entry?.markers.find(
        (candidate) => candidate.categoryIndex === annotation.categoryIndex,
      );
      if (!entry || !marker) {
        return [];
      }

      // Anchored away from the plot edges, because a centred label at the first or last category
      // hangs half outside the viewBox and is clipped rather than merely tight.
      const anchor =
        marker.x < ANNOTATION_EDGE_GUARD
          ? 'start'
          : marker.x > LINE_CHART_VIEW_WIDTH - ANNOTATION_EDGE_GUARD
            ? 'end'
            : 'middle';

      return [
        {
          key: `${entry.series.id}:${annotation.categoryIndex}`,
          label: annotation.label,
          x: marker.x,
          // Above the reading, and below it where there is no room — a peak sits at the top of
          // the plot, which is exactly where a label clamped upward lands on its own marker.
          y:
            marker.y - ANNOTATION_GAP >= ANNOTATION_GAP
              ? marker.y - ANNOTATION_GAP
              : marker.y + ANNOTATION_GAP,
          anchor,
        },
      ];
    });
  });

  /** A normalized stack draws shares, not readings, so the axis has to say so - the value a tooltip
   *  or the annex table prints stays the reading, which is what `valueFormat` goes on formatting. */
  private readonly axisFormat = computed<ChartValueFormat>(() =>
    this.stack() === 'normalized'
      ? (value: number) => formatPercent(value, 1)
      : this.valueFormatResolved(),
  );

  /** Each axis takes the colour of the series measured against it, but only where two scales share
   *  one plot: on a single-scale chart it would restate the marks' own colour in the furniture,
   *  and under `'split'` the two plots are already apart. The chart knows its own series colours,
   *  so this is derived rather than asked for. */
  private readonly axisTint = computed(() => {
    if (!this.hasSecondaryAxis() || this.stacked()) {
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

  protected readonly axisTitleY = computed(() => {
    const plot = this.layout().primaryPlot;

    return plot.top + plot.height / 2;
  });

  protected readonly viewWidth = LINE_CHART_VIEW_WIDTH;

  protected readonly stacksSeries = computed(() => this.stack() !== 'none');

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly activeCategory = signal(-1);

  protected readonly categoryBands = computed(() =>
    pointScale(this.categories().length, this.layout().primaryPlot.width),
  );

  // The band is a slot CENTRED on its reading, so it starts half a step before it. At the two ends
  // half of that slot is outside the plot, and clamping is what keeps the band off the axis labels
  // rather than letting it hang past them.
  protected readonly activeBandX = computed(() => {
    const plot = this.layout().primaryPlot;
    const scale = this.categoryBands();
    const center = plot.left + scale.position(this.activeCategory());

    return Math.max(center - scale.step / 2, plot.left);
  });

  protected readonly activeBandWidth = computed(() => {
    const plot = this.layout().primaryPlot;
    const scale = this.categoryBands();
    const center = plot.left + scale.position(this.activeCategory());
    const start = Math.max(center - scale.step / 2, plot.left);
    const end = Math.min(center + scale.step / 2, plot.left + plot.width);

    return Math.max(end - start, 0);
  });

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
    if (this.pinnedCategory()) {
      return;
    }
    this.cancelCategoryClear();
    const category = this.categoryBands().indexAt(point.x - plot.left);
    this.activeCategory.set(category);
    this.tooltipOrigin.set(
      this.tooltipAnchor() === 'pointer'
        ? { x: event.clientX, y: event.clientY }
        : this.readingAnchor(screen, category),
    );
  }

  /** The highest reading in the category, mapped back into client pixels. Anchoring there rather
   *  than at the cursor keeps the panel still while the pointer travels within one band, and puts
   *  it over the readings it names instead of over the finger. */
  private readingAnchor(
    screen: DOMMatrix,
    category: number,
  ): ChartTooltipOrigin {
    const tops = this.plottedSeries().flatMap((entry) =>
      entry.markers
        .filter((marker) => marker.categoryIndex === category)
        .map((marker) => marker.y),
    );
    const y = tops.length ? Math.min(...tops) : this.layout().primaryPlot.top;
    const point = new DOMPoint(
      this.plotLeft() + this.categoryBands().position(category),
      y,
    ).matrixTransform(screen);

    return { x: point.x, y: point.y };
  }

  protected clearActiveCategory(): void {
    if (this.pinnedCategory()) {
      return;
    }
    // Same grace the element-mark charts get from `chartActiveMark`: the panel is portaled out of
    // the plot, so leaving the plot fires before the pointer can reach it. Clearing at once made
    // the panel unreachable, and — because the pane takes pointer events now — put the plot and the
    // panel in a loop where each closed the other.
    this.cancelCategoryClear();
    this.pendingCategoryClear = setTimeout(
      () => {
        this.pendingCategoryClear = null;
        this.activeCategory.set(-1);
        this.tooltipOrigin.set(null);
      },
      Math.max(this.tooltipLingerResolved(), 0),
    );
  }

  /** The panel is portaled to the body, so the plot never sees the pointer arrive on it. This is
   *  the other half of the grace period: reaching the panel keeps it open, and leaving the panel for
   *  anything that is not the plot starts the clear the plot can no longer start itself. */
  protected onPointerAnywhere(event: PointerEvent): void {
    if (!(event.target instanceof Element) || this.pinnedCategory()) {
      return;
    }
    if (event.target.closest('.ds-chart-tooltip-pane')) {
      this.cancelCategoryClear();

      return;
    }
    if (
      this.activeCategory() !== -1 &&
      !this.host.nativeElement.contains(event.target)
    ) {
      this.clearActiveCategory();
    }
  }

  private cancelCategoryClear(): void {
    if (this.pendingCategoryClear !== null) {
      clearTimeout(this.pendingCategoryClear);
      this.pendingCategoryClear = null;
    }
  }

  private readonly tooltipLingerResolved = resolveWithConfig(
    this.tooltipLingerMs,
    (config) => config.chart?.tooltipLingerMs,
    0,
  );

  private pendingCategoryClear: ReturnType<typeof setTimeout> | null = null;

  protected releaseCategoryPin(): void {
    this.pinnedCategory.set(false);
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

  /** Where the tooltip is pinned. `'point'`, the default, is the highest reading in the category,
   *  so the panel stays put while the pointer moves within one band. `'pointer'` follows the
   *  cursor. */
  readonly tooltipAnchor = input<'point' | 'pointer'>('point');

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
      const format = this.valueFormatResolved();
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
            formatted: format(value, 'tooltip'),
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

  /** Where the crosshair stops. Under `'split'` the two plots sit one above the other over one
   *  category axis, so a crosshair that ends at the upper plot's baseline leaves the lower plot —
   *  the same category, the same pointer — with nothing marked at all. */
  protected readonly cursorBottomY = computed(() =>
    this.stacked() ? this.secondaryBaselineY() : this.primaryBaselineY(),
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
    const notes = this.placedAnnotations().map((note) => note.label);
    const noted = notes.length ? ` Noted: ${notes.join('; ')}.` : '';

    return sentences.length === 0
      ? describeSeries(title, [], format, this.dataTableResolved() !== 'none')
      : `${title}. ${sentences.join(' ')}${noted}${pointer}`;
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

    return `${entry.series.label}, ${point.category}, ${this.valueFormatResolved()(marker.value, 'tooltip')}`;
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
    this.onMarkerClick(entry, marker);
  }

  /** The pin hangs off the MARKER, not off the plot: the marker is already focusable and already
   *  answers Enter and Space, so the keyboard gets the pin for free. A click handler on the plot
   *  would have no keyboard route at all. A second activation of the pinned category releases it. */
  protected onMarkerClick(entry: PlottedSeries, marker: LinePoint): void {
    this.pointClicked.emit(this.pointOf(entry, marker));
    if (this.pinOnClick()) {
      this.pinnedCategory.set(!this.pinnedCategory());
    }
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
    const format = this.axisFormat();

    return ticks.map((value) => ({
      y: valueY(value, axisMax, plot),
      label: format(value, 'tick'),
    }));
  }
}
