import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  chartColors,
  describeSeries,
  formatPercent,
  describeShare,
  shareOfTotal,
  rovingMarks,
  leaveMark,
  staggerDelay,
  chartRenderGate,
  DsChartBase,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  barExtent,
  resolveMax,
  segmentWidths,
  widthPercent,
} from './bar-chart.math';
import type { BarChartRow, BarChartSegment } from './bar-chart.types';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';

/** A row's parts, ready to draw: a width, a colour and a formatted value each. Segments are
 *  CATEGORIES, so they take the categorical palette in order — unlike the rows, which are one
 *  series and share one colour. */
function segmentsOf(
  row: BarChartRow,
  format: (value: number) => string,
): readonly {
  key: string;
  segment: BarChartSegment;
  widthPercent: number;
  formattedValue: string;
  color: string;
}[] {
  const parts = row.segments ?? [];
  const widths = segmentWidths(parts.map((part) => part.value));

  return widths.length
    ? parts.map((segment, index) => ({
        key: segment.id ?? String(index),
        segment,
        widthPercent: widths[index],
        formattedValue: format(segment.value),
        color:
          segment.color ??
          CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
      }))
    : [];
}

@Component({
  selector: 'ds-bar-chart',
  standalone: true,
  imports: [
    SkeletonComponent,
    ChartTooltipDirective,
    IconComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
  host: { '[class.framed]': "frameResolved() === 'auto'" },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent
  extends DsChartBase
  implements
    ChartDimmable,
    ChartStaggered,
    ChartWithDataTable,
    ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  protected readonly leaveMark = leaveMark;

  /** One row per bar, drawn in the order given. */
  readonly data = input<readonly BarChartRow[]>([]);

  /** Track length is relative to this. Null uses the largest value, so the
   *  longest row always fills its track. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

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

  /** Prints each row's share of `max` beside its value. */
  readonly showPercent = input(true, { transform: booleanAttribute });

  readonly dataTableResolved = this.defaults.dataTable;

  /** The row that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly rowClicked = output<BarChartRow>();

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The segment to single out, by its `id` - or by its position as a string where it has none.
   *  Every other segment in every row fades, the same answer `highlighted` gives on a series
   *  mark. Independent of `dimOthers`, which governs what a pointer does. A row without segments
   *  is unaffected. */
  readonly highlighted = input<string | null>(null);

  protected isSegmentDimmed(key: string): boolean {
    const highlighted = this.highlighted();

    return highlighted !== null && highlighted !== key;
  }

  /** Milliseconds between one row's entrance and the next, `40` by default; `0` turns the stagger
   *  off. The whole spread stays within 260ms, so a long chart
   *  narrows the step instead of crawling in. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.rows().length, this.staggerMs())}ms`;
  }

  /** Whether a hovered or focused row opens a tooltip. `'axis'` is not offered — a bar
   *  chart's marks ARE its categories, so an axis tooltip would repeat the item one. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  private readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  protected readonly activeMark = chartActiveMark(
    () => this.tooltipLingerResolved(),
    () => this.defaults.hoverDelayMs(),
  );

  protected onMarkClick(
    payload: BarChartRow,
    index: number,
    event: Event,
  ): void {
    this.rowClicked.emit(payload);
    if (this.defaults.pinOnClick()) {
      this.activeMark.pin(index, event, '.fill');
    }
  }
  protected readonly roving = rovingMarks(() => this.rows().length);

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.roving.focus(index);
    this.activeMark.enter(index, event, '.fill');
  }

  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    this.roving.navigate(
      event,
      index,
      (event.currentTarget as Element).closest('.rows'),
    );
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const entry = this.rows()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !entry) {
        return null;
      }

      // A segmented bar draws several readings the row label cannot name, so the row heads the
      // panel and each segment gets its own line. Repeating the label the pointer is already on
      // would tell the reader nothing.
      if (entry.segments.length) {
        const values = entry.segments.map((part) => part.segment.value);

        return {
          category: entry.row.label,
          entries: entry.segments.map((part, partIndex) => ({
            label: part.segment.label,
            value: part.segment.value,
            formatted: part.formattedValue,
            color: part.color,
            detail: describeShare(
              values,
              partIndex,
              this.defaults.locale,
              (share) => this.intl().chart.shareOfTotal(share),
            ),
          })),
        };
      }

      return {
        category: '',
        entries: [
          {
            label: entry.row.label,
            value: barExtent(entry.row.value).high,
            formatted: entry.formattedValue,
            color: entry.color,
            detail: this.partOfWhole()
              ? describeShare(
                  this.data().map((row) => {
                    const extent = barExtent(row.value);

                    return extent.high - extent.low;
                  }),
                  this.activeMark.index(),
                  this.defaults.locale,
                  (share) => this.intl().chart.shareOfTotal(share),
                )
              : undefined,
          },
        ],
      };
    },
  );

  /** The track has to hold the far end of every bar, the target tick and the outermost band -
   *  a goal above every reading is the one the chart is read for, and an axis derived from the
   *  bars alone would draw it off the end. */
  protected readonly resolvedMax = computed(() =>
    resolveMax(
      this.max(),
      this.data().flatMap((row) => [
        barExtent(row.value).high,
        row.target ?? 0,
        ...(row.ranges ?? []),
      ]),
    ),
  );

  protected readonly dataTableColumns = computed<readonly string[]>(() =>
    this.partOfWhole()
      ? [
          this.intl().chart.labelColumn,
          this.intl().chart.valueColumn,
          this.intl().chart.shareColumn,
        ]
      : [this.intl().chart.labelColumn, this.intl().chart.valueColumn],
  );

  /** A row's segments follow it as nested rows: one table reads in one pass, and a segment is
   *  read against the bar it belongs to rather than against the other bars. */
  protected readonly dataTableRows = computed<readonly ChartDataRow[]>(() =>
    this.rows().flatMap((entry) => [
      {
        key: `bar:${entry.key}`,
        cells: this.partOfWhole()
          ? [
              [entry.row.label, entry.row.detail].filter(Boolean).join(' - '),
              entry.formattedValue,
              entry.share,
            ]
          : [
              [entry.row.label, entry.row.detail].filter(Boolean).join(' - '),
              entry.formattedValue,
            ],
      },
      ...entry.segments.map((part) => ({
        // Both keys fall back to a positional index in their OWN scope, and flattening puts
        // them in one list - a bar and its first segment would otherwise both be "0".
        key: `bar:${entry.key}/${part.key}`,
        nested: true,
        cells: this.partOfWhole()
          ? [part.segment.label, part.formattedValue, '']
          : [part.segment.label, part.formattedValue],
      })),
    ]),
  );

  protected readonly rows = computed(() => {
    const max = this.resolvedMax();
    const format = this.valueFormatResolved();
    // The bar's LENGTH is what a share is a share of, and on a floating bar that is the span
    // between its ends rather than either end on its own.
    const values = this.data().map((row) => {
      const extent = barExtent(row.value);

      return extent.high - extent.low;
    });

    return this.data().map((row, index) => {
      const extent = barExtent(row.value);
      const span = extent.high - extent.low;
      const isRange = typeof row.value !== 'number';

      return {
        key: row.id ?? String(index),
        row,
        offsetPercent: widthPercent(extent.low, max),
        widthPercent: widthPercent(span, max),
        formattedValue: isRange
          ? `${format(extent.low, 'tooltip')} - ${format(extent.high, 'tooltip')}`
          : format(extent.high, 'tooltip'),
        targetPercent:
          row.target === undefined ? null : widthPercent(row.target, max),
        formattedTarget:
          row.target === undefined ? '' : format(row.target, 'tooltip'),
        bands: (row.ranges ?? []).map((bound, bandIndex, all) => ({
          key: `${row.id ?? index}-band-${bandIndex}`,
          widthPercent: widthPercent(bound, max),
          // Rising opacity rather than rising hue: the bands are one backdrop read as an order,
          // and a second palette behind the bars would compete with the bars themselves.
          opacity: (bandIndex + 1) / (all.length + 1),
        })),
        formattedPercent:
          row.percent !== undefined
            ? formatPercent(row.percent, 100, this.defaults.locale)
            : formatPercent(span, max, this.defaults.locale),
        share: this.partOfWhole()
          ? shareOfTotal(values, index, this.defaults.locale)
          : '',
        segments: segmentsOf(row, (value) => format(value, 'tooltip')),
        color: row.color ?? chartColors.seriesDefault,
      };
    });
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.intl().chart,
        this.caption() ?? this.intl().chart.title,
        this.data().map((row) => ({
          label: row.label,
          value: barExtent(row.value).high - barExtent(row.value).low,
        })),
        (value) => this.valueFormatResolved()(value, 'tooltip'),
        this.dataTableResolved() !== 'none',
      ),
  );

  protected entryLabel(entry: { row: BarChartRow; formattedValue: string }) {
    return `${entry.row.label}, ${entry.formattedValue}`;
  }

  protected onRowKey(row: BarChartRow, event: Event): void {
    // Only the row's own key opens the row: a key pressed on a control inside it belongs to that
    // control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.rowClicked.emit(row);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder bars while loading. Follows the real row count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
