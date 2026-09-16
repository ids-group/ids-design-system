import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Signal,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import {
  bandScale,
  defaultChartFormat,
  elementWidth,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  CHART_AXIS_LABEL_GAP,
  CHART_BAND_PADDING,
  CHART_CATEGORY_LABEL_OFFSET,
  CHART_DEFAULT_AXIS_GUTTER,
  CHART_DEFAULT_PLOT_HEIGHT,
  CHART_DEFAULT_TICK_COUNT,
  CHART_DEFAULT_VALUE_SPACE,
  CHART_FALLBACK_WIDTH,
  axisDomain,
  chartPlot,
  chartViewHeight,
  valueScale,
} from './chart.math';
import {
  CHART_SCALES,
  type ChartPlot,
  type ChartScales,
} from './chart-scales.token';

@Component({
  selector: 'ds-chart',
  standalone: true,
  imports: [SkeletonComponent],
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

  readonly frameResolved = resolveWithConfig(
    this.frame,
    (config) => config.chart?.frame,
    'auto' as ChartFrame,
  );
  protected readonly emptyTextResolved = resolveWithConfig(
    this.emptyText,
    (config) => config.chart?.emptyText,
    'No data',
  );
  protected readonly errorTextResolved = resolveWithConfig(
    this.errorText,
    (config) => config.chart?.errorText,
    'Could not load the data',
  );
  protected readonly valueFormatResolved = resolveWithConfig(
    this.valueFormat,
    (config) => config.chart?.valueFormat,
    defaultChartFormat,
  );

  /** The `<svg>`'s own rendered width: `:host(.framed)` carries the frame padding, so the host's
   *  CONTENT box - which is what a `ResizeObserver` reports - is the box the canvas fills at
   *  `inline-size: 100%`. Measuring the host is therefore measuring the canvas. */
  private readonly measuredWidth = elementWidth(
    inject<ElementRef<HTMLElement>>(ElementRef),
  );

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
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => this.settled.set(true));
      });
      onCleanup(() => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      });
    });
  }

  protected readonly viewHeight = computed(() =>
    chartViewHeight(this.plotHeight(), this.valueSpace()),
  );

  /** One viewBox unit is one CSS pixel, in both axes. That is the whole point of measuring: a
   *  radius, a gutter or a width cap set anywhere inside the plot is then the length it says it
   *  is, at every card width, instead of a share of one that a fixed viewBox stretches. */
  protected readonly viewBox = computed(
    () => `0 0 ${this.viewWidth()} ${this.viewHeight()}`,
  );

  readonly plot: Signal<ChartPlot> = computed(() =>
    chartPlot(
      this.viewWidth(),
      this.plotHeight(),
      this.axisGutter(),
      this.valueSpace(),
    ),
  );

  private readonly reportedDomains = signal<
    ReadonlyMap<string, readonly number[]>
  >(new Map());

  reportDomain(id: string, values: readonly number[]): void {
    this.reportedDomains.update((reported) =>
      new Map(reported).set(id, values),
    );
  }

  releaseDomain(id: string): void {
    this.reportedDomains.update((reported) => {
      const next = new Map(reported);
      next.delete(id);

      return next;
    });
  }

  /** Compared by value, which is what stops a mark that reports AND reads `yPosition()` in one
   *  effect from running forever: every report allocates a fresh `Map` and `niceDomain` a fresh
   *  object, so identity always differs and the read would re-arm the write. Measured without it:
   *  97507 effect runs in 45 seconds, no Angular loop error, renderer unresponsive. */
  protected readonly domain = computed(
    () =>
      axisDomain(
        this.reportedDomains().values(),
        this.tickCount(),
        this.min(),
        this.max(),
      ),
    { equal: (a, b) => a.min === b.min && a.max === b.max },
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

  readonly activeIndex = signal(-1);

  setActiveIndex(index: number): void {
    const last = this.categories().length - 1;
    this.activeIndex.set(
      Number.isFinite(index)
        ? Math.min(Math.max(Math.trunc(index), -1), last)
        : -1,
    );
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
  protected readonly categoryLabelY = computed(
    () => this.plotBottom() + this.valueSpace() + CHART_CATEGORY_LABEL_OFFSET,
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

  protected readonly categoryLabels = computed(() => {
    const toX = this.xPosition();

    return this.categories().map((text, index) => ({ x: toX(index), text }));
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
