import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import type { ChartAxis } from '@ids-group-ltd/ids-design-system/core';
import { CHART_SCALES } from './chart-scales.token';
import { annotationMarks } from './chart.math';

/** A label the caller pins to one reading, named by the category it sits under. */
export interface ChartAnnotation {
  /** 0-based position along the category axis. */
  readonly categoryIndex: number;
  /** The reading the label names, in the axis's own unit. */
  readonly value: number;
  readonly label: string;
  /** Which value axis the reading is measured against. Defaults to `'primary'`. */
  readonly axis?: ChartAxis;
}

/**
 * Labels pinned to readings, so the point one names is legible with no pointer - a peak, a
 * launch, the month a number turned. The tooltip answers "what is this?" on hover; an annotation
 * answers it in a printed page or a screenshot.
 *
 * Takes the readings rather than finding them: a mark never sees the other marks, so the caller
 * that owns the series is the one that knows which value a label belongs to. Reports no domain -
 * the series it annotates already did.
 */
@Component({
  // The repository's `component-selector` rule asks for an element selector, and one cannot work
  // inside a canvas - see the same exemption on `g[dsColumnSeries]`.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsSeriesAnnotation]',
  standalone: true,
  templateUrl: './series-annotation.component.html',
  styleUrl: './series-annotation.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeriesAnnotationComponent {
  private readonly scales = inject(CHART_SCALES);

  readonly annotations = input<readonly ChartAnnotation[]>([]);

  protected readonly placed = computed(() => {
    const plot = this.scales.plot();
    const xPosition = this.scales.xPosition();
    const yPosition = this.scales.yPosition();
    const secondaryYPosition = this.scales.secondaryYPosition();

    return annotationMarks(
      this.annotations().map((annotation, index) => ({
        key: `${annotation.categoryIndex}:${index}`,
        label: annotation.label,
        x: xPosition(annotation.categoryIndex),
        y: (annotation.axis === 'secondary' ? secondaryYPosition : yPosition)(
          annotation.value,
        ),
      })),
      plot.left + plot.width,
    );
  });
}
