import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
  untracked,
  viewChild,
} from '@angular/core';
import {
  afterTwoFrames,
  bandScale,
  elementWidth,
  labelInterval,
  nextRovingIndex,
  rotationWouldFit,
  tickValues,
  chartRenderGate,
  leaveMark,
  CHART_SKELETON_COUNT,
  DsChartBase,
  skeletonMarkCount,
} from '@ids-group-ltd/ids-design-system/components';
import { isPlatformBrowser } from '@angular/common';
import {
  CHART_PIN_GAP,
  CHART_PIN_RADIUS,
  CHART_UNPIN_DRAWN_BY_HOST,
  ChartPinMarkerComponent,
  ChartPlacedDirective,
  ChartSkeletonComponent,
  ChartTooltipDirective,
  ChartStatesComponent,
  chartActiveMark,
  isPrimaryPress,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ChartTooltipContext } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  DS_INTL_DEFAULTS,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartAxis,
  ChartAxisMode,
} from '@ids-group-ltd/ids-design-system/core';
import {
  categoryAt,
  categoryKeys,
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
  pinYAbove,
  secondaryAxis,
  topDown,
  valueScale,
} from './chart.math';
import {
  CHART_SCALES,
  type ChartAxisEntry,
  type ChartAxisReadout,
  type ChartCategoryRange,
  type ChartPlot,
  type ChartScales,
  type ChartTooltipSource,
} from './chart-scales.token';

// Between the value axis and the pill that prints the reading there.
const READOUT_PILL_GAP = 2;
// Text to edge, either side, of a pill drawn on the canvas.
const PILL_PADDING = 6;
const RANGE_BAND_INSET = 2;
// Above the plot's top edge, inside the value space reserved there.
const RANGE_PILL_RISE = 10;

@Component({
  selector: 'ds-chart',
  standalone: true,
  exportAs: 'dsChart',
  imports: [
    ChartSkeletonComponent,
    ChartTooltipDirective,
    ChartPinMarkerComponent,
    ChartPlacedDirective,
    ChartStatesComponent,
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '[class.measuring]': '!settled()',
    '[style.--_chart-view-height]': "viewHeight() + 'px'",
    '(keydown)': 'onChartKey($event)',
    '(focusout)': 'onChartFocusOut($event)',
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
export class ChartComponent extends DsChartBase implements ChartScales {
  protected readonly leaveMark = leaveMark;

  protected readonly renderReady = chartRenderGate();

  /** One band per category; every projected mark is positioned against them. */
  readonly categories = input<readonly string[]>([]);

  /** How many columns the loading skeleton draws before the categories are known. */
  readonly skeletonCount = input(CHART_SKELETON_COUNT, {
    transform: (raw: unknown) => numberAttribute(raw, CHART_SKELETON_COUNT),
  });

  protected readonly skeletonMarks = computed(() =>
    skeletonMarkCount(this.categories().length, this.skeletonCount()),
  );

  /** How many value-axis ticks to aim for; ticks snap to a round step, so the count may differ by one. */
  readonly tickCount = input(CHART_DEFAULT_TICK_COUNT, {
    transform: numberAttribute,
  });

  /** Pins the floor of the value axis. It only opens the axis further; a floor above the data is ignored. */
  readonly min = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the ceiling of the value axis. See `min`. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Draws a band and crosshair down the category under the pointer and reports it to every mark
   *  through `activeIndex`; the panel then names every reading at that category. `'auto'` (default)
   *  is `'category'` with two or more tooltip-showing marks or a mark with `tooltip="axis"`, else
   *  `'none'`. */
  readonly cursor = input<'none' | 'category' | 'auto'>('auto');

  readonly pinOnClickResolved = resolveWithConfig(
    this.pinOnClick,
    (config) => config.chart?.pinOnClick,
    true,
  );

  /** Whether hiding a series re-scales the value axes to what is left. Off holds them where they
   *  stand with every series shown. */
  readonly rescaleOnHide = input(true, { transform: booleanAttribute });

  /** Pins the ceiling of the SECOND value axis, the way `max` pins the first. */
  readonly maxSecondary = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Plot height in CSS pixels, axis labels and headroom excluded; fixed across card widths. */
  readonly plotHeight = input(CHART_DEFAULT_PLOT_HEIGHT, {
    transform: numberAttribute,
  });

  /** Width in CSS pixels of the left gutter that carries the value-axis labels. */
  readonly axisGutter = input(CHART_DEFAULT_AXIS_GUTTER, {
    transform: numberAttribute,
  });

  /** Pixels reserved at each end of the plot for a value label, drawn or not. */
  readonly valueSpace = input(CHART_DEFAULT_VALUE_SPACE, {
    transform: numberAttribute,
  });

  /** How the second value axis relates to the first, once a mark has reported against it. */
  readonly secondaryAxisMode = input<ChartAxisMode>('aligned');

  /** Colours the first axis's tick labels like the marks measured against it. */
  readonly axisColor = input<string | null>(null);

  /** `axisColor` for the second axis. */
  readonly secondaryAxisColor = input<string | null>(null);

  /** Names the first axis's unit beside it. */
  readonly axisLabel = input<string | null>(null);

  /** `axisLabel` for the second axis. */
  readonly secondaryAxisLabel = input<string | null>(null);

  /** Lets a press dragged across categories select them: a band over the range, the sum and mean of
   *  every reading in it, and the marks outside it faded. Escape or a press outside clears it; a
   *  press released in its own category still pins. Off by default. */
  readonly selectRange = input(false, { transform: booleanAttribute });

  protected readonly tooltipSwatchesResolved = this.defaults.tooltipSwatches;
  readonly hoverDelayMs = this.defaults.hoverDelayMs;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** The `<svg>`'s rendered width: the host's content box, since `:host(.framed)` carries the padding. */
  private readonly measuredWidth = elementWidth(this.host);

  /** True under SSR, which draws at the fallback width. */
  readonly measured = computed(
    () => !this.isBrowser || this.measuredWidth() > 0,
  );

  protected readonly viewWidth = computed(
    () => this.measuredWidth() || CHART_FALLBACK_WIDTH,
  );

  /** The geometry a resize redraws; marks hold still while it changes. A category coming or going is
   *  not part of it: the marks glide sideways and a line morphs to its new point count. */
  private readonly layout = computed(() => `${this.measuredWidth()}`);

  private readonly settledLayout = signal('');

  /** Whether the marks may animate: the correction after measuring and a resize must not, or the plot
   *  drags behind the pointer. Derived from the layout, so the hold lands in the same render as the new
   *  geometry. Two frames, because after one the corrected geometry is unstyled and `transitionrun`
   *  fires on `x` and `width`. */
  protected readonly settled = computed(
    () => this.measuredWidth() > 0 && this.layout() === this.settledLayout(),
  );

  constructor() {
    super();
    effect((onCleanup) => {
      const layout = this.layout();
      if (this.measuredWidth() === 0 || layout === this.settledLayout()) {
        return;
      }
      onCleanup(
        afterTwoFrames(this.zone, () => this.settledLayout.set(layout)),
      );
    });

    // Before the view drops the stops past the new end, while the focused one is still in the DOM.
    effect(() => {
      const last = this.categories().length - 1;
      untracked(() => {
        if (this.activeIndex() > last) {
          this.cursorState.release();
          this.cursorState.setIndex(last);
        }
        if (this.roving() > last && this.keyboardFocusInside()) {
          this.refocusStop = true;
        }
        if ((this.range()?.to ?? -1) > last) {
          this.range.set(null);
        }
      });
    });

    afterRenderEffect(() => {
      this.categories();
      if (this.refocusStop) {
        this.refocusStop = false;
        untracked(() => this.focusStop(this.focusedCategory()));
      }
    });

    effect((onCleanup) => {
      const canvas = this.canvasElement()?.nativeElement;
      if (canvas && this.cursorResolved() === 'category') {
        onCleanup(this.listenForCursor(canvas));
      }
    });

    effect((onCleanup) => {
      const canvas = this.canvasElement()?.nativeElement;
      if (canvas && this.selectRange()) {
        onCleanup(this.listenForRange(canvas));
      } else {
        untracked(() => this.range.set(null));
      }
    });

    // Read phase: every `getComputedTextLength` before any write, or each label forces a layout.
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

    afterRenderEffect({
      read: () => {
        this.axisReadout();
        this.rangeTotal();
        this.readoutTextWidth.set(this.widestLabel('.readout-text'));
        this.rangeTextWidth.set(this.widestLabel('.range-text'));
      },
    });

    // The readings and the scales change with the data, so a held pin follows its category's new geometry.
    afterRenderEffect({
      read: () => {
        this.tooltipContext();
        this.yPosition();
        this.secondaryYPosition();
        this.bandPinY.set(this.measureBandPinY());
      },
    });

    // Where the pin and the anchor land, not their boxes: a pin moving to another mark is mid-glide here.
    afterRenderEffect({
      read: () => {
        this.tooltipContext();
        this.bandPinY();
        const origin = this.tooltipOrigin();
        const canvas = this.canvasElement()?.nativeElement;
        const pin = this.tooltipPinned()
          ? this.host.nativeElement.querySelector('[dschartpinmarker]')
          : null;
        const viewHeight = this.viewHeight();
        if (
          !(origin instanceof Element) ||
          !pin ||
          !canvas ||
          viewHeight <= 0
        ) {
          this.pinRise.set(0);

          return;
        }
        const pixelsPerUnit =
          canvas.getBoundingClientRect().height / viewHeight;
        const pinTop = landedTranslateY(pin) - CHART_PIN_RADIUS;
        const rise =
          (landedExtent(origin, canvas, viewHeight).top - pinTop) *
          pixelsPerUnit;
        this.pinRise.set(Math.max(0, Math.round(rise)));
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

  /** Two plots stacked on a shared category axis. */
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

  /** One viewBox unit is one CSS pixel, so lengths inside the plot hold at every width. */
  protected readonly viewBox = computed(
    () => `0 0 ${this.viewWidth()} ${this.viewHeight()}`,
  );

  /** Widest tick label as rendered, in CSS pixels. Zero until the first read and under SSR. */
  private readonly measuredLabelWidth = signal(0);

  private readonly measuredCategoryLabelWidth = signal(0);

  /** `axisGutter` is the floor: compact numbers are wider in some locales and the SVG clips overflow. */
  protected readonly effectiveAxisGutter = computed(() =>
    Math.max(
      this.axisGutter(),
      this.measuredLabelWidth() + CHART_AXIS_LABEL_GAP + this.axisTitleGutter(),
    ),
  );

  /** A rotated axis title shares the tick gutter; its width is its line height. */
  protected readonly axisTitleGutter = computed(() =>
    this.axisLabel() ? CHART_AXIS_TITLE_BAND : 0,
  );

  protected readonly axisTitleX = computed(() => CHART_AXIS_TITLE_BAND / 2);

  protected readonly secondaryTitleX = computed(
    () => this.viewWidth() - CHART_AXIS_TITLE_BAND / 2,
  );

  private readonly measuredSecondaryLabelWidth = signal(0);

  /** Right-hand label room only when the second axis is drawn there; a stacked one is on the left. */
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
      {
        readonly axis: ChartAxis;
        readonly values: readonly number[];
        readonly hidden: boolean;
      }
    >
  >(new Map());

  reportDomain(
    id: string,
    values: readonly number[],
    axis: ChartAxis = 'primary',
    hidden = false,
  ): void {
    this.reportedDomains.update((reported) =>
      new Map(reported).set(id, { axis, values, hidden }),
    );
  }

  private valuesOn(
    axis: ChartAxis,
    withHidden = false,
  ): readonly (readonly number[])[] {
    const found: (readonly number[])[] = [];
    for (const report of this.reportedDomains().values()) {
      if (report.axis === axis && (withHidden || !report.hidden)) {
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

  /** Extra clearance between the mark and the panel, for a value label printed in that gap. */
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

  protected readonly cursorResolved = computed(() => {
    const cursor = this.cursor();
    if (cursor !== 'auto') {
      return cursor;
    }

    const readsCategory = [...this.tooltipSources().values()].some(
      (source) => source.readsCategory?.() ?? false,
    );

    return this.composed() || readsCategory ? 'category' : 'none';
  });

  readonly cursorOn = computed(() => this.cursorResolved() === 'category');

  /** The tooltip context to show, if any; at most one mark has one at a time. */
  private readonly activeTooltip = computed(
    () =>
      [...this.tooltipSources().values()].find(
        (source) => source.context() !== null,
      ) ?? null,
  );

  // By source and position, not label: two marks may read under one label.
  private readonly pickedKey = signal<string | null>(null);

  private readonly pickedReading = computed(() => {
    const picked = this.pickedKey();

    return picked === null
      ? null
      : (this.readingsTopDown().find((reading) => reading.key === picked) ??
          null);
  });

  protected readonly tooltipContext = computed(() => {
    const merged = this.categoryContext();
    const picked = this.pickedReading();

    return picked === null || !this.cursorOn() || merged === null
      ? merged
      : { ...merged, entries: [picked.entry] };
  });

  private readonly categoryContext = computed(() => {
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
    // The panel is about the category, so every other mark's reading joins it, matched by label; the offering mark keeps its own row and detail.
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

  protected readonly tooltipOrigin = computed(
    () => this.pickedReading()?.element ?? this.categoryOrigin(),
  );

  private readonly categoryOrigin = computed(() => {
    const own = this.activeTooltip()?.origin() ?? null;
    if (this.activeTooltip()?.stacked?.() && own instanceof Element) {
      return this.stackTop(own);
    }
    if (
      this.cursorResolved() !== 'category' ||
      (own !== null && !(own instanceof Element))
    ) {
      return own;
    }
    // Anchor over the tallest reading at the category, pointer over it or not: the opening mark
    // puts the panel low under a column, and pointer-only readings make it jump at the column's edge.
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

  /** Compared by value: a mark that reports and reads `yPosition()` in one effect would otherwise loop forever. */
  protected readonly domain = computed(
    () =>
      axisDomain(
        this.valuesOn('primary', !this.rescaleOnHide()),
        this.tickCount(),
        this.min(),
        this.max(),
      ),
    { equal: (a, b) => a.min === b.min && a.max === b.max },
  );

  // Counts values, not reporters: a line series registers both axes, so an empty one would raise a second axis.
  readonly hasSecondaryAxis = computed(() =>
    this.valuesOn('secondary').some((values) => values.length > 0),
  );

  protected readonly secondary = computed(
    () =>
      secondaryAxis(
        this.ticks().map((tick) => tick.value),
        this.valuesOn('secondary', !this.rescaleOnHide()),
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

  /** Second gridlines only where the scales do not share rows; an aligned axis would double every stroke. */
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

  private bandAt(index: number) {
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
  }

  /** The band the panel reads from, drawn invisible as its fallback anchor. */
  protected readonly cursorBand = computed(() =>
    this.bandAt(this.activeIndex()),
  );

  // A held band is not highlighted: under a pin the highlight follows the pointer alone.
  protected readonly highlightBand = computed(() =>
    this.bandAt(
      this.tooltipPinned() ? this.hoveredCategory() : this.activeIndex(),
    ),
  );

  /** The same state machine the element marks run on; here the index counts categories. */
  private readonly cursorState = chartActiveMark(
    () => this.defaults.tooltipLingerMs(),
    () => this.hoverDelayMs(),
  );

  readonly activeIndex = this.cursorState.index;

  private readonly pointerAt = signal<{ x: number; y: number } | null>(null);

  // Set at once, not after the hover delay.
  private readonly pointerInBand = signal(false);

  private readonly hoveredCategory = signal(-1);

  /** Under the panel: it opens over the tallest reading, so the disc sits at that reading's head -
   *  inside a column, below a marker, and over a column too short to hold it. */
  protected readonly bandPinY = signal(0);

  // The highest segment at the mark's category, by where each lands: a segment glides after a data change.
  private stackTop(segment: Element): Element {
    const canvas = this.canvasElement()?.nativeElement;
    const index = segment
      .closest('[data-mark-index]')
      ?.getAttribute('data-mark-index');
    if (!canvas || index == null) {
      return segment;
    }
    const segments = this.host.nativeElement.querySelectorAll(
      `[data-mark-index="${index}"] > .bar`,
    );
    let highest = segment;
    let highestTop = landedExtent(segment, canvas, this.viewHeight()).top;
    for (const candidate of segments) {
      const top = landedExtent(candidate, canvas, this.viewHeight()).top;
      if (top < highestTop) {
        highest = candidate;
        highestTop = top;
      }
    }

    return highest;
  }

  // Read from the marks' bound geometry, not their boxes: after a data change the boxes are mid-glide,
  // and the pin glides to where the reading lands.
  private measureBandPinY(): number {
    const band = this.cursorBand();
    const inset = CHART_PIN_RADIUS + CHART_PIN_GAP;
    const origin = this.tooltipOrigin();
    const canvas = this.canvasElement()?.nativeElement;
    if (!band || !canvas || !(origin instanceof Element)) {
      return (band?.top ?? 0) + inset;
    }
    const { top, height } = landedExtent(origin, canvas, this.viewHeight());
    if (height < 2 * inset && !origin.matches('.bar')) {
      return top + height + inset;
    }
    const value =
      origin.parentElement?.querySelector<SVGTextElement>(':scope > .value');

    return pinYAbove(top, height, value ? landedTextTop(value) : null, inset);
  }

  /** How far a held pin sits above the panel's anchor; the panel rises by as much to stay over it. */
  private readonly pinRise = signal(0);

  protected readonly tooltipGap = computed(() =>
    Math.max(this.tooltipExtraGap(), this.pinRise()),
  );

  protected readonly pinnedCategories = computed(() =>
    this.cursorPinned() && this.cursorBand() ? [this.activeIndex()] : [],
  );

  protected readonly bandPins = computed(
    () => this.pinOnClickResolved() && this.pointerInBand(),
  );

  readonly cursorPointer = computed(() =>
    this.activeIndex() < 0 ? null : this.pointerAt(),
  );

  /** Whether the cursor is held. */
  readonly cursorPinned = this.cursorState.pinned;

  protected readonly drawsUnpin = !inject(CHART_UNPIN_DRAWN_BY_HOST, {
    optional: true,
  });

  releaseCursor(): void {
    this.cursorState.release();
  }

  private readonly canvasElement =
    viewChild<ElementRef<SVGSVGElement>>('canvasEl');

  // Read once per hover and dropped on scroll: reading on every move forces a second layout after the band update.
  private canvasRect: DOMRect | null = null;

  private readonly forgetCanvasRect = (): void => {
    this.canvasRect = null;
  };

  // Client x to view units: the canvas is scaled to its box.
  private viewXOf(event: PointerEvent, canvas: SVGSVGElement): number {
    this.canvasRect ??= canvas.getBoundingClientRect();

    return (
      ((event.clientX - this.canvasRect.left) / this.canvasRect.width) *
      this.viewWidth()
    );
  }

  private plotPointer(event: PointerEvent, canvas: SVGSVGElement): void {
    const plot = this.plot();
    const viewX = this.viewXOf(event, canvas);
    // Every point belongs to its nearest category, so the cursor never passes through "none".
    const index = this.clampIndex(
      categoryAt(viewX, plot.left, plot.width, this.categories().length),
    );
    this.pointerAt.set({ x: event.clientX, y: event.clientY });
    this.pointerInBand.set(index >= 0);
    this.hoveredCategory.set(index);
    if (index < 0) {
      if (event.type === 'pointerdown' && this.cursorPinned()) {
        this.cursorState.release();
      } else {
        this.cursorState.leave();
      }

      return;
    }
    // Under `selectRange` a press may become a drag; the range listener pins on a release in place.
    if (
      event.type === 'pointerdown' &&
      this.pinOnClickResolved() &&
      !this.selectRange()
    ) {
      this.cursorState.pin(index, event);

      return;
    }
    this.cursorState.enter(index, event);
  }

  /** Listens only when a category cursor is drawn, outside the zone. */
  private listenForCursor(canvas: SVGSVGElement): () => void {
    const forgetRect = this.forgetCanvasRect;
    const onPointer = (event: PointerEvent): void => {
      if (event.type === 'pointerdown' && !isPrimaryPress(event)) {
        return;
      }
      this.plotPointer(event, canvas);
    };
    const onEnter = (): void =>
      window.addEventListener('scroll', forgetRect, {
        capture: true,
        passive: true,
      });
    const onLeave = (): void => {
      window.removeEventListener('scroll', forgetRect, { capture: true });
      forgetRect();
      this.pointerInBand.set(false);
      this.hoveredCategory.set(-1);
      // The panel goes back to the band the keyboard holds, which keeps it open while focus stays.
      if (this.keyboardFocusInside()) {
        this.cursorState.setIndex(this.focusedCategory());
      } else {
        this.cursorState.leave();
      }
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

  private readonly range = signal<ChartCategoryRange | null>(null);

  /** The categories a drag selected, both ends included; `null` when none are. */
  readonly selectedRange = this.range.asReadonly();

  private listenForRange(canvas: SVGSVGElement): () => void {
    const document = canvas.ownerDocument;
    const view = document.defaultView ?? window;
    let anchor = -1;
    let dragged = false;
    const forgetRectWhileDragging = (): void => this.forgetCanvasRect();
    // Past either end of the plot a drag holds the nearest category.
    const categoryOf = (event: PointerEvent, clamp: boolean): number => {
      const plot = this.plot();
      const viewX = this.viewXOf(event, canvas);
      const x = clamp
        ? Math.min(Math.max(viewX, plot.left), plot.left + plot.width)
        : viewX;

      return categoryAt(x, plot.left, plot.width, this.categories().length);
    };
    const onMove = (event: PointerEvent): void => {
      const index = categoryOf(event, true);
      if (index < 0 || (index === anchor && !dragged)) {
        return;
      }
      dragged = true;
      this.range.set({
        from: Math.min(anchor, index),
        to: Math.max(anchor, index),
      });
    };
    const stopDrag = (): void => {
      view.removeEventListener('pointermove', onMove);
      view.removeEventListener('pointerup', onUp);
      view.removeEventListener('scroll', forgetRectWhileDragging, {
        capture: true,
      });
      anchor = -1;
    };
    const onUp = (event: PointerEvent): void => {
      if (!dragged && this.cursorOn() && this.pinOnClickResolved()) {
        this.cursorState.pin(anchor, event, null, canvas);
      }
      stopDrag();
    };
    const onDown = (event: PointerEvent): void => {
      if (!isPrimaryPress(event)) {
        return;
      }
      stopDrag();
      this.range.set(null);
      dragged = false;
      this.forgetCanvasRect();
      anchor = categoryOf(event, false);
      if (anchor >= 0) {
        view.addEventListener('pointermove', onMove);
        view.addEventListener('pointerup', onUp);
        view.addEventListener('scroll', forgetRectWhileDragging, {
          capture: true,
          passive: true,
        });
      }
    };
    const onOutside = (event: PointerEvent): void => {
      if (!(event.target instanceof Node) || !canvas.contains(event.target)) {
        this.range.set(null);
      }
    };
    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        this.range.set(null);
      }
    };
    this.zone.runOutsideAngular(() => {
      canvas.addEventListener('pointerdown', onDown);
      document.addEventListener('pointerdown', onOutside, true);
      document.addEventListener('keydown', onEscape);
    });

    return () => {
      stopDrag();
      canvas.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('keydown', onEscape);
    };
  }

  private readonly rangeTotal = computed(() => {
    const range = this.range();
    if (!range) {
      return null;
    }
    const perSource = [...this.tooltipSources().values()].map(
      (source) => source.valuesByCategory?.() ?? [],
    );
    let total = 0;
    let count = 0;
    for (let index = range.from; index <= range.to; index++) {
      for (const values of perSource) {
        for (const value of values[index] ?? []) {
          total += value;
          count++;
        }
      }
    }
    const categories = this.categories();
    const name =
      range.from === range.to
        ? (categories[range.from] ?? '')
        : `${categories[range.from] ?? ''}-${categories[range.to] ?? ''}`;
    const format = this.valueFormatResolved();

    const rangeTotal =
      this.intl().chart.rangeTotal ?? DS_INTL_DEFAULTS.chart.rangeTotal;

    return rangeTotal(
      name,
      format(total, 'tooltip'),
      format(count > 0 ? total / count : 0, 'tooltip'),
    );
  });

  private readonly rangeTextWidth = signal(0);

  protected readonly rangeBand = computed(() => {
    const range = this.range();
    const label = this.rangeTotal();
    const count = this.categories().length;
    if (!range || label === null || count === 0) {
      return null;
    }
    const plot = this.plot();
    const step = plot.width / count;
    const x = plot.left + step * range.from + RANGE_BAND_INSET;
    const width = step * (range.to - range.from + 1) - 2 * RANGE_BAND_INSET;
    const pillWidth = this.rangeTextWidth() + 2 * PILL_PADDING;
    const half = Math.min(pillWidth, plot.width) / 2;

    return {
      x,
      width,
      top: plot.top,
      height: plot.height,
      label,
      pillWidth,
      pillX: Math.min(
        Math.max(x + width / 2, plot.left + half),
        plot.left + plot.width - half,
      ),
      pillY: plot.top - RANGE_PILL_RISE,
    };
  });

  /** Under the category cursor the highest reading at the category, or the one the keyboard picked;
   *  otherwise the reading of the mark answering the pointer or focus. */
  private readonly activeReadout = computed<ChartAxisReadout | null>(() => {
    if (this.cursorOn()) {
      const categoryIndex = this.activeIndex();
      if (categoryIndex < 0) {
        return null;
      }
      const top =
        this.pickedReading()?.entry ??
        highestReading(
          [...this.tooltipSources().values()].flatMap(
            (source) => source.axisEntries?.() ?? [],
          ),
        );

      return top?.y === undefined
        ? null
        : { categoryIndex, y: top.y, axis: top.axis };
    }
    for (const source of this.tooltipSources().values()) {
      const readout = source.axisReadout?.();
      if (readout) {
        return readout;
      }
    }

    return null;
  });

  private readonly readoutTextWidth = signal(0);

  /** A guide from the value axis at the active reading, and the axis value there in a pill on the axis. */
  protected readonly axisReadout = computed(() => {
    const readout = this.activeReadout();
    if (!readout) {
      return null;
    }
    const secondary = readout.axis === 'secondary' && this.hasSecondaryAxis();
    const plot = secondary ? this.secondaryPlot() : this.plot();
    const domain = secondary ? this.secondary().domain : this.domain();
    const share =
      plot.height > 0 ? (plot.top + plot.height - readout.y) / plot.height : 0;
    // Rounded off the float noise the inversion adds, so a reading of 620 prints as 620.
    const value =
      Math.round((domain.min + share * (domain.max - domain.min)) * 1e6) / 1e6;
    const onRight = secondary && !this.stacked();
    const half = this.bandWidth() / 2;
    const centre = this.xPosition()(readout.categoryIndex);
    const toMark = readout.reach === 'mark';
    const pillWidth = this.readoutTextWidth() + 2 * PILL_PADDING;

    return {
      categoryIndex: readout.categoryIndex,
      y: readout.y,
      label: this.valueFormatResolved()(value, 'tooltip'),
      x1: onRight && toMark ? centre - half : this.plot().left,
      x2: !onRight && toMark ? centre + half : this.plotRight(),
      pillWidth,
      pillX: onRight
        ? this.plotRight() + READOUT_PILL_GAP
        : this.plot().left - READOUT_PILL_GAP - pillWidth,
    };
  });

  protected readonly hotCategory = computed(
    () => this.axisReadout()?.categoryIndex ?? -1,
  );

  private readonly bandElement = viewChild<ElementRef<Element>>('cursorBandEl');

  readonly cursorOrigin = computed<Element | null>(() =>
    this.cursorBand() ? (this.bandElement()?.nativeElement ?? null) : null,
  );

  protected readonly keyboardStops = computed(
    () => this.cursorOn() && this.interactive(),
  );

  private readonly roving = signal(0);

  private refocusStop = false;

  readonly focusedCategory = computed(() =>
    Math.min(this.roving(), Math.max(0, this.categories().length - 1)),
  );

  protected readonly focusedStopX = computed(
    () => this.xPosition()(this.focusedCategory()) - this.bandWidth() / 2,
  );

  protected readonly categoryStops = computed(() => {
    const toX = this.xPosition();
    const width = this.bandWidth();

    return this.categories().map((category, index) => ({
      index,
      category,
      x: toX(index) - width / 2,
      width,
    }));
  });

  // Only the active category's readings are known; a stop is named once the cursor is on it, which focusing it does first.
  protected stopLabel(index: number): string {
    const category = this.categories()[index] ?? '';
    const context =
      this.activeIndex() === index ? this.categoryContext() : null;
    const readings =
      context?.entries.map(
        (entry) => `${entry.label} ${entry.formatted ?? entry.value}`,
      ) ?? [];

    return readings.length ? `${category}: ${readings.join(', ')}` : category;
  }

  protected onStopFocus(index: number, event: FocusEvent): void {
    this.roving.set(index);
    this.pickedKey.set(null);
    this.cursorState.enter(index, event, null, event.target as Element);
  }

  private leavesChart(event: FocusEvent): boolean {
    const next = event.relatedTarget;

    return (
      !(next instanceof Element) || !this.host.nativeElement.contains(next)
    );
  }

  protected onStopBlur(event: FocusEvent): void {
    if (this.leavesChart(event)) {
      this.cursorState.leave();
    }
  }

  protected onChartFocusOut(event: FocusEvent): void {
    if (this.leavesChart(event)) {
      this.pickedKey.set(null);
    }
  }

  // Index after focus: the marker losing focus clears the series' cursor index on its way out.
  // Moving to another band lets a pin go; returning to the held band keeps it.
  private focusStop(index: number): void {
    this.roving.set(index);
    this.host.nativeElement
      .querySelector<SVGElement>(
        `.category-stop[data-category-index="${index}"]`,
      )
      ?.focus();
    if (this.cursorPinned() && this.activeIndex() !== index) {
      this.cursorState.release();
    }
    this.cursorState.setIndex(index);
  }

  private keyboardFocusInside(): boolean {
    const focused = this.host.nativeElement.ownerDocument.activeElement;

    return (
      this.keyboardStops() &&
      focused !== null &&
      this.host.nativeElement.contains(focused) &&
      focused.closest('.category-stop, [data-mark-index]') !== null
    );
  }

  // Ahead of the pin's own document-capture Escape, which would release the pin before the marker steps back.
  private readonly stepBackOnEscape = this.listenForEscapeFromMarker();

  private listenForEscapeFromMarker(): void {
    if (!this.isBrowser) {
      return;
    }
    const document = this.host.nativeElement.ownerDocument;
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target;
      if (
        event.key !== 'Escape' ||
        !this.keyboardStops() ||
        !this.cursorPinned() ||
        !(target instanceof Element) ||
        !this.host.nativeElement.contains(target) ||
        target.closest('.category-stop') !== null ||
        target.closest('[data-mark-index]') === null
      ) {
        return;
      }
      event.stopImmediatePropagation();
      event.preventDefault();
      this.pickedKey.set(null);
      this.focusStop(this.focusedCategory());
    };
    document.addEventListener('keydown', onKey, true);
    inject(DestroyRef).onDestroy(() =>
      document.removeEventListener('keydown', onKey, true),
    );
  }

  // Held by the canvas, as a pointer pin is: a press on the band then releases it instead of re-pinning.
  private pinFromKeyboard(index: number, event: Event): void {
    const canvas = this.canvasElement()?.nativeElement;
    this.cursorState.pin(index, event, null, canvas);
  }

  private readingsTopDown(): readonly {
    key: string;
    entry: ChartAxisEntry;
    element: Element;
  }[] {
    return (
      [...this.tooltipSources()]
        .flatMap(([sourceId, source]) => {
          const elements = source.axisPointElements?.() ?? [];

          return (source.axisEntries?.() ?? []).map((entry, index) => ({
            key: `${sourceId}:${index}`,
            entry,
            element: elements[index] ?? null,
          }));
        })
        // A mark without `interactive` has no tabindex and would swallow the focus call.
        .filter(
          (
            reading,
          ): reading is {
            key: string;
            entry: ChartAxisEntry;
            element: Element;
          } => reading.element?.hasAttribute('tabindex') ?? false,
        )
        .sort((a, b) => (a.entry.y ?? 0) - (b.entry.y ?? 0))
    );
  }

  protected onChartKey(event: KeyboardEvent): void {
    if (!this.keyboardStops() || !(event.target instanceof Element)) {
      return;
    }
    const onStop = event.target.closest('.category-stop') !== null;
    const fromMarker =
      !onStop && event.target.closest('[data-mark-index]') !== null;
    if (!onStop && !fromMarker) {
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      // The pointer may have moved or pinned the cursor elsewhere, or Escape cleared it, since the stop took focus.
      if (
        this.cursorPinned() &&
        this.activeIndex() !== this.focusedCategory()
      ) {
        this.cursorState.release();
      }
      this.cursorState.setIndex(this.focusedCategory());
      const readings = this.readingsTopDown();
      if (readings.length === 0) {
        return;
      }
      const at = readings.findIndex(
        (reading) => reading.key === this.pickedKey(),
      );
      const step = event.key === 'ArrowDown' ? 1 : readings.length - 1;
      const next =
        at < 0
          ? event.key === 'ArrowDown'
            ? 0
            : readings.length - 1
          : (at + step) % readings.length;
      this.pickedKey.set(readings[next].key);
      (readings[next].element as SVGElement).focus();

      return;
    }
    if (!fromMarker) {
      return;
    }
    if (event.key === 'Tab') {
      // Moved before the browser acts, so Tab leaves from the stop: a marker sits before it in the DOM.
      this.focusStop(this.focusedCategory());

      return;
    }
    const next =
      event.key === 'Escape'
        ? this.focusedCategory()
        : nextRovingIndex(
            event.key,
            this.focusedCategory(),
            this.categories().length,
          );
    if (next !== null) {
      event.preventDefault();
      this.focusStop(next);
    }
  }

  protected onStopKey(event: KeyboardEvent): void {
    const current = this.focusedCategory();
    const next =
      event.key === 'ArrowUp' || event.key === 'ArrowDown'
        ? null
        : nextRovingIndex(event.key, current, this.categories().length);
    if (next !== null) {
      event.preventDefault();
      this.focusStop(next);

      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.pinOnClickResolved()) {
        this.pinFromKeyboard(current, event);
      }
    } else if (event.key === 'Escape') {
      this.cursorState.release();
      this.cursorState.leave();
    }
  }

  // Captured ahead of a series' own arrow keys, which would otherwise move focus without the range.
  private readonly extendRangeFromKeys = this.listenForRangeKeys();

  private listenForRangeKeys(): void {
    if (!this.isBrowser) {
      return;
    }
    const host = this.host.nativeElement;
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target;
      if (
        !this.selectRange() ||
        !event.shiftKey ||
        (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
        !(target instanceof Element)
      ) {
        return;
      }
      const stop = target.closest('.category-stop');
      const mark = stop ? null : target.closest('[data-mark-index]');
      // A column's mark index is its category; a line marker reports its category as it takes focus.
      const current = stop
        ? this.focusedCategory()
        : mark?.hasAttribute('data-point-key')
          ? this.activeIndex()
          : Number(mark?.getAttribute('data-mark-index') ?? -1);
      if ((!stop && !mark) || current < 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const next = this.extendRange(
        current,
        event.key === 'ArrowRight' ? 1 : -1,
      );
      if (next === current) {
        return;
      }
      if (stop) {
        this.focusStop(next);
      } else if (mark) {
        this.markInCategory(mark, current, next)?.focus();
      }
    };
    host.addEventListener('keydown', onKey, true);
    inject(DestroyRef).onDestroy(() =>
      host.removeEventListener('keydown', onKey, true),
    );
  }

  // Grows or shrinks the range from its far end; from a category outside the range's ends, a new one
  // starts there. Returns the category the far end moved to.
  private extendRange(current: number, step: 1 | -1): number {
    const next = Math.min(
      Math.max(current + step, 0),
      this.categories().length - 1,
    );
    const range = this.range();
    const anchor =
      range && current === range.to
        ? range.from
        : range && current === range.from
          ? range.to
          : current;
    this.range.set({
      from: Math.min(anchor, next),
      to: Math.max(anchor, next),
    });

    return next;
  }

  // The same series' mark at another category: a column is indexed by its category, a line marker keyed by it.
  private markInCategory(
    mark: Element,
    current: number,
    next: number,
  ): SVGElement | null {
    const pointKey = mark.getAttribute('data-point-key');
    if (pointKey === null) {
      return (
        mark.parentElement?.querySelector<SVGElement>(
          `:scope > [data-mark-index="${next}"]`,
        ) ?? null
      );
    }
    const keys = categoryKeys(this.categories());
    const seriesId = pointKey.slice(0, -(keys[current].length + 1));

    return (
      mark.parentElement?.querySelector<SVGElement>(
        `[data-point-key="${CSS.escape(`${seriesId}-${keys[next]}`)}"]`,
      ) ?? null
    );
  }

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
  /** Clears the reservation the view height budgets, only when it is there; otherwise the labels fall past the viewBox. */
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

  /** Rotation is tried before thinning; both use the widest label as rendered. */
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

    const keys = categoryKeys(this.categories());

    return this.categories()
      .map((text, index) => ({ x: toX(index), text, index, key: keys[index] }))
      .filter((label) => label.index % interval === 0);
  });

  protected readonly reachesBelowZero = computed(() => this.domain().min < 0);

  /** Read off `categories` alone: the marks are projected into the branch this decides, so waiting for a report would deadlock. */
  protected readonly isEmpty = computed(() => this.categories().length === 0);

  protected readonly accessibleName = computed(
    () => this.summary() ?? this.caption() ?? this.intl().chart.title,
  );
}

function highestReading(
  readings: readonly ChartAxisEntry[],
): ChartAxisEntry | null {
  let highest: ChartAxisEntry | null = null;
  for (const reading of readings) {
    if (
      reading.y !== undefined &&
      (highest?.y === undefined || reading.y < highest.y)
    ) {
      highest = reading;
    }
  }

  return highest;
}

// A pin's `transform` attribute is where it lands; its computed transform is mid-glide.
function landedTranslateY(element: Element): number {
  const match = /translate\(\s*[-\d.e]+[\s,]+([-\d.e]+)/.exec(
    element.getAttribute('transform') ?? '',
  );

  return match ? parseFloat(match[1]) : 0;
}

function boundNumber(element: Element, name: string): number {
  return parseFloat(element.getAttribute(name) ?? '') || 0;
}

/** Top and height in view units of where `origin` lands: a column's cap and a marker by their bound
 *  attributes, anything else by its box. */
function landedExtent(
  origin: Element,
  canvas: SVGSVGElement,
  viewHeight: number,
): { top: number; height: number } {
  const cap = origin.matches('.bar') ? origin.querySelector('.bar-cap') : null;
  if (cap) {
    return { top: boundNumber(cap, 'y'), height: boundNumber(cap, 'height') };
  }
  if (origin instanceof SVGCircleElement) {
    const radius = parseFloat(getComputedStyle(origin).r) || 0;

    return { top: boundNumber(origin, 'cy') - radius, height: 2 * radius };
  }
  const frame = canvas.getBoundingClientRect();
  const scale = frame.height > 0 ? viewHeight / frame.height : 1;
  const box = origin.getBoundingClientRect();

  return { top: (box.top - frame.top) * scale, height: box.height * scale };
}

// The label is placed by `--_column-value-y` (its baseline); `getBBox` is in its own space, so its `y` is the ascent.
function landedTextTop(label: SVGTextElement): number {
  const baseline =
    parseFloat(label.style.getPropertyValue('--_column-value-y')) || 0;

  return baseline + label.getBBox().y;
}
