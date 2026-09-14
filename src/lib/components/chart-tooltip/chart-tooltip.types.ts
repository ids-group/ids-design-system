/** Which mark a chart's tooltip answers for. `'item'` is the mark under the pointer;
 *  `'axis'` is every series at the category under the pointer, which is what a line
 *  chart needs and a bar chart does not. */
export type ChartTooltipTrigger = 'item' | 'axis' | 'none';

/** The subset a chart whose marks ARE its categories offers. Spelled out rather than written as
 *  `Exclude<ChartTooltipTrigger, 'axis'>`: the React wrapper generator cannot resolve a built-in
 *  utility type, so the conditional collapses the whole input to `unknown` on that side. */
export type ChartItemTooltipTrigger = 'item' | 'none';

export interface ChartTooltipEntry {
  readonly label: string;
  readonly value: number;
  /** Already through the chart's `valueFormat`, so the panel never formats. */
  readonly formatted: string;
  readonly color: string;
  /** A second line under the value, for what the chart does NOT already print beside the mark —
   *  its share of the total, its rank, the drop into it. A tooltip that repeats the label a
   *  reader is looking at has told them nothing. */
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
