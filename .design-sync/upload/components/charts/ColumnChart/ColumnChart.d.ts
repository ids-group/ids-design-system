import * as React from 'react';

/**
 * ColumnChart — the real ColumnChartComponent, run by Angular behind `<ds-column-chart>`.
 * Vertical columns for a short series read left to right — months, stages, teams. Every column is measured against one value axis whose ticks snap to round numbers, each column prints its own value above itself, and a skeleton holds the space while the numbers are still arriving.
 */
export interface ColumnChartProps {
  /** One column per point, drawn in the order given - or one NAMED SERIES per entry, where every category carries a column from each. The two forms are told apart by their shape, so a chart handed a flat list behaves exactly as it always has. */
  data?: unknown;
  /** How several series share one category's band. `'none'`, the default, and `'grouped'` draw them side by side - a chart of one series takes the whole band either way, so the two differ only in spelling. `'stacked'` puts each series on top of the one before it, and `'normalized'` stacks then divides by the category's total, so every band is full and the axis reads in shares. Unrelated to `ds-line-chart`'s `axisMode="stacked"`, which is two PLOTS one above the other. */
  stack?: ('none' | 'grouped' | 'stacked' | 'normalized');
  /** Reference lines and bands drawn across the plot, behind the columns: a target, a budget, an SLA. Each one opens the value axis far enough to hold it, so a target above every column is still on the plot, and each is named in the generated description - a line only the sighted reader gets is an annotation half the audience never receives. */
  thresholds?: unknown;
  /** Prints each column's value above the column. */
  showValues?: boolean;
  /** How many value-axis ticks to aim for. A hint, not a count: ticks are snapped to a round step, so the axis may carry one more or one fewer. */
  tickCount?: number;
  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it; `'none'` leaves the chart bare, for one placed inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards is one decision per app rather than per plot. */
  frame?: ('auto' | 'none') | null;
  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. Zero, the default, takes it away at once: a panel that outlives the pointer sits over the plot the reader has moved on to. Raise it only for a panel a reader has to REACH — one carrying a link, a figure, or anything selectable — which is WCAG 1.4.13's hoverable clause. The panel is portaled to the body, so crossing the gap to it at an ordinary pointer speed needs about 140. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 0. */
  tooltipLingerMs?: number | null;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so `'none'` belongs only where the same data is already in a table on the page. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** Declares that the marks are parts of one whole, which is what makes a share of their total a real quantity. Off by default: a chart of visitors per stage or revenue per month sums to a number nobody can point at, and "18.6% of total" against it is arithmetic dressed as a fact. On, each mark's share appears on the tooltip's second line and in the data table. */
  partOfWhole?: boolean;
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `data` is empty. Unset falls back to `DS_INTL.chart.empty`. */
  emptyText?: string | null;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  errorText?: string | null;
  /** Formats every value the chart prints, the annex table and the generated description included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  valueFormat?: unknown;
  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The point that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onPointClicked?: (value: unknown) => void;
  /** Holds the clicked mark and its tooltip in place, with a pin disc on it, until a second click, Escape or a press outside releases it. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. `pointClicked` fires either way - pinning is a state, not a handler. */
  pinOnClick?: boolean | null;
  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark and pays for it with the rest of the chart. */
  dimOthers?: boolean;
  /** Milliseconds between one mark's entrance and the next. The steps narrow to fit the whole spread within 260ms, so a long series does not crawl in. `0` is no stagger. */
  staggerMs?: number;
  /** Whether a hovered or focused column opens a tooltip. `'axis'` is not offered — a column chart's marks ARE its categories, so an axis tooltip would repeat the item one. */
  tooltip?: ('item' | 'none');
  /** Where the tooltip is pinned. `'mark'`, the default, is the column itself — a panel over the reading it describes. `'cell'` is the full-height category cell, which puts the panel at the top of the plot whatever the column's value. */
  tooltipAnchor?: 'mark' | 'cell';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ColumnChart: React.ComponentType<ColumnChartProps>;
