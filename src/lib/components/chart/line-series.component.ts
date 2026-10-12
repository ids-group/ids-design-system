import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  CHART_TOOLTIP_LINGER_MS,
  areaPath,
  chartValueFormat,
  focusMark,
  listenForMarkFocus,
  markOf,
  bandPath,
  lineSegments,
  nextRovingIndex,
  linePath,
  leaveMark,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import type {
  LinePoint,
  MarkHit,
} from '@ids-group-ltd/ids-design-system/components';
import {
  injectDsLocale,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartAxis,
  ChartCurve,
  ChartGaps,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import {
  CHART_PIN_GAP,
  CHART_PIN_RADIUS,
  ChartPinMarkerComponent,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartTooltipTrigger,
  ChartTooltipContext,
  ChartTooltipOrigin,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { CHART_SCALES } from './chart-scales.token';
import type { ChartAxisEntry } from './chart-scales.token';
import { topDown } from './chart.math';

export interface LineSeriesData {
  id: string;
  label: string;
  /** One reading per category; a `null` is missing, and `gaps` decides what it draws. */
  data: readonly (number | null)[];
  /** Which value axis the readings are measured against. */
  axis?: ChartAxis;
  /** Fills the band between the line and its axis baseline: `true` in one flat tint, `'fade'`
   *  fading to nothing at the baseline. */
  area?: boolean | 'fade';
  /** The band's floor, one entry per category, in the axis's own unit. Unset fills to the baseline;
   *  given, the fill is the band between the two curves. A `null` must sit in the same categories as in `data`. */
  lower?: readonly (number | null)[];
  /** Any CSS colour. Unset takes the categorical palette slot for the series' position. */
  color?: string;
}

let nextSeriesId = 0;

// The active marker's default radius, `--chart-dot-radius-active`.
const PIN_MARKER_CLEARANCE = 6;

/**
 * One line per series, drawn against the scales `ds-chart` supplies, on either value axis.
 *
 * Hosted on a `<g>`: an element SVG does not know renders nothing, nor do its descendants.
 * Written as `<svg:g dsLineSeries>`.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsLineSeries]',
  standalone: true,
  imports: [ChartPinMarkerComponent],
  exportAs: 'dsLineSeries',
  templateUrl: './line-series.component.html',
  styleUrl: './line-series.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineSeriesComponent implements OnDestroy {
  protected readonly leaveMark = leaveMark;

  protected readonly scales = inject(CHART_SCALES);

  /** Not `input.required`: the preset reads `tooltipContext()` from a binding on this element (NG0950). */
  readonly data = input<readonly LineSeriesData[]>([]);

  /** Draws a round marker at every reading; reads better off past roughly twenty points. */
  readonly showMarkers = input(true, { transform: booleanAttribute });

  /** Lays the line and markers on a background-colour band so they stay legible where they cross other marks. */
  readonly outline = input(true, { transform: booleanAttribute });

  /** Turns on the click affordance (pointer cursor and hover tint). `pointClicked` fires either way. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Holds the clicked mark and its tooltip until a second click, Escape or a press outside. Unset
   *  falls back to `DS_CONFIG.chart.pinOnClick`, then `true`; the category cursor holds the category instead. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  readonly pinOnClickResolved = resolveWithConfig(
    this.pinOnClick,
    (config) => config.chart?.pinOnClick,
    true,
  );
  protected readonly pins = computed(
    () => this.pinOnClickResolved() && !this.scales.cursorOn?.(),
  );

  /** Fades every series but the one under the pointer. Off by default: it costs separation between the rest. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The series to single out: the others draw faded and this one bold. Fades the others whether or not `dimOthers` is set. */
  readonly highlighted = input<string | null>(null);

  /** A dash pattern per series, in series order. A series past the end, or given `''`, draws solid. */
  readonly patterns = input<readonly string[]>([]);

  /** Fills each area from the series below it rather than from the baseline (stacked plots). */
  readonly stacked = input(false, { transform: booleanAttribute });

  protected dashFor(seriesIndex: number): string | null {
    return this.patterns()[seriesIndex] || null;
  }

  /** Milliseconds between one series' entrance and the next, narrowed to fit the stagger budget; `0` is off. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  /** What a `null` reading draws: `'break'` leaves a hole in the line, `'zero'` plots a point at zero. */
  readonly gaps = input<ChartGaps>('break');

  /** How the line joins its readings: `'linear'` (default) asserts nothing between them; `'step'`
   *  holds each reading to the next; `'smooth'` is a monotone cubic that draws no peak the data lacks. */
  readonly curve = input<ChartCurve>('linear');

  /** Whether a hovered or focused reading opens a tooltip: `'item'` names the marker, `'axis'` every
   *  series at the category, turning the container's category cursor on under `cursor="auto"`. */
  readonly tooltip = input<ChartTooltipTrigger>('item');

  /** Where an `'axis'` panel hangs: `'reading'` over the highest reading in the category; `'pointer'` follows the cursor. */
  readonly tooltipAnchor = input<'reading' | 'pointer'>('reading');

  /** Milliseconds the panel survives the pointer leaving the marker. */
  readonly tooltipLingerMs = input(CHART_TOOLTIP_LINGER_MS, {
    transform: numberAttribute,
  });

  /** Formats every value this series prints: `'tick'` for an axis label, `'tooltip'` for a value in full. */
  readonly valueFormat = input<ChartValueFormat>(
    chartValueFormat(injectDsLocale()),
  );

  /** The clicked reading, its series and position in `categories`. Fires on click and Enter or Space, whatever `interactive` says. */
  readonly pointClicked = output<{
    series: LineSeriesData;
    categoryIndex: number;
    value: number;
  }>();

  private readonly domainId = `line-series-${nextSeriesId++}`;

  protected fadeId(seriesIndex: number): string {
    return `${this.domainId}-fade-${seriesIndex}`;
  }

  constructor() {
    effect(() => {
      this.scales.reportDomain(
        `${this.domainId}-primary`,
        this.valuesOn('primary'),
        'primary',
      );
      this.scales.reportDomain(
        `${this.domainId}-secondary`,
        this.valuesOn('secondary'),
        'secondary',
      );
    });
    this.scales.reportTooltip(this.domainId, {
      context: this.tooltipContext,
      origin: this.tooltipOrigin,
      offersTooltip: computed(() => this.tooltip() !== 'none'),
      readsCategory: computed(() => this.tooltip() === 'axis'),
      axisOrigin: this.topReadingElement,
      axisEntries: this.axisEntries,
      axisPointElements: this.axisPointElements,
    });
    listenForMarkFocus(
      inject(ElementRef),
      (event, hit) => this.onMarkerFocus(event, hit),
      () => {
        this.focusedSeries.set(null);
        this.activeMark.leave();
        this.scales.setActiveIndex(-1);
      },
    );
  }

  ngOnDestroy(): void {
    this.scales.releaseTooltip(this.domainId);
    this.scales.releaseDomain(`${this.domainId}-primary`);
    this.scales.releaseDomain(`${this.domainId}-secondary`);
  }

  readonly activeMark = chartActiveMark(
    () => this.tooltipLingerMs(),
    () => this.scales.hoverDelayMs?.() ?? 0,
  );

  private valuesOn(axis: ChartAxis): number[] {
    return this.data()
      .filter((series) => (series.axis ?? 'primary') === axis)
      .flatMap((series) =>
        series.data.filter((value): value is number => value !== null),
      );
  }

  /** A `null` past the end is a missing reading. */
  private readingsOf(series: LineSeriesData, count: number): (number | null)[] {
    const zeroed = this.gaps() === 'zero';
    const readings: (number | null)[] = [];
    for (let index = 0; index < count; index++) {
      const raw = series.data[index];
      const reading =
        typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
      readings.push(reading === null && zeroed ? 0 : reading);
    }

    return readings;
  }

  protected readonly plotted = computed(() => {
    const toX = this.scales.xPosition();
    const primaryY = this.scales.yPosition();
    const secondaryY = this.scales.secondaryYPosition();
    const categories = this.scales.categories();
    let markerIndex = 0;

    return this.data().map((series, index) => {
      const secondary = (series.axis ?? 'primary') === 'secondary';
      const toY = secondary ? secondaryY : primaryY;
      const color =
        series.color ?? CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length];
      const points: (LinePoint | null)[] = this.readingsOf(
        series,
        categories.length,
      ).map((value, categoryIndex) =>
        value === null
          ? null
          : {
              categoryIndex,
              x: toX(categoryIndex),
              y: toY(value),
              value,
            },
      );
      const segments = lineSegments(points);
      const format = this.valueFormat();
      const curve = this.curve();

      return {
        series,
        color,
        seriesIndex: index,
        linePaths: segments.map((segment) => linePath(segment, curve)),
        areaPaths: series.area
          ? this.areaPathsFor(series, segments, toX, toY, curve)
          : [],
        markers: points
          .filter((point): point is LinePoint => point !== null)
          .map((point) => ({
            key: `${series.id}-${point.categoryIndex}`,
            markIndex: markerIndex++,
            x: point.x,
            y: point.y,
            value: point.value,
            category: categories[point.categoryIndex] ?? '',
            formattedValue: format(point.value, 'tooltip'),
            seriesLabel: series.label,
            seriesId: series.id,
            categoryIndex: point.categoryIndex,
            color,
          })),
      };
    });
  });

  private areaPathsFor(
    series: LineSeriesData,
    segments: readonly (readonly LinePoint[])[],
    toX: (categoryIndex: number) => number,
    toY: (value: number) => number,
    curve: ChartCurve,
  ): readonly string[] {
    const lower = series.lower;
    if (!lower) {
      return segments
        .map((segment) => areaPath(segment, toY(0), curve))
        .filter((path) => path.length > 0);
    }
    const lowerSegments = lineSegments(
      lower.map((value, categoryIndex) =>
        value === null
          ? null
          : {
              categoryIndex,
              x: toX(categoryIndex),
              y: toY(value),
              value,
            },
      ),
    );

    return segments
      .map((segment, index) =>
        lowerSegments[index]
          ? bandPath(segment, lowerSegments[index], curve)
          : areaPath(segment, toY(0), curve),
      )
      .filter((path) => path.length > 0);
  }

  private readonly allMarkers = computed(() =>
    this.plotted().flatMap((entry) => entry.markers),
  );

  protected seriesStagger(index: number): string {
    return `${staggerDelay(index, this.plotted().length, this.staggerMs())}ms`;
  }

  /** One tab stop per series, walked with the arrows: 12 categories x 2 series would be 24 stops. */
  private readonly rovingBySeries = signal<ReadonlyMap<string, number>>(
    new Map(),
  );

  private readonly firstMarkerBySeries = computed(
    () =>
      new Map(
        this.plotted().map((entry) => [
          entry.series.id,
          entry.markers[0]?.markIndex,
        ]),
      ),
  );

  protected isTabStop(seriesId: string, markIndex: number): boolean {
    return (
      (this.rovingBySeries().get(seriesId) ??
        this.firstMarkerBySeries().get(seriesId)) === markIndex
    );
  }

  /** The series a marker holds focus on; narrows an `'axis'` panel to that reading. */
  private readonly focusedSeries = signal<string | null>(null);

  /** Active when its own marker is hovered or the category cursor is on its category, so the dot grows anywhere in the band. */
  protected isActiveMarker(marker: {
    markIndex: number;
    categoryIndex: number;
  }): boolean {
    return (
      marker.markIndex === this.activeMark.index() ||
      marker.categoryIndex === this.scales.activeIndex()
    );
  }

  // A list keyed by mark index: another mark takes a new pin that pops in, the same mark glides with the data.
  protected readonly pinnedMarkers = computed(() => {
    const index = this.activeMark.index();
    const marker = this.activeMark.pinned() ? this.allMarkers()[index] : null;

    return marker ? [{ index, marker }] : [];
  });

  protected readonly pinLift =
    CHART_PIN_RADIUS + CHART_PIN_GAP + PIN_MARKER_CLEARANCE;

  protected onMarkerOver(event: PointerEvent): void {
    const hit = markOf(event);
    if (hit && !this.scales.cursorOn?.()) {
      this.activeMark.enter(hit.index, event, undefined, hit.element);
    }
  }

  protected onMarkerOut(event: PointerEvent): void {
    const hit = markOf(event);
    if (!hit || this.scales.cursorOn?.()) {
      return;
    }
    const next =
      event.relatedTarget instanceof Element
        ? event.relatedTarget.closest('[data-mark-index]')
        : null;
    if (next !== hit.element) {
      this.activeMark.leave();
    }
  }

  private onMarkerFocus(event: FocusEvent, hit: MarkHit): void {
    const marker = this.allMarkers()[hit.index];
    if (marker) {
      this.rovingBySeries.update((roving) =>
        new Map(roving).set(marker.seriesId, hit.index),
      );
      this.focusedSeries.set(marker.seriesId);
      this.scales.setActiveIndex(marker.categoryIndex);
    }
    this.activeMark.enter(hit.index, event, undefined, hit.element);
  }

  protected onMarkerKey(event: KeyboardEvent): void {
    const hit = markOf(event);
    if (!hit) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectMarker(hit.index);

      return;
    }
    // The category cursor's `ds-chart` owns the other keys.
    if (this.scales.cursorOn?.()) {
      return;
    }
    const marker = this.allMarkers()[hit.index];
    const strand = this.allMarkers().filter(
      (candidate) => candidate.seriesId === marker?.seriesId,
    );
    const current = strand.findIndex(
      (candidate) => candidate.markIndex === hit.index,
    );
    const next = nextRovingIndex(event.key, current, strand.length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    focusMark(hit.element.closest('.lines'), strand[next].markIndex);
  }

  protected isDimmed(seriesId: string): boolean {
    const highlighted = this.highlighted();

    return highlighted !== null && highlighted !== seriesId;
  }

  protected onMarkerClick(event: MouseEvent): void {
    const hit = markOf(event);
    if (!hit) {
      return;
    }
    if (this.pins()) {
      this.activeMark.pin(hit.index, event, '.series-marker', hit.element);
    }
    this.selectMarker(hit.index);
  }

  private selectMarker(markIndex: number): void {
    const marker = this.allMarkers()[markIndex];
    const series = this.data().find((entry) => entry.id === marker?.seriesId);
    if (marker && series) {
      this.pointClicked.emit({
        series,
        categoryIndex: marker.categoryIndex,
        value: marker.value,
      });
    }
  }

  protected markerLabel(marker: {
    seriesLabel: string;
    category: string;
    formattedValue: string;
  }): string {
    return `${marker.seriesLabel}, ${marker.category}, ${marker.formattedValue}`;
  }

  /** What this series reads at the cursor's category, whatever `tooltip` says; feeds the category panel. */
  readonly axisEntries = computed<readonly ChartAxisEntry[]>(() =>
    this.readingsAtCursor().map(({ reading }) => reading),
  );

  private readonly readingsAtCursor = computed(() => {
    const categoryIndex = this.scales.activeIndex();
    if (categoryIndex < 0) {
      return [];
    }

    return this.plotted().flatMap((entry) => {
      const marker = entry.markers.find(
        (candidate) => candidate.categoryIndex === categoryIndex,
      );

      return marker
        ? [
            {
              seriesId: entry.series.id,
              markIndex: marker.markIndex,
              reading: {
                label: marker.seriesLabel,
                value: marker.value,
                formatted: marker.formattedValue,
                color: marker.color,
                y: marker.y,
              } satisfies ChartAxisEntry,
            },
          ]
        : [];
    });
  });

  readonly tooltipContext = computed<ChartTooltipContext | null>(() => {
    if (this.tooltip() === 'none') {
      return null;
    }
    if (this.tooltip() === 'axis') {
      return this.axisTooltipContext();
    }
    const marker = this.allMarkers()[this.activeMark.index()];
    if (!marker) {
      return null;
    }

    return {
      category: marker.category,
      entries: [
        {
          label: marker.seriesLabel,
          value: marker.value,
          formatted: marker.formattedValue,
          color: marker.color,
        },
      ],
    };
  });

  private readonly markerElements =
    viewChildren<ElementRef<Element>>('markerEl');

  readonly axisPointElements = computed<readonly (Element | null)[]>(() =>
    this.readingsAtCursor().map(
      ({ markIndex }) =>
        this.markerElements()[markIndex]?.nativeElement ?? null,
    ),
  );

  /** The topmost reading at the active category, as an element; the cursor band spans the plot and would open an `'axis'` panel at the top. */
  private readonly topReadingElement = computed<Element | null>(() => {
    const categoryIndex = this.scales.activeIndex();
    if (categoryIndex < 0) {
      return null;
    }
    const highest = this.allMarkers()
      .filter((marker) => marker.categoryIndex === categoryIndex)
      .reduce<{ markIndex: number; y: number } | null>(
        (top, marker) => (top === null || marker.y < top.y ? marker : top),
        null,
      );

    return highest
      ? (this.markerElements()[highest.markIndex]?.nativeElement ?? null)
      : null;
  });

  readonly tooltipOrigin = computed<ChartTooltipOrigin | null>(() => {
    if (this.tooltip() !== 'axis') {
      return this.activeMark.origin();
    }
    if (this.tooltipAnchor() === 'pointer') {
      return this.scales.cursorPointer() ?? this.scales.cursorOrigin();
    }

    return this.topReadingElement() ?? this.scales.cursorOrigin();
  });

  /** Every series' reading at the active category; a series with none contributes no row. */
  private readonly axisTooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const categoryIndex = this.scales.activeIndex();
      if (categoryIndex < 0) {
        return null;
      }
      const focused = this.focusedSeries();
      const entries = topDown(
        this.readingsAtCursor()
          .filter(({ seriesId }) => !focused || seriesId === focused)
          .map(({ reading }) => reading),
      );
      if (!entries.length) {
        return null;
      }

      return {
        category: this.scales.categories()[categoryIndex] ?? '',
        entries,
      };
    },
  );
}
