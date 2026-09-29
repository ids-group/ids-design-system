import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import type { ChartThreshold } from '@ids-group-ltd/ids-design-system/core';
import { CHART_SCALES } from './chart-scales.token';
import { thresholdMarks } from './chart.math';

let nextReferenceId = 0;

/**
 * Reference lines and bands across the plot, drawn against the scales `ds-chart` supplies.
 *
 * Strokes only: labels are `g[dsReferenceLabel]`, a second element, since they paint in another layer.
 *
 * Hosted on a `<g>`: an element SVG does not know renders nothing, nor do its descendants.
 * Written as `<svg:g dsReferenceLine>`.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsReferenceLine]',
  standalone: true,
  templateUrl: './reference-line.component.html',
  styleUrl: './reference-line.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceLineComponent implements OnDestroy {
  private readonly scales = inject(CHART_SCALES);

  /** The lines and bands to draw: one `value` plus optional `label`, `color` and `dash`; a `to` makes it a band. Each widens the value axis. */
  readonly thresholds = input<readonly ChartThreshold[]>([]);

  private readonly domainId = `reference-line-${nextReferenceId++}`;

  constructor() {
    // Reported like a series: an axis derived from the data alone would draw a high target off the plot.
    effect(() =>
      this.scales.reportDomain(
        this.domainId,
        this.thresholds().flatMap((threshold) =>
          threshold.to == null
            ? [threshold.value]
            : [threshold.value, threshold.to],
        ),
      ),
    );
  }

  ngOnDestroy(): void {
    this.scales.releaseDomain(this.domainId);
  }

  protected readonly lines = computed(() =>
    thresholdMarks(
      this.thresholds(),
      this.scales.plot(),
      this.scales.yPosition(),
    ),
  );
}
