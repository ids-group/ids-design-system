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
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  describeSeries,
  formatPercent,
  shareOfTotal,
  chartRenderGate,
  CHART_RENDER_GATE_PASSED,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartStackMode,
  ChartThreshold,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  ChartComponent,
  ColumnSeriesComponent,
  ReferenceLabelComponent,
  ReferenceLineComponent,
  chartViewHeight,
  stackOffsets,
} from '@ids-group-ltd/ids-design-system/components/chart';
import type { ChartStackOffset } from '@ids-group-ltd/ids-design-system/components/chart';
import { ChartLegendComponent } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import type { ChartLegendItem } from '@ids-group-ltd/ids-design-system/components/chart-legend';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartMarkFill,
  ColumnChartPoint,
  ColumnChartSeries,
} from './column-chart.types';

/** One series, ready to draw. `points` is the caller's own array, never a copy: the colour and the
 *  fill reach the marks as series-wide defaults so a clicked point comes back as the object that
 *  was handed in. */
interface ResolvedColumnSeries {
  readonly key: string;
  readonly label: string;
  /** Null leaves each mark on the categorical palette by its own position, which is what a chart
   *  of one series has always drawn. */
  readonly color: string | null;
  readonly fill: ChartMarkFill | null;
  readonly points: readonly ColumnChartPoint[];
}

function isSeriesList(
  data: readonly ColumnChartPoint[] | readonly ColumnChartSeries[],
): data is readonly ColumnChartSeries[] {
  return data.length > 0 && 'data' in data[0];
}

/** What the four geometry tokens resolve to when nothing has been set and while the host is not yet
 *  in a document — under SSR, and for the frame before the first read. */
const COLUMN_GEOMETRY = {
  plotHeight: 200,
  axisGutter: 40,
  valueSpace: 20,
  columnWidthRatio: 0.8,
};

/** The plot is an SVG coordinate space, so `--ds-column-chart-plot-height` and its three siblings
 *  cannot reach it as CSS: a length written into a `viewBox` is a number the component computes.
 *  They are read back once, from the private resolvers on the host, which is what keeps them real
 *  public hooks rather than names that parse and change nothing.
 *
 *  Read once, on the first pass: a token re-pointed at a breakpoint is NOT picked up, because
 *  `ds-chart`'s `ResizeObserver` answers the plot's width rather than a token's value. Set these
 *  from a stylesheet, not from a media query. */
function readColumnGeometry(host: HTMLElement): typeof COLUMN_GEOMETRY {
  const style = getComputedStyle(host);
  const length = (token: string, fallback: number): number => {
    const parsed = Number.parseFloat(style.getPropertyValue(token));

    // `>= 0`, so a token deliberately set to zero - no tick gutter, no label headroom - is kept
    // rather than silently replaced by the default.
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  return {
    plotHeight: length(
      '--_column-chart-plot-height',
      COLUMN_GEOMETRY.plotHeight,
    ),
    axisGutter: length(
      '--_column-chart-axis-width',
      COLUMN_GEOMETRY.axisGutter,
    ),
    valueSpace: length(
      '--_column-chart-value-space',
      COLUMN_GEOMETRY.valueSpace,
    ),
    // A share of the category's own slot, written as a percentage and used as a ratio.
    columnWidthRatio:
      length(
        '--_column-chart-column-width',
        COLUMN_GEOMETRY.columnWidthRatio * 100,
      ) / 100,
  };
}

@Component({
  selector: 'ds-column-chart',
  standalone: true,
  imports: [
    SkeletonComponent,
    ChartComponent,
    ChartLegendComponent,
    ColumnSeriesComponent,
    ReferenceLabelComponent,
    ReferenceLineComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '[style.--_column-chart-view-height]': 'viewHeightPx()',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: CHART_RENDER_GATE_PASSED, useValue: true }],
})
export class ColumnChartComponent {
  protected readonly renderReady = chartRenderGate();

  /** One column per point, drawn in the order given - or one NAMED SERIES per entry, where every
   *  category carries a column from each. The two forms are told apart by their shape, so a chart
   *  handed a flat list behaves exactly as it always has. */
  readonly data = input<
    readonly ColumnChartPoint[] | readonly ColumnChartSeries[]
  >([]);

  /** How several series share one category's band. `'none'`, the default, and `'grouped'` draw
   *  them side by side - a chart of one series takes the whole band either way, so the two differ
   *  only in spelling. `'stacked'` puts each series on top of the one before it, and
   *  `'normalized'` stacks then divides by the category's total, so every band is full and the
   *  axis reads in shares.
   *
   *  Unrelated to `ds-line-chart`'s `axisMode="stacked"`, which is two PLOTS one above the
   *  other. */
  readonly stack = input<ChartStackMode>('none');

  /** Reference lines and bands drawn across the plot, behind the columns: a target, a budget, an
   *  SLA. Each one opens the value axis far enough to hold it, so a target above every column is
   *  still on the plot, and each is named in the generated description - a line only the sighted
   *  reader gets is an annotation half the audience never receives. */
  readonly thresholds = input<readonly ChartThreshold[]>([]);

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** How many value-axis ticks to aim for. A hint, not a count: ticks are
   *  snapped to a round step, so the axis may carry one more or one fewer. */
  readonly tickCount = input(5, { transform: numberAttribute });

  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it;
   *  `'none'` leaves the chart bare, for one placed inside a card the page has already drawn.
   *  Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards
   *  is one decision per app rather than per plot. */
  readonly frame = input<ChartFrame | null>(null);

  /** Whether the tooltip draws a colour dot beside each reading. Unset falls back to
   *  `DS_CONFIG.chart.tooltipSwatches`, then draws them for two to four readings. */
  readonly tooltipSwatches = input<boolean | null>(null, {
    transform: (value: unknown) =>
      value == null ? null : booleanAttribute(value),
  });

  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. The default,
   *  500, lets the pointer cross to the next mark and find the same panel, which glides there
   *  instead of closing and opening again. Zero takes it away at once. Unset falls back to
   *  `DS_CONFIG.chart.tooltipLingerMs`, then 500. */
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
  /** Declares that the marks are parts of one whole, which is what makes a share of their total a
   *  real quantity. Off by default: a chart of visitors per stage or revenue per month sums to a
   *  number nobody can point at, and "18.6% of total" against it is arithmetic dressed as a fact.
   *  On, each mark's share appears on the tooltip's second line and in the data table. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize
   *  when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`,
   *  because "the request failed" and "there is nothing to show" read the same to a reader and
   *  mean opposite things. */
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

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The point that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly pointClicked = output<ColumnChartPoint>();

  /** Holds the clicked mark and its tooltip in place, with a pin disc on it, until a second click,
   *  Escape or a press outside releases it. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then
   *  `true`. `pointClicked` fires either way - pinning is a state, not a handler. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next. The steps narrow to fit the whole
   *  spread within 260ms, so a long series does not crawl in.
   *  `0` is no stagger. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  /** Whether a hovered or focused column opens a tooltip. `'axis'` is not offered — a
   *  column chart's marks ARE its categories, so an axis tooltip would repeat the item one. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  /** Where the tooltip is pinned. `'mark'`, the default, is the column itself — a panel over the
   *  reading it describes. `'cell'` is the full-height category cell, which puts the panel at the
   *  top of the plot whatever the column's value. */
  readonly tooltipAnchor = input<'mark' | 'cell'>('mark');

  /** The value is printed ABOVE the column, so a panel anchored to the column alone opens on top
   *  of that number. One text line of clearance puts it above both. */
  protected readonly valueClearance = computed(() =>
    this.showValues() ? 18 : 0,
  );

  protected readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  protected readonly geometry = signal(COLUMN_GEOMETRY);

  /** Every state occupies the box the plot would have, so nothing on the page moves when the data
   *  lands or the request fails. */
  protected readonly viewHeightPx = computed(
    () =>
      `${chartViewHeight(this.geometry().plotHeight, this.geometry().valueSpace)}px`,
  );

  protected readonly skeletonHeightPx = computed(
    () => `${this.geometry().plotHeight}px`,
  );

  protected readonly seriesRefs = viewChildren(ColumnSeriesComponent);

  protected readonly pinnedSeries = computed(
    () =>
      this.seriesRefs().find((series) => series.activeMark.pinned()) ?? null,
  );

  protected readonly resolvedSeries = computed<readonly ResolvedColumnSeries[]>(
    () => {
      const given = this.data();
      if (!isSeriesList(given)) {
        return [
          { key: 'series', label: '', color: null, fill: null, points: given },
        ];
      }

      return given.map((series, index) => ({
        key: series.id,
        label: series.label,
        color:
          series.color ??
          CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
        fill: series.fill ?? null,
        points: series.data,
      }));
    },
  );

  /** Stacking collapses every series onto ONE slot, which is also why a stacked series is drawn
   *  at slot 0 rather than at its own index - its segments sit on top of each other, not beside
   *  them. */
  protected readonly slotCount = computed(() =>
    this.stack() === 'stacked' || this.stack() === 'normalized'
      ? 1
      : this.resolvedSeries().length,
  );

  private readonly offsets = computed(() =>
    stackOffsets(
      this.resolvedSeries().map((series) =>
        series.points.map((point) => point.value),
      ),
      this.stack(),
    ),
  );

  protected offsetsFor(index: number): readonly ChartStackOffset[] {
    return this.offsets()[index] ?? [];
  }

  /** The categories come from the LONGEST series: a series that stops early leaves the bands past
   *  its end standing rather than taking them off the axis for every other series too. */
  protected readonly categories = computed(() =>
    this.resolvedSeries()
      .reduce<readonly ColumnChartPoint[]>(
        (longest, series) =>
          series.points.length > longest.length ? series.points : longest,
        [],
      )
      .map((point) => point.label),
  );

  protected readonly multiSeries = computed(
    () => this.resolvedSeries().length > 1,
  );

  /** The series named in the legend under the pointer, which fades the rest. */
  protected readonly highlightedSeries = signal<string | null>(null);

  protected readonly legendItems = computed<readonly ChartLegendItem[]>(() =>
    this.resolvedSeries().map((series) => ({
      id: series.key,
      label: series.label,
      color: series.color ?? '',
    })),
  );

  /** A normalized stack draws shares, not readings, so the axis has to say so - the value printed
   *  beside each mark stays the reading, which is what `valueFormat` goes on formatting. */
  protected readonly axisFormat = computed<ChartValueFormat | null>(() =>
    this.stack() === 'normalized'
      ? (value: number) => formatPercent(value, 1, this.defaults.locale)
      : this.valueFormat(),
  );

  protected readonly dataTableColumns = computed<readonly string[]>(() => [
    ...(this.multiSeries() ? [this.intl().chart.seriesColumn] : []),
    this.intl().chart.labelColumn,
    this.intl().chart.valueColumn,
    ...(this.partOfWhole() ? [this.intl().chart.shareColumn] : []),
  ]);

  protected readonly dataTableRows = computed<readonly ChartDataRow[]>(() =>
    this.tableRows().map((row) => ({
      key: row.key,
      cells: [
        ...(this.multiSeries() ? [row.series] : []),
        row.label,
        row.formattedValue,
        ...(this.partOfWhole() ? [row.share] : []),
      ],
    })),
  );

  protected readonly tableRows = computed(() => {
    const format = this.valueFormatResolved();

    return this.resolvedSeries().flatMap((series) => {
      const values = series.points.map((point) => point.value);

      return series.points.map((point, index) => ({
        key: `${series.key}:${point.id ?? index}`,
        series: series.label,
        label: point.label,
        formattedValue: format(point.value, 'tooltip'),
        share: this.partOfWhole()
          ? shareOfTotal(values, index, this.defaults.locale)
          : '',
      }));
    });
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      this.resolvedSeries()
        .map((series, index) =>
          describeSeries(
            this.intl().chart,
            series.label || this.caption() || this.intl().chart.title,
            series.points.map((point) => ({
              label: point.label,
              value: point.value,
            })),
            (value) => this.valueFormatResolved()(value, 'tooltip'),
            this.dataTableResolved() !== 'none',
            // The reference lines belong to the plot, not to a series, so they are named once.
            index === 0 ? this.thresholds() : [],
          ),
        )
        .join(' '),
  );

  protected readonly isEmpty = computed(() => this.categories().length === 0);

  /** Placeholder columns while loading. Follows the real point count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonColumns = computed(() =>
    Array.from({ length: Math.max(this.categories().length, 3) }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() =>
      this.geometry.set(readColumnGeometry(host.nativeElement)),
    );
  }
}
