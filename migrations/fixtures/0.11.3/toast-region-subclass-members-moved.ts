import { ElementRef, inject } from '@angular/core';
import { ToastRegionComponent, type ToastEntry } from '@ids-group-ltd/ids-design-system';
// @ts-expect-error both TS2724
import { DropdownComponent } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error before TS2415
export class AppRegionMarked extends ToastRegionComponent {
  // @ts-expect-error after TS4113
  override startCountdown(entry: ToastEntry): void {}
}

// @ts-expect-error before TS2415
export class AppRegionUnmarked extends ToastRegionComponent {
  // @ts-expect-error before TS4114
  startCountdown(entry: ToastEntry): void {}
}

// @ts-expect-error after TS2415
export class AppRegionHost extends ToastRegionComponent {
  // @ts-expect-error before TS4113
  protected override readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
}

export class AppRegionHover extends ToastRegionComponent {
  // @ts-expect-error before TS4113
  protected override onHover(entered: boolean): void {}
  // @ts-expect-error after TS4114 TS2416
  protected readonly onFocusWithin = 1;
}

export type Unused = DropdownComponent;
