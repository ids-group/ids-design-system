export interface FunnelChartStage {
  id: string;
  label: string;
  value: number;
}

/** What the Drop column reports. `'relative'` is the share that leaked at this stage,
 *  `'absolute'` the COUNT that leaked, `'none'` drops the column.
 *
 *  Both answer real questions and they are not the same question: on a settlement funnel the share
 *  is a talking point and the count is a re-targeting job. The count is recoverable by subtracting
 *  two rows, but a reader should not have to. */
export type FunnelChartDrop = 'relative' | 'absolute' | 'none';

/** How a stage's geometry encodes its value. `'area'` is the default; `'taper'` encodes nothing —
 *  the silhouette is fixed whatever the data. See `funnelGeometry`. */
export type FunnelChartShape = 'taper' | 'width' | 'area';
