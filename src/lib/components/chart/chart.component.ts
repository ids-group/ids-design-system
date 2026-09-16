import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import {
  bandScale,
  defaultChartFormat,
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
  CHART_DEFAULT_TICK_COUNT,
  CHART_PLOT,
  CHART_VIEW_HEIGHT,
  CHART_VIEW_WIDTH,
  axisDomain,
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

  /** Printed above the plot as the chart's visible title. */
  readonly caption = input<string | null>(null);

  /** Accessible name for the plot. The container holds no readings of its own, so a chart that
   *  needs its numbers described supplies the sentence here. */
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

  protected readonly viewBox = `0 0 ${CHART_VIEW_WIDTH} ${CHART_VIEW_HEIGHT}`;

  readonly plot: Signal<ChartPlot> = signal(CHART_PLOT);

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
    () => this.plotBottom() + CHART_CATEGORY_LABEL_OFFSET,
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
