/** Which mark a chart's tooltip answers for. `'item'` is the mark under the pointer;
 *  `'axis'` is every series at the category under the pointer (line charts). */
export type ChartTooltipTrigger = 'item' | 'axis' | 'none';

/** The subset a chart whose marks ARE its categories offers. Not written as
 *  `Exclude<ChartTooltipTrigger, 'axis'>`: the React wrapper generator cannot resolve a built-in
 *  utility type and collapses the input to `unknown`. */
export type ChartItemTooltipTrigger = 'item' | 'none';

export interface ChartTooltipEntry {
  readonly label: string;
  readonly value: number;
  /** Already through the chart's `valueFormat`. */
  readonly formatted: string;
  readonly color: string;
  /** Marks whose fill is hatched; the swatch is hatched too. */
  readonly hatched?: boolean;
  /** A second line under the value: share of the total, rank, the drop into it. */
  readonly detail?: string;
}

export interface ChartTooltipContext {
  /** Empty on a chart whose marks are the categories. */
  readonly category: string;
  readonly entries: readonly ChartTooltipEntry[];
}

/** The mark's own element, or a point in client coordinates when the active mark has no element. */
export type ChartTooltipOrigin =
  | Element
  | { readonly x: number; readonly y: number };
