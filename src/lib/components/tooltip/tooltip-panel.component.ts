import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { parseTooltipMarkup } from './tooltip-markup';
import type { TooltipPlacement } from './tooltip.types';

@Component({
  selector: 'ds-tooltip-panel',
  standalone: true,
  template: `
    @for (segment of segments(); track $index) {
      @if (segment.bold) {
        <strong [textContent]="segment.text"></strong>
      } @else {
        <span [textContent]="segment.text"></span>
      }
    }
  `,
  styleUrl: './tooltip-panel.component.scss',
  host: {
    role: 'tooltip',
    '[attr.id]': 'panelId()',
    '[class.top]': "placement() === 'top'",
    '[class.bottom]': "placement() === 'bottom'",
    '[class.left]': "placement() === 'left'",
    '[class.right]': "placement() === 'right'",
    '[class.no-arrow]': '!arrow()',
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class TooltipPanelComponent {
  /** Tooltip text; `**bold**` runs render bold. */
  readonly text = input.required<string>();
  protected readonly segments = computed(() => parseTooltipMarkup(this.text()));
  /** Side of the trigger the panel is positioned on; also drives the arrow class. */
  readonly placement = input.required<TooltipPlacement>();
  /** Whether the arrow pointing at the trigger is drawn. */
  readonly arrow = input(true);
  /** Element `id`, referenced by the trigger's `aria-describedby`. */
  readonly panelId = input<string>('');
}
