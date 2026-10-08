import { ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core';
import { HeatmapChartComponent } from '@ids-group-ltd/ids-design-system';

// What strictTemplates type-checks `<ds-heatmap-chart min="0">` as: the attribute's string assigned
// to the signal input's write type.
export function staticAttribute(chart: HeatmapChartComponent): void {
  // @ts-expect-error both TS2322
  chart.min[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] = '0';
  chart.min[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] = 0;
}
