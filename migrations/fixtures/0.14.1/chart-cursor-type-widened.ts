import { input } from '@angular/core';
import { ChartComponent } from '@ids-group-ltd/ids-design-system';

export function describe(chart: ChartComponent): string {
  const cursor = chart.cursor();
  if (cursor === 'none') return 'off';
  if (cursor === 'category') return 'band';
  // @ts-expect-error after TS2322
  const unreachable: never = cursor;
  return unreachable;
}

export class AppChart extends ChartComponent {
  // @ts-expect-error after TS2416
  override readonly cursor = input<'none' | 'category'>('none');
}
