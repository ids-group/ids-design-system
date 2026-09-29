export interface PieChartSlice {
  id: string;
  label: string;
  value: number;
  /** 1-based palette slot. Pinning keeps every other slice's colour stable when one is filtered
   *  out of `data`; left off, the colour follows the index and the whole ring repaints. */
  slot?: number;
}
