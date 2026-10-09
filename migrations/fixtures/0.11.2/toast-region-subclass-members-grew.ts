import { ToastRegionComponent, type ToastEntry } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2415
export class AppToastRegion extends ToastRegionComponent {
  // @ts-expect-error after TS4114
  private startCountdown(entry: ToastEntry): void {}
}
