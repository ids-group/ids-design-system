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

// Past four readings the dots stop telling rows apart and start reading as a column of noise; the
// labels carry the series on their own.
const AUTO_SWATCH_LIMIT = 4;

@Component({
  selector: 'ds-chart-tooltip-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './chart-tooltip-panel.component.html',
  styleUrl: './chart-tooltip-panel.component.scss',
  host: {
    // Every interactive mark already carries the same label and value in its `aria-label`;
    // exposing the panel would read each reading twice.
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

    return swatches === 'auto'
      ? this.context().entries.length <= AUTO_SWATCH_LIMIT
      : swatches;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Before the frame paints, so a ring never lands a frame after its row.
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
