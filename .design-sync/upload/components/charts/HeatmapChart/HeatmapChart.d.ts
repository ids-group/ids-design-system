import * as React from 'react';

/**
 * HeatmapChart — the real HeatmapChartComponent, run by Angular behind `<ds-heatmap-chart>`.
 * A matrix of readings coloured by magnitude — depot by weekday, hour by date, queue by region. Colour is the only channel carrying the quantity on the grid, so every cell names its own reading to assistive tech and the annex table under the grid is always drawn, never an option.
 */
export interface HeatmapChartProps {
  /** The column headings, left to right. Their count decides how many readings of a row are drawn: a row longer than this loses its tail, a shorter one ends early. */
  columns?: readonly string[];
  /** One entry per row, each carrying one reading per column. A `null` reading is a cell that was never measured and is drawn as the surface rather than as the ramp's coldest step. */
  data?: unknown;
  /** Printed above the grid as the visible title. */
  caption?: string | null;
  /** Pins the floor of the colour scale. It only ever OPENS the scale further, so a floor above the data cannot push a reading off the ramp. Unset, the scale starts at the lowest reading. */
  min?: number | null;
  /** Pins the ceiling of the colour scale, the same way `min` pins its floor. Set both to compare two heat maps by colour: unset, each one spans its own readings and the same hue means a different quantity on each. */
  max?: number | null;
  /** Prints each cell's reading inside it. Off by default: a grid dense enough to be worth a heat map has no room for the numbers, which is why the annex table is always there. */
  showValues?: boolean;
  /** Makes every measured cell a button. An unmeasured cell stays inert - a grid of buttons with nothing behind them is a tab trap. */
  interactive?: boolean;
  /** Fades every cell but the one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed cells, which on a ramp is the only thing carrying magnitude. */
  dimOthers?: boolean;
  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  frame?: ('auto' | 'none') | null;
  /** A skeleton at the grid's own height, so the page does not resize when the data lands. */
  loading?: boolean;
  /** Separate from an empty matrix: "the request failed" and "there is nothing to show" read the same and mean opposite things. */
  error?: boolean;
  /** Shown when there are no rows or no columns. Unset falls back to `DS_CONFIG.chart.emptyText`. */
  emptyText?: string | null;
  /** Shown in place of the grid while `error` is set. Unset falls back to `DS_CONFIG.chart.errorText`. */
  errorText?: string | null;
  /** Formats every reading the chart prints - the scale's two ends, each cell's accessible name and the annex table. Unset falls back to `DS_CONFIG.chart.valueFormat`. */
  valueFormat?: unknown;
  /** Whether a hovered or focused cell opens a tooltip. A heat map's cells carry no printed value by default, so this is where a reading is read without reaching for the annex table. */
  tooltip?: ('item' | 'none');
  /** The clicked cell, with the row and the column it sits at. Never fires for an unmeasured cell, which has no reading to drill into. */
  onCellClicked?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const HeatmapChart: React.ComponentType<HeatmapChartProps>;
