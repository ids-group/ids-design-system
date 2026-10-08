import { computed, input } from '@angular/core';
import { AuthLayoutComponent, ChartComponent, ColumnSeriesComponent, InputComponent } from '@ids-group-ltd/ids-design-system';

export class AppInput extends InputComponent {
  // @ts-expect-error after TS4114 TS2416
  protected readonly intl = null;
}

// @ts-expect-error after TS2415
export class AppChart extends ChartComponent {
  // @ts-expect-error after TS4114
  private readonly composed = computed((): never => {
    throw new Error();
  });
}

export class AppColumnSeries extends ColumnSeriesComponent {
  // @ts-expect-error before TS4114
  protected onMarkBlur(event: FocusEvent): void {}
}

export class AppAuthLayout extends AuthLayoutComponent {
  override readonly landmark = input<'main' | 'none'>('none');
}
