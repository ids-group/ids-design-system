import { Component, viewChild } from '@angular/core';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-hint',
  imports: [TooltipDirective],
  template: `<button dsTooltip="Saved">Save</button>`,
})
export class HintComponent {
  private readonly tip = viewChild.required(TooltipDirective);

  protected side(): string {
    return this.tip().dsTooltipPlacement() ?? 'top';
  }
}
