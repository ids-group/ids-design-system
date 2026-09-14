import * as React from 'react';

/**
 * BarChart — the real BarChartComponent, run by Angular behind `<ds-bar-chart>`.
 * Horizontal bar chart: each row in `data` prints a `label`, a formatted `value` and (unless suppressed) a percentage, with a track filled to `value` relative to `max`. The populated state renders inside a `role="img"` block carrying an auto-generated accessible name; a `<details>` data table underneath repeats every row as plain text.
 */
export interface BarChartProps {
  /** One row per bar, drawn in the order given. */
  data?: unknown;
  /** Track length is relative to this. Null uses the largest value, so the longest row always fills its track. */
  max?: number | null;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so `'none'` belongs only where the same data is already in a table on the page. */
  dataTable?: 'toggle' | 'visible' | 'none';
  /** Prints each row's share of `max` beside its value. */
  showPercent?: boolean;
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `data` is empty. */
  emptyText?: string;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. */
  errorText?: string;
  /** Formats every value the chart prints, the annex table and the generated description included. Defaults to the browser's locale grouping with a K/M/B suffix past four digits. */
  valueFormat?: unknown;
  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The row that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onRowClicked?: (value: unknown) => void;
  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at all; `40` is the documented non-zero step. The total is capped, so a long series does not crawl in. */
  staggerMs?: number;
  /** Whether a hovered or focused row opens a tooltip. `'axis'` is not offered — a bar chart's marks ARE its categories, so an axis tooltip would repeat the item one. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const BarChart: React.ComponentType<BarChartProps>;
