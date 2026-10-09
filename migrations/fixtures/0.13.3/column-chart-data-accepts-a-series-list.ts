import { input } from '@angular/core';
import { ColumnChartComponent, type ColumnChartPoint } from '@ids-group-ltd/ids-design-system';

export function firstValue(chart: ColumnChartComponent): number | undefined {
  // @ts-expect-error after TS2339
  return chart.data()[0]?.value;
}

export function narrowed(chart: ColumnChartComponent): number | undefined {
  const entry = chart.data()[0];
  return entry && !('data' in entry) ? entry.value : undefined;
}

export class AppColumnChart extends ColumnChartComponent {
  // @ts-expect-error after TS2416
  override readonly data = input.required<readonly ColumnChartPoint[]>();
}
