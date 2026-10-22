import * as React from 'react';

/**
 * PieChart — the real PieChartComponent, run by Angular behind `<ds-pie-chart>`.
 * A ring that splits one total into its parts. Each slice carries its share as a whole percentage, and the percentages always add up to exactly 100, so a legend never visibly loses a point. The middle of the ring is free for the total or for a headline figure of your own.
 */
export interface PieChartProps {
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
  /** One slice per entry. A non-positive or non-finite value counts as zero. */
  data?: unknown;
  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  centerValue?: string | null;
  /** Caption under the centre value. */
  centerLabel?: string | null;
  /** When the sum does not fit the hole even at `--ds-pie-chart-center-value-min-font-size`, prints it in the `'tick'` form of `valueFormat` (`32.4K`). A `centerValue` string is never shortened. */
  centerCompact?: boolean;
  /** `'below'` prints the value and its caption under the ring at full size, never shrunk or shortened. */
  centerPlacement?: ('inside' | 'below');
  /** The hovered, focused or held slice prints its value and label in the centre in place of `centerValue` and `centerLabel`. */
  showHoverCenter?: boolean;
  /** Legend placement, logical so it flips in right-to-left. */
  legend?: 'end' | 'bottom' | 'none';
  /** How many slices, and legend rows, the loading skeleton draws before the data is known. */
  skeletonCount?: number;
  /** Longest legend to draw; past it the smallest slices are summed into one. Values below 2 are ignored. */
  maxSlices?: number | null;
  /** Names the grouped slice. Unset falls back to `DS_INTL.chart.other`. */
  otherLabel?: string | null;
  /** The hole, as a fraction of the outer radius. Zero draws a solid pie without centre content. */
  innerRadius?: number;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** Prints each slice's share in the legend, the tooltip and the data table. */
  partOfWhole?: boolean;
  /** The slice that was clicked or activated with Enter or Space. */
  onSliceClicked?: (value: unknown) => void;
  /** Dims every other mark while one is hovered or focused. */
  dimOthers?: boolean;
  /** Whether a hovered or focused slice opens a tooltip. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const PieChart: React.ComponentType<PieChartProps>;
