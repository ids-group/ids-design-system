export interface ChartLegendItem {
  /** Matches the series or slice id the chart hides by. */
  readonly id: string;
  readonly label: string;
  readonly color: string;
}
