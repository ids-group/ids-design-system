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
  DsChartBase,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
import {
  ChartTooltipDirective,
  ChartStatesComponent,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  barExtent,
  isMissing,
  partSpans,
  placeRows,
  plainValue,
  resolveMax,
  segmentWidths,
  shownRows,
  widthPercent,
} from './bar-chart.math';
import type {
  BarChartLabelPosition,
  BarChartRow,
  BarChartSegment,
} from './bar-chart.types';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';

const MISSING_VALUE = '—';

let nextBarChartId = 0;

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
    LoadingOverlayComponent,
    ChartTooltipDirective,
    ChartStatesComponent,
    IconComponent,
    ChartDataTableComponent,
    TooltipDirective,
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

  /** Track length is relative to this. Null uses the largest value. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`,
   *  then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Declares the marks parts of one whole: each share appears on the tooltip's second line and in
   *  the data table. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  /** Prints each row's share of `max` beside its value. A row's own `showPercent` overrides it. */
  readonly showPercent = input(true, { transform: booleanAttribute });

  /** `'start'` puts each label in a column before its bar, on the bar's line, with the values in
   *  aligned columns after it; `'top'` keeps the label on its own line above the bar. */
  readonly labelPosition = input<BarChartLabelPosition>('top');

  private readonly idPrefix = `ds-bar-chart-${++nextBarChartId}`;

  private readonly expanded = signal<ReadonlySet<string>>(new Set());

  protected isExpanded(key: string): boolean {
    return this.expanded().has(key);
  }

  protected toggleRow(key: string, event?: Event): void {
    event?.stopPropagation();
    this.expanded.update((open) => {
      const next = new Set(open);
      if (!next.delete(key)) {
        next.add(key);
      }

      return next;
    });
  }

  protected hintId(key: string): string {
    return `${this.idPrefix}-hint-${key}`;
  }

  /** A disclosure or a term button cannot live inside `role="img"`, whose children are presentational. */
  protected readonly holdsControls = computed(() =>
    this.data().some((row) => !!row.hint || !!row.children?.length),
  );

  protected readonly percentColumn = computed(() =>
    this.rows().some((entry) => entry.showsPercent),
  );

  readonly dataTableResolved = this.defaults.dataTable;

  /** The row clicked or activated with Enter or Space, whether or not `interactive` is set. */
  readonly rowClicked = output<BarChartRow>();

  /** Dims every OTHER mark while one is hovered or focused. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The segment to single out, by its `id` or its position as a string; every other segment
   *  fades. Independent of `dimOthers`. */
  readonly highlighted = input<string | null>(null);

  protected isSegmentDimmed(key: string): boolean {
    const highlighted = this.highlighted();

    return highlighted !== null && highlighted !== key;
  }

  /** Milliseconds between one row's entrance and the next; `0` turns it off. The step narrows to keep the spread within 260ms. */
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

  // A tree's convention: Right opens a closed group and Left closes an open one; otherwise the arrows walk the rows.
  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    const entry = this.rows()[index];
    if (
      entry?.hasChildren &&
      (event.key === 'ArrowRight' || event.key === 'ArrowLeft') &&
      (event.key === 'ArrowRight') !== this.isExpanded(entry.key)
    ) {
      event.preventDefault();
      this.toggleRow(entry.key);

      return;
    }
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
            value: entry.missing
              ? Number.NaN
              : (plainValue(entry.row.value) ??
                barExtent(entry.row.value).high),
            formatted: entry.formattedValue,
            color: entry.color,
            detail:
              this.partOfWhole() && entry.dataIndex !== null
                ? describeShare(
                    partSpans(this.data()),
                    entry.dataIndex,
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
    this.entries().flatMap((entry) => [
      {
        key: `bar:${entry.key}`,
        nested: entry.parentKey !== null,
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
        key: `segment:${entry.key}/${part.key}`,
        nested: true,
        cells: this.partOfWhole()
          ? [part.segment.label, part.formattedValue, '']
          : [part.segment.label, part.formattedValue],
      })),
    ]),
  );

  /** Every row, children included whether or not their group is open: the data table lists them all. */
  protected readonly entries = computed(() => {
    const chartMax = this.resolvedMax();
    const format = this.valueFormatResolved();
    const values = partSpans(this.data());
    const colors = new Map<string, string>();
    const percents = new Map<string, boolean | undefined>();
    let topIndex = -1;

    return placeRows(this.data()).map((placed) => {
      const { row, key, parentKey, scale, startsDetached } = placed;
      const max = scale ?? chartMax;
      const extent = barExtent(row.value);
      const span = extent.high - extent.low;
      const isRange = typeof row.value !== 'number';
      const missing = isMissing(row.value);
      const dataIndex = parentKey === null ? ++topIndex : null;
      const color =
        row.color ??
        (parentKey === null ? undefined : colors.get(parentKey)) ??
        chartColors.seriesDefault;
      if (parentKey === null) {
        colors.set(key, color);
        percents.set(key, row.showPercent);
      }

      return {
        key,
        parentKey,
        row,
        dataIndex,
        hasChildren: parentKey === null && !!row.children?.length,
        startsDetached,
        showsPercent:
          row.showPercent ??
          (parentKey === null ? undefined : percents.get(parentKey)) ??
          this.showPercent(),
        missing,
        offsetPercent: widthPercent(extent.low, max),
        widthPercent: widthPercent(span, max),
        formattedValue: missing
          ? MISSING_VALUE
          : isRange
            ? `${format(extent.low, 'tooltip')} - ${format(extent.high, 'tooltip')}`
            : format(plainValue(row.value) ?? extent.high, 'tooltip'),
        targetPercent:
          row.target === undefined ? null : widthPercent(row.target, max),
        formattedTarget:
          row.target === undefined ? '' : format(row.target, 'tooltip'),
        bands: (row.ranges ?? []).map((bound, bandIndex, all) => ({
          key: `${key}-band-${bandIndex}`,
          widthPercent: widthPercent(bound, max),
          opacity: (bandIndex + 1) / (all.length + 1),
        })),
        formattedPercent:
          row.percent !== undefined
            ? formatPercent(row.percent, 100, this.defaults.locale)
            : missing
              ? MISSING_VALUE
              : formatPercent(span, max, this.defaults.locale),
        share:
          !this.partOfWhole() || dataIndex === null || row.detached
            ? ''
            : missing
              ? MISSING_VALUE
              : shareOfTotal(values, dataIndex, this.defaults.locale),
        segments: segmentsOf(row, (value) => format(value, 'tooltip')),
        color,
      };
    });
  });

  /** The rows drawn: every top-level row, and the children of the open groups. */
  protected readonly rows = computed(() =>
    shownRows(this.entries(), this.expanded()),
  );

  protected readonly accessibleName = computed(() => {
    const summary = this.summary();
    if (summary !== null) {
      return summary;
    }
    const points = this.data().map((row) => ({
      label: row.label,
      value: isMissing(row.value)
        ? Number.NaN
        : (plainValue(row.value) ??
          barExtent(row.value).high - barExtent(row.value).low),
    }));
    const measured = points.filter((point) => Number.isFinite(point.value));
    const format = this.valueFormatResolved();

    return describeSeries(
      this.intl().chart,
      this.caption() ?? this.intl().chart.title,
      measured.length ? measured : points,
      (value) =>
        Number.isFinite(value) ? format(value, 'tooltip') : MISSING_VALUE,
      this.dataTableResolved() !== 'none',
    );
  });

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

  /** Skeleton rows only before there is a row to show; a reload keeps the rows under an overlay, as `ds-table` does. */
  protected readonly showsSkeleton = computed(
    () => (this.loading() && this.data().length === 0) || !this.renderReady(),
  );

  protected readonly reloading = computed(
    () => this.loading() && !this.showsSkeleton(),
  );

  /** One label width per placeholder row, varied so the column does not read as a solid block. */
  protected readonly skeletonRows = computed(() =>
    Array.from(
      { length: Math.max(this.data().length, 3) },
      (_, index) => `${[70, 90, 55][index % 3]}%`,
    ),
  );
}
