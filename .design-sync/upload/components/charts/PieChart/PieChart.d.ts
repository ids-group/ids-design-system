import * as React from 'react';

/**
 * PieChart — the real PieChartComponent, run by Angular behind `<ds-pie-chart>`.
 * A ring that splits one total into its parts. Each slice carries its share as a whole percentage, and the percentages always add up to exactly 100, so a legend never visibly loses a point. The middle of the ring is free for the total or for a headline figure of your own.
 */
export interface PieChartProps {
  /** One slice per entry. A non-positive or non-finite value counts as zero — a ring is a part-to-whole picture and has no way to draw a negative share. */
  data?: unknown;
  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  centerValue?: string | null;
  /** Caption under the centre value. */
  centerLabel?: string | null;
  /** Logical placement, so a right-to-left page needs no second value. */
  legend?: 'end' | 'bottom' | 'none';
  /** Longest legend to draw. Past it the smallest slices are summed into one, so a long tail does not become a legend nobody reads. Off by default: grouping changes what the chart says, and that is the consumer's call. Values below 2 are ignored — one slice is not a pie. */
  maxSlices?: number | null;
  /** Names the grouped slice. */
  otherLabel?: string;
  /** The hole, as a fraction of the outer radius. Zero draws a solid pie and takes the centre content away with the hole that held it. */
  innerRadius?: number;
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
  /** Prints each slice's share of the ring — in the legend, on the tooltip and in the data table. On by default, unlike every other chart, because a ring IS parts of one whole: the share is a real quantity here whatever the data, not a claim the consumer has to make. Off drops all three, for a ring whose slices are already labelled in percent. */
  partOfWhole?: boolean;
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `data` is empty. Unset falls back to `DS_CONFIG.chart.emptyText`, then `'No data'`. */
  emptyText?: string | null;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. Unset falls back to `DS_CONFIG.chart.errorText`, then `'Could not load the data'`. */
  errorText?: string | null;
  /** Formats every value the chart prints, the annex table and the generated description included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then the browser's locale grouping with a K/M/B suffix past four digits. */
  valueFormat?: unknown;
  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The slice that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onSliceClicked?: (value: unknown) => void;
  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a press outside releases it. Off by default: a click is already the drill-down hook, and a mark left lit after the pointer has gone needs a reader who knows why it is lit. `sliceClicked` fires either way — pinning is a state, not a handler. */
  pinOnClick?: boolean;
  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark and pays for it with the rest of the chart. */
  dimOthers?: boolean;
  /** Accepted for parity with the other four charts and deliberately without effect here: a ring arrives as ONE object, because arcs share their edges and fading them one at a time lets the background through every seam. There is nothing to stagger. */
  staggerMs?: number;
  /** Whether a hovered or focused slice opens a tooltip. `'axis'` is not offered — a ring has no axis to group readings under. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const PieChart: React.ComponentType<PieChartProps>;
