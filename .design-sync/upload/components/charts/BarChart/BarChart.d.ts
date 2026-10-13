import * as React from 'react';

/**
 * BarChart — the real BarChartComponent, run by Angular behind `<ds-bar-chart>`.
 * Horizontal bar chart: each row in `data` prints a `label`, a formatted `value` and (unless suppressed) a percentage, with a track filled to `value` relative to `max`. The populated state renders inside a `role="img"` block carrying an auto-generated accessible name; a `<details>` data table underneath repeats every row as plain text.
 */
export interface BarChartProps {
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
  /** One row per bar, drawn in the order given. */
  data?: unknown;
  /** Track length is relative to this. Null uses the largest value. */
  max?: number | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** Declares the marks parts of one whole: each share appears on the tooltip's second line and in the data table. */
  partOfWhole?: boolean;
  /** Prints each row's share of `max` beside its value. A row's own `showPercent` overrides it. */
  showPercent?: boolean;
  /** `'start'` puts each label in a column before its bar, on the bar's line, with the values in aligned columns after it; `'top'` keeps the label on its own line above the bar. */
  labelPosition?: ('top' | 'start');
  /** The row clicked or activated with Enter or Space, whether or not `interactive` is set. */
  onRowClicked?: (value: unknown) => void;
  /** Dims every OTHER mark while one is hovered or focused. */
  dimOthers?: boolean;
  /** The segment to single out, by its `id` or its position as a string; every other segment fades. Independent of `dimOthers`. */
  highlighted?: string | null;
  /** Milliseconds between one row's entrance and the next; `0` turns it off. The step narrows to keep the spread within 260ms. */
  staggerMs?: number;
  /** Whether a hovered or focused row opens a tooltip. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const BarChart: React.ComponentType<BarChartProps>;
