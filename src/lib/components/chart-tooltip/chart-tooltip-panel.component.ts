import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ChartTooltipContext } from './chart-tooltip.types';

@Component({
  selector: 'ds-chart-tooltip-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './chart-tooltip-panel.component.html',
  styleUrl: './chart-tooltip-panel.component.scss',
  host: {
    // Hidden from assistive technology on purpose: every interactive mark already
    // carries the same label and value in its `aria-label`, so exposing the panel
    // makes a screen reader read each reading twice.
    'aria-hidden': 'true',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartTooltipPanelComponent {
  readonly context = input.required<ChartTooltipContext>();
  readonly template = input<TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null>(null);
}
