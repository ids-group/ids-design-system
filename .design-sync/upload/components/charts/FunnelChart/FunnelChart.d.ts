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
  /** Printed above the plot as the chart's visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** Accessible name. Generated from the data when omitted. */
  summary?: string | null;
  /** The label-and-value disclosure every chart carries. Ignored while `showTable` is on, which already prints every label and value. */
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
  /** Turns on the click affordance — the pointer cursor and any hover tint. The click output fires whether or not this is set, so a consumer that binds the output and forgets the flag still receives every click. */
  interactive?: boolean;
  /** The stage that was clicked, or activated with Enter or Space. Fires whether or not `interactive` is set. */
  onStageClicked?: (value: unknown) => void;
  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at all; `40` is the documented non-zero step. The total is capped, so a long series does not crawl in. */
  staggerMs?: number;
  /** Whether a hovered or focused stage opens a tooltip. `'axis'` is not offered — a funnel's stages are its categories, so an axis tooltip would repeat the item one. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FunnelChart: React.ComponentType<FunnelChartProps>;
