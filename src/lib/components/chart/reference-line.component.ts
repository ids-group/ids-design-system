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
 * Strokes only: the labels are a second element, `g[dsReferenceLabel]`, because they paint in a
 * different layer and one projected element lands in only one of the container's slots.
 *
 * Hosted on a `<g>`: an element the SVG specification does not know is not rendered, nor are its
 * descendants. Written as `<svg:g dsReferenceLine>`.
 */
@Component({
  // An element selector cannot work inside a canvas; see `g[dsColumnSeries]`.
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

  /** The lines and bands to draw. Each entry is one `value` plus optional `label`, `color` and `dash`;
   *  a `to` makes it a band. Each widens the value axis to hold it. */
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
