import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import {
  leaveMark,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import { CHART_SCALES } from '@ids-group-ltd/ids-design-system/components/chart';
import type { ChartValueFormat } from '@ids-group-ltd/ids-design-system/core';
import type { WaterfallChartStep } from './waterfall-chart.types';

const VALUE_LABEL_GAP = 8;

/**
 * The connector rules between bars and the signed value labels, which a column series cannot carry.
 *
 * Hosted on a `<g>`: an element unknown to SVG is not rendered. Written as `<svg:g dsWaterfallMarks>`.
 *
 * @internal
 */
@Component({
  // An element selector cannot work inside a canvas; same exemption as `g[dsColumnSeries]`.
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

  protected readonly leaveMark = leaveMark;

  readonly steps = input<readonly WaterfallChartStep[]>([]);

  /** The reading each label prints: a delta's own change, a total's running sum. */
  readonly labelValues = input<readonly number[]>([]);

  readonly showValues = input(true);

  readonly showConnectors = input(true);

  readonly valueFormat = input<ChartValueFormat>((value) => String(value));

  /** The share of a category's band the bars take. */
  readonly columnWidthRatio = input(0.8, { transform: numberAttribute });

  /** The bars' own `staggerMs`. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  protected readonly markWidth = computed(
    () => this.scales.bandWidth() * this.columnWidthRatio(),
  );

  /** One rule per gap between two bars, at the level the left bar ended on. */
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
      stagger: this.barStagger(index + 1),
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
        stagger: this.barStagger(index),
      };
    });
  });

  private barStagger(index: number): string {
    return `${staggerDelay(index, this.steps().length, this.staggerMs())}ms`;
  }
}
