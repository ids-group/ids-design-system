import { input } from '@angular/core';
import { ColumnChartComponent } from '@ids-group-ltd/ids-design-system';
// @ts-expect-error after TS2305
import { ProgressComponent } from '@ids-group-ltd/ids-design-system';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';

export class AppChartTooltip extends ChartTooltipDirective {
  // @ts-expect-error after TS4114
  readonly dsChartTooltipPreferBelow = input(false);
}

// @ts-expect-error after TS2415
export class AppChartTooltipPrivate extends ChartTooltipDirective {
  // @ts-expect-error after TS4114
  private detachScrollReposition: (() => void) | null = null;
}

export class AppColumnChart extends ColumnChartComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly stack = 1;
}

export class AppProgress extends ProgressComponent {}
