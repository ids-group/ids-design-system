import { Component, ViewEncapsulation, input } from '@angular/core';
import type { TooltipPlacement } from './tooltip.types';

@Component({
  selector: 'ds-tooltip-panel',
  standalone: true,
  template: `
    @if (lead(); as leadText) {
      <span class="lead">{{ leadText }}</span>
    }
    {{ text() }}
  `,
  styleUrl: './tooltip-panel.component.scss',
  host: {
    role: 'tooltip',
    '[attr.id]': 'panelId()',
    '[class.top]': "placement() === 'top'",
    '[class.bottom]': "placement() === 'bottom'",
    '[class.left]': "placement() === 'left'",
    '[class.right]': "placement() === 'right'",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class TooltipPanelComponent {
  /** Tooltip text content. */
  readonly text = input.required<string>();
  /** Bold line shown above `text`. */
  readonly lead = input<string | null>(null);
  /** Side of the trigger the panel is positioned on; also drives the arrow class. */
  readonly placement = input.required<TooltipPlacement>();
  /** Element `id`, referenced by the trigger's `aria-describedby`. */
  readonly panelId = input<string>('');
}
