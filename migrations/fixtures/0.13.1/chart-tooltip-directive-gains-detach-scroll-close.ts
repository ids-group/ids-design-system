import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

// @ts-expect-error after TS2415
export class AppChartTooltip extends ChartTooltipDirective {
  // @ts-expect-error after TS4114
  private detachScrollClose: (() => void) | null = null;
}

// @ts-expect-error after TS2415
export class AppChartTooltipOverride extends ChartTooltipDirective {
  // @ts-expect-error before TS4113
  override detachScrollClose: (() => void) | null = null;
}

export class AppChartTooltipFlag extends ChartTooltipDirective {
  // @ts-expect-error after TS4114 TS2416
  detachScrollClose = 1;
}
