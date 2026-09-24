import * as React from 'react';

/**
 * ScatterChart — the real ScatterChartComponent, run by Angular behind `<ds-scatter-chart>`.
 * Two continuous quantities against each other — weight against carriage cost, distance against time, volume against conversion. None of the other charts draws this: they all put categories on one axis. It is also the only one whose mark count the CALLER decides, so it is the only one that thins its own data before drawing.
 */
export interface ScatterChartProps {
  /** One entry per series, each carrying its own readings. Both scales are continuous, so a point holds its position on each rather than an index into a list of categories. */
  data?: unknown;
  /** Names the horizontal quantity under the plot. Without it the reader has two numbers and no idea which is which - on a scatter that is the whole reading. */
  xLabel?: string | null;
  /** Names the vertical quantity beside the plot. */
  yLabel?: string | null;
  /** Which decimator thins a series past the budget. `'minMax'` by default, because it is the only one that promises each bucket's extremum survives. */
  decimator?: ('minMax' | 'lttb' | 'none');
  /** A hint, not a count, and it applies to BOTH axes. Ticks snap to a round step. */
  tickCount?: number;
  /** Printed above the plot as the visible title, and reused as the annex table's caption. */
  caption?: string | null;
  /** The accessible name. Generated when omitted, naming both axes' spans, how many readings were drawn and how many were thinned out. */
  summary?: string | null;
  /** Makes every mark a button and gives it a keyboard route. `pointClicked` fires whether or not this is set. */
  interactive?: boolean;
  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  frame?: ('auto' | 'none') | null;
  /** The annex table under the plot. It lists EVERY reading, including the ones decimation left out of the drawing, which is what keeps a thinned chart honest. */
  dataTable?: unknown;
  /** A skeleton at the plot's own height, so the page does not resize when the data lands. */
  loading?: boolean;
  /** Separate from empty data: "the request failed" and "there is nothing to show" read the same and mean opposite things. */
  error?: boolean;
  /** Shown when no series carries a reading. Unset falls back to `DS_CONFIG.chart.emptyText`. */
  emptyText?: string | null;
  /** Shown in place of the plot while `error` is set. Unset falls back to `DS_CONFIG.chart.errorText`. */
  errorText?: string | null;
  /** Formats every number the chart prints - both axes' ticks, the accessible name and the annex table. Unset falls back to `DS_CONFIG.chart.valueFormat`. */
  valueFormat?: unknown;
  /** Whether a hovered or focused mark opens a tooltip. A scatter prints no value beside its marks - there is no room - so this is where a reading is read without the annex table. */
  tooltip?: ('item' | 'none');
  /** Fades every mark but the one under the pointer. Off by default: on a scatter the pile-up IS the reading, and dimming the neighbours takes exactly that away. */
  dimOthers?: boolean;
  /** The clicked reading, with the series it belongs to. Fires on click and on Enter or Space. */
  onPointClicked?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ScatterChart: React.ComponentType<ScatterChartProps>;
