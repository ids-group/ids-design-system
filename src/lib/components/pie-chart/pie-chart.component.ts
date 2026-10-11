import type {
  ChartDimmable,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  CHART_SERIES_COLORS,
  chartDwell,
  describeSeries,
  formatWholePercent,
  largestRemainder,
  leaveMark,
  markAt,
  rovingMarks,
  chartRenderGate,
  CHART_SKELETON_COUNT,
  DsChartBase,
  skeletonMarkCount,
  tweenMarks,
  watchElementWidth,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
import {
  ChartTooltipDirective,
  ChartStatesComponent,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  DEFAULT_INNER_RADIUS,
  arcPath,
  fitCenterValue,
  groupSmallest,
  holeFraction,
  paletteIndex,
  positiveValues,
  resolveInnerRadius,
  resolveTotal,
  ringCoords,
  sliceArcs,
} from './pie-chart.math';
import type { CenterValueFit, PieArc } from './pie-chart.math';
import type { PieChartCenterPlacement, PieChartSlice } from './pie-chart.types';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';

const RING_VIEW_BOX_SIZE = 100;
const RING_CENTER = RING_VIEW_BOX_SIZE / 2;
const RING_OUTER_RADIUS = RING_VIEW_BOX_SIZE / 2;
// How far a hovered slice slides out along its bisector, in viewBox units.
const SLICE_HOVER_SHIFT = 3;
// The value keeps a margin from the inner edge of the ring.
const CENTER_VALUE_HOLE_SHARE = 0.9;

// One canvas and one font-load wait for every pie chart on the page.
let measureContext: CanvasRenderingContext2D | null | undefined;
const fontsLoaded = signal(false);
let fontsWatched = false;

function watchFontsOnce(): void {
  if (!fontsWatched) {
    fontsWatched = true;
    void document.fonts?.ready.then(() => fontsLoaded.set(true));
  }
}

@Component({
  selector: 'ds-pie-chart',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    SkeletonComponent,
    ChartTooltipDirective,
    ChartStatesComponent,
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
  implements ChartDimmable, ChartWithDataTable, ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  /** One slice per entry. A non-positive or non-finite value counts as zero. */
  readonly data = input<readonly PieChartSlice[]>([]);

  /** Printed inside the ring. Null prints the sum through `valueFormat`. */
  readonly centerValue = input<string | null>(null);

  /** Caption under the centre value. */
  readonly centerLabel = input<string | null>(null);

  /** When the sum does not fit the hole even at `--ds-pie-chart-center-value-min-font-size`, prints
   *  it in the `'tick'` form of `valueFormat` (`32.4K`). A `centerValue` string is never shortened. */
  readonly centerCompact = input(true, { transform: booleanAttribute });

  /** `'below'` prints the value and its caption under the ring at full size, never shrunk or
   *  shortened. */
  readonly centerPlacement = input<PieChartCenterPlacement>('inside');

  /** Legend placement, logical so it flips in right-to-left. */
  readonly legend = input<'end' | 'bottom' | 'none'>('end');

  /** How many slices, and legend rows, the loading skeleton draws before the data is known. */
  readonly skeletonCount = input(CHART_SKELETON_COUNT, {
    transform: (raw: unknown) => numberAttribute(raw, CHART_SKELETON_COUNT),
  });

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

  /** The label-and-value table under the plot: `'toggle'` puts it behind a disclosure,
   *  `'visible'` opens it, `'none'` renders none. Unset falls back to `DS_CONFIG.chart.dataTable`,
   *  then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);

  /** Prints each slice's share in the legend, the tooltip and the data table. */
  readonly partOfWhole = input(true, { transform: booleanAttribute });

  readonly dataTableResolved = this.defaults.dataTable;

  /** The slice that was clicked or activated with Enter or Space. */
  readonly sliceClicked = output<PieChartSlice>();

  /** Dims every other mark while one is hovered or focused. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

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

  protected readonly leaveMark = leaveMark;

  protected readonly sliceHoverShift = SLICE_HOVER_SHIFT;

  // Keyed by slice id, so a slice that stays tweens from where it is drawn and a new one opens from its start edge.
  private readonly drawnArcs = signal<ReadonlyMap<string, PieArc>>(new Map());

  private stopArcTween: () => void = () => undefined;

  private readonly tweenArcs = afterRenderEffect((onCleanup) => {
    const data = this.visibleSlices();
    const ring = this.ringElement()?.nativeElement;
    const target = sliceArcs(data.map((slice) => slice.value));
    untracked(() => {
      const drawn = this.drawnArcs();
      const apply = (angles: readonly number[]): void =>
        this.drawnArcs.set(
          new Map(
            data.map((slice, index) => [
              slice.id,
              {
                startAngle: angles[2 * index],
                endAngle: angles[2 * index + 1],
              },
            ]),
          ),
        );
      const to = target.flatMap((arc) => [arc.startAngle, arc.endAngle]);
      this.stopArcTween();
      if (!ring || drawn.size === 0) {
        apply(to);

        return;
      }
      const from = data.flatMap((slice, index) => {
        const arc = drawn.get(slice.id);

        return arc
          ? [arc.startAngle, arc.endAngle]
          : [target[index].startAngle, target[index].startAngle];
      });
      this.stopArcTween = tweenMarks(ring, from, to, apply);
    });
    onCleanup(() => this.stopArcTween());
  });

  protected readonly slices = computed(() => {
    const data = this.visibleSlices();
    const values = data.map((slice) => slice.value);
    const target = sliceArcs(values);
    const drawn = this.drawnArcs();
    const arcs = data.map(
      (slice, index) =>
        drawn.get(slice.id) ??
        (drawn.size === 0
          ? target[index]
          : {
              startAngle: target[index].startAngle,
              endAngle: target[index].startAngle,
            }),
    );
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
      shift: ringCoords(
        0,
        0,
        SLICE_HOVER_SHIFT,
        (arcs[index].startAngle + arcs[index].endAngle) / 2,
      ),
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
            x: ((entry.center.x + entry.shift.x) / RING_VIEW_BOX_SIZE) * 100,
            y: ((entry.center.y + entry.shift.y) / RING_VIEW_BOX_SIZE) * 100,
          },
        }
      : null;
  });

  protected readonly resolvedCenterValue = computed(
    () =>
      this.centerValue() ?? this.valueFormatResolved()(this.total(), 'tooltip'),
  );

  private readonly compactCenterValue = computed(() =>
    this.centerCompact() && this.centerValue() === null
      ? this.valueFormatResolved()(this.total(), 'tick')
      : null,
  );

  private readonly ringElement = viewChild<ElementRef<HTMLElement>>('ring');
  private readonly centerValueElement =
    viewChild<ElementRef<HTMLElement>>('centerValue');

  private readonly centerFit = signal<CenterValueFit | null>(null, {
    equal: (previous, next) =>
      previous?.text === next?.text && previous?.fontSize === next?.fontSize,
  });

  protected readonly centerText = computed(
    () => this.centerFit()?.text ?? this.resolvedCenterValue(),
  );

  protected readonly centerFontSize = computed(
    () => this.centerFit()?.fontSize ?? null,
  );

  private readonly ringWidth = signal(0);

  private readonly fitsInside = computed(
    () => this.hole() > 0 && this.centerPlacement() === 'inside',
  );

  private fitCenter(
    value: HTMLElement,
    ringWidth: number,
    full: string,
    compact: string | null,
    hole: number,
  ): CenterValueFit | null {
    const style = getComputedStyle(value);
    const maxFontSize = parseFloat(
      style.getPropertyValue('--_pie-chart-center-value-max-font-size'),
    );
    const minFontSize = parseFloat(
      style.getPropertyValue('--_pie-chart-center-value-min-font-size'),
    );
    measureContext ??= document.createElement('canvas').getContext('2d');
    const context = measureContext;
    if (!context || !(maxFontSize > 0) || !(minFontSize > 0)) {
      return null;
    }
    context.font = `${style.fontWeight} ${maxFontSize}px ${style.fontFamily}`;
    const measure = (text: string) => ({
      text,
      width: context.measureText(text).width,
    });
    const availableWidth = ringWidth * hole * CENTER_VALUE_HOLE_SHARE;
    const floor = Math.min(minFontSize, maxFontSize);
    const measuredFull = measure(full);
    const fitsAtFloor =
      (measuredFull.width * floor) / maxFontSize <= availableWidth;

    return fitCenterValue(
      measuredFull,
      compact === null || fitsAtFloor ? null : measure(compact),
      availableWidth,
      maxFontSize,
      floor,
    );
  }

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

  // Only the ring is observed, and only while the value sits inside it: its box is set by
  // `--ds-pie-chart-size` alone, so the fitted value never resizes what is observed.
  private readonly watchRing = afterRenderEffect((onCleanup) => {
    const ring = this.ringElement()?.nativeElement;
    if (ring && this.fitsInside()) {
      onCleanup(watchElementWidth(ring, this.ringWidth));
    }
  });

  // Refits once per change of what decides the fit; an unchanged ring width writes nothing.
  private readonly refit = afterRenderEffect(() => {
    const value = this.centerValueElement()?.nativeElement;
    const ringWidth = this.ringWidth();
    const full = this.resolvedCenterValue();
    const compact = this.compactCenterValue();
    const hole = this.hole();
    fontsLoaded();
    if (!value || !this.fitsInside() || ringWidth === 0) {
      this.centerFit.set(null);

      return;
    }
    watchFontsOnce();
    this.centerFit.set(
      untracked(() => this.fitCenter(value, ringWidth, full, compact, hole)),
    );
  });

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

  protected readonly skeletonMarks = computed(() =>
    skeletonMarkCount(this.data().length, this.skeletonCount()),
  );

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: this.skeletonMarks() }),
  );
}
