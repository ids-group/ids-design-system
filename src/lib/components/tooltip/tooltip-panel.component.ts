import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { parseTooltipMarkup } from './tooltip-markup';
import type { TooltipPlacement } from './tooltip.types';

@Component({
  selector: 'ds-tooltip-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as template) {
      <ng-container [ngTemplateOutlet]="template" />
    }

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
  /** Tooltip text, where `**bold**` runs render bold; or a template, rendered as given. */
  readonly text = input.required<string | TemplateRef<unknown>>();
  protected readonly template = computed(() => {
    const text = this.text();

    return text instanceof TemplateRef ? text : null;
  });
  protected readonly segments = computed(() => {
    const text = this.text();

    return typeof text === 'string' ? parseTooltipMarkup(text) : [];
  });
  /** Side of the trigger the panel is positioned on; also drives the arrow class. */
  readonly placement = input.required<TooltipPlacement>();
  /** Whether the arrow pointing at the trigger is drawn. */
  readonly arrow = input(true);
  /** Element `id`, referenced by the trigger's `aria-describedby`. */
  readonly panelId = input<string>('');
}
