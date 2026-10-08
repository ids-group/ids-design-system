import { input } from '@angular/core';
import { BarChartComponent, LineSeriesComponent, type BarChartRow } from '@ids-group-ltd/ids-design-system';

export class AppBarChart extends BarChartComponent {
  override readonly caption = input<string | null>(null);
}

export class AppBarChartRequired extends BarChartComponent {
  override readonly data = input.required<readonly BarChartRow[]>();
}

export class AppLineSeries extends LineSeriesComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly fadeId = 1;
}
