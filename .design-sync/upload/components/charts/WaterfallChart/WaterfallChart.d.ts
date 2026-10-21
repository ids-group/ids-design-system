import * as React from 'react';

/**
 * WaterfallChart — the real WaterfallChartComponent, run by Angular behind `<ds-waterfall-chart>`.
 * A running total, bar by bar: what a figure started at, what moved it, and what it ended at. The one variant in the chart family that genuinely cannot be a mode on another — it needs an accumulating level, bars pinned to zero for the totals, and its own three-colour semantic, all at once.
 */
export interface WaterfallChartProps {
  /** `'auto'` draws the chart's own bordered, padded box; `'none'` leaves it bare, for a chart inside a card. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'`. */
  frame?: ('auto' | 'none') | null;
  /** Visible title above the plot, reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** With no data, draws a skeleton in the chart's shape: `skeletonCount` marks where the chart has it, the data's count once known. With data on screen, keeps the plot under `ds-loading-overlay`. */
  loading?: boolean;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from empty data. */
  error?: boolean;
  /** Shown when there is no data. Unset falls back to `DS_INTL.chart.empty`. */
  emptyText?: string | null;
  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  errorText?: string | null;
  /** Formats every printed value, including the annex table and generated description. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  valueFormat?: unknown;
  /** Turns on the click affordance: pointer cursor and hover tint. The click output fires whether or not this is set. */
  interactive?: boolean;
  /** Whether the tooltip draws a colour dot beside each reading. Unset falls back to `DS_CONFIG.chart.tooltipSwatches`, then shows them for two to four readings. */
  tooltipSwatches?: boolean | null;
  /** How long the tooltip stays after the pointer leaves the mark for another part of the chart, in milliseconds; zero closes it at once. A pointer that leaves the chart closes it at once whatever this says. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 500. */
  tooltipLingerMs?: number | null;
  /** Holds the clicked mark and its tooltip until a second click, Escape or a press outside. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. The click output fires either way. */
  pinOnClick?: boolean | null;
  /** Whether the hovered or focused column, bar or heatmap cell brightens. Unset falls back to `DS_CONFIG.chart.highlightActive`, then `true`. */
  highlightActive?: boolean | null;
  /** The bars in reading order; never sorted. */
  data?: unknown;
  /** Prints each bar's own reading above it, with its sign. */
  showValues?: boolean;
  /** The dashed rule chaining one bar to the next. */
  showConnectors?: boolean;
  /** Dims every OTHER bar while one is hovered or focused. */
  dimOthers?: boolean;
  /** Answers the pointer on the axes: the category label in bold, a guide from the value axis and the value there in a pill on the axis. On by default. */
  showAxisReadout?: boolean;
  /** Whether a hovered or focused bar opens a tooltip. `'axis'` is not offered: each bar is its own category. */
  tooltip?: ('item' | 'none');
  /** How many value-axis ticks to aim for; ticks snap to a round step. */
  tickCount?: number;
  /** How many steps the loading skeleton draws before the data is known: a total, the deltas, a total. */
  skeletonCount?: number;
  /** The annex table under the plot: each step's direction, reading and running total. Unset falls back to `DS_CONFIG.chart.dataTable`. */
  dataTable?: unknown;
  /** Milliseconds between one step's entrance and the next; the step narrows to finish within 260ms. `0` turns it off. */
  staggerMs?: number;
  /** The clicked datum, as it was given. Fires on click and on Enter or Space. */
  onBarClicked?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const WaterfallChart: React.ComponentType<WaterfallChartProps>;
