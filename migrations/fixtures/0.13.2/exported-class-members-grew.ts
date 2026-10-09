import { booleanAttribute, input } from '@angular/core';
import { BarChartComponent, ProgressComponent } from '@ids-group-ltd/ids-design-system';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

export class AppBarChart extends BarChartComponent {
  // @ts-expect-error after TS4114
  readonly pinOnClick = input(false, { transform: booleanAttribute });
}

export class AppProgress extends ProgressComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly max = 'full';
}

// @ts-expect-error after TS2415
export class AppChartTooltip extends ChartTooltipDirective {
  // @ts-expect-error after TS4114
  private detachEscape: (() => void) | null = null;
}

// @ts-expect-error after TS2415
export class AppChartTooltipOverride extends ChartTooltipDirective {
  // @ts-expect-error before TS4113
  override detachEscape: (() => void) | null = null;
}
