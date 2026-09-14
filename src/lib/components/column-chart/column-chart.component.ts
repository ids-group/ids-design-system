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
  describeSeries,
  formatTick,
  formatValue,
  niceMax,
  tickStep,
  focusMark,
  nextRovingIndex,
  staggerDelay,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
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
import { heightPercent, resolveDomainMax } from './column-chart.math';
import type { ColumnChartPoint } from './column-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

@Component({
  selector: 'ds-column-chart',
  standalone: true,
  imports: [SkeletonComponent, ChartTooltipDirective],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnChartComponent {
  /** One column per point, drawn in the order given. */
  readonly data = input.required<readonly ColumnChartPoint[]>();

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** How many value-axis ticks to aim for. A hint, not a count: ticks are
   *  snapped to a round step, so the axis may carry one more or one fewer. */
  readonly tickCount = input(5, { transform: numberAttribute });

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

  /** The point that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly pointClicked = output<ColumnChartPoint>();

  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at
   *  all; `40` is the documented non-zero step. The total is capped, so a long series does not
   *  crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

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

  protected readonly activeMark = chartActiveMark();

  protected onMarkEnter(index: number, event: Event): void {
    this.activeMark.enter(
      index,
      event,
      this.tooltipAnchor() === 'mark' ? '.bar' : undefined,
    );
  }
  /** One tab stop per chart, not one per mark: WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable, and that is what keeps a
   *  twenty-five mark chart from being twenty-five stops in the page's tab order. */
  protected readonly rovingIndex = signal(0);

  protected readonly tabStopIndex = computed(() =>
    Math.min(this.rovingIndex(), Math.max(0, this.columns().length - 1)),
  );

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.rovingIndex.set(index);
    this.onMarkEnter(index, event);
  }

  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    const next = nextRovingIndex(event.key, index, this.columns().length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    this.rovingIndex.set(next);
    focusMark((event.currentTarget as Element).closest('.columns'), next);
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const entry = this.columns()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !entry) {
        return null;
      }

      return {
        category: '',
        entries: [
          {
            label: entry.point.label,
            value: entry.point.value,
            formatted: entry.formattedValue,
            color: entry.color,
          },
        ],
      };
    },
  );

  protected readonly domainMax = computed(() =>
    resolveDomainMax(this.data().map((point) => point.value)),
  );

  /** Top of the value axis: the domain rounded up to a whole tick, so the
   *  tallest column ends on a gridline rather than between two. */
  protected readonly axisMax = computed(() =>
    niceMax(this.domainMax(), this.tickCount()),
  );

  protected readonly ticks = computed(() => {
    const axisMax = this.axisMax();
    // Niced from the same domain as `axisMax`, which is what makes the top tick
    // and the top of the axis the same number.
    const values = tickValues(this.domainMax(), this.tickCount());
    const step = tickStep(values);
    const format = this.valueFormatResolved();

    return values.map((value) => ({
      label:
        format === defaultValueFormat ? formatTick(value, step) : format(value),
      offsetPercent: heightPercent(value, axisMax),
    }));
  });

  protected readonly columns = computed(() => {
    const axisMax = this.axisMax();
    const format = this.valueFormatResolved();

    return this.data().map((point, index) => ({
      key: point.id ?? String(index),
      point,
      heightPercent: heightPercent(point.value, axisMax),
      formattedValue: format(point.value),
      color:
        point.color ?? CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
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
        this.valueFormatResolved(),
        this.dataTableResolved() !== 'none',
      ),
  );

  protected entryLabel(entry: {
    point: ColumnChartPoint;
    formattedValue: string;
  }) {
    return `${entry.point.label}, ${entry.formattedValue}`;
  }

  protected onPointKey(point: ColumnChartPoint, event: Event): void {
    // Only the column's own key opens it: a key pressed on a control inside belongs to that
    // control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.pointClicked.emit(point);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder columns while loading. Follows the real point count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonColumns = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
