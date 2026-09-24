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
  yAxisMode?: ('aligned' | 'exact' | 'dual-grid' | 'split');
  /** Draws a dot at every reading. Off, the dots appear on hover and on focus only. */
  showMarkers?: boolean;
  /** Lays the lines and their markers on a band of the surface colour. Off where the plot holds nothing for them to cross and the band only separates them from the gridlines. */
  outline?: boolean;
  /** Labels pinned over their readings, for the points that have to read without a pointer. They are drawn, not announced: the data table already carries every reading, and repeating one in the plot makes a screen reader say it twice. */
  annotations?: unknown;
  /** Makes every reading focusable and clickable. A series drawn without markers grows invisible ones so there is something to land on; they appear on hover and on focus. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The point that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onPointClicked?: (value: unknown) => void;
  /** Holds the crosshair and its tooltip on the category that was clicked, until Escape or a press outside releases it. Off by default: a click is already the drill-down hook, and a crosshair left standing after the pointer has gone needs a reader who knows why. `pointClicked` fires either way — pinning is a state, not a handler. */
  pinOnClick?: boolean;
  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark and pays for it with the rest of the chart. */
  dimOthers?: boolean;
  /** What a `null` reading draws. The default refuses to assert that a missing reading is a zero. */
  gaps?: ('break' | 'zero');
  /** How the line joins its readings. `'linear'` by default, which asserts nothing the data does not say; a curve is a claim about what happened BETWEEN two readings. */
  curve?: ('linear' | 'step' | 'smooth');
  /** How several series share the value axis. Stacking runs per AXIS, so a series on the secondary axis never piles onto one measured against the primary. */
  stack?: ('none' | 'stacked' | 'normalized');
  /** Names the first axis's unit beside it. On a plot carrying two scales the colour says which line reads which axis and this says what the numbers ARE - and a reader who has neither is left comparing two quantities that may not be comparable at all. */
  yAxisLabel?: string | null;
  /** `yAxisLabel` for the second axis. */
  secondaryAxisLabel?: string | null;
  /** How many value-axis ticks to aim for. A hint, not a count: ticks snap to a round step, so the axis may carry one more or one fewer. */
  tickCount?: number;
  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it; `'none'` leaves the chart bare, for one placed inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards is one decision per app rather than per plot. */
  frame?: ('auto' | 'none') | null;
  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. Zero, the default, takes it away at once: a panel that outlives the pointer sits over the plot the reader has moved on to. Raise it only for a panel a reader has to REACH — one carrying a link, a figure, or anything selectable — which is WCAG 1.4.13's hoverable clause. The panel is portaled to the body, so crossing the gap to it at an ordinary pointer speed needs about 140. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 0. */
  tooltipLingerMs?: number | null;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so `'none'` belongs only where the same data is already in a table on the page. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** Pins the value axis instead of deriving it from the data. A panel opened one subject at a time — one agent, one microsite — derives a different axis for each of them, so two plots with the same gentle wiggle can be four times apart in value and nothing on screen says so. A fixed maximum is what makes two renders comparable. Null, the default, keeps the derived axis. Applies to the primary axis; `maxSecondary` pins the second one where a series sets `axis: 'secondary'`. A maximum below the data does not clip it — the larger of the two wins, because silently hiding a reading is worse than a taller axis than you asked for. */
  max?: number | null;
  /** Pins the secondary value axis. See `max`. */
  maxSecondary?: number | null;
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `data` is empty. Unset falls back to `DS_INTL.chart.empty`. */
  emptyText?: string | null;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  errorText?: string | null;
  /** Formats every value the chart prints, the annex table and the generated description included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  valueFormat?: unknown;
  /** Ids of the series the legend has switched off. Two-way, so a page can drive it from a URL parameter and read back what the reader chose. */
  hiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (value: readonly string[]) => void;
  /** Whether hiding a series re-scales the value axis to what is left. Default `false`: a silent rescale turns a period-over-period comparison into a different claim, and a comparison dashboard is the common case. */
  rescaleOnHide?: boolean;
  /** Whether the legend switches series off. Off leaves it a plain key. */
  legendFilters?: boolean;
  /** What a legend control does. `'isolate'` shows one series and hides the rest — one action to answer "show me only this" rather than one per series. `'toggle'` hides one and leaves the rest, for taking a dominant series out so the others can be read at a usable scale. Forwarded to `ds-chart-legend`, which renders radios for the first and checkboxes for the second. */
  legendMode?: 'toggle' | 'isolate';
  /** Shown in place of the plot once the legend has switched every series off. Without it the reader is left with an empty grid and nothing saying why. Unset falls back to `DS_INTL.chart.noVisibleSeries`. */
  noVisibleSeriesText?: string | null;
  /** Gives every series a dash pattern of its own, so the lines are told apart by shape as well as by colour — WCAG technique G111. Off by default: the shipped palette clears the colour-blind separation threshold on its own, so the patterns are for monochrome print, for a retuned palette, and for a reader who asks for them. */
  patterns?: boolean;
  /** Milliseconds between one series' entrance and the next. `0`, the default, is no stagger at all; `40` is the documented non-zero step. The total is capped, so a long list of series does not crawl in. */
  staggerMs?: number;
  /** Whether the plot opens a tooltip, and for what. `'axis'` names every series at the category under the pointer, which is the reading a multi-series line is compared on; `'item'` names only the marker itself. */
  tooltip?: ('item' | 'axis' | 'none');
  /** Where the tooltip is pinned. `'point'`, the default, is the highest reading in the category, so the panel stays put while the pointer moves within one band. `'pointer'` follows the cursor. */
  tooltipAnchor?: 'point' | 'pointer';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const LineChart: React.ComponentType<LineChartProps>;
