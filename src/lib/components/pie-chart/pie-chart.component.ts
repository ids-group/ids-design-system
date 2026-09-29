import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
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
  chartDwell,
  describeSeries,
  formatWholePercent,
  largestRemainder,
  markAt,
  rovingMarks,
  chartRenderGate,
  DsChartBase,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  DEFAULT_INNER_RADIUS,
  arcPath,
  groupSmallest,
  holeFraction,
  paletteIndex,
  positiveValues,
  resolveInnerRadius,
  resolveTotal,
  ringCoords,
  sliceArcs,
} from './pie-chart.math';
import type { PieChartSlice } from './pie-chart.types';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';

const RING_VIEW_BOX_SIZE = 100;
const RING_CENTER = RING_VIEW_BOX_SIZE / 2;
const RING_OUTER_RADIUS = RING_VIEW_BOX_SIZE / 2;

@Component({
  selector: 'ds-pie-chart',
  standalone: true,
  imports: [
    SkeletonComponent,
    ChartTooltipDirective,
    IconComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
  host: { '[class.framed]': "frameResolved() === 'auto'" },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent
  extends DsChartBase
  implements
    ChartDimmable,
    ChartStaggered,
    ChartWithDataTable,
    ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  /** One slice per entry. A non-positive or non-finite value counts as zero — a ring is a
   *  part-to-whole picture and has no way to draw a negative share. */
  readonly data = input<readonly PieChartSlice[]>([]);

  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  readonly centerValue = input<string | null>(null);

  /** Caption under the centre value. */
  readonly centerLabel = input<string | null>(null);

  /** Logical placement, so a right-to-left page needs no second value. */
  readonly legend = input<'end' | 'bottom' | 'none'>('end');

  /** Longest legend to draw. Past it the smallest slices are summed into one, so a long tail does
   *  not become a legend nobody reads. Off by default: grouping changes what the chart says, and
   *  that is the consumer's call. Values below 2 are ignored — one slice is not a pie. */
  readonly maxSlices = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Names the grouped slice. Unset falls back to `DS_INTL.chart.other`. */
  readonly otherLabel = input<string | null>(null);

  readonly otherLabelResolved = computed(
    () => this.otherLabel() ?? this.intl().chart.other,
  );

  /** The hole, as a fraction of the outer radius. Zero draws a solid pie and takes the centre
   *  content away with the hole that held it. */
  readonly innerRadius = input(DEFAULT_INNER_RADIUS, {
    transform: numberAttribute,
  });

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. It is the non-visual route to the numbers, so
   *  `'none'` belongs only where the same data is already in a table on the page.
   *  Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** Prints each slice's share of the ring — in the legend, on the tooltip and in the data table.
   *  On by default, unlike every other chart, because a ring IS parts of one whole: the share is a
   *  real quantity here whatever the data, not a claim the consumer has to make. Off drops all
   *  three, for a ring whose slices are already labelled in percent. */
  readonly partOfWhole = input(true, { transform: booleanAttribute });

  // Declared after every input it reads: it takes each signal off `this` when it runs.
  readonly dataTableResolved = this.defaults.dataTable;

  /** The slice that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly sliceClicked = output<PieChartSlice>();

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

  private readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  protected readonly activeMark = chartActiveMark(
    () => this.tooltipLingerResolved(),
    () => this.defaults.hoverDelayMs(),
  );

  protected onMarkClick(
    payload: PieChartSlice,
    index: number,
    event: Event,
  ): void {
    this.sliceClicked.emit(payload);
    if (this.defaults.pinOnClick()) {
      this.activeMark.pin(index, event);
    }
  }
  protected readonly roving = rovingMarks(() => this.slices().length);

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.roving.focus(index);
    this.activeMark.enter(index, event);
  }

  private readonly legendHighlight = signal(-1);
  private readonly legendDwell = chartDwell(() => this.defaults.hoverDelayMs());

  /** A legend item stands for its arc, so it opens the arc's tooltip over the ARC and dims the
   *  other slices — the same state hovering the arc itself produces. */
  protected onLegendEnter(index: number, event: Event): void {
    this.legendDwell.schedule(
      index,
      () => this.legendHighlight.set(index),
      event,
    );
    this.activeMark.enter(index, event, this.arcAt(event, index));
  }

  protected onLegendLeave(): void {
    this.legendDwell.cancel();
    this.legendHighlight.set(-1);
    this.activeMark.leave();
  }

  protected onLegendFocus(index: number, event: FocusEvent): void {
    this.roving.focus(index);
    this.onLegendEnter(index, event);
  }

  protected onLegendClick(
    slice: PieChartSlice,
    index: number,
    event: Event,
  ): void {
    this.sliceClicked.emit(slice);
    if (this.defaults.pinOnClick()) {
      this.activeMark.pin(index, event, this.arcAt(event, index));
    }
  }

  private arcAt(event: Event, index: number): Element | null {
    return markAt(
      (event.currentTarget as Element).closest('.chart'),
      index,
      '.slice',
    );
  }

  protected isDimmed(index: number): boolean {
    // Naming a slice in the legend fades the rest whether or not `dimOthers` is set, the way every
    // chart legend singles out its series; `dimOthers` governs what a pointer over the ring does.
    const legendHighlight = this.legendHighlight();
    if (legendHighlight !== -1) {
      return legendHighlight !== index;
    }

    return (
      this.dimOthers() &&
      this.activeMark.index() !== -1 &&
      this.activeMark.index() !== index
    );
  }

  protected onMarkNavigation(
    event: KeyboardEvent,
    index: number,
    scope: string,
  ): void {
    this.roving.navigate(
      event,
      index,
      (event.currentTarget as Element).closest(scope),
    );
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
            formatted: this.partOfWhole()
              ? `${entry.formattedValue} · ${entry.formattedPercent}`
              : entry.formattedValue,
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
    groupSmallest(this.data(), this.maxSlices(), this.otherLabelResolved()),
  );

  protected readonly dataTableColumns = computed<readonly string[]>(() =>
    this.partOfWhole()
      ? [
          this.intl().chart.labelColumn,
          this.intl().chart.valueColumn,
          this.intl().chart.shareColumn,
        ]
      : [this.intl().chart.labelColumn, this.intl().chart.valueColumn],
  );

  protected readonly dataTableRows = computed<readonly ChartDataRow[]>(() =>
    this.slices().map((entry) => ({
      key: entry.slice.id,
      cells: this.partOfWhole()
        ? [entry.slice.label, entry.formattedValue, entry.formattedPercent]
        : [entry.slice.label, entry.formattedValue],
    })),
  );

  protected readonly slices = computed(() => {
    const data = this.visibleSlices();
    const values = data.map((slice) => slice.value);
    const arcs = sliceArcs(values);
    const percents = largestRemainder(positiveValues(values));
    const innerRadius = resolveInnerRadius(
      RING_OUTER_RADIUS,
      this.innerRadius(),
    );
    const format = (value: number) =>
      this.valueFormatResolved()(value, 'tooltip');

    const midRadius = (RING_OUTER_RADIUS + innerRadius) / 2;

    return data.map((slice, index) => ({
      slice,
      // Halfway along the arc and halfway through the ring: the one point that is inside a slice
      // whatever its sweep, which the bounding box of a curved wedge is not.
      center: ringCoords(
        RING_CENTER,
        RING_CENTER,
        midRadius,
        (arcs[index].startAngle + arcs[index].endAngle) / 2,
      ),
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
      formattedPercent: formatWholePercent(
        percents[index],
        this.defaults.locale,
      ),
    }));
  });

  /** The held slice's centre as a share of the ring box. The badge is HTML over the ring rather
   *  than a `foreignObject` inside it: inside, the viewBox scale grows the badge with the ring and
   *  the grid that centres the glyph does not lay out. */
  protected readonly pinnedEntry = computed(() => {
    const entry = this.activeMark.pinned()
      ? this.slices()[this.activeMark.index()]
      : undefined;

    return entry
      ? {
          center: {
            x: (entry.center.x / RING_VIEW_BOX_SIZE) * 100,
            y: (entry.center.y / RING_VIEW_BOX_SIZE) * 100,
          },
        }
      : null;
  });

  protected readonly resolvedCenterValue = computed(
    () =>
      this.centerValue() ?? this.valueFormatResolved()(this.total(), 'tooltip'),
  );

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.intl().chart,
        this.caption() ?? this.intl().chart.title,
        this.data().map((slice) => ({
          label: slice.label,
          value: slice.value,
        })),
        (value) => this.valueFormatResolved()(value, 'tooltip'),
        this.dataTableResolved() !== 'none',
      ),
  );

  protected readonly hole = computed(() => holeFraction(this.innerRadius()));

  protected entryLabel(entry: {
    slice: PieChartSlice;
    formattedValue: string;
    formattedPercent: string;
  }) {
    return this.partOfWhole()
      ? `${entry.slice.label}, ${entry.formattedValue}, ${entry.formattedPercent}`
      : `${entry.slice.label}, ${entry.formattedValue}`;
  }

  protected onSliceKey(slice: PieChartSlice, event: Event): void {
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
