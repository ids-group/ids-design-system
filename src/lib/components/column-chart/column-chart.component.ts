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

/** `points` is the caller's own array, never a copy, so a clicked point comes back as the object handed in. */
interface ResolvedColumnSeries {
  readonly key: string;
  readonly label: string;
  /** Null leaves each mark on the categorical palette by its own position. */
  readonly color: string | null;
  readonly fill: ChartMarkFill | null;
  readonly points: readonly ColumnChartPoint[];
}

function isSeriesList(
  data: readonly ColumnChartPoint[] | readonly ColumnChartSeries[],
): data is readonly ColumnChartSeries[] {
  return data.length > 0 && 'data' in data[0];
}

const COLUMN_GEOMETRY = {
  plotHeight: 200,
  axisGutter: 40,
  valueSpace: 20,
  columnWidthRatio: 0.8,
};

/** Reads the four geometry tokens off the host. Read once: a token re-pointed at a breakpoint is NOT picked up. */
function readColumnGeometry(host: HTMLElement): typeof COLUMN_GEOMETRY {
  const style = getComputedStyle(host);
  const length = (token: string, fallback: number): number => {
    const parsed = Number.parseFloat(style.getPropertyValue(token));

    // `>= 0` keeps a token deliberately set to zero.
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

  /** One column per point in the order given, or one named series per entry with a column per
   *  category from each. The two forms are told apart by their shape. */
  readonly data = input.required<
    readonly ColumnChartPoint[] | readonly ColumnChartSeries[]
  >();

  /** How several series share one category's band. `'none'` (default) and `'grouped'` draw them side
   *  by side; `'stacked'` piles them; `'normalized'` piles then divides by the category's total. */
  readonly stack = input<ChartStackMode>('none');

  /** Reference lines and bands behind the columns. Each widens the value axis and is named in the generated description. */
  readonly thresholds = input<readonly ChartThreshold[]>([]);

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** How many value-axis ticks to aim for. A hint: ticks snap to a round step. */
  readonly tickCount = input(5, { transform: numberAttribute });

  /** `'auto'` draws a bordered, padded box; `'none'` leaves it bare. Unset falls back to
   *  `DS_CONFIG.chart.frame`, then `'auto'`. */
  readonly frame = input<ChartFrame | null>(null);

  /** Colour dot beside each tooltip reading. Unset falls back to `DS_CONFIG.chart.tooltipSwatches`,
   *  then dots for up to four readings. */
  readonly tooltipSwatches = input<boolean | null>(null, {
    transform: (value: unknown) =>
      value == null ? null : booleanAttribute(value),
  });

  /** Milliseconds the tooltip stays after the pointer leaves the mark; zero closes it at once. Unset
   *  falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 500. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  /** Visible title above the plot, reused as the annex table's caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** Label-and-value table under the plot: `'toggle'` behind a disclosure, `'visible'` open, `'none'`
   *  none. Use `'none'` only where the data is already in a table on the page. Unset falls back to
   *  `DS_CONFIG.chart.dataTable`, then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Declares the marks parts of one whole: each mark's share appears on the tooltip's second line and
   *  in the data table. Off by default, since a total over stages or months is not a real quantity. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  /** Draws skeleton marks in place of the data, at the same count. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Distinct from `loading` and from an empty `data`. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);
  /** Formats every printed value, including the annex table and generated description. Unset falls
   *  back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  private readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  /** Adds the pointer cursor and hover tint. `pointClicked` fires either way. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The point clicked or activated with Enter or Space, whether or not `interactive` is set. */
  readonly pointClicked = output<ColumnChartPoint>();

  /** Holds the clicked mark and its tooltip in place, with a pin disc, until a second click, Escape or a press
   *  outside. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. `pointClicked` fires either way. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  /** Dims every OTHER mark while one is hovered or focused. Off by default: it costs separation
   *  between the dimmed marks. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next; `0` is no stagger. The steps narrow to
   *  fit the whole spread within 260ms. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  /** Whether a hovered or focused column opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  /** Where the tooltip is pinned: `'mark'` (default) is the column; `'cell'` is the full-height category cell. */
  readonly tooltipAnchor = input<'mark' | 'cell'>('mark');

  /** Keeps the panel clear of the value printed above the column. */
  protected readonly valueClearance = computed(() =>
    this.showValues() ? 18 : 0,
  );

  protected readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  protected readonly geometry = signal(COLUMN_GEOMETRY);

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

  protected readonly highlightedSeries = signal<string | null>(null);

  protected readonly legendItems = computed<readonly ChartLegendItem[]>(() =>
    this.resolvedSeries().map((series) => ({
      id: series.key,
      label: series.label,
      color: series.color ?? '',
    })),
  );

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
            // Reference lines belong to the plot, so they are named once.
            index === 0 ? this.thresholds() : [],
          ),
        )
        .join(' '),
  );

  protected readonly isEmpty = computed(() => this.categories().length === 0);

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
