import * as React from 'react';

/**
 * WaterfallChart — the real WaterfallChartComponent, run by Angular behind `<ds-waterfall-chart>`.
 * A running total, bar by bar: what a figure started at, what moved it, and what it ended at. The one variant in the chart family that genuinely cannot be a mode on another — it needs an accumulating level, bars pinned to zero for the totals, and its own three-colour semantic, all at once.
 */
export interface WaterfallChartProps {
  /** The bars in the order they are read, which is the order they happened in - a waterfall is never sorted, because the sequence is the meaning. */
  data?: unknown;
  /** Prints each bar's own reading above it, with its sign. */
  showValues?: boolean;
  /** The dashed rule chaining one bar to the next at the level they share. Without it the bars read as separate columns rather than as one running total. */
  showConnectors?: boolean;
  /** Printed above the plot as the visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** The accessible name. Generated from the steps when omitted, naming each one's direction in words and the figure the chain ends at. */
  summary?: string | null;
  /** A hint, not a count. Ticks snap to a round step. */
  tickCount?: number;
  /** Turns on the click affordance and the keyboard route. `barClicked` fires whether or not this is set. */
  interactive?: boolean;
  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  frame?: ('auto' | 'none') | null;
  /** The annex table under the plot. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. It prints each step's direction, its own reading and the running total. */
  dataTable?: unknown;
  /** Skeleton bars at the real count, so the page does not resize when the data lands. */
  loading?: boolean;
  /** Separate from an empty `data`: "the request failed" and "there is nothing to show" read the same and mean opposite things. */
  error?: boolean;
  /** Shown in place of the plot when `data` is empty. Unset falls back to `DS_INTL.chart.empty`. */
  emptyText?: string | null;
  /** Shown in place of the plot while `error` is set. Unset falls back to `DS_INTL.chart.error`. */
  errorText?: string | null;
  /** Formats every value the chart prints - the axis ticks, the bar labels and the annex table. The sign a delta carries is added around it, so a formatter never has to know about one. */
  valueFormat?: unknown;
  /** The clicked datum, as it was given. Fires on click and on Enter or Space. */
  onBarClicked?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const WaterfallChart: React.ComponentType<WaterfallChartProps>;
