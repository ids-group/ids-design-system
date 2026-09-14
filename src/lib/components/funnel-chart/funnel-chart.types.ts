export interface FunnelChartStage {
  id: string;
  label: string;
  value: number;
}

/** How a stage's geometry encodes its value. `'area'` is the default; `'taper'` encodes nothing —
 *  the silhouette is fixed whatever the data. See `funnelGeometry`. */
export type FunnelChartShape = 'taper' | 'width' | 'area';
