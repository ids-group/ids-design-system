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
  viewChild,
} from '@angular/core';
import {
  defaultChartFormat,
  describeSeries,
  shareOfTotal,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartThreshold,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  ChartComponent,
  ColumnSeriesComponent,
  ReferenceLabelComponent,
  ReferenceLineComponent,
  chartViewHeight,
} from '@ids-group-ltd/ids-design-system/components/chart';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type { ColumnChartPoint } from './column-chart.types';

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
    ColumnSeriesComponent,
    ReferenceLabelComponent,
    ReferenceLineComponent,
    ChartTooltipDirective,
  ],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
    '[style.--_column-chart-view-height]': 'viewHeightPx()',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnChartComponent {
  /** One column per point, drawn in the order given. */
  readonly data = input.required<readonly ColumnChartPoint[]>();

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
  /** Declares that the marks are parts of one whole, which is what makes a share of their total a
   *  real quantity. Off by default: a chart of visitors per stage or revenue per month sums to a
   *  number nobody can point at, and "18.6% of total" against it is arithmetic dressed as a fact.
   *  On, each mark's share appears on the tooltip's second line and in the data table. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

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

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The point that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly pointClicked = output<ColumnChartPoint>();

  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a press
   *  outside releases it. Off by default: a click is already the drill-down hook, and a mark left
   *  lit after the pointer has gone needs a reader who knows why it is lit. `pointClicked` fires
   *  either way — pinning is a state, not a handler. */
  readonly pinOnClick = input(false, { transform: booleanAttribute });

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at
   *  all; `40` is the documented non-zero step. The total is capped, so a long series does not
   *  crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

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

  protected readonly tooltipLingerResolved = resolveWithConfig(
    this.tooltipLingerMs,
    (config) => config.chart?.tooltipLingerMs,
    0,
  );

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

  protected readonly series = viewChild(ColumnSeriesComponent);

  protected readonly categories = computed(() =>
    this.data().map((point) => point.label),
  );

  protected readonly tableRows = computed(() => {
    const format = this.valueFormatResolved();
    const values = this.data().map((point) => point.value);

    return this.data().map((point, index) => ({
      key: point.id ?? String(index),
      label: point.label,
      formattedValue: format(point.value, 'tooltip'),
      share: this.partOfWhole() ? shareOfTotal(values, index) : '',
    }));
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.caption() ?? 'Chart',
        this.data().map((point) => ({
          label: point.label,
          value: point.value,
        })),
        (value) => this.valueFormatResolved()(value, 'tooltip'),
        this.dataTableResolved() !== 'none',
        this.thresholds(),
      ),
  );

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder columns while loading. Follows the real point count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonColumns = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() =>
      this.geometry.set(readColumnGeometry(host.nativeElement)),
    );
  }
}
