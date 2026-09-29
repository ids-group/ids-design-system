import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import type { ChartThreshold } from '@ids-group-ltd/ids-design-system/core';
import { CHART_SCALES } from './chart-scales.token';
import { thresholdMarks } from './chart.math';

/**
 * The names of a chart's reference lines, laid out by the same geometry that draws them.
 *
 * A second element because strokes go under the marks and names over them, and a projected element
 * lands in one slot only. Reports no domain; the line it names already did.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsReferenceLabel]',
  standalone: true,
  templateUrl: './reference-label.component.html',
  styleUrl: './reference-label.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceLabelComponent {
  private readonly scales = inject(CHART_SCALES);

  /** The same list `dsReferenceLine` is given. Place this mark after the series so labels stay legible over marks. */
  readonly thresholds = input<readonly ChartThreshold[]>([]);

  protected readonly lines = computed(() =>
    thresholdMarks(
      this.thresholds(),
      this.scales.plot(),
      this.scales.yPosition(),
    ).filter((mark) => mark.label !== ''),
  );
}
