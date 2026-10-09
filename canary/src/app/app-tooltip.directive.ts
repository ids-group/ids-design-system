import { Directive, input } from '@angular/core';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/tooltip';

@Directive({
  selector: '[appTooltip]',
})
export class AppTooltipDirective extends TooltipDirective {
  readonly appTooltipTone = input<'plain' | 'emphasis'>('plain');
}
