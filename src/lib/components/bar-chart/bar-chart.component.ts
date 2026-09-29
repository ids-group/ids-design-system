import {
  ChangeDetectionStrategy,
  Component,
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
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
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
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';

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
export class BarChartComponent {
  protected readonly renderReady = chartRenderGate();

  protected readonly leaveMark = leaveMark;

  /** One row per bar, drawn in the order given. */
  readonly data = input.required<readonly BarChartRow[]>();

  /** Track length is relative to this. Null uses the largest value. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

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

  /** Prints each row's share of `max` beside its value. */
  readonly showPercent = input(true, { transform: booleanAttribute });
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

  /** Holds the clicked mark and its tooltip in place, with a pin disc, until a second click, Escape or a press
   *  outside. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. `rowClicked` fires either way. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  protected readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  /** Adds the pointer cursor and hover tint. `rowClicked` fires either way. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The row clicked or activated with Enter or Space, whether or not `interactive` is set. */
  readonly rowClicked = output<BarChartRow>();

  /** Dims every OTHER mark while one is hovered or focused. Off by default: it costs separation
   *  between the dimmed marks. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The segment to single out, by its `id` or by its position as a string where it has none. Every
   *  other segment in every row fades. Independent of `dimOthers`; rows without segments are
   *  unaffected. */
  readonly highlighted = input<string | null>(null);

  protected isSegmentDimmed(key: string): boolean {
    const highlighted = this.highlighted();

    return highlighted !== null && highlighted !== key;
  }

  /** Milliseconds between one row's entrance and the next; `0` turns the stagger off. The step narrows to keep the spread within 260ms. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.rows().length, this.staggerMs())}ms`;
  }

  /** Whether a hovered or focused row opens a tooltip. */
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

  protected readonly hoveredLabel = signal(-1);

  protected readonly dimsOthers = computed(
    () =>
      this.dimOthers() ||
      (this.hoveredLabel() !== -1 &&
        this.hoveredLabel() === this.activeMark.index()),
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

  /** The track spans every bar end, target tick and outermost band. */
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
        // Positional fallbacks are per scope: unprefixed, a bar and its first segment would both be "0".
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
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.rowClicked.emit(row);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
