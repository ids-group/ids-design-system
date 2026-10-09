import { computed } from '@angular/core';
import { AvatarGroupComponent, ChartComponent } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2415
export class AppAvatarGroup extends AvatarGroupComponent {
  // @ts-expect-error before TS4113
  override readonly avatars = computed((): never => {
    throw new Error();
  });
}

export class AppChart extends ChartComponent {
  protected pinTop(): number {
    // @ts-expect-error after TS2554
    return this.bandPinY({ bottom: 0 });
  }
}

export class AppChartOverride extends ChartComponent {
  // @ts-expect-error after TS2425 TS2416
  protected override bandPinY(band: { readonly bottom: number }): number {
    return band.bottom;
  }
}

export class AppChartHighlight extends ChartComponent {
  // @ts-expect-error after TS4114 TS2416
  protected readonly highlightBand = 1;
}
