import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { CHART_SCALES } from '@ids-group-ltd/ids-design-system/components/chart';
import type { ChartValueFormat } from '@ids-group-ltd/ids-design-system/core';
import type { WaterfallChartStep } from './waterfall-chart.types';

/** Distance from a bar's own tip to its value label's baseline. */
const VALUE_LABEL_GAP = 8;

/**
 * The two things a waterfall needs that a column series cannot carry: the dashed rule chaining one
 * bar to the next, and a value label that prints its own sign.
 *
 * The label lives here rather than on the column series because the sign is not a property of the
 * number - a delta of `130` reads `+130` and a total of `800` reads `800` - and a series-wide
 * formatter sees only the value, never which of the two it is holding.
 *
 * Hosted on a `<g>` rather than an element of its own: an element the SVG specification does not
 * know is not rendered, and neither are its descendants. Written as `<svg:g dsWaterfallMarks>`.
 *
 * @internal
 */
@Component({
  // The repository's `component-selector` rule asks for an element selector, and one cannot work
  // inside a canvas - see the same exemption on `g[dsColumnSeries]`.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsWaterfallMarks]',
  standalone: true,
  templateUrl: './waterfall-marks.component.html',
  styleUrl: './waterfall-marks.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallMarksComponent {
  private readonly scales = inject(CHART_SCALES);

  readonly steps = input<readonly WaterfallChartStep[]>([]);

  /** The reading each label prints: a delta's own change, a total's running sum. */
  readonly labelValues = input<readonly number[]>([]);

  readonly showValues = input(true);

  readonly showConnectors = input(true);

  readonly valueFormat = input<ChartValueFormat>((value) => String(value));

  /** The share of a category's band the bars take, so the connector starts where the bar ends. */
  readonly columnWidthRatio = input(0.8, { transform: numberAttribute });

  protected readonly markWidth = computed(
    () => this.scales.bandWidth() * this.columnWidthRatio(),
  );

  /** One rule per gap between two bars, drawn at the level they share - the level the left bar
   *  ended on. Without it the bars read as five separate columns instead of one chain. */
  protected readonly connectors = computed(() => {
    const toX = this.scales.xPosition();
    const toY = this.scales.yPosition();
    const steps = this.steps();
    const half = this.markWidth() / 2;

    return steps.slice(0, -1).map((step, index) => ({
      key: `${index}-${step.label}`,
      x1: toX(index) + half,
      x2: toX(index + 1) - half,
      y: toY(step.to),
    }));
  });

  protected readonly labels = computed(() => {
    const toX = this.scales.xPosition();
    const toY = this.scales.yPosition();
    const format = this.valueFormat();
    const values = this.labelValues();

    return this.steps().map((step, index) => {
      const reading = values[index] ?? step.to - step.from;
      const tip = Math.min(toY(step.from), toY(step.to));
      const sign = step.direction === 'increase' && reading > 0 ? '+' : '';

      return {
        key: `${index}-${step.label}`,
        x: toX(index),
        y: tip - VALUE_LABEL_GAP,
        text: `${sign}${format(reading, 'tooltip')}`,
      };
    });
  });
}
