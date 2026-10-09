import { TooltipDirective } from '@ids-group-ltd/ids-design-system';

export class ClippedAwareTooltip extends TooltipDirective {
  protected isTested(): boolean {
    return this.dsTooltipWhenClipped() === true && this.isClipped();
  }
}
