export interface FunnelChartStage {
  id: string;
  label: string;
  value: number;
}

/** What the Drop column reports. `'relative'` is the share that leaked at this stage,
 *  `'absolute'` the count that leaked, `'none'` drops the column. */
export type FunnelChartDrop = 'relative' | 'absolute' | 'none';

/** How a stage's geometry encodes its value. `'area'` is the default; `'taper'` encodes nothing:
 *  the silhouette is fixed whatever the data. */
export type FunnelChartShape = 'taper' | 'width' | 'area';
