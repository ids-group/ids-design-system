import * as React from 'react';

/**
 * ColumnChart — the real ColumnChartComponent, run by Angular behind `<ds-column-chart>`.
 * Vertical columns for a short series read left to right — months, stages, teams. Every column is measured against one value axis whose ticks snap to round numbers, each column prints its own value above itself, and a skeleton holds the space while the numbers are still arriving.
 */
export interface ColumnChartProps {
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
  /** One column per point, drawn in the order given, or one NAMED SERIES per entry, where every category carries a column from each. The two forms are told apart by their shape. */
  data?: unknown;
  /** How several series share one category's band. `'none'` (default) and `'grouped'` sit side by side; `'stacked'` piles them; `'normalized'` piles then divides by the category's total. */
  stack?: ('none' | 'grouped' | 'stacked' | 'normalized');
  /** Reference lines and bands behind the columns; each widens the value axis and is named in the generated description. */
  thresholds?: unknown;
  /** Prints each column's value above the column. */
  showValues?: boolean;
  /** How many columns the loading skeleton draws before the data is known. */
  skeletonCount?: number;
  /** How many value-axis ticks to aim for; ticks snap to a round step. */
  tickCount?: number;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** Declares the marks parts of one whole: each share appears on the tooltip's second line and in the data table. */
  partOfWhole?: boolean;
  /** The point clicked or activated with Enter or Space, whether or not `interactive` is set. */
  onPointClicked?: (value: unknown) => void;
  /** Dims every OTHER mark while one is hovered or focused. Dimmed marks lose separation between them (three series: worst pair dE 14.8 to 2.1 at `--ds-chart-dim-opacity` 0.3, measured 2026-09-13). */
  dimOthers?: boolean;
  /** Milliseconds between one mark's entrance and the next; `0` turns it off. The step narrows to fit within 260ms. */
  staggerMs?: number;
  /** Whether a hovered or focused column opens a tooltip. */
  tooltip?: ('item' | 'none');
  /** Ids of the series the legend has switched off; their columns sink to the baseline. */
  hiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (value: readonly string[]) => void;
  /** Whether hiding a series re-scales the value axis to what is left. Off holds the axis where it stands with every series shown. */
  rescaleOnHide?: boolean;
  /** Whether the legend switches series off. Off leaves it a plain key. */
  legendFilters?: boolean;
  /** What a legend control does. `'isolate'` shows one series and hides the rest (radios); `'toggle'` hides one and leaves the rest (checkboxes). */
  legendMode?: 'toggle' | 'isolate';
  /** Lets a press dragged across columns select their categories: a band, the sum and mean of every column in it, and the rest faded. Escape or a press outside clears it. Off by default. */
  selectRange?: boolean;
  /** Answers the pointer on the axes: the category label in bold, a guide from the value axis and the value there in a pill on the axis. On by default. */
  showAxisReadout?: boolean;
  /** Where the tooltip anchors: `'mark'` (default) is the column; `'cell'` is the full-height category cell. */
  tooltipAnchor?: 'mark' | 'cell';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ColumnChart: React.ComponentType<ColumnChartProps>;
