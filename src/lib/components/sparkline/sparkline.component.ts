import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { injectDsLocale } from '@ids-group-ltd/ids-design-system/core';
import { ChartTooltipDirective } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartTooltipContext,
  ChartTooltipOrigin,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { sparklineGeometry } from './sparkline.math';
import type { SparklinePoint } from './sparkline.math';
import type { SparklineScale } from './sparkline.types';

/** A word-sized trend line: no axes, legend or frame, a dot on the last reading, and a tooltip.
 *  Sized by `--ds-sparkline-width` and `--ds-sparkline-height`. */
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
    '[attr.tabindex]': 'focusable() ? 0 : null',
    '(focus)': 'onFocus()',
    '(blur)': 'clearActive()',
    '(keydown)': 'onKeydown($event)',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparklineComponent {
  /** Fills the band under the line down to the baseline. The colour is
   *  `--ds-sparkline-area-color`, the line's own by default, at `--ds-sparkline-area-opacity`. */
  readonly area = input(false, { transform: booleanAttribute });

  /** One reading per step, oldest first. `null` breaks the line. */
  readonly data = input<readonly (number | null)[]>([]);

  /** What each reading is, for the tooltip. Left out, the tooltip prints the value alone. */
  readonly categories = input<readonly string[]>([]);

  /** Accessible name, and the series name in the tooltip. Left out, the sparkline is decorative
   *  and hidden from assistive technology. */
  readonly label = input<string | null>(null);

  readonly scale = input<SparklineScale>('data');

  /** Shows the reading under the pointer, and under the keyboard where `label` makes the sparkline
   *  focusable: focus opens the last reading; arrows, Home and End move. */
  readonly tooltip = input(true, { transform: booleanAttribute });

  /** Formats the value the tooltip prints. Unset, the locale's plain number format. */
  readonly valueFormat = input<((value: number) => string) | null>(null);

  private readonly locale = injectDsLocale();

  private readonly canvas =
    viewChild.required<ElementRef<SVGSVGElement>>('canvas');

  protected readonly focusable = computed(
    () => this.tooltip() && this.label() !== null,
  );

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
    const box = this.canvas().nativeElement.getBoundingClientRect();
    const across = ((event.clientX - box.left) / box.width) * 100;
    this.activate(
      points.reduce((best, point) =>
        Math.abs(point.x - across) < Math.abs(best.x - across) ? point : best,
      ),
    );
  }

  protected onFocus(): void {
    const last = this.geometry().points.at(-1);
    if (this.focusable() && last) {
      this.activate(last);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const points = this.geometry().points;
    const current = this.activePoint();
    if (!this.focusable() || !current) {
      return;
    }
    const position = points.indexOf(current);
    const target = {
      ArrowLeft: position - 1,
      ArrowRight: position + 1,
      Home: 0,
      End: points.length - 1,
    }[event.key];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    this.activate(points[Math.min(Math.max(target, 0), points.length - 1)]);
  }

  protected clearActive(): void {
    this.activePoint.set(null);
    this.tooltipOrigin.set(null);
  }

  private activate(point: SparklinePoint): void {
    if (point === this.activePoint()) {
      return;
    }
    const box = this.canvas().nativeElement.getBoundingClientRect();
    this.activePoint.set(point);
    this.tooltipOrigin.set({
      x: box.left + (point.x / 100) * box.width,
      y: box.top + (point.y / 100) * box.height,
    });
  }
}
