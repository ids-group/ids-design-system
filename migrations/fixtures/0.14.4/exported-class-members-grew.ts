import { ChartComponent, ScatterChartComponent } from '@ids-group-ltd/ids-design-system';

export class AppChart extends ChartComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly tooltipSwatches = 'yes';
}

export class AppScatter extends ScatterChartComponent {
  // @ts-expect-error before TS4114
  protected onPointOver(event: Event): void {}
}
