import { input, numberAttribute } from '@angular/core';
import { HeatmapChartComponent } from '@ids-group-ltd/ids-design-system';

export class AppHeatmapOld extends HeatmapChartComponent {
  override readonly max = input<number | null>(null);
}

export class AppHeatmapAction extends HeatmapChartComponent {
  // @ts-expect-error both TS2416
  override readonly min = input<number | null, unknown>(null, { transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)) });
}

export function readMax(chart: HeatmapChartComponent): number | null {
  return chart.max();
}
