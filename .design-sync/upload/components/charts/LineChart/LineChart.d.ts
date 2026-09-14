import * as React from 'react';

/**
 * LineChart — the real LineChartComponent, run by Angular behind `<ds-line-chart>`.
 * One or more series plotted over a shared set of categories. A series can be measured against a second y axis when it is in different units, a missing reading can break the line or sit at zero, and the category labels thin out rather than crowd once the series gets long.
 */
export interface LineChartProps {
  /** X labels. Every series' `data` is read against this length. */
  categories?: readonly string[];
  /** One line per entry. Every series is read against `categories`, so a series longer than it loses its tail and a shorter one ends early. */
  series?: unknown;
  /** How a secondary axis relates to the primary one. */
  yAxisMode?: ('rounded' | 'exact' | 'independent' | 'stacked');
  /** Draws a dot at every reading. Off, the dots appear on hover and on focus only. */
  showMarkers?: boolean;
  /** Makes every reading focusable and clickable. A series drawn without markers grows invisible ones so there is something to land on; they appear on hover and on focus. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The point that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onPointClicked?: (value: unknown) => void;
  /** What a `null` reading draws. The default refuses to assert that a missing reading is a zero. */
  gaps?: ('break' | 'zero');
  /** How many value-axis ticks to aim for. A hint, not a count: ticks snap to a round step, so the axis may carry one more or one fewer. */
  tickCount?: number;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so `'none'` belongs only where the same data is already in a table on the page. */
  dataTable?: 'toggle' | 'visible' | 'none';
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `data` is empty. */
  emptyText?: string;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. */
  errorText?: string;
  /** Formats every value the chart prints, the annex table and the generated description included. Defaults to the browser's locale grouping with a K/M/B suffix past four digits. */
  valueFormat?: unknown;
  /** Ids of the series the legend has switched off. Two-way, so a page can drive it from a URL parameter and read back what the reader chose. */
  hiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (value: readonly string[]) => void;
  /** Whether hiding a series re-scales the value axis to what is left. Default `false`: a silent rescale turns a period-over-period comparison into a different claim, and a comparison dashboard is the common case. */
  rescaleOnHide?: boolean;
  /** Whether the legend switches series off. Off leaves it a plain key. */
  legendFilters?: boolean;
  /** Shown in place of the plot once the legend has switched every series off. Without it the reader is left with an empty grid and nothing saying why. */
  noVisibleSeriesText?: string;
  /** Gives every series a dash pattern of its own, so the lines are told apart by shape as well as by colour — WCAG technique G111. Off by default: the shipped palette clears the colour-blind separation threshold on its own, so the patterns are for monochrome print, for a retuned palette, and for a reader who asks for them. */
  patterns?: boolean;
  /** Milliseconds between one series' entrance and the next. `0`, the default, is no stagger at all; `40` is the documented non-zero step. The total is capped, so a long list of series does not crawl in. */
  staggerMs?: number;
  /** Whether the plot opens a tooltip, and for what. `'axis'` names every series at the category under the pointer, which is the reading a multi-series line is compared on; `'item'` names only the marker itself. */
  tooltip?: ('item' | 'axis' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const LineChart: React.ComponentType<LineChartProps>;
