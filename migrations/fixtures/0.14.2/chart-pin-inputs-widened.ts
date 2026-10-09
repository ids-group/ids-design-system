import { booleanAttribute, input } from '@angular/core';
import { BarChartComponent } from '@ids-group-ltd/ids-design-system';

export function read(chart: BarChartComponent): boolean {
  if (chart.pinOnClick()) return true;
  // @ts-expect-error after TS2322
  const pins: boolean = chart.pinOnClick();
  return pins;
}

export class AppBarChart extends BarChartComponent {
  // @ts-expect-error after TS2416
  override readonly pinOnClick = input(false, { transform: booleanAttribute });
}

export class AppBarChartRetyped extends BarChartComponent {
  // @ts-expect-error before TS2416
  override readonly pinOnClick = input<boolean | null, unknown>(null, { transform: (value) => (value == null ? null : booleanAttribute(value)) });
}
