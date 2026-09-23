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
 * Strokes only: the LABELS are a second element, `g[dsReferenceLabel]`, because the two belong in
 * different layers of the canvas - a line reads as furniture under the marks, a label has to stay
 * legible over them - and one projected element can only land in one of the container's slots.
 *
 * Hosted on a `<g>` rather than an element of its own: an element the SVG specification does not
 * know is not rendered, and neither are its descendants. Written as `<svg:g dsReferenceLine>`.
 */
@Component({
  // The repository's `component-selector` rule asks for an element selector, and one cannot work
  // inside a canvas - see the same exemption on `g[dsColumnSeries]`.
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

  /** The lines and bands to draw across the plot. Each entry is ONE reading, `value`, plus an
   *  optional `label`, `color` and `dash`; a `to` makes it a band between two readings. Each one
   *  widens the value axis to hold it, so a target above every mark still lands on the plot. */
  readonly thresholds = input<readonly ChartThreshold[]>([]);

  private readonly domainId = `reference-line-${nextReferenceId++}`;

  constructor() {
    // Reported like a series: a target above every reading is the one the reader most needs to
    // see, and an axis derived from the data alone would draw it off the plot.
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
