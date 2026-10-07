import { booleanAttribute, input } from '@angular/core';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system';

export class AppOverlay extends LoadingOverlayComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly inertContent = 'yes';
}

// @ts-expect-error after TS2415
export class AppOverlayProtected extends LoadingOverlayComponent {
  // @ts-expect-error after TS4114
  protected readonly inertContent = input(true, { transform: booleanAttribute });
}
