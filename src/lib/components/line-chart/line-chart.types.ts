export interface LineChartSeries {
  id: string;
  label: string;
  /** A `null` is a missing reading. What it draws is the chart's `gaps` input. */
  data: readonly (number | null)[];
  /** Which y axis this series is measured against. Defaults to `'primary'`. */
  axis?: 'primary' | 'secondary';
  /** Fills the band between the line and its axis baseline: `true` in one flat tint, `'fade'`
   *  fading to nothing at the baseline. The colour is
   *  `--ds-chart-area-color`, the series' own by default. */
  area?: boolean | 'fade';
  /** 1-based palette slot. Pinning it keeps every other series on its own colour when one is hidden;
   *  left out, a series takes the colour of its position. */
  slot?: number;
}

/** How several series share the value axis. `'none'` draws each from the baseline. `'stacked'`
 *  starts each series where the one before it ended. `'normalized'` stacks then divides by the
 *  category's own total, so the axis reads in shares.
 *
 *  Unrelated to `yAxisMode`'s `'split'`, which puts two plots one above the other. */
export type LineChartStack = 'none' | 'stacked' | 'normalized';

/** A label pinned to one reading, so the point stays legible with no pointer (print, screenshot). */
export interface LineChartAnnotation {
  /** 0-based position along the category axis. */
  readonly categoryIndex: number;
  readonly label: string;
  /** Which series the reading belongs to. Left out, the first plotted one. An annotation whose
   *  series is hidden, or whose reading is `null`, draws nothing. */
  readonly seriesId?: string;
}

/** One reading, named by the series it belongs to and the category it sits under. */
export interface LineChartReading {
  readonly series: LineChartSeries;
  readonly categoryIndex: number;
  readonly category: string;
  readonly value: number;
}
