import * as React from 'react';

/**
 * FunnelChart — the real FunnelChartComponent, run by Angular behind `<ds-funnel-chart>`.
 * The stages of a journey, drawn top to bottom in the order you give them — they are never sorted, because the order is the meaning. Under the funnel an aligned table repeats each stage's value, its share of the first stage, and how much fell away since the stage above it.
 */
export interface FunnelChartProps {
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
  /** Drawn in the order given; stages are never sorted, since their order is the meaning. */
  data?: unknown;
  /** What the silhouette encodes. `'area'` (default) makes each stage's area proportional to its value. `'width'` reads widths straight off the values, which collapses the tail of a steep funnel. `'taper'` encodes nothing: the shape is fixed. */
  shape?: ('taper' | 'width' | 'area');
  /** The value, percent and drop table printed under the funnel. While on, `dataTable` is not rendered. */
  showTable?: boolean;
  /** The label-and-value disclosure. Ignored while `showTable` is on. Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  dataTable?: unknown;
  /** What the Drop column reports: `'relative'` (default) the share that leaked at this stage, `'absolute'` the count, `'none'` no column. */
  drop?: ('relative' | 'absolute' | 'none');
  /** How many stages the loading skeleton draws before the data is known. */
  skeletonCount?: number;
  /** The stage clicked or activated with Enter or Space, whether or not `interactive` is set. */
  onStageClicked?: (value: unknown) => void;
  /** Dims every OTHER mark while one is hovered or focused. */
  dimOthers?: boolean;
  /** Milliseconds between one stage's entrance and the next, top to bottom; `0` turns it off. The step narrows to keep the spread within 260ms. */
  staggerMs?: number;
  /** Whether a hovered or focused stage opens a tooltip. */
  tooltip?: ('item' | 'none');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FunnelChart: React.ComponentType<FunnelChartProps>;
