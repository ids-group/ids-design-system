import * as React from 'react';

/**
 * ColumnChart — the real ColumnChartComponent, run by Angular behind `<ds-column-chart>`.
 * Vertical columns for a short series read left to right — months, stages, teams. Every column is measured against one value axis whose ticks snap to round numbers, each column prints its own value above itself, and a skeleton holds the space while the numbers are still arriving.
 */
export interface ColumnChartProps {
  /** One column per point, drawn in the order given. */
  data?: unknown;
  /** Prints each column's value above the column. */
  showValues?: boolean;
  /** How many value-axis ticks to aim for. A hint, not a count: ticks are snapped to a round step, so the axis may carry one more or one fewer. */
  tickCount?: number;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so `'none'` belongs only where the same data is already in a table on the page. */
  dataTable?: 'toggle' | 'visible' | 'none';
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
  /** The point that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onPointClicked?: (value: unknown) => void;
  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at all; `40` is the documented non-zero step. The total is capped, so a long series does not crawl in. */
  staggerMs?: number;
  /** Whether a hovered or focused column opens a tooltip. `'axis'` is not offered — a column chart's marks ARE its categories, so an axis tooltip would repeat the item one. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ColumnChart: React.ComponentType<ColumnChartProps>;
