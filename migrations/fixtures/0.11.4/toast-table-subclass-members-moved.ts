import { LiveAnnouncer } from '@angular/cdk/a11y';
import { computed, inject } from '@angular/core';
import { ToastComponent, ToastRegionComponent, ToastService } from '@ids-group-ltd/ids-design-system';

export class AppToast extends ToastComponent {
  // @ts-expect-error after TS4113
  protected override readonly role = computed(() => 'alert' as const);
}

export class AppToastWithStaleMember extends ToastComponent {
  // @ts-expect-error before TS4114
  protected readonly role = computed(() => 'alert' as const);
}

// @ts-expect-error after TS2415
export class AppToastService extends ToastService {
  // @ts-expect-error after TS4114
  private readonly announcer = inject(LiveAnnouncer);
}

export class AppToastServiceWithOwnField extends ToastService {
  // @ts-expect-error after TS2416 TS4114
  readonly announcer = null;
}

// @ts-expect-error before TS2415
export class AppToastRegion extends ToastRegionComponent {
  // @ts-expect-error after TS4113
  override promoteFromQueue(): void {}
}
