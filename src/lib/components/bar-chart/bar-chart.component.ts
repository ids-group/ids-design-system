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
  chartColors,
  describeSeries,
  formatPercent,
  describeShare,
  shareOfTotal,
  focusMark,
  formatValue,
  nextRovingIndex,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
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
import { resolveMax, widthPercent } from './bar-chart.math';
import type { BarChartRow } from './bar-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

@Component({
  selector: 'ds-bar-chart',
  standalone: true,
  imports: [SkeletonComponent, ChartTooltipDirective, IconComponent],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent {
  /** One row per bar, drawn in the order given. */
  readonly data = input.required<readonly BarChartRow[]>();

  /** Track length is relative to this. Null uses the largest value, so the
   *  longest row always fills its track. */
  readonly max = input<number | null>(null, {
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
   *  Unset falls back to `DS_CONFIG.chart.dataTable`, then `'toggle'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Declares that the marks are parts of one whole, which is what makes a share of their total a
   *  real quantity. Off by default: a chart of visitors per stage or revenue per month sums to a
   *  number nobody can point at, and "18.6% of total" against it is arithmetic dressed as a fact.
   *  On, each mark's share appears on the tooltip's second line and in the data table. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  /** Prints each row's share of `max` beside its value. */
  readonly showPercent = input(true, { transform: booleanAttribute });
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

  readonly dataTableResolved = resolveWithConfig(
    this.dataTable,
    (config) => config.chart?.dataTable,
    'toggle' as ChartDataTable,
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
    defaultValueFormat as ChartValueFormat,
  );

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The row that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly rowClicked = output<BarChartRow>();

  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a press
   *  outside releases it. Off by default: a click is already the drill-down hook, and a mark left
   *  lit after the pointer has gone needs a reader who knows why it is lit. `rowClicked` fires
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

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  /** Whether a hovered or focused row opens a tooltip. `'axis'` is not offered — a bar
   *  chart's marks ARE its categories, so an axis tooltip would repeat the item one. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  protected readonly activeMark = chartActiveMark();

  protected onMarkClick(
    payload: BarChartRow,
    index: number,
    event: Event,
  ): void {
    this.rowClicked.emit(payload);
    if (this.pinOnClick()) {
      this.activeMark.pin(index, event);
    }
  }
  /** One tab stop per chart, not one per mark: WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable, and that is what keeps a
   *  twenty-five mark chart from being twenty-five stops in the page's tab order. */
  protected readonly rovingIndex = signal(0);

  protected readonly tabStopIndex = computed(() =>
    Math.min(this.rovingIndex(), Math.max(0, this.rows().length - 1)),
  );

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.rovingIndex.set(index);
    this.activeMark.enter(index, event);
  }

  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    const next = nextRovingIndex(event.key, index, this.rows().length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    this.rovingIndex.set(next);
    focusMark((event.currentTarget as Element).closest('.rows'), next);
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const entry = this.rows()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !entry) {
        return null;
      }

      return {
        category: '',
        entries: [
          {
            label: entry.row.label,
            value: entry.row.value,
            formatted: entry.formattedValue,
            color: entry.color,
            detail: this.partOfWhole()
              ? describeShare(
                  this.data().map((row) => row.value),
                  this.activeMark.index(),
                )
              : undefined,
          },
        ],
      };
    },
  );

  protected readonly resolvedMax = computed(() =>
    resolveMax(
      this.max(),
      this.data().map((row) => row.value),
    ),
  );

  protected readonly rows = computed(() => {
    const max = this.resolvedMax();
    const format = this.valueFormatResolved();
    const values = this.data().map((row) => row.value);

    return this.data().map((row, index) => ({
      key: row.id ?? String(index),
      row,
      widthPercent: widthPercent(row.value, max),
      formattedValue: format(row.value),
      formattedPercent:
        row.percent !== undefined
          ? formatPercent(row.percent, 100)
          : formatPercent(row.value, max),
      share: this.partOfWhole() ? shareOfTotal(values, index) : '',
      color: row.color ?? chartColors.seriesDefault,
    }));
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.caption() ?? 'Chart',
        this.data().map((row) => ({ label: row.label, value: row.value })),
        this.valueFormatResolved(),
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
