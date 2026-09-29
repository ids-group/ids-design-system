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

/**
 * The inputs every chart has, declared once.
 *
 * Only the UNIVERSAL ones belong here. An input some charts have and others do not - `dimOthers`,
 * `staggerMs`, `dataTable`, `tooltip` - stays on the chart that has it, which implements the
 * matching interface below, so a chart that has no use for one never grows it.
 * @internal
 */
@Directive()
export abstract class DsChartBase {
  /** `'auto'` draws the chart's own bordered, padded box, so it reads as one object on a bare page;
   *  `'none'` leaves the chart bare, for one placed inside a card the page has already drawn.
   *  Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards
   *  is one decision per app rather than per plot. */
  readonly frame = input<ChartFrame | null>(null);

  /** Printed above the plot as the chart's visible title, and reused as the annex table's
   *  caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize
   *  when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Shows `errorText` in place of the plot. Separate from `loading` and from empty data,
   *  because "the request failed" and "there is nothing to show" read the same to a reader and
   *  mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** Shown in place of the plot when there is no data. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);

  /** Formats every value the chart prints, the annex table and the generated description
   *  included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` /
   *  `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output
   *  fires whether or not this is set, so a consumer that binds the output and forgets the flag
   *  still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

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

  /** Holds the clicked mark and its tooltip in place, with a pin disc on it, until a second
   *  click, Escape or a press outside releases it. Unset falls back to
   *  `DS_CONFIG.chart.pinOnClick`, then `true`. The click output fires either way - pinning is a
   *  state, not a handler. */
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
