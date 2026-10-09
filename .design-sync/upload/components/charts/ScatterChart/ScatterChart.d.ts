import * as React from 'react';

/**
 * ScatterChart — the real ScatterChartComponent, run by Angular behind `<ds-scatter-chart>`.
 * Two continuous quantities against each other — weight against carriage cost, distance against time, volume against conversion. None of the other charts draws this: they all put categories on one axis. It is also the only one whose mark count the CALLER decides, so it is the only one that thins its own data before drawing.
 */
export interface ScatterChartProps {
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
  /** One entry per series. */
  data?: unknown;
  /** Names the horizontal quantity under the plot. */
  xLabel?: string | null;
  /** Names the vertical quantity beside the plot. */
  yLabel?: string | null;
  /** Which decimator thins a series past the budget. See `ScatterChartDecimator`. */
  decimator?: ('minMax' | 'lttb' | 'none');
  /** A hint, not a count, applied to both axes. Ticks snap to a round step. */
  tickCount?: number;
  /** The annex table under the plot; lists every reading, including those decimation left out. */
  dataTable?: unknown;
  /** Whether a hovered or focused mark opens a tooltip. */
  tooltip?: ('item' | 'none');
  /** Fades every mark but the one under the pointer; on a scatter this hides pile-ups. */
  dimOthers?: boolean;
  /** The clicked reading, with the series it belongs to. Fires on click and on Enter or Space. */
  onPointClicked?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ScatterChart: React.ComponentType<ScatterChartProps>;
