import { Directive, inject } from '@angular/core';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system';

@Directive({ selector: '[appTipLogger]' })
export class TipLoggerDirective {
  private readonly tooltip = inject(TooltipDirective);

  protected log(): void {
    console.log(this.tooltip.dsTooltip().trim());
  }
}
