import { input } from '@angular/core';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system';

export class AppTooltip extends TooltipDirective {
  // @ts-expect-error after TS4114
  readonly dsTooltipClippedLead = input<string>('');
}

// @ts-expect-error after TS2415
export class AppTooltipPrivate extends TooltipDirective {
  // @ts-expect-error before TS4117
  private override readonly dsTooltipClippedLead = input<string>('');
}

// @ts-expect-error both TS2415
export class AppTooltipBasePrivate extends TooltipDirective {
  // @ts-expect-error both TS4114
  private detachAncestor: (() => void) | null = null;
}

// @ts-expect-error both TS2415
export class AppTooltipBasePrivateOverride extends TooltipDirective {
  override detachAncestor: (() => void) | null = null;
}
