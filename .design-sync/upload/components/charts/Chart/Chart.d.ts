import * as React from 'react';

/**
 * Chart — the real ChartComponent, run by Angular behind `<ds-x-chart>`.
 * The container `ColumnChart` is built inside - port of `ds-chart`. It owns the plot, the axes, the gridlines, the ticks, the shared value domain and the loading, empty and error states, and it draws no marks of its own: the columns, lines, reference lines and labels are separate children projected into it. The other four charts each still draw their own canvas.
 */
export interface ChartProps {
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
  /** One band per category; every projected mark is positioned against them. */
  categories?: readonly string[];
  /** How many columns the loading skeleton draws before the categories are known. */
  skeletonCount?: number;
  /** How many value-axis ticks to aim for; ticks snap to a round step, so the count may differ by one. */
  tickCount?: number;
  /** Pins the floor of the value axis. It only opens the axis further; a floor above the data is ignored. */
  min?: number | null;
  /** Pins the ceiling of the value axis. See `min`. */
  max?: number | null;
  /** Draws a band and crosshair down the category under the pointer and reports it to every mark through `activeIndex`; the panel then names every reading at that category. `'auto'` (default) is `'category'` with two or more tooltip-showing marks or a mark with `tooltip="axis"`, else `'none'`. */
  cursor?: 'none' | 'category' | 'auto';
  /** Pins the ceiling of the SECOND value axis, the way `max` pins the first. */
  maxSecondary?: number | null;
  /** Plot height in CSS pixels, axis labels and headroom excluded; fixed across card widths. */
  plotHeight?: number;
  /** Width in CSS pixels of the left gutter that carries the value-axis labels. */
  axisGutter?: number;
  /** Pixels reserved at each end of the plot for a value label, drawn or not. */
  valueSpace?: number;
  /** How the second value axis relates to the first, once a mark has reported against it. */
  secondaryAxisMode?: ('aligned' | 'exact' | 'dual-grid' | 'split');
  /** Colours the first axis's tick labels like the marks measured against it. */
  axisColor?: string | null;
  /** `axisColor` for the second axis. */
  secondaryAxisColor?: string | null;
  /** Names the first axis's unit beside it. */
  axisLabel?: string | null;
  /** `axisLabel` for the second axis. */
  secondaryAxisLabel?: string | null;
  /** A template that replaces the panel's body. */
  tooltipTemplate?: unknown;
  /** Extra clearance between the mark and the panel, for a value label printed in that gap. */
  tooltipExtraGap?: number;
  /** Content for the `[dsReferenceLine]` slot. */
  referenceLine?: React.ReactNode;
  /** Content for the `[dsReferenceLabel]` slot. */
  referenceLabel?: React.ReactNode;
  /** Content for the `[dsSeriesAnnotation]` slot. */
  seriesAnnotation?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Chart: React.ComponentType<ChartProps>;
