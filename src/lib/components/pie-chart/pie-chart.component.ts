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
  chartDwell,
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

  /** One slice per entry. A non-positive or non-finite value counts as zero. */
  readonly data = input.required<readonly PieChartSlice[]>();

  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  readonly centerValue = input<string | null>(null);

  /** Caption under the centre value. */
  readonly centerLabel = input<string | null>(null);

  /** Legend placement, logical so it flips in right-to-left. */
  readonly legend = input<'end' | 'bottom' | 'none'>('end');

  /** Longest legend to draw; past it the smallest slices are summed into one. Values below 2 are ignored. */
  readonly maxSlices = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Names the grouped slice. Unset falls back to `DS_INTL.chart.other`. */
  readonly otherLabel = input<string | null>(null);

  readonly otherLabelResolved = computed(
    () => this.otherLabel() ?? this.intl().chart.other,
  );

  /** The hole, as a fraction of the outer radius. Zero draws a solid pie without centre content. */
  readonly innerRadius = input(DEFAULT_INNER_RADIUS, {
    transform: numberAttribute,
  });

  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare. Unset falls back to `DS_CONFIG.chart.frame`. */
  readonly frame = input<ChartFrame | null>(null);

  /** Whether the tooltip draws a colour dot per reading. Unset falls back to `DS_CONFIG.chart.tooltipSwatches`. */
  readonly tooltipSwatches = input<boolean | null>(null, {
    transform: (value: unknown) =>
      value == null ? null : booleanAttribute(value),
  });

  /** Milliseconds the tooltip stays after the pointer leaves the mark; zero closes it at once. Unset falls back to `DS_CONFIG.chart.tooltipLingerMs`. */
  readonly tooltipLingerMs = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  /** Visible title above the plot; also the annex table's caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure, `'visible'` opens it, `'none'` renders none.
   *  Unset falls back to `DS_CONFIG.chart.dataTable`. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** Prints each slice's share in the legend, the tooltip and the data table. */
  readonly partOfWhole = input(true, { transform: booleanAttribute });

  /** Draws skeleton marks in place of the data, at the same count. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);
  /** Formats every value the chart prints. Unset falls back to `DS_CONFIG.chart.valueFormat`, then `DS_CONFIG.locale` / `LOCALE_ID`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** Holds the clicked mark and its tooltip until a second click, Escape or an outside press. `sliceClicked` fires either way. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  // Declared after every input it reads: it takes each signal off `this` when it runs.
  protected readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly dataTableResolved = this.defaults.dataTable;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  /** Turns on the click affordance (pointer cursor, hover tint). */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The slice that was clicked or activated with Enter or Space. */
  readonly sliceClicked = output<PieChartSlice>();

  /** Dims every other mark while one is hovered or focused; dimmed marks lose separation from each other. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Accepted for parity with the other charts; has no effect. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  /** Whether a hovered or focused slice opens a tooltip. */
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

  /** A legend item opens the arc's tooltip and dims the other slices, as hovering the arc does. */
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
    // The legend dims the rest whether or not `dimOthers` is set; `dimOthers` governs the ring only.
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
      // Halfway along the arc and through the ring: inside the slice whatever its sweep.
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

  /** The held slice's centre as a share of the ring box. The badge is HTML over the ring: inside a `foreignObject` the viewBox scale grows it and the centring grid does not lay out. */
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
    // A key pressed on a control inside the item belongs to that control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.sliceClicked.emit(slice);
  }

  // The legend items carry the tab route; the ring needs it only at `legend="none"`.
  protected readonly ringCarriesTheRoute = computed(
    () => this.interactive() && this.legend() === 'none',
  );

  protected readonly isEmpty = computed(() => this.data().length === 0);

  /** Placeholder legend rows while loading. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.data().length, 3) }),
  );
}
