import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
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
  CHART_SKELETON_COUNT,
  DsChartBase,
  readOnHostResize,
  skeletonMarkCount,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  ChartDataTable,
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
import {
  ChartSkeletonComponent,
  ChartStatesComponent,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartMarkFill,
  ColumnChartPoint,
  ColumnChartSeries,
} from './column-chart.types';

interface ResolvedColumnSeries {
  readonly key: string;
  readonly label: string;
  /** Null leaves each mark on the categorical palette by its own position. */
  readonly color: string | null;
  readonly fill: ChartMarkFill | null;
  /** The caller's own array, not a copy, so a clicked point comes back as the object handed in. */
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

function sameColumnGeometry(
  previous: typeof COLUMN_GEOMETRY,
  next: typeof COLUMN_GEOMETRY,
): boolean {
  return (
    previous.plotHeight === next.plotHeight &&
    previous.axisGutter === next.axisGutter &&
    previous.valueSpace === next.valueSpace &&
    previous.columnWidthRatio === next.columnWidthRatio
  );
}

/** Reads the four geometry tokens off the host. */
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
    ChartSkeletonComponent,
    ChartComponent,
    ChartLegendComponent,
    ChartStatesComponent,
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
export class ColumnChartComponent
  extends DsChartBase
  implements
    ChartDimmable,
    ChartStaggered,
    ChartWithDataTable,
    ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  /** One column per point, drawn in the order given, or one NAMED SERIES per entry, where every
   *  category carries a column from each. The two forms are told apart by their shape. */
  readonly data = input<
    readonly ColumnChartPoint[] | readonly ColumnChartSeries[]
  >([]);

  /** How several series share one category's band. `'none'` (default) and `'grouped'` sit side
   *  by side; `'stacked'` piles them; `'normalized'` piles then divides by the category's total. */
  readonly stack = input<ChartStackMode>('none');

  /** Reference lines and bands behind the columns; each widens the value axis and is named in the generated description. */
  readonly thresholds = input<readonly ChartThreshold[]>([]);

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** How many columns the loading skeleton draws before the data is known. */
  readonly skeletonCount = input(CHART_SKELETON_COUNT, {
    transform: (raw: unknown) => numberAttribute(raw, CHART_SKELETON_COUNT),
  });

  /** How many value-axis ticks to aim for; ticks snap to a round step. */
  readonly tickCount = input(5, { transform: numberAttribute });

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`,
   *  then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Declares the marks parts of one whole: each share appears on the tooltip's second line and in
   *  the data table. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  readonly dataTableResolved = this.defaults.dataTable;

  /** The point clicked or activated with Enter or Space, whether or not `interactive` is set. */
  readonly pointClicked = output<ColumnChartPoint>();

  /** Dims every OTHER mark while one is hovered or focused. Dimmed marks lose separation between
   *  them (three series: worst pair dE 14.8 to 2.1 at `--ds-chart-dim-opacity` 0.3, measured 2026-09-13). */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next; `0` turns it off. The step narrows to fit within 260ms. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  /** Whether a hovered or focused column opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  /** Where the tooltip anchors: `'mark'` (default) is the column; `'cell'` is the full-height category cell. */
  readonly tooltipAnchor = input<'mark' | 'cell'>('mark');

  /** Keeps the panel clear of the value printed above the column. */
  protected readonly valueClearance = computed(() =>
    this.showValues() ? 18 : 0,
  );

  protected readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  protected readonly geometry = readOnHostResize(
    inject<ElementRef<HTMLElement>>(ElementRef),
    readColumnGeometry,
    COLUMN_GEOMETRY,
    sameColumnGeometry,
  );

  protected readonly viewHeightPx = computed(
    () =>
      `${chartViewHeight(this.geometry().plotHeight, this.geometry().valueSpace)}px`,
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

  protected readonly skeletonMarks = computed(() =>
    skeletonMarkCount(this.categories().length, this.skeletonCount()),
  );
}
