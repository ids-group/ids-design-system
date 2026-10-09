import * as React from 'react';

/**
 * HeatmapChart — the real HeatmapChartComponent, run by Angular behind `<ds-heatmap-chart>`.
 * A matrix of readings coloured by magnitude — depot by weekday, hour by date, queue by region. Colour is the only channel carrying the quantity on the grid, so every cell names its own reading to assistive tech and the annex table under the grid is always drawn, never an option.
 */
export interface HeatmapChartProps {
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
  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds; zero closes it at once. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 500. */
  tooltipLingerMs?: number | null;
  /** Holds the clicked mark and its tooltip until a second click, Escape or a press outside. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. The click output fires either way. */
  pinOnClick?: boolean | null;
  /** The column headings, left to right; a row longer than this loses its tail. */
  columns?: readonly string[];
  /** One entry per row, one reading per column; a `null` reading is drawn as the surface. */
  data?: unknown;
  /** Pins the floor of the colour scale. It only OPENS the scale further; a floor above the data is ignored. Unset, the scale starts at the lowest reading. */
  min?: number | null;
  /** Pins the ceiling of the colour scale, as `min` pins the floor. */
  max?: number | null;
  /** Prints each cell's reading inside it. */
  showValues?: boolean;
  /** Fades every cell but the one under the pointer. */
  dimOthers?: boolean;
  /** Whether a hovered or focused cell opens a tooltip. */
  tooltip?: ('item' | 'none');
  /** Milliseconds between one column's entrance and the next; `0` turns it off. The spread is capped at 260ms. */
  staggerMs?: number;
  /** The clicked cell, with its row and column. Never fires for an unmeasured cell. */
  onCellClicked?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const HeatmapChart: React.ComponentType<HeatmapChartProps>;
