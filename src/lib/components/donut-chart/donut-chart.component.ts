import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  describeSeries,
  formatValue,
  focusMark,
  largestRemainder,
  nextRovingIndex,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
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
  imports: [SkeletonComponent, ChartTooltipDirective],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  /** One slice per entry. A non-positive or non-finite value counts as zero — a ring is a
   *  part-to-whole picture and has no way to draw a negative share. */
  readonly data = input.required<readonly DonutChartSlice[]>();

  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  readonly centerValue = input<string | null>(null);

  /** Caption under the centre value. */
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

  /** Printed above the plot as the chart's visible title, and reused as the annex table's
   *  caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so
   *  `'none'` belongs only where the same data is already in a table on the page.
   *  Unset falls back to `DS_CONFIG.chart.dataTable`, then `'toggle'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize
   *  when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_CONFIG.chart.emptyText`, then `'No data'`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`,
   *  because "the request failed" and "there is nothing to show" read the same to a reader and
   *  mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_CONFIG.chart.errorText`, then
   *  `'Could not load the data'`. */
  readonly errorText = input<string | null>(null);
  /** Formats every value the chart prints, the annex table and the generated description
   *  included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then the browser's locale
   *  grouping with a K/M/B suffix past four digits. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  readonly dataTableResolved = resolveWithConfig(
    this.dataTable,
    (config) => config.chart?.dataTable,
    'toggle' as ChartDataTable,
  );
  readonly emptyTextResolved = resolveWithConfig(
    this.emptyText,
    (config) => config.chart?.emptyText,
    'No data',
  );
  readonly errorTextResolved = resolveWithConfig(
    this.errorText,
    (config) => config.chart?.errorText,
    'Could not load the data',
  );
  readonly valueFormatResolved = resolveWithConfig(
    this.valueFormat,
    (config) => config.chart?.valueFormat,
    defaultValueFormat as ChartValueFormat,
  );

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The slice that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly sliceClicked = output<DonutChartSlice>();

  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a press
   *  outside releases it. Off by default: a click is already the drill-down hook, and a mark left
   *  lit after the pointer has gone needs a reader who knows why it is lit. `sliceClicked` fires
   *  either way — pinning is a state, not a handler. */
  readonly pinOnClick = input(false, { transform: booleanAttribute });

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Accepted for parity with the other four charts and deliberately without effect here: a ring
   *  arrives as ONE object, because arcs share their edges and fading them one at a time lets the
   *  background through every seam. There is nothing to stagger. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  /** Whether a hovered or focused slice opens a tooltip. `'axis'` is not offered — a ring
   *  has no axis to group readings under. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  protected readonly activeMark = chartActiveMark();

  protected onMarkClick(
    payload: DonutChartSlice,
    index: number,
    event: Event,
  ): void {
    this.sliceClicked.emit(payload);
    if (this.pinOnClick()) {
      this.activeMark.pin(index, event);
    }
  }
  /** One tab stop per chart, not one per slice: WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable. */
  protected readonly rovingIndex = signal(0);

  protected readonly tabStopIndex = computed(() =>
    Math.min(this.rovingIndex(), Math.max(0, this.slices().length - 1)),
  );

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.rovingIndex.set(index);
    this.activeMark.enter(index, event);
  }

  protected onMarkNavigation(
    event: KeyboardEvent,
    index: number,
    scope: string,
  ): void {
    const next = nextRovingIndex(event.key, index, this.slices().length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    this.rovingIndex.set(next);
    focusMark((event.currentTarget as Element).closest(scope), next);
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const entry = this.slices()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !entry) {
        return null;
      }

      return {
        category: '',
        entries: [
          {
            label: entry.slice.label,
            value: entry.slice.value,
            formatted: `${entry.formattedValue} · ${entry.formattedPercent}`,
            color: entry.color,
          },
        ],
      };
    },
  );

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
    const format = this.valueFormatResolved();

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
    () => this.centerValue() ?? this.valueFormatResolved()(this.total()),
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
        this.valueFormatResolved(),
        this.dataTableResolved() !== 'none',
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

  // Both focusable would double the tab order; the legend items already carry the route.
  // Without this the ring is unreachable at `legend="none"`.
  protected readonly ringCarriesTheRoute = computed(
    () => this.interactive() && this.legend() === 'none',
  );

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder legend rows while loading. Follows the real slice count so the
   *  chart does not resize when the data lands; falls back to three when `data`
   *  is still empty. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
