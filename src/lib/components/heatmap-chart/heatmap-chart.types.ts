/** One row of the matrix. `data` has one reading per column; a `null` is a cell never measured. */
export interface HeatmapChartRow {
  /** Falls back to the row's position; a reorder then rewrites the DOM. */
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
