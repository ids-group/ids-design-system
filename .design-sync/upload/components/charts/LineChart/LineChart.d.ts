import * as React from 'react';

/**
 * LineChart — the real LineChartComponent, run by Angular behind `<ds-line-chart>`.
 * One or more series plotted over a shared set of categories. A series can be measured against a second y axis when it is in different units, a missing reading can break the line or sit at zero, and the category labels thin out rather than crowd once the series gets long.
 */
export interface LineChartProps {
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
  /** X labels. Every series' `data` is read against this length. */
  categories?: readonly string[];
  /** One line per entry, read against `categories`: a longer series loses its tail, a shorter one ends early. */
  series?: unknown;
  /** How a secondary axis relates to the primary one. */
  yAxisMode?: ('aligned' | 'exact' | 'dual-grid' | 'split');
  /** Draws a dot at every reading. Off, the dots appear on hover and on focus only. */
  showMarkers?: boolean;
  /** Lays the lines and their markers on a band of the background colour. */
  outline?: boolean;
  /** Labels pinned over their readings. Drawn `aria-hidden`; their text is appended to the accessible name. */
  annotations?: unknown;
  /** The point clicked or activated with Enter or Space, whether or not `interactive` is set. */
  onPointClicked?: (value: unknown) => void;
  /** Dims every OTHER mark while one is hovered or focused. Dimmed marks lose separation between them (three series: worst pair dE 14.8 to 2.1 at `--ds-chart-dim-opacity` 0.3, measured 2026-09-13). */
  dimOthers?: boolean;
  /** What a `null` reading draws. The default `'break'` does not assert a missing reading is zero. */
  gaps?: ('break' | 'zero');
  /** How the line joins its readings. `'linear'` asserts nothing between readings; a curve does. */
  curve?: ('linear' | 'step' | 'smooth');
  /** How several series share the value axis. Stacking runs per axis. */
  stack?: ('none' | 'stacked' | 'normalized');
  /** Names the first axis's unit beside it. */
  yAxisLabel?: string | null;
  /** `yAxisLabel` for the second axis. */
  secondaryAxisLabel?: string | null;
  /** How many value-axis ticks to aim for; ticks snap to a round step. */
  tickCount?: number;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** Pins the primary value axis maximum so separate renders are comparable; `maxSecondary` pins the second. Null keeps the derived axis. A maximum below the data does not clip it. */
  max?: number | null;
  /** Pins the secondary value axis. See `max`. */
  maxSecondary?: number | null;
  /** Ids of the series the legend has switched off. */
  hiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (value: readonly string[]) => void;
  /** Whether hiding a series re-scales the value axis to what is left. Off holds the axis where it stands with every series shown. */
  rescaleOnHide?: boolean;
  /** Whether the legend switches series off. Off leaves it a plain key. */
  legendFilters?: boolean;
  /** What a legend control does. `'isolate'` shows one series and hides the rest (radios); `'toggle'` hides one and leaves the rest (checkboxes). */
  legendMode?: 'toggle' | 'isolate';
  /** Shown in place of the plot once the legend has switched every series off. Unset falls back to `DS_INTL.chart.noVisibleSeries`. */
  noVisibleSeriesText?: string | null;
  /** Gives every series a dash pattern, so lines differ by shape as well as colour. */
  patterns?: boolean;
  /** Lets a press dragged across categories select them: a band, the sum and mean of every reading in it, and the readings outside faded. Escape or a press outside clears it. Off by default. */
  selectRange?: boolean;
  /** Answers the pointer on the axes: the category label in bold, a guide from the value axis and the value there in a pill on the axis. On by default. */
  showAxisReadout?: boolean;
  /** On the hovered reading, thickens the stretches from the reading before it and to the reading after it, each in its own rising or falling colour and, unless it starts at zero, with its own change in percent; with several series, for the one singled out. */
  showChange?: boolean;
  /** Milliseconds between one series' entrance and the next; `0` turns it off. The step narrows so the last series still starts within the stagger budget. */
  staggerMs?: number;
  /** Whether the plot opens a tooltip, and for what. `'axis'` names every series at the category under the pointer; `'item'` names only the marker itself. */
  tooltip?: ('item' | 'axis' | 'none');
  /** Where the tooltip anchors while `tooltip` is `'axis'` (default); with `'item'` the panel hangs on the marker and this does nothing. `'reading'` (default) is the highest reading in the category, so the panel stays put within one band; `'pointer'` follows the cursor. */
  tooltipAnchor?: 'reading' | 'pointer';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const LineChart: React.ComponentType<LineChartProps>;
