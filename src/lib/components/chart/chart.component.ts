import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  Signal,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  TemplateRef,
  signal,
  viewChild,
} from '@angular/core';
import {
  bandScale,
  elementWidth,
  labelInterval,
  rotationWouldFit,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ChartTooltipContext } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';
import type {
  ChartAxis,
  ChartAxisMode,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  categoryAt,
  CHART_AXIS_LABEL_GAP,
  CHART_AXIS_TITLE_BAND,
  CHART_BAND_PADDING,
  CHART_CATEGORY_LABEL_OFFSET,
  CHART_DEFAULT_AXIS_GUTTER,
  CHART_DEFAULT_PLOT_HEIGHT,
  CHART_DEFAULT_TICK_COUNT,
  CHART_DEFAULT_VALUE_SPACE,
  CHART_EDGE_GUTTER,
  CHART_FALLBACK_WIDTH,
  CHART_STACKED_PLOT_GAP,
  axisDomain,
  chartPlot,
  chartViewHeight,
  secondaryAxis,
  valueScale,
} from './chart.math';
import {
  CHART_SCALES,
  type ChartPlot,
  type ChartScales,
  type ChartTooltipSource,
} from './chart-scales.token';

@Component({
  selector: 'ds-chart',
  standalone: true,
  exportAs: 'dsChart',
  imports: [SkeletonComponent, ChartTooltipDirective],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '[class.measuring]': '!settled()',
    '[style.--_chart-view-height]': "viewHeight() + 'px'",
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CHART_SCALES,
      useExisting: forwardRef(() => ChartComponent),
    },
  ],
})
export class ChartComponent implements ChartScales {
  /** The category axis. Every projected mark is positioned against this list, so its length is
   *  what decides how many bands the plot has. */
  readonly categories = input<readonly string[]>([]);

  /** How many value-axis ticks to aim for. A hint, not a count: ticks snap to a round step, so
   *  the axis may carry one more or one fewer. */
  readonly tickCount = input(CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** Pins the floor of the value axis instead of deriving it from the marks. It only ever opens
   *  the axis further: a floor above the data would push readings off the plot. */
  readonly min = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the ceiling of the value axis. See `min`. Two charts drawn one subject at a time are
   *  only comparable when both are pinned. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Draws a band and a crosshair down the category under the pointer, and reports that category
   *  to every mark through `activeIndex`. `'none'`, the default, leaves the plot alone: a chart
   *  whose marks are the hover targets already answers per mark, and two affordances on one plot
   *  read as two different questions. */
  readonly cursor = input<'none' | 'category'>('none');

  /** Whether a press holds the category cursor where it is, so the reader can look away from the
   *  plot with the comparison still on screen. Released by pressing it again, by Escape, or by a
   *  press outside the plot. */
  readonly cursorPin = input(false, { transform: booleanAttribute });

  /** Milliseconds the cursor survives the pointer leaving the plot. The tooltip panel is portaled
   *  out of the plot, so without a grace period it closes before the pointer can reach it. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the ceiling of the SECOND value axis, the way `max` pins the first. Two plots read
   *  against each other need both pinned, or the second rescales under them. */
  readonly maxSecondary = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Height of the plot itself, in CSS pixels, axis labels and value headroom excluded. Real
   *  pixels rather than a share of the width: one viewBox unit is one pixel, so a card that
   *  widens spreads the categories further apart and leaves the plot exactly this tall. */
  readonly plotHeight = input(CHART_DEFAULT_PLOT_HEIGHT, {
    transform: numberAttribute,
  });

  /** Width in CSS pixels of the gutter down the left that carries the value-axis labels. Widen it
   *  for long tick labels; the plot takes whatever is left. */
  readonly axisGutter = input(CHART_DEFAULT_AXIS_GUTTER, {
    transform: numberAttribute,
  });

  /** Pixels reserved for a value label at each end of the plot: above the top tick for a mark at
   *  the ceiling, and below the baseline for a negative mark, whose label would otherwise print
   *  over the category labels. Reserved whether or not a mark draws one, because a chart that
   *  gains a label on one value must not change height. */
  readonly valueSpace = input(CHART_DEFAULT_VALUE_SPACE, {
    transform: numberAttribute,
  });

  /** Printed above the plot as the chart's visible title. */
  readonly caption = input<string | null>(null);

  /** Whether the projected marks answer to the pointer and the keyboard. The container draws no
   *  marks of its own and only reads this for the plot's role: a group of controls to step
   *  through, against a single image to be described. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Accessible name for the plot. The container holds no readings of its own, so a chart that
   *  needs its numbers described supplies the sentence here - `describeSeries` is what the five
   *  presets build it with. It is the whole label in the static case, where nothing else is
   *  reachable. */
  readonly summary = input<string | null>(null);

  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it;
   *  `'none'` leaves it bare, for one placed inside a card the page has already drawn. Unset
   *  falls back to `DS_CONFIG.chart.frame`, then `'auto'`. */
  readonly frame = input<ChartFrame | null>(null);

  /** Draws a placeholder in place of the plot, at the plot's own height, so the page does not
   *  resize when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shown in place of the plot when `categories` is empty. Unset falls back to
   *  `DS_CONFIG.chart.emptyText`, then `'No data'`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty
   *  `categories`, because "the request failed" and "there is nothing to show" read the same to a
   *  reader and mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_CONFIG.chart.errorText`, then
   *  `'Could not load the data'`. */
  readonly errorText = input<string | null>(null);

  /** Formats the value-axis ticks. Unset falls back to `DS_CONFIG.chart.valueFormat`, then the
   *  browser's locale grouping with a K/M/B suffix past four digits. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** How the second value axis relates to the first, once a mark has reported against it. The
   *  same four words `ds-line-chart` takes. */
  readonly secondaryAxisMode = input<ChartAxisMode>('aligned');

  /** Paints the first axis's tick labels in the colour of the marks measured against it. A
   *  two-scale plot is ambiguous without it - nothing on the canvas says which of two lines is
   *  read against which set of numbers - and it is the author, not the container, who knows which
   *  colour an axis belongs to, because several marks can share one. */
  readonly axisColor = input<string | null>(null);

  /** `axisColor` for the second axis. */
  readonly secondaryAxisColor = input<string | null>(null);

  /** Names the first axis's unit beside it. On a two-scale plot the colour says which line reads
   *  which axis and this says what the numbers ARE - a reader who has neither is left comparing
   *  two quantities that may not be comparable at all. */
  readonly axisLabel = input<string | null>(null);

  /** `axisLabel` for the second axis. */
  readonly secondaryAxisLabel = input<string | null>(null);

  private readonly defaults = resolveChartDefaults(this);
  readonly frameResolved = this.defaults.frame;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  /** The `<svg>`'s own rendered width: `:host(.framed)` carries the frame padding, so the host's
   *  CONTENT box - which is what a `ResizeObserver` reports - is the box the canvas fills at
   *  `inline-size: 100%`. Measuring the host is therefore measuring the canvas. */
  private readonly measuredWidth = elementWidth(this.host);

  protected readonly viewWidth = computed(
    () => this.measuredWidth() || CHART_FALLBACK_WIDTH,
  );

  /** Whether the marks may animate yet. The first frame draws at `CHART_FALLBACK_WIDTH` scaled to
   *  fit, so the measurement that follows moves every mark - and a mark that transitions its
   *  geometry would play that correction as an animated slide on every load, hydration included.
   *
   *  Two frames, not one. A transition starts when the property changes in a style that also
   *  enables it, so the enabling must not land in the same style recalculation as the correction.
   *  One `requestAnimationFrame` is not enough: scheduled from the change detection that writes
   *  the corrected geometry, it runs at the START of the next frame, still before that geometry
   *  has been through a recalculation. Measured with one frame: `transitionrun` on `x` and
   *  `width`, both marks, on the same tick the class cleared. */
  protected readonly settled = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (this.settled() || this.measuredWidth() === 0) {
        return;
      }
      let first = 0;
      let second = 0;
      // Outside the zone: under zone.js each frame callback is a full application tick, two per
      // chart, and the signal write schedules the one render this needs by itself.
      this.zone.runOutsideAngular(() => {
        first = requestAnimationFrame(() => {
          second = requestAnimationFrame(() => this.settled.set(true));
        });
      });
      onCleanup(() => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      });
    });

    // The read phase, so every `getComputedTextLength` lands in one batch before any write:
    // interleaving them forces a synchronous layout per label. It re-measures when a label's text
    // changes, and only then - not when a resize merely moves the labels.
    afterRenderEffect({
      read: () => {
        this.labelTexts();
        this.measuredLabelWidth.set(this.widestLabel('.axis-label.is-primary'));
        this.measuredSecondaryLabelWidth.set(
          this.widestLabel('.axis-label.is-secondary'),
        );
        this.measuredCategoryLabelWidth.set(
          this.widestLabel('.category-label'),
        );
      },
    });
  }

  private widestLabel(selector: string): number {
    const labels =
      this.host.nativeElement.querySelectorAll<SVGTextElement>(selector);
    let widest = 0;
    for (const label of labels) {
      widest = Math.max(widest, label.getComputedTextLength());
    }

    return Math.ceil(widest);
  }

  /** Two plots, one above the other, sharing the category axis: the only mode whose second axis
   *  is a second PLOT rather than a second scale over the first. */
  protected readonly stacked = computed(
    () => this.secondaryAxisMode() === 'split' && this.hasSecondaryAxis(),
  );

  protected readonly viewHeight = computed(
    () =>
      chartViewHeight(
        this.plotHeight(),
        this.valueSpace(),
        this.reachesBelowZero(),
      ) + (this.stacked() ? this.plotHeight() + CHART_STACKED_PLOT_GAP : 0),
  );

  /** One viewBox unit is one CSS pixel, in both axes. That is the whole point of measuring: a
   *  radius, a gutter or a width cap set anywhere inside the plot is then the length it says it
   *  is, at every card width, instead of a share of one that a fixed viewBox stretches. */
  protected readonly viewBox = computed(
    () => `0 0 ${this.viewWidth()} ${this.viewHeight()}`,
  );

  /** Widest tick label actually rendered, in the CSS pixels the canvas is drawn in. Zero until the
   *  first read, and zero under SSR, where `axisGutter` alone decides. */
  private readonly measuredLabelWidth = signal(0);

  /** The widest category label as drawn, which is what decides whether they all fit. */
  private readonly measuredCategoryLabelWidth = signal(0);

  /** `axisGutter` is the FLOOR, not the answer: a compact number is far wider in some locales than
   *  in others - `3,5 тыс.` against `3.5k` - and an SVG canvas CLIPS what a DOM column merely
   *  overflowed, so a fixed gutter silently eats the leading digit. The gutter takes whichever is
   *  larger, so setting the token still guarantees at least that much room.
   *
   *  This converges rather than oscillating: a tick's TEXT is decided by the domain and the tick
   *  count, neither of which the gutter feeds, so widening it moves the labels without rewriting
   *  them and the second measurement equals the first. */
  protected readonly effectiveAxisGutter = computed(() =>
    Math.max(
      this.axisGutter(),
      this.measuredLabelWidth() + CHART_AXIS_LABEL_GAP + this.axisTitleGutter(),
    ),
  );

  /** A rotated axis title stands in the same gutter as the tick labels, so the gutter has to carry
   *  both or the widest tick runs through the title. Its own width is its line height, because it
   *  is turned on its side. */
  protected readonly axisTitleGutter = computed(() =>
    this.axisLabel() ? CHART_AXIS_TITLE_BAND : 0,
  );

  /** Where a rotated axis title sits: hard against the outer edge, with the tick labels between it
   *  and the plot. */
  protected readonly axisTitleX = computed(() => CHART_AXIS_TITLE_BAND / 2);

  /** Widest secondary tick label, measured the same way and for the same reason as the primary
   *  one: those labels sit OUTSIDE the plot's right edge and an SVG canvas clips what a DOM
   *  column merely overflowed. */
  private readonly measuredSecondaryLabelWidth = signal(0);

  /** The plot gives the right-hand labels room only when they are drawn there - a stacked second
   *  axis puts both label columns down the left, so the plot keeps the full width. */
  protected readonly rightGutter = computed(() =>
    this.hasSecondaryAxis() && !this.stacked()
      ? Math.max(
          this.axisGutter(),
          this.measuredSecondaryLabelWidth() + CHART_AXIS_LABEL_GAP,
        )
      : CHART_EDGE_GUTTER,
  );

  readonly plot: Signal<ChartPlot> = computed(() =>
    chartPlot(
      this.viewWidth(),
      this.plotHeight(),
      this.effectiveAxisGutter(),
      this.valueSpace(),
      this.rightGutter(),
    ),
  );

  readonly secondaryPlot: Signal<ChartPlot> = computed(() => {
    const plot = this.plot();

    return this.stacked()
      ? { ...plot, top: plot.top + plot.height + CHART_STACKED_PLOT_GAP }
      : plot;
  });

  private readonly reportedDomains = signal<
    ReadonlyMap<
      string,
      { readonly axis: ChartAxis; readonly values: readonly number[] }
    >
  >(new Map());

  reportDomain(
    id: string,
    values: readonly number[],
    axis: ChartAxis = 'primary',
  ): void {
    this.reportedDomains.update((reported) =>
      new Map(reported).set(id, { axis, values }),
    );
  }

  private valuesOn(axis: ChartAxis): readonly (readonly number[])[] {
    const found: (readonly number[])[] = [];
    for (const report of this.reportedDomains().values()) {
      if (report.axis === axis) {
        found.push(report.values);
      }
    }

    return found;
  }

  releaseDomain(id: string): void {
    this.reportedDomains.update((reported) => {
      const next = new Map(reported);
      next.delete(id);

      return next;
    });
  }

  /** A template that replaces the panel's body, for a preset that prints more than label+value. */
  readonly tooltipTemplate = input<TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null>(null);

  /** Extra clearance between the mark and the panel, for a chart that prints a value label in
   *  the gap the panel would otherwise take. */
  readonly tooltipExtraGap = input(0, { transform: numberAttribute });

  private readonly tooltipSources = signal<
    ReadonlyMap<string, ChartTooltipSource>
  >(new Map());

  reportTooltip(id: string, source: ChartTooltipSource): void {
    this.tooltipSources.update((sources) => new Map(sources).set(id, source));
  }

  releaseTooltip(id: string): void {
    this.tooltipSources.update((sources) => {
      const next = new Map(sources);
      next.delete(id);

      return next;
    });
  }

  /** The offer to show, if any mark is making one. At most one mark has a context at a time: a
   *  per-mark tooltip only fills it while that mark is hovered, and an axis tooltip only while the
   *  category cursor is on. The container opening the panel is what stops two marks opening two. */
  private readonly activeTooltip = computed(
    () =>
      [...this.tooltipSources().values()].find(
        (source) => source.context() !== null,
      ) ?? null,
  );

  protected readonly tooltipContext = computed(() => {
    const base = this.activeTooltip()?.context() ?? null;
    if (base === null || this.cursor() !== 'category') {
      return base;
    }
    // A category panel is about the category, not about the mark that happened to open it, so
    // every other mark's reading at the same category belongs in it. Matched by label, because a
    // mark that already named itself must not be listed twice.
    const named = new Set(base.entries.map((entry) => entry.label));
    const rest = [...this.tooltipSources().values()]
      .flatMap((source) => source.axisEntries?.() ?? [])
      .filter((entry) => !named.has(entry.label));

    return rest.length === 0
      ? base
      : { ...base, entries: [...base.entries, ...rest] };
  });

  protected readonly tooltipOrigin = computed(
    () => this.activeTooltip()?.origin() ?? null,
  );

  protected readonly tooltipPreferBelow = computed(
    () =>
      (this.activeTooltip()?.preferBelow?.() ?? false) || this.cursorPinned(),
  );

  /** Compared by value, which is what stops a mark that reports AND reads `yPosition()` in one
   *  effect from running forever: every report allocates a fresh `Map` and `niceDomain` a fresh
   *  object, so identity always differs and the read would re-arm the write. Measured without it:
   *  97507 effect runs in 45 seconds, no Angular loop error, renderer unresponsive. */
  protected readonly domain = computed(
    () =>
      axisDomain(
        this.valuesOn('primary'),
        this.tickCount(),
        this.min(),
        this.max(),
      ),
    { equal: (a, b) => a.min === b.min && a.max === b.max },
  );

  // Counts VALUES, not reporters: `valuesOn` returns one entry per mark that registered, and a
  // line series registers both axes unconditionally, so an empty contribution would otherwise
  // raise a whole second axis on a plot that has one.
  readonly hasSecondaryAxis = computed(() =>
    this.valuesOn('secondary').some((values) => values.length > 0),
  );

  protected readonly secondary = computed(
    () =>
      secondaryAxis(
        this.ticks().map((tick) => tick.value),
        this.valuesOn('secondary'),
        this.tickCount(),
        this.secondaryAxisMode(),
        this.maxSecondary(),
      ),
    {
      equal: (a, b) =>
        a.aligned === b.aligned &&
        a.domain.min === b.domain.min &&
        a.domain.max === b.domain.max &&
        a.ticks.length === b.ticks.length &&
        a.ticks.every((tick, index) => tick === b.ticks[index]),
    },
  );

  readonly secondaryYPosition = computed(() => {
    if (!this.hasSecondaryAxis()) {
      return this.yPosition();
    }
    const plot = this.secondaryPlot();

    return valueScale(this.secondary().domain, plot.top, plot.height);
  });

  protected readonly secondaryTicks = computed(() => {
    if (!this.hasSecondaryAxis()) {
      return [];
    }
    const toY = this.secondaryYPosition();
    const format = this.valueFormatResolved();

    return this.secondary().ticks.map((value) => ({
      value,
      y: toY(value),
      label: format(value, 'tick'),
    }));
  });

  /** A second set of gridlines only where the two scales do NOT share rows: drawn against an
   *  aligned axis they would land on the primary's own lines and double every stroke. */
  protected readonly showSecondaryGridlines = computed(
    () =>
      this.hasSecondaryAxis() &&
      (this.stacked() || !this.secondary().aligned) &&
      this.secondaryTicks().length > 1,
  );

  protected readonly secondaryLabelX = computed(() =>
    this.stacked()
      ? this.plot().left - CHART_AXIS_LABEL_GAP
      : this.plot().left + this.plot().width + CHART_AXIS_LABEL_GAP,
  );

  protected readonly secondaryLabelAnchor = computed(() =>
    this.stacked() ? 'end' : 'start',
  );

  protected readonly secondaryPlotBottom = computed(
    () => this.secondaryPlot().top + this.secondaryPlot().height,
  );

  /** No tint on a single-scale plot: one axis needs no telling apart, and colouring it would only
   *  restate the marks' own colour in the furniture. */
  protected readonly axisLabelFill = computed(() =>
    this.hasSecondaryAxis() ? this.axisColor() : null,
  );

  protected readonly secondaryAxisLabelFill = computed(() =>
    this.secondaryAxisColor(),
  );

  private readonly bands = computed(() =>
    bandScale(this.categories().length, this.plot().width, CHART_BAND_PADDING),
  );

  readonly bandWidth = computed(() => this.bands().bandWidth);

  readonly xPosition = computed(() => {
    const plot = this.plot();
    const bands = this.bands();

    return (index: number) =>
      plot.left + bands.position(index) + bands.bandWidth / 2;
  });

  readonly yPosition = computed(() => {
    const plot = this.plot();

    return valueScale(this.domain(), plot.top, plot.height);
  });

  readonly zeroOffset = computed(() => this.yPosition()(0));

  protected readonly cursorBand = computed(() => {
    const index = this.activeIndex();
    if (this.cursor() !== 'category' || index < 0) {
      return null;
    }
    const width = this.bandWidth();
    const plot = this.plot();

    return {
      x: this.xPosition()(index) - width / 2,
      width,
      top: plot.top,
      bottom: plot.top + plot.height,
    };
  });

  /** The same state machine the element marks run on: pin, linger, the grace period that lets the
   *  pointer reach a portaled panel, Escape and press-outside. A category cursor differs from a
   *  mark only in what the index counts, so it takes the behaviour rather than restating it. */
  private readonly cursorState = chartActiveMark(() =>
    this.defaults.tooltipLingerMs(),
  );

  readonly activeIndex = this.cursorState.index;

  private readonly pointerAt = signal<{ x: number; y: number } | null>(null);

  readonly cursorPointer = computed(() =>
    this.activeIndex() < 0 ? null : this.pointerAt(),
  );

  /** Whether the cursor is held. A preset renders its own way out of the pin from this. */
  readonly cursorPinned = this.cursorState.pinned;

  releaseCursor(): void {
    this.cursorState.release();
  }

  protected onPlotPointer(event: PointerEvent): void {
    if (this.cursor() !== 'category') {
      return;
    }
    const canvas = (event.currentTarget as Element).getBoundingClientRect();
    const plot = this.plot();
    // The canvas is scaled to its box, so a client x has to come back through the viewBox before
    // it means anything to a plot measured in view units.
    const viewX =
      ((event.clientX - canvas.left) / canvas.width) * this.viewWidth();
    const index = this.clampIndex(
      categoryAt(viewX, plot.left, plot.width, this.categories().length),
    );
    this.pointerAt.set({ x: event.clientX, y: event.clientY });
    if (event.type === 'pointerdown' && this.cursorPin()) {
      this.cursorState.pin(index, event);

      return;
    }
    this.cursorState.enter(index, event);
  }

  protected clearCursor(): void {
    if (this.cursor() === 'category') {
      this.cursorState.leave();
    }
  }

  private readonly bandElement = viewChild<ElementRef<Element>>('cursorBandEl');

  readonly cursorOrigin = computed<Element | null>(() =>
    this.cursorBand() ? (this.bandElement()?.nativeElement ?? null) : null,
  );

  setActiveIndex(index: number): void {
    this.cursorState.setIndex(this.clampIndex(index));
  }

  private clampIndex(index: number): number {
    const last = this.categories().length - 1;

    return Number.isFinite(index)
      ? Math.min(Math.max(Math.trunc(index), -1), last)
      : -1;
  }

  protected readonly plotRight = computed(
    () => this.plot().left + this.plot().width,
  );
  protected readonly plotBottom = computed(
    () => this.plot().top + this.plot().height,
  );
  protected readonly axisLabelX = computed(
    () => this.plot().left - CHART_AXIS_LABEL_GAP,
  );
  /** Clears the same reservation the view height budgets, and only when it is there: adding it
   *  unconditionally would drop the labels past a viewBox that no longer holds the space. */
  protected readonly categoryLabelY = computed(
    () =>
      this.secondaryPlotBottom() +
      (this.reachesBelowZero() ? this.valueSpace() : 0) +
      CHART_CATEGORY_LABEL_OFFSET,
  );

  protected readonly ticks = computed(() => {
    const domain = this.domain();
    const toY = this.yPosition();
    const format = this.valueFormatResolved();

    return tickValues(domain.min, domain.max, this.tickCount()).map(
      (value) => ({
        value,
        y: toY(value),
        label: format(value, 'tick'),
      }),
    );
  });

  private readonly labelTexts = computed(() =>
    [
      ...this.ticks().map((tick) => tick.label),
      ...this.secondaryTicks().map((tick) => tick.label),
      ...this.categories(),
    ].join('\n'),
  );

  /** Rotation is spent before thinning: a tilt costs the reader a glance, dropping a label costs
   *  them a reading. Both are decided from the widest label as it actually rendered. */
  protected readonly categoryLabelsRotated = computed(() =>
    rotationWouldFit(
      [this.measuredCategoryLabelWidth()],
      this.plot().width / Math.max(1, this.categories().length),
    ),
  );

  private readonly categoryLabelInterval = computed(() =>
    labelInterval(
      [this.measuredCategoryLabelWidth()],
      this.plot().width / Math.max(1, this.categories().length),
      this.categoryLabelsRotated(),
    ),
  );

  protected readonly categoryLabels = computed(() => {
    const toX = this.xPosition();
    const interval = this.categoryLabelInterval();

    return (
      this.categories()
        .map((text, index) => ({ x: toX(index), text, index }))
        // The first is always drawn and the rest follow the interval, so the axis keeps an anchor
        // the reader can count from rather than an arbitrary offset into the categories.
        .filter((label) => label.index % interval === 0)
    );
  });

  protected readonly reachesBelowZero = computed(() => this.domain().min < 0);

  /** Empty is read off `categories` alone, never off the reported domains: the marks are
   *  projected INTO the branch that this decides, so a container that waited for a report before
   *  rendering them would never receive one. */
  protected readonly isEmpty = computed(() => this.categories().length === 0);

  protected readonly accessibleName = computed(
    () => this.summary() ?? this.caption() ?? 'Chart',
  );
}
