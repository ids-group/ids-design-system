import {
  Directive,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  type Signal,
} from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { resolveChartDefaults } from './charts-defaults';

/** The inputs every chart has, declared once. Inputs only some charts have stay on those charts. @internal */
@Directive()
export abstract class DsChartBase {
  /** `'auto'` draws the chart's own bordered, padded box; `'none'` leaves it bare, for a chart
   *  inside a card. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'`. */
  readonly frame = input<ChartFrame | null>(null);

  /** Visible title above the plot, reused as the annex table's caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** With no data, draws a skeleton in the chart's shape: `skeletonCount` marks where the chart has
   *  it, the data's count once known. With data on screen, keeps the plot under `ds-loading-overlay`. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows `errorText` in place of the plot. Separate from `loading` and from empty data. */
  readonly error = input(false, { transform: booleanAttribute });

  /** Shown when there is no data. Unset falls back to `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);

  /** Formats every printed value, including the annex table and generated description. Unset
   *  falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** Turns on the click affordance: pointer cursor and hover tint. The click output fires
   *  whether or not this is set. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Whether the tooltip draws a colour dot beside each reading. Unset falls back to
   *  `DS_CONFIG.chart.tooltipSwatches`, then shows them for two to four readings. */
  readonly tooltipSwatches = input<boolean | null>(null, {
    transform: (value: unknown) =>
      value == null ? null : booleanAttribute(value),
  });

  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds; zero closes
   *  it at once. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 500. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Holds the clicked mark and its tooltip until a second click, Escape or a press outside.
   *  Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. The click output fires either way. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  protected readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;
}

/** Whether the marks keyed `key` fade while `highlighted` is singled out: only under `dimOthers`,
 *  and never the highlighted marks themselves.
 *
 *  @internal */
export function dimmedBy<T>(
  dimOthers: boolean,
  highlighted: T | null,
  key: T,
): boolean {
  return dimOthers && highlighted !== null && highlighted !== key;
}

/** A chart that can fade every mark but the one it is answering. @internal */
export interface ChartDimmable {
  readonly dimOthers: Signal<boolean>;
}

/** A chart whose marks arrive one after another. @internal */
export interface ChartStaggered {
  readonly staggerMs: Signal<number>;
}

/** A chart with an annex table it may leave out. @internal */
export interface ChartWithDataTable {
  readonly dataTable: Signal<ChartDataTable | null>;
}

/** A chart whose tooltip trigger can be chosen or turned off. @internal */
export interface ChartWithTooltipTrigger {
  readonly tooltip: Signal<'item' | 'axis' | 'none'>;
}
