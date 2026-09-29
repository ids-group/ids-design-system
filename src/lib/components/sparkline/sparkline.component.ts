import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartTooltipContext,
  ChartTooltipOrigin,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { sparklineGeometry } from './sparkline.math';
import type { SparklinePoint } from './sparkline.math';
import type { SparklineScale } from './sparkline.types';

/** A word-sized trend line: no axes, gridlines, legend or frame, a dot on the last reading, and a
 *  tooltip naming the reading under the pointer. Sized by `--ds-sparkline-width` and
 *  `--ds-sparkline-height`. */
@Component({
  selector: 'ds-sparkline',
  standalone: true,
  imports: [ChartTooltipDirective],
  templateUrl: './sparkline.component.html',
  styleUrl: './sparkline.component.scss',
  host: {
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label()',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparklineComponent {
  /** One reading per step, oldest first. `null` breaks the line. */
  readonly data = input.required<readonly (number | null)[]>();

  /** What each reading is, for the tooltip. Left out, the tooltip prints the value alone. */
  readonly categories = input<readonly string[]>([]);

  /** Accessible name, and the series name in the tooltip. Left out, the sparkline is decorative
   *  and hidden from assistive technology: it is then taken to sit beside a value that says it. */
  readonly label = input<string | null>(null);

  readonly scale = input<SparklineScale>('data');

  /** Shows the reading under the pointer. */
  readonly tooltip = input(true, { transform: booleanAttribute });

  /** Formats the value the tooltip prints. Unset, the locale's plain number format. */
  readonly valueFormat = input<((value: number) => string) | null>(null);

  private readonly locale = inject(LOCALE_ID);

  protected readonly geometry = computed(() =>
    sparklineGeometry(this.data(), this.scale()),
  );

  protected readonly activePoint = signal<SparklinePoint | null>(null);

  protected readonly shownPoint = computed(
    () => this.activePoint() ?? this.geometry().points.at(-1) ?? null,
  );

  protected readonly tooltipOrigin = signal<ChartTooltipOrigin | null>(null);

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const point = this.activePoint();
      const value = point ? this.data()[point.index] : null;
      if (!point || value == null || !this.tooltip()) {
        return null;
      }
      const format =
        this.valueFormat() ??
        ((reading: number) => reading.toLocaleString(this.locale));

      return {
        category: this.categories()[point.index] ?? '',
        entries: [
          {
            label: this.label() ?? '',
            value,
            formatted: format(value),
            color:
              'var(--ds-sparkline-line-color, var(--ds-chart-series-1-color))',
          },
        ],
      };
    },
  );

  protected onPointerMove(event: PointerEvent): void {
    const points = this.geometry().points;
    if (!this.tooltip() || points.length === 0) {
      return;
    }
    const box = (event.currentTarget as Element).getBoundingClientRect();
    const across = ((event.clientX - box.left) / box.width) * 100;
    const nearest = points.reduce((best, point) =>
      Math.abs(point.x - across) < Math.abs(best.x - across) ? point : best,
    );
    if (nearest === this.activePoint()) {
      return;
    }
    this.activePoint.set(nearest);
    this.tooltipOrigin.set({
      x: box.left + (nearest.x / 100) * box.width,
      y: box.top + (nearest.y / 100) * box.height,
    });
  }

  protected onPointerLeave(): void {
    this.activePoint.set(null);
    this.tooltipOrigin.set(null);
  }
}
