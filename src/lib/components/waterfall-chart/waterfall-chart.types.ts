/** What a bar is, which decides where it stands rather than how it is coloured.
 *
 *  A `'delta'` hangs from the level the bar before it left off at. A `'total'` or a `'subtotal'`
 *  stands on zero at the running sum, which is what makes it readable as a figure in its own right
 *  rather than as a change. The two differ only in the chain: the running sum carries on past a
 *  subtotal and a closing total is the end of it. */
export type WaterfallChartKind = 'delta' | 'total' | 'subtotal';

export interface WaterfallChartDatum {
  /** Falls back to the bar's position when left out, so a reorder rewrites the DOM. */
  readonly id?: string;
  readonly label: string;
  /** Added to the running sum wherever it sits. A closing total usually carries `0`: it prints the
   *  sum reached, not a change of its own. */
  readonly value: number;
  /** Defaults to `'delta'`. */
  readonly kind?: WaterfallChartKind;
}

/** Where one bar spans on the value axis, and which of the three meanings it carries. */
export interface WaterfallChartStep {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly direction: 'increase' | 'decrease' | 'total';
}
