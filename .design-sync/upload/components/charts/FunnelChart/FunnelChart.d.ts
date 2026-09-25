import * as React from 'react';

/**
 * FunnelChart — the real FunnelChartComponent, run by Angular behind `<ds-funnel-chart>`.
 * The stages of a journey, drawn top to bottom in the order you give them — they are never sorted, because the order is the meaning. Under the funnel an aligned table repeats each stage's value, its share of the first stage, and how much fell away since the stage above it.
 */
export interface FunnelChartProps {
  /** Drawn in the order given. The order of a funnel's stages is its meaning, so they are never sorted. */
  data?: unknown;
  /** What the silhouette encodes. `'area'`, the default, makes each stage's AREA proportional to its value, which is the honest encoding that still leaves a tail wide enough to label. `'width'` reads the widths straight off the values, which collapses the tail of a steep funnel below a labellable width. `'taper'` encodes NOTHING: the shape is fixed whatever the data, and the numbers are read from the table beside it. */
  shape?: ('taper' | 'width' | 'area');
  /** The value, percent and drop table printed under the funnel. It supersedes `dataTable`: while this is on, the disclosure every chart carries would repeat a strict subset of these same numbers, so it is not rendered. */
  showTable?: boolean;
  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it; `'none'` leaves the chart bare, for one placed inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards is one decision per app rather than per plot. */
  frame?: ('auto' | 'none') | null;
  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. Zero, the default, takes it away at once: a panel that outlives the pointer sits over the plot the reader has moved on to. Raise it only for a panel a reader has to REACH — one carrying a link, a figure, or anything selectable — which is WCAG 1.4.13's hoverable clause. The panel is portaled to the body, so crossing the gap to it at an ordinary pointer speed needs about 140. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`, then 0. */
  tooltipLingerMs?: number | null;
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value disclosure every chart carries. Ignored while `showTable` is on, which already prints every label and value. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'toggle'`. */
  dataTable?: unknown;
  /** What the Drop column reports: `'relative'` (the default) the share that leaked at this stage, `'absolute'` the count, `'none'` no column at all. */
  drop?: ('relative' | 'absolute' | 'none');
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
  /** Holds the clicked mark and its tooltip in place, with a pin disc on it, until a second click, Escape or a press outside releases it. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. `stageClicked` fires either way - pinning is a state, not a handler. */
  pinOnClick?: boolean | null;
  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The stage that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onStageClicked?: (value: unknown) => void;
  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark and pays for it with the rest of the chart. */
  dimOthers?: boolean;
  /** Milliseconds between one stage's entrance and the next, top to bottom. `60` is the default; `0` brings every stage in at once. The step narrows once the stages would take longer than 260ms to start, so a long funnel does not crawl in. */
  staggerMs?: number;
  /** Whether a hovered or focused stage opens a tooltip. `'axis'` is not offered — a funnel's stages are its categories, so an axis tooltip would repeat the item one. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FunnelChart: React.ComponentType<FunnelChartProps>;
