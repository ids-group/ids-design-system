import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  describeSeries,
  formatPercent,
  formatValue,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { resolveMax, widthPercent } from './bar-chart.math';
import type { BarChartRow } from './bar-chart.types';

@Component({
  selector: 'ds-bar-chart',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent {
  readonly data = input.required<readonly BarChartRow[]>();

  /** Track length is relative to this. Null uses the largest value, so the
   *  longest row always fills its track. */
  readonly max = input<number | null>(null);

  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  readonly dataTable = input<'toggle' | 'visible' | 'none'>('toggle');
  readonly showPercent = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input<string>('No data');
  readonly valueFormat = input<(value: number) => string>((value) =>
    formatValue(value),
  );

  readonly rowClick = output<BarChartRow>();

  protected readonly resolvedMax = computed(() =>
    resolveMax(
      this.max(),
      this.data().map((row) => row.value),
    ),
  );

  protected readonly rows = computed(() => {
    const max = this.resolvedMax();
    const format = this.valueFormat();

    return this.data().map((row, index) => ({
      row,
      widthPercent: widthPercent(row.value, max),
      formattedValue: format(row.value),
      formattedPercent:
        row.percent !== undefined
          ? `${row.percent.toFixed(1)}%`
          : formatPercent(row.value, max),
      color:
        row.color ?? CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
    }));
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.caption() ?? 'Chart',
        this.data().map((row) => ({ label: row.label, value: row.value })),
        this.valueFormat(),
      ),
  );

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder bars while loading. Follows the real row count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
