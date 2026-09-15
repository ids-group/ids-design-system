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
  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it; `'none'` leaves the chart bare, for one placed inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards is one decision per app rather than per plot. */
  frame?: ('auto' | 'none') | null;
  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. Zero, the default, takes it away at once: a panel that outlives the pointer sits over the plot the reader has moved on to. Raise it only for a panel a reader has to REACH — one carrying a link, a figure, or anything selectable — which is WCAG 1.4.13's hoverable clause. The panel is portaled to the body, so crossing the gap to it at an ordinary pointer speed needs about 140. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 0. */
  tooltipLingerMs?: number | null;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so `'none'` belongs only where the same data is already in a table on the page. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: ('toggle' | 'visible' | 'none') | null;
  /** Declares that the marks are parts of one whole, which is what makes a share of their total a real quantity. Off by default: a chart of visitors per stage or revenue per month sums to a number nobody can point at, and "18.6% of total" against it is arithmetic dressed as a fact. On, each mark's share appears on the tooltip's second line and in the data table. */
  partOfWhole?: boolean;
  /** Prints each row's share of `max` beside its value. */
  showPercent?: boolean;
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `data` is empty. Unset falls back to `DS_CONFIG.chart.emptyText`, then `'No data'`. */
  emptyText?: string | null;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. Unset falls back to `DS_CONFIG.chart.errorText`, then `'Could not load the data'`. */
  errorText?: string | null;
  /** Formats every value the chart prints, the annex table and the generated description included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then the browser's locale grouping with a K/M/B suffix past four digits. */
  valueFormat?: unknown;
  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The row that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onRowClicked?: (value: unknown) => void;
  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a press outside releases it. Off by default: a click is already the drill-down hook, and a mark left lit after the pointer has gone needs a reader who knows why it is lit. `rowClicked` fires either way — pinning is a state, not a handler. */
  pinOnClick?: boolean;
  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark and pays for it with the rest of the chart. */
  dimOthers?: boolean;
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
