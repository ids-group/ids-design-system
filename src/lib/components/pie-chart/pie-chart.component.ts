import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  describeSeries,
  formatWholePercent,
  largestRemainder,
  markAt,
  rovingMarks,
  chartRenderGate,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartDataTable,
  ChartFrame,
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
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';

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
export class PieChartComponent {
  protected readonly renderReady = chartRenderGate();

  /** One slice per entry. A non-positive or non-finite value counts as zero — a ring is a
   *  part-to-whole picture and has no way to draw a negative share. */
  readonly data = input.required<readonly PieChartSlice[]>();

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

  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it;
   *  `'none'` leaves the chart bare, for one placed inside a card the page has already drawn.
   *  Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards
   *  is one decision per app rather than per plot. */
  readonly frame = input<ChartFrame | null>(null);

  /** How long the tooltip stays after the pointer leaves the mark, in milliseconds. Zero, the
   *  default, takes it away at once: a panel that outlives the pointer sits over the plot the
   *  reader has moved on to.
   *
   *  Raise it only for a panel a reader has to REACH — one carrying a link, a figure, or anything
   *  selectable — which is WCAG 1.4.13's hoverable clause. The panel is portaled to the body, so
   *  crossing the gap to it at an ordinary pointer speed needs about 140. Unset falls back to
   *  `DS_CONFIG.chart.tooltipLingerMs`, then 0. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  /** Printed above the plot as the chart's visible title, and reused as the annex table's
   *  caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

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

  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize
   *  when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`,
   *  because "the request failed" and "there is nothing to show" read the same to a reader and
   *  mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);
  /** Formats every value the chart prints, the annex table and the generated description
   *  included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` /
   *  `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  private readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The slice that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly sliceClicked = output<PieChartSlice>();

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

  private readonly tooltipLingerResolved = this.defaults.tooltipLingerMs;

  protected readonly activeMark = chartActiveMark(() =>
    this.tooltipLingerResolved(),
  );

  protected onMarkClick(
    payload: PieChartSlice,
    index: number,
    event: Event,
  ): void {
    this.sliceClicked.emit(payload);
    if (this.pinOnClick()) {
      this.activeMark.pin(index, event);
    }
  }
  protected readonly roving = rovingMarks(() => this.slices().length);

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.roving.focus(index);
    this.activeMark.enter(index, event);
  }

  private readonly legendHighlight = signal(-1);

  /** A legend item stands for its arc, so it opens the arc's tooltip over the ARC and dims the
   *  other slices — the same state hovering the arc itself produces. */
  protected onLegendEnter(index: number, event: Event): void {
    this.legendHighlight.set(index);
    this.activeMark.enter(index, event, this.arcAt(event, index));
  }

  protected onLegendLeave(): void {
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
    if (this.pinOnClick()) {
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
