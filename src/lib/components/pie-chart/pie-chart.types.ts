export interface PieChartSlice {
  id: string;
  label: string;
  value: number;
  /** 1-based palette slot. Pinning a slice to a slot keeps every other slice's
   *  colour where it is when one is filtered out of `data`; left off, the colour
   *  follows the index and the whole ring repaints. */
  slot?: number;
}
