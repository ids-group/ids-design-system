/** What a bar is, which decides where it stands. A `'delta'` hangs from the level the bar before it
 *  left off at; a `'total'` or `'subtotal'` stands on zero at the running sum. */
export type WaterfallChartKind = 'delta' | 'total' | 'subtotal';

export interface WaterfallChartBar {
  /** Falls back to the bar's position; a reorder then rewrites the DOM. */
  readonly id?: string;
  readonly label: string;
  /** Added to the running sum wherever it sits. A closing total usually carries `0`. */
  readonly value: number;
  /** Defaults to `'delta'`. */
  readonly kind?: WaterfallChartKind;
}

/** Where one bar spans on the value axis, and which of the three meanings it carries.
 *
 *  @internal */
export interface WaterfallChartStep {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly direction: 'increase' | 'decrease' | 'total';
}
