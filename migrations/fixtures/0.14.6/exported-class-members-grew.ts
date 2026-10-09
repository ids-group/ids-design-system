import { ChartComponent, LineSeriesComponent, TagComponent } from '@ids-group-ltd/ids-design-system';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

export class AppTag extends TagComponent {
  // @ts-expect-error after TS4114
  protected onKeyActivate(event: Event): void {}
}

export class AppLineSeries extends LineSeriesComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly axisPointElements = 1;
}

// @ts-expect-error after TS2415
export class AppChart extends ChartComponent {
  // @ts-expect-error before TS4113
  override focusStop(index: number): void {}
}

// @ts-expect-error after TS2415
export class AppChartTooltip extends ChartTooltipDirective {
  // @ts-expect-error before TS4113
  override detachOffscreen: (() => void) | null = null;
}
