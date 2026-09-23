/** One row of the matrix. `data` carries one reading per column, in the chart's own column order;
 *  a `null` is a cell that was never measured and is drawn as a hole rather than as a low value. */
export interface HeatmapChartRow {
  /** Falls back to the row's position when left out, so a reorder rewrites the DOM. */
  id?: string;
  label: string;
  data: readonly (number | null)[];
}

/** One cell, named by the row and the column it sits at. */
export interface HeatmapChartCell {
  readonly row: HeatmapChartRow;
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly column: string;
  readonly value: number;
}
