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
  CHART_SERIES_COLORS,
  describeSeries,
  formatValue,
  largestRemainder,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import {
  DEFAULT_THICKNESS,
  arcPath,
  groupSmallest,
  holeFraction,
  paletteIndex,
  positiveValues,
  resolveInnerRadius,
  resolveTotal,
  sliceArcs,
} from './donut-chart.math';
import type { DonutChartSlice } from './donut-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

const RING_VIEW_BOX_SIZE = 100;
const RING_CENTER = RING_VIEW_BOX_SIZE / 2;
const RING_OUTER_RADIUS = RING_VIEW_BOX_SIZE / 2;

@Component({
  selector: 'ds-donut-chart',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  readonly data = input.required<readonly DonutChartSlice[]>();

  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  readonly centerValue = input<string | null>(null);

  readonly centerLabel = input<string | null>(null);

  /** Logical placement, so a right-to-left page needs no second value. */
  readonly legend = input<'end' | 'bottom' | 'none'>('end');

  /** Longest legend to draw. Past it the smallest slices are summed into one, so a long tail does
   *  not become a legend nobody reads. Off by default: grouping changes what the chart says, and
   *  that is the consumer's call. Values below 2 are ignored — one slice is not a donut. */
  readonly maxSlices = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Names the grouped slice. */
  readonly otherLabel = input<string>('Other');

  /** Ring width as a fraction of the radius. */
  readonly thickness = input(DEFAULT_THICKNESS, { transform: numberAttribute });

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

  readonly sliceClicked = output<DonutChartSlice>();

  protected readonly viewBox = `0 0 ${RING_VIEW_BOX_SIZE} ${RING_VIEW_BOX_SIZE}`;

  protected readonly total = computed(() =>
    resolveTotal(this.data().map((slice) => slice.value)),
  );

  protected readonly visibleSlices = computed(() =>
    groupSmallest(this.data(), this.maxSlices(), this.otherLabel()),
  );

  protected readonly slices = computed(() => {
    const data = this.visibleSlices();
    const values = data.map((slice) => slice.value);
    const arcs = sliceArcs(values);
    const percents = largestRemainder(positiveValues(values));
    const innerRadius = resolveInnerRadius(RING_OUTER_RADIUS, this.thickness());
    const format = this.valueFormat();

    return data.map((slice, index) => ({
      slice,
      path: arcPath(
        RING_CENTER,
        RING_CENTER,
        RING_OUTER_RADIUS,
        innerRadius,
        arcs[index].startAngle,
        arcs[index].endAngle,
      ),
      color:
        CHART_SERIES_COLORS[
          paletteIndex(slice.slot, index, CHART_SERIES_COLORS.length)
        ],
      formattedValue: format(slice.value),
      formattedPercent: `${percents[index]}%`,
    }));
  });

  protected readonly resolvedCenterValue = computed(
    () => this.centerValue() ?? this.valueFormat()(this.total()),
  );

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.caption() ?? 'Chart',
        this.data().map((slice) => ({
          label: slice.label,
          value: slice.value,
        })),
        this.valueFormat(),
      ),
  );

  protected readonly hole = computed(() => holeFraction(this.thickness()));

  protected entryLabel(entry: {
    slice: DonutChartSlice;
    formattedValue: string;
    formattedPercent: string;
  }) {
    return `${entry.slice.label}, ${entry.formattedValue}, ${entry.formattedPercent}`;
  }

  protected onSliceKey(slice: DonutChartSlice, event: Event): void {
    // Only the legend item's own key opens it: a key pressed on a control inside belongs to that
    // control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.sliceClicked.emit(slice);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder legend rows while loading. Follows the real slice count so the
   *  chart does not resize when the data lands; falls back to three when `data`
   *  is still empty. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
