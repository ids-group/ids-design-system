import { Component, ViewEncapsulation, input } from '@angular/core';
import type { TooltipPlacement } from './tooltip.types';

@Component({
  selector: 'ds-tooltip-panel',
  standalone: true,
  template: `{{ text() }}`,
  styleUrl: './tooltip-panel.component.scss',
  host: {
    '[class.top]': "placement() === 'top'",
    '[class.bottom]': "placement() === 'bottom'",
    '[class.left]': "placement() === 'left'",
    '[class.right]': "placement() === 'right'",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class TooltipPanelComponent {
  readonly text = input.required<string>();
  readonly placement = input.required<TooltipPlacement>();
}
