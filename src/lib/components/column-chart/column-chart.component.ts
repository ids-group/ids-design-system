import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import {
  chartColors,
  describeSeries,
  formatTick,
  formatValue,
  niceMax,
  tickStep,
  tickValues,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { heightPercent, resolveDomainMax } from './column-chart.math';
import type { ColumnChartPoint } from './column-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

@Component({
  selector: 'ds-column-chart',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnChartComponent {
  readonly data = input.required<readonly ColumnChartPoint[]>();

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** How many value-axis ticks to aim for. A hint, not a count: ticks are
   *  snapped to a round step, so the axis may carry one more or one fewer. */
  readonly tickCount = input(5, { transform: numberAttribute });

  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  readonly dataTable = input<'toggle' | 'visible' | 'none'>('toggle');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input<string>('No data');
  readonly valueFormat = input<(value: number) => string>(defaultValueFormat);

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  readonly pointClicked = output<ColumnChartPoint>();

  protected readonly domainMax = computed(() =>
    resolveDomainMax(this.data().map((point) => point.value)),
  );

  /** Top of the value axis: the domain rounded up to a whole tick, so the
   *  tallest column ends on a gridline rather than between two. */
  protected readonly axisMax = computed(() =>
    niceMax(this.domainMax(), this.tickCount()),
  );

  protected readonly ticks = computed(() => {
    const axisMax = this.axisMax();
    // Niced from the same domain as `axisMax`, which is what makes the top tick
    // and the top of the axis the same number.
    const values = tickValues(this.domainMax(), this.tickCount());
    const step = tickStep(values);
    const format = this.valueFormat();

    return values.map((value) => ({
      label:
        format === defaultValueFormat ? formatTick(value, step) : format(value),
      offsetPercent: heightPercent(value, axisMax),
    }));
  });

  protected readonly columns = computed(() => {
    const axisMax = this.axisMax();
    const format = this.valueFormat();

    return this.data().map((point) => ({
      point,
      heightPercent: heightPercent(point.value, axisMax),
      formattedValue: format(point.value),
      color: point.color ?? chartColors.seriesDefault,
    }));
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.caption() ?? 'Chart',
        this.data().map((point) => ({
          label: point.label,
          value: point.value,
        })),
        this.valueFormat(),
      ),
  );

  protected entryLabel(entry: {
    point: ColumnChartPoint;
    formattedValue: string;
  }) {
    return `${entry.point.label}, ${entry.formattedValue}`;
  }

  protected onPointKey(point: ColumnChartPoint, event: Event): void {
    // Only the column's own key opens it: a key pressed on a control inside belongs to that
    // control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.pointClicked.emit(point);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder columns while loading. Follows the real point count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonColumns = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
