export interface PieChartSlice {
  id: string;
  label: string;
  value: number;
  /** 1-based palette slot; left off, the colour follows the index. */
  slot?: number;
}
