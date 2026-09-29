import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  PLATFORM_ID,
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
  chartRenderGate,
} from '@ids-group-ltd/ids-design-system/components';
import { isPlatformBrowser } from '@angular/common';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
  CHART_PIN_GAP,
  CHART_PIN_RADIUS,
  ChartPinMarkerComponent,
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ChartTooltipContext } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';
import {
  DS_INTL,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
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
  topDown,
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
  imports: [SkeletonComponent, ChartTooltipDirective, ChartPinMarkerComponent],
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
  protected readonly renderReady = chartRenderGate();

  /** The category axis; its length is the number of bands every projected mark is positioned against. */
  readonly categories = input<readonly string[]>([]);

  /** How many value-axis ticks to aim for. A hint: ticks snap to a round step, so one more or fewer may appear. */
  readonly tickCount = input(CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** Pins the floor of the value axis. It only ever opens the axis further: a floor above the data
   *  would push readings off the plot. */
  readonly min = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the ceiling of the value axis. See `min`. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Draws a band and a crosshair down the category under the pointer and reports it to every mark
   *  through `activeIndex`; with two or more tooltip-showing marks the panel names every reading at
   *  that category. `'auto'` (default) is `'category'` for such a composed plot or for a mark with
   *  `tooltip="axis"`, and `'none'` otherwise, where each mark answers for itself. */
  readonly cursor = input<'none' | 'category' | 'auto'>('auto');

  /** Whether a press holds the category cursor where it is. Released by pressing again, Escape, or a
   *  press outside the plot. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. */
  readonly cursorPin = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  readonly cursorPinResolved = resolveWithConfig(
    this.cursorPin,
    (config) => config.chart?.pinOnClick,
    true,
  );

  /** Milliseconds the cursor survives the pointer leaving the plot; the panel is portaled out, so
   *  with no grace period it closes before the pointer reaches it. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the ceiling of the second value axis, as `max` does the first. */
  readonly maxSecondary = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Height of the plot itself, in CSS pixels, axis labels and value headroom excluded; it does not
   *  scale with the card width. */
  readonly plotHeight = input(CHART_DEFAULT_PLOT_HEIGHT, {
    transform: numberAttribute,
  });

  /** Width in CSS pixels of the gutter down the left that carries the value-axis labels. Widen it
   *  for long tick labels; the plot takes whatever is left. */
  readonly axisGutter = input(CHART_DEFAULT_AXIS_GUTTER, {
    transform: numberAttribute,
  });

  /** Pixels reserved for a value label at each end of the plot (above the top tick, below the
   *  baseline for a negative mark). Reserved whether or not a label is drawn, so the height is stable. */
  readonly valueSpace = input(CHART_DEFAULT_VALUE_SPACE, {
    transform: numberAttribute,
  });

  /** Printed above the plot as the chart's visible title. */
  readonly caption = input<string | null>(null);

  /** Whether the projected marks answer to the pointer and keyboard; sets the plot's role (a group
   *  of controls, or a single image). */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Accessible name for the plot; the container holds no readings, so a chart that needs its numbers
   *  described supplies the sentence here (presets build it with `describeSeries`). It is the whole
   *  label in the static case. */
  readonly summary = input<string | null>(null);

  /** Whether the chart draws its own bordered, padded box: `'auto'` draws it, `'none'` leaves it bare
   *  for a chart inside a card. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'`. */
  readonly frame = input<ChartFrame | null>(null);

  /** Draws a placeholder at the plot's own height in place of the plot. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shown in place of the plot when `categories` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot; separate from `loading` and from empty `categories`. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);

  /** Formats the value-axis ticks. Unset falls back to `DS_CONFIG.chart.valueFormat`, then
   *  `DS_CONFIG.locale` / `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** How the second value axis relates to the first, once a mark has reported against it. The
   *  same four words `ds-line-chart` takes. */
  readonly secondaryAxisMode = input<ChartAxisMode>('aligned');

  /** Paints the first axis's tick labels in the colour of the marks measured against it, so a
   *  two-scale plot says which line reads which axis. Set by the author: several marks can share one. */
  readonly axisColor = input<string | null>(null);

  /** `axisColor` for the second axis. */
  readonly secondaryAxisColor = input<string | null>(null);

  /** Names the first axis's unit beside it. */
  readonly axisLabel = input<string | null>(null);

  /** `axisLabel` for the second axis. */
  readonly secondaryAxisLabel = input<string | null>(null);

  private readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;
  readonly hoverDelayMs = this.defaults.hoverDelayMs;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** The `<svg>`'s rendered width. `:host(.framed)` carries the frame padding, so the host's content
   *  box (what `ResizeObserver` reports) is the box the canvas fills. */
  private readonly measuredWidth = elementWidth(this.host);

  /** Server-rendered output has no width to wait for, so it draws at the stand-in. */
  readonly measured = computed(
    () => !this.isBrowser || this.measuredWidth() > 0,
  );

  protected readonly viewWidth = computed(
    () => this.measuredWidth() || CHART_FALLBACK_WIDTH,
  );

  /** Whether the marks may animate yet. The first frame draws at `CHART_FALLBACK_WIDTH`, so the
   *  measurement that follows moves every mark and a transitioning mark would animate that
   *  correction on every load, hydration included.
   *
   *  Two frames, not one: a transition starts when a property changes in a style that also enables
   *  it. One `requestAnimationFrame` runs at the start of the next frame, before the corrected
   *  geometry has been through a style recalculation, and `transitionrun` fires on `x` and `width`. */
  protected readonly settled = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (this.settled() || this.measuredWidth() === 0) {
        return;
      }
      let first = 0;
      let second = 0;
      // Outside the zone: under zone.js each frame callback is a full application tick; the signal write schedules the one render needed.
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

    effect((onCleanup) => {
      const canvas = this.canvasElement()?.nativeElement;
      if (canvas && this.cursorResolved() === 'category') {
        onCleanup(this.listenForCursor(canvas));
      }
    });

    // Read phase: batching every `getComputedTextLength` before any write avoids a synchronous layout
    // per label. Re-measures only when a label's text changes, not when a resize moves the labels.
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

  /** Two plots stacked on a shared category axis: the only mode whose second axis is a second plot,
   *  not a second scale over the first. */
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

  /** One viewBox unit is one CSS pixel in both axes, so lengths set inside the plot hold at every
   *  card width. */
  protected readonly viewBox = computed(
    () => `0 0 ${this.viewWidth()} ${this.viewHeight()}`,
  );

  /** Widest tick label as rendered, in CSS pixels. Zero until the first read and under SSR, where
   *  `axisGutter` alone decides. */
  private readonly measuredLabelWidth = signal(0);

  private readonly measuredCategoryLabelWidth = signal(0);

  /** `axisGutter` is the floor: compact numbers are wider in some locales (`3,5 тыс.` against `3.5k`)
   *  and an SVG canvas clips the leading digit of what overflows. Takes the larger of the two.
   *
   *  Converges: tick text depends on the domain and tick count, not the gutter, so the second
   *  measurement equals the first. */
  protected readonly effectiveAxisGutter = computed(() =>
    Math.max(
      this.axisGutter(),
      this.measuredLabelWidth() + CHART_AXIS_LABEL_GAP + this.axisTitleGutter(),
    ),
  );

  /** A rotated axis title shares the tick gutter, so the gutter carries both. Its width is its line
   *  height. */
  protected readonly axisTitleGutter = computed(() =>
    this.axisLabel() ? CHART_AXIS_TITLE_BAND : 0,
  );

  protected readonly axisTitleX = computed(() => CHART_AXIS_TITLE_BAND / 2);

  protected readonly secondaryTitleX = computed(
    () => this.viewWidth() - CHART_AXIS_TITLE_BAND / 2,
  );

  /** Widest secondary tick label, measured like the primary (they sit outside the right edge and
   *  the canvas clips). */
  private readonly measuredSecondaryLabelWidth = signal(0);

  /** Right-hand label room only when drawn there; a stacked second axis puts both columns on the left. */
  protected readonly rightGutter = computed(() =>
    this.hasSecondaryAxis() && !this.stacked()
      ? Math.max(
          this.axisGutter(),
          this.measuredSecondaryLabelWidth() +
            CHART_AXIS_LABEL_GAP +
            this.secondaryTitleGutter(),
        )
      : CHART_EDGE_GUTTER,
  );

  protected readonly secondaryTitleGutter = computed(() =>
    this.secondaryAxisLabel() && this.hasSecondaryAxis()
      ? CHART_AXIS_TITLE_BAND
      : 0,
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

  /** A template that replaces the panel's body. */
  readonly tooltipTemplate = input<TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null>(null);

  /** Extra clearance between the mark and the panel, for a chart that prints a value label in that gap. */
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

  /** Two or more marks that show a tooltip: the panel is about the category, not the mark under the pointer. */
  private readonly composed = computed(
    () =>
      [...this.tooltipSources().values()].filter(
        (source) => source.offersTooltip?.() ?? true,
      ).length > 1,
  );

  private readonly readsCategory = computed(() =>
    [...this.tooltipSources().values()].some(
      (source) => source.readsCategory?.() ?? false,
    ),
  );

  protected readonly cursorResolved = computed(() => {
    const cursor = this.cursor();
    if (cursor !== 'auto') {
      return cursor;
    }

    return this.composed() || this.readsCategory() ? 'category' : 'none';
  });

  readonly cursorOn = computed(() => this.cursorResolved() === 'category');

  /** The offer to show, if any. At most one mark has a context at a time: a per-mark tooltip fills
   *  it only while hovered, an axis tooltip only while the category cursor is on. */
  private readonly activeTooltip = computed(
    () =>
      [...this.tooltipSources().values()].find(
        (source) => source.context() !== null,
      ) ?? null,
  );

  protected readonly tooltipContext = computed(() => {
    const base = this.activeTooltip()?.context() ?? null;
    const categoryIndex = this.activeIndex();
    if (this.cursorResolved() !== 'category' || categoryIndex < 0) {
      return base;
    }
    const readings = [...this.tooltipSources().values()].flatMap(
      (source) => source.axisEntries?.() ?? [],
    );
    if (base === null) {
      return readings.length === 0
        ? null
        : {
            category: this.categories()[categoryIndex] ?? '',
            entries: topDown(readings),
          };
    }
    // A mark's panel under the cursor (focus or axis tooltip) is about the category, so every other
    // mark's reading belongs in it. Matched by label: the offering mark keeps its own row and detail.
    const named = new Map(base.entries.map((entry) => [entry.label, entry]));
    if (readings.every((reading) => named.has(reading.label))) {
      return base;
    }
    const drawn = new Set(readings.map((reading) => reading.label));

    return {
      ...base,
      entries: [
        ...base.entries.filter((entry) => !drawn.has(entry.label)),
        ...topDown(readings).map(
          (reading) => named.get(reading.label) ?? reading,
        ),
      ],
    };
  });

  protected readonly tooltipOrigin = computed(() => {
    const own = this.activeTooltip()?.origin() ?? null;
    if (
      this.cursorResolved() !== 'category' ||
      (own !== null && !(own instanceof Element))
    ) {
      return own;
    }
    // Anchor over the tallest reading at the category, not the mark that opened it, or a line dipping
    // under a column puts the panel low. Every reading counts pointer-over or not, or the panel jumps
    // as the pointer crosses the column's edge.
    const boxes = [...this.tooltipSources().values()]
      .map((source) => (source.axisOrigin ?? source.origin)())
      .filter((origin): origin is Element => origin instanceof Element)
      .map((element) => ({ element, top: element.getBoundingClientRect().top }))
      .filter(({ element }) => {
        const box = element.getBoundingClientRect();

        return box.width > 0 && box.height > 0;
      });

    return boxes.length === 0
      ? (own ?? this.cursorOrigin())
      : boxes.reduce((highest, candidate) =>
          candidate.top < highest.top ? candidate : highest,
        ).element;
  });

  protected readonly tooltipPinned = computed(
    () => (this.activeTooltip()?.pinned?.() ?? false) || this.cursorPinned(),
  );

  /** Compared by value: a mark that reports and reads `yPosition()` in one effect would otherwise
   *  loop forever, since every report allocates a fresh `Map` and `niceDomain` a fresh object. */
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

  // Counts values, not reporters: a line series registers both axes unconditionally, so an empty
  // contribution would otherwise raise a second axis.
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

  /** A second set of gridlines only where the scales do not share rows; against an aligned axis they
   *  would double every stroke. */
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

  /** No tint on a single-scale plot. */
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
    if (this.cursorResolved() !== 'category' || index < 0) {
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

  /** The state machine the element marks run on (pin, linger, grace period, Escape, press-outside);
   *  a category cursor differs only in what the index counts. */
  private readonly cursorState = chartActiveMark(
    () => this.defaults.tooltipLingerMs(),
    () => this.hoverDelayMs(),
  );

  readonly activeIndex = this.cursorState.index;

  private readonly pointerAt = signal<{ x: number; y: number } | null>(null);

  // Set at once, not after the hover delay.
  private readonly pointerInBand = signal(false);

  // At the band's foot: its head is where the panel opens, over the tallest reading.
  protected bandPinY(band: { readonly bottom: number }): number {
    return band.bottom - CHART_PIN_RADIUS - CHART_PIN_GAP;
  }

  protected readonly bandPins = computed(
    () => this.cursorPinResolved() && this.pointerInBand(),
  );

  readonly cursorPointer = computed(() =>
    this.activeIndex() < 0 ? null : this.pointerAt(),
  );

  /** Whether the cursor is held. A preset renders its own way out of the pin from this. */
  readonly cursorPinned = this.cursorState.pinned;

  releaseCursor(): void {
    this.cursorState.release();
  }

  private readonly canvasElement =
    viewChild<ElementRef<SVGSVGElement>>('canvasEl');

  // Read once per hover and dropped on scroll: reading on every move forces a second layout after the band update.
  private canvasRect: DOMRect | null = null;

  private plotPointer(event: PointerEvent, canvas: SVGSVGElement): void {
    this.canvasRect ??= canvas.getBoundingClientRect();
    const plot = this.plot();
    // The canvas is scaled to its box: convert client x through the viewBox into view units.
    const viewX =
      ((event.clientX - this.canvasRect.left) / this.canvasRect.width) *
      this.viewWidth();
    // Every point belongs to its nearest category, so the cursor never passes through "none".
    const index = this.clampIndex(
      categoryAt(viewX, plot.left, plot.width, this.categories().length),
    );
    this.pointerAt.set({ x: event.clientX, y: event.clientY });
    this.pointerInBand.set(index >= 0);
    if (index < 0) {
      if (event.type === 'pointerdown' && this.cursorPinned()) {
        this.cursorState.release();
      } else {
        this.cursorState.leave();
      }

      return;
    }
    if (event.type === 'pointerdown' && this.cursorPinResolved()) {
      this.cursorState.pin(index, event);

      return;
    }
    this.cursorState.enter(index, event);
  }

  /** Listens only when a category cursor is drawn, outside the zone: the handler writes signals,
   *  which schedule the render. */
  private listenForCursor(canvas: SVGSVGElement): () => void {
    const forgetRect = (): void => {
      this.canvasRect = null;
    };
    const onPointer = (event: PointerEvent): void =>
      this.plotPointer(event, canvas);
    const onEnter = (): void =>
      window.addEventListener('scroll', forgetRect, {
        capture: true,
        passive: true,
      });
    const onLeave = (): void => {
      window.removeEventListener('scroll', forgetRect, { capture: true });
      forgetRect();
      this.pointerInBand.set(false);
      this.cursorState.leave();
    };
    this.zone.runOutsideAngular(() => {
      canvas.addEventListener('pointerenter', onEnter);
      canvas.addEventListener('pointermove', onPointer);
      canvas.addEventListener('pointerdown', onPointer);
      canvas.addEventListener('pointerleave', onLeave);
    });

    return () => {
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', forgetRect, { capture: true });
      forgetRect();
    };
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
  /** Clears the reservation the view height budgets, and only when it is there; unconditionally it
   *  would drop the labels past the viewBox. */
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

  /** Rotation is spent before thinning: a tilt costs a glance, a dropped label a reading. Both use
   *  the widest label as rendered. */
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

  private readonly labelHovered = signal<{
    readonly index: number;
    readonly event: PointerEvent;
  } | null>(null);

  readonly categoryLabelHover = this.labelHovered.asReadonly();

  protected onCategoryLabelEnter(index: number, event: PointerEvent): void {
    if (!this.cursorOn()) {
      this.labelHovered.set({ index, event });
    }
  }

  protected onCategoryLabelLeave(): void {
    this.labelHovered.set(null);
  }

  protected readonly categoryLabels = computed(() => {
    const toX = this.xPosition();
    const interval = this.categoryLabelInterval();

    return (
      this.categories()
        .map((text, index) => ({ x: toX(index), text, index }))
        // The first is always drawn, giving the reader an anchor to count from.
        .filter((label) => label.index % interval === 0)
    );
  });

  protected readonly reachesBelowZero = computed(() => this.domain().min < 0);

  /** Read off `categories` alone, never the reported domains: the marks are projected into the branch
   *  this decides, so waiting for a report would deadlock. */
  protected readonly isEmpty = computed(() => this.categories().length === 0);

  protected readonly accessibleName = computed(
    () => this.summary() ?? this.caption() ?? this.intl().chart.title,
  );
}
