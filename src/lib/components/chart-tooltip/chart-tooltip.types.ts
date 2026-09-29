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
  /** Already through the chart's `valueFormat`, so the panel never formats. */
  readonly formatted: string;
  readonly color: string;
  /** Marks whose fill is hatched rather than solid. The swatch is hatched too, so the distinction
   *  does not rely on hue alone. */
  readonly hatched?: boolean;
  /** A second line under the value, for what the chart does not already print beside the mark:
   *  its share of the total, its rank, the drop into it. */
  readonly detail?: string;
}

export interface ChartTooltipContext {
  /** Empty on a chart whose marks are the categories, where the entry label says it. */
  readonly category: string;
  readonly entries: readonly ChartTooltipEntry[];
}

/** Where the panel is anchored: the mark's own element, or a point in client
 *  coordinates for a chart whose active mark has no element of its own. */
export type ChartTooltipOrigin =
  | Element
  | { readonly x: number; readonly y: number };
