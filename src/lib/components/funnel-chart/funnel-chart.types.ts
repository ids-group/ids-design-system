export interface FunnelChartStage {
  id: string;
  label: string;
  value: number;
}

/** How a stage's geometry encodes its value. `'taper'` encodes nothing — the
 *  silhouette is fixed; see `funnelGeometry`. */
export type FunnelChartShape = 'taper' | 'width' | 'area';
