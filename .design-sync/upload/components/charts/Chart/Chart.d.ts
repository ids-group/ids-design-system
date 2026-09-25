import * as React from 'react';

/**
 * Chart — the real ChartComponent, run by Angular behind `<ds-x-chart>`.
 * The container `ColumnChart` is built inside - port of `ds-chart`. It owns the plot, the axes, the gridlines, the ticks, the shared value domain and the loading, empty and error states, and it draws no marks of its own: the columns, lines, reference lines and labels are separate children projected into it. The other four charts each still draw their own canvas.
 */
export interface ChartProps {
  /** The category axis. Every projected mark is positioned against this list, so its length is what decides how many bands the plot has. */
  categories?: readonly string[];
  /** How many value-axis ticks to aim for. A hint, not a count: ticks snap to a round step, so the axis may carry one more or one fewer. */
  tickCount?: number;
  /** Pins the floor of the value axis instead of deriving it from the marks. It only ever opens the axis further: a floor above the data would push readings off the plot. */
  min?: number | null;
  /** Pins the ceiling of the value axis. See `min`. Two charts drawn one subject at a time are only comparable when both are pinned. */
  max?: number | null;
  /** Draws a band and a crosshair down the category under the pointer, and reports that category to every mark through `activeIndex`. On a plot of two or more marks that show a tooltip, the panel then names every mark's reading at that category wherever in it the pointer is. `'auto'`, the default, is `'category'` for such a composed plot and `'none'` for a plot of one mark, whose marks already answer per mark: two affordances on one plot read as two different questions. */
  cursor?: 'none' | 'category' | 'auto';
  /** Whether a press holds the category cursor where it is, so the reader can look away from the plot with the comparison still on screen. Released by pressing it again, by Escape, or by a press outside the plot. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. */
  cursorPin?: boolean | null;
  /** Milliseconds the cursor survives the pointer leaving the plot. The tooltip panel is portaled out of the plot, so without a grace period it closes before the pointer can reach it. */
  tooltipLingerMs?: number | null;
  /** Pins the ceiling of the SECOND value axis, the way `max` pins the first. Two plots read against each other need both pinned, or the second rescales under them. */
  maxSecondary?: number | null;
  /** Height of the plot itself, in CSS pixels, axis labels and value headroom excluded. Real pixels rather than a share of the width: one viewBox unit is one pixel, so a card that widens spreads the categories further apart and leaves the plot exactly this tall. */
  plotHeight?: number;
  /** Width in CSS pixels of the gutter down the left that carries the value-axis labels. Widen it for long tick labels; the plot takes whatever is left. */
  axisGutter?: number;
  /** Pixels reserved for a value label at each end of the plot: above the top tick for a mark at the ceiling, and below the baseline for a negative mark, whose label would otherwise print over the category labels. Reserved whether or not a mark draws one, because a chart that gains a label on one value must not change height. */
  valueSpace?: number;
  /** Printed above the plot as the chart's visible title. */
  caption?: string | null;
  /** Whether the projected marks answer to the pointer and the keyboard. The container draws no marks of its own and only reads this for the plot's role: a group of controls to step through, against a single image to be described. */
  interactive?: boolean;
  /** Accessible name for the plot. The container holds no readings of its own, so a chart that needs its numbers described supplies the sentence here - `describeSeries` is what the five presets build it with. It is the whole label in the static case, where nothing else is reachable. */
  summary?: string | null;
  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it; `'none'` leaves it bare, for one placed inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'`. */
  frame?: ('auto' | 'none') | null;
  /** Draws a placeholder in place of the plot, at the plot's own height, so the page does not resize when the data lands. */
  loading?: boolean;
  /** Shown in place of the plot when `categories` is empty. Unset falls back to `DS_INTL.chart.empty`. */
  emptyText?: string | null;
  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `categories`, because "the request failed" and "there is nothing to show" read the same to a reader and mean opposite things. */
  error?: boolean;
  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  errorText?: string | null;
  /** Formats the value-axis ticks. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  valueFormat?: unknown;
  /** How the second value axis relates to the first, once a mark has reported against it. The same four words `ds-line-chart` takes. */
  secondaryAxisMode?: ('aligned' | 'exact' | 'dual-grid' | 'split');
  /** Paints the first axis's tick labels in the colour of the marks measured against it. A two-scale plot is ambiguous without it - nothing on the canvas says which of two lines is read against which set of numbers - and it is the author, not the container, who knows which colour an axis belongs to, because several marks can share one. */
  axisColor?: string | null;
  /** `axisColor` for the second axis. */
  secondaryAxisColor?: string | null;
  /** Names the first axis's unit beside it. On a two-scale plot the colour says which line reads which axis and this says what the numbers ARE - a reader who has neither is left comparing two quantities that may not be comparable at all. */
  axisLabel?: string | null;
  /** `axisLabel` for the second axis. */
  secondaryAxisLabel?: string | null;
  /** A template that replaces the panel's body, for a preset that prints more than label+value. */
  tooltipTemplate?: unknown;
  /** Extra clearance between the mark and the panel, for a chart that prints a value label in the gap the panel would otherwise take. */
  tooltipExtraGap?: number;
  /** Content for the `[dsReferenceLine]` slot. */
  referenceLine?: React.ReactNode;
  /** Content for the `[dsReferenceLabel]` slot. */
  referenceLabel?: React.ReactNode;
  /** Content for the `[dsSeriesAnnotation]` slot. */
  seriesAnnotation?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Chart: React.ComponentType<ChartProps>;
