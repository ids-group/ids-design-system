export interface LineChartSeries {
  id: string;
  label: string;
  /** A `null` is a missing reading. What it draws is the chart's `gaps` input. */
  data: readonly (number | null)[];
  /** Which y axis this series is measured against. Defaults to `'primary'`. */
  axis?: 'primary' | 'secondary';
  /** Fills the band between the line and its axis baseline. */
  area?: boolean;
  /** 1-based palette slot. Pinning it keeps every other series on its own colour
   *  when one is hidden; left out, a series takes the colour of its position. */
  slot?: number;
}

/** How the secondary axis relates to the primary one.
 *
 *  - `'rounded'` — one set of gridlines, and the secondary axis rounds its step up
 *    to a round number, so its series stops short of the top.
 *  - `'exact'` — one set of gridlines, and the secondary axis ends exactly at its
 *    largest reading, so its series uses the full height and the labels are not round.
 *  - `'independent'` — each axis is scaled and gridded on its own.
 *  - `'stacked'` — two plots one above the other, sharing the category axis. */
export type LineChartAxisMode = 'rounded' | 'exact' | 'independent' | 'stacked';

/** What a `null` reading draws: a hole in the line, or a point at zero. */
export type LineChartGaps = 'break' | 'zero';
