import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ChartTooltipContext } from './chart-tooltip.types';
import { swatchBlendsInto } from './swatch-contrast';

// A dot tells readings apart, so a lone reading has nothing to tell it from, and past four the dots
// read as a column of noise; in both cases the labels carry the series on their own.
const AUTO_SWATCH_MIN = 2;
const AUTO_SWATCH_MAX = 4;

@Component({
  selector: 'ds-chart-tooltip-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './chart-tooltip-panel.component.html',
  styleUrl: './chart-tooltip-panel.component.scss',
  host: {
    // Every interactive mark's `aria-label` already carries the reading.
    'aria-hidden': 'true',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartTooltipPanelComponent {
  /** The category and the readings the panel prints. */
  readonly context = input.required<ChartTooltipContext>();
  /** The chart's projected `#dsChartTooltip` template. Null renders the built-in rows. */
  readonly template = input<TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null>(null);

  readonly swatches = input<boolean | 'auto'>('auto');

  protected readonly showsSwatches = computed(() => {
    const swatches = this.swatches();

    const count = this.context().entries.length;

    return swatches === 'auto'
      ? count >= AUTO_SWATCH_MIN && count <= AUTO_SWATCH_MAX
      : swatches;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect({
      earlyRead: () => {
        this.context();
        const host = this.host.nativeElement;
        const ground = getComputedStyle(host).backgroundColor;

        return [...host.querySelectorAll<HTMLElement>('.swatch')].map(
          (swatch) =>
            [
              swatch,
              swatchBlendsInto(
                getComputedStyle(swatch).backgroundColor,
                ground,
              ),
            ] as const,
        );
      },
      write: (swatches) => {
        for (const [swatch, blends] of swatches()) {
          swatch.classList.toggle('ringed', blends);
        }
      },
    });
  }
}
