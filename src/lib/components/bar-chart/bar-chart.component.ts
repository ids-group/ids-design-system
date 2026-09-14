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
  formatPercent,
  formatValue,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { resolveMax, widthPercent } from './bar-chart.math';
import type { BarChartRow } from './bar-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

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
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  readonly dataTable = input<'toggle' | 'visible' | 'none'>('toggle');
  readonly showPercent = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input<string>('No data');

  readonly error = input(false, { transform: booleanAttribute });

  readonly errorText = input<string>('Could not load the data');
  readonly valueFormat = input<(value: number) => string>(defaultValueFormat);

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  readonly rowClicked = output<BarChartRow>();

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
      key: row.id ?? String(index),
      row,
      widthPercent: widthPercent(row.value, max),
      formattedValue: format(row.value),
      formattedPercent:
        row.percent !== undefined
          ? formatPercent(row.percent, 100)
          : formatPercent(row.value, max),
      color: row.color ?? chartColors.seriesDefault,
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

  protected entryLabel(entry: { row: BarChartRow; formattedValue: string }) {
    return `${entry.row.label}, ${entry.formattedValue}`;
  }

  protected onRowKey(row: BarChartRow, event: Event): void {
    // Only the row's own key opens the row: a key pressed on a control inside it belongs to that
    // control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.rowClicked.emit(row);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder bars while loading. Follows the real row count so the chart does not resize
   *  when the data lands; falls back to three when `data` is still empty. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
