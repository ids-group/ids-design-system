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
  areaPath,
  defaultChartFormat,
  focusMark,
  bandPath,
  lineSegments,
  nextRovingIndex,
  linePath,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import type { LinePoint } from '@ids-group-ltd/ids-design-system/components';
import type {
  ChartAxis,
  ChartCurve,
  ChartGaps,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { chartActiveMark } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartTooltipTrigger,
  ChartTooltipContext,
  ChartTooltipEntry,
  ChartTooltipOrigin,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { CHART_SCALES } from './chart-scales.token';

export interface LineSeriesData {
  id: string;
  label: string;
  /** One reading per category. A `null` is a missing reading, and `gaps` decides what it draws. */
  data: readonly (number | null)[];
  /** Which value axis the readings are measured against. Defaults to `'primary'`. */
  axis?: ChartAxis;
  /** Fills the band between the line and its axis baseline. */
  area?: boolean;
  /** The band's floor, one entry per category, in the axis's own unit. Unset fills to the
   *  baseline. Given, the fill is the band between the two curves - which is what a stacked plot
   *  needs, and the caller that owns the pile is the one that knows where each band starts. A
   *  `null` must sit in exactly the categories `data` has one, or the two sides break in
   *  different places. */
  lower?: readonly (number | null)[];
  /** Any CSS colour. Unset takes the categorical palette slot for the series' position. */
  color?: string;
}

let nextSeriesId = 0;

/**
 * One line per series, drawn against the scales `ds-chart` supplies, on either of its two value
 * axes.
 *
 * Hosted on a `<g>` rather than an element of its own: an element the SVG specification does not
 * know is not rendered, and neither are its descendants. Written as `<svg:g dsLineSeries>`.
 */
@Component({
  // The repository's `component-selector` rule asks for an element selector, and one cannot work
  // inside a canvas - see the same exemption on `g[dsColumnSeries]`.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsLineSeries]',
  standalone: true,
  exportAs: 'dsLineSeries',
  templateUrl: './line-series.component.html',
  styleUrl: './line-series.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineSeriesComponent implements OnDestroy {
  private readonly scales = inject(CHART_SCALES);

  /** Not `input.required`: the preset reads `tooltipContext()` from a binding on this same
   *  element, and a required input throws NG0950 for the pass before its own value is written. */
  readonly data = input<readonly LineSeriesData[]>([]);

  /** Draws a round marker at every reading. Off leaves the line alone, which reads better past
   *  roughly twenty points. */
  readonly showMarkers = input(true, { transform: booleanAttribute });

  /** Lays the line and its markers on a band of the surface colour, so they stay legible where
   *  they cross other marks. On by default: a line shares its plot more often than not, and on an
   *  empty plot the band only separates it from the gridlines. */
  readonly outline = input(true, { transform: booleanAttribute });

  /** Turns on the click affordance - the pointer cursor and the hover tint. `pointClicked`
   *  fires whether or not this is set. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a
   *  press outside releases it. Pinning is a state, not a handler. */
  readonly pinOnClick = input(false, { transform: booleanAttribute });

  /** Fades every series but the one under the pointer. Off by default: the dimming buys loudness
   *  for one line and pays for it with the separation between the rest. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The one series to single out: every other one draws faded and this one draws bold, so the
   *  comparison survives a monochrome print. Driven from a legend, or from whatever else the app
   *  uses to mean "show me this one". Needs `dimOthers`, which is what says fading is wanted at
   *  all. */
  readonly highlighted = input<string | null>(null);

  /** A dash pattern per series, in the order the series are given. A series past the end of the
   *  list, or given an empty string, draws solid. */
  readonly patterns = input<readonly string[]>([]);

  /** Fills each area from the series below it rather than from the baseline, which is what a
   *  stacked plot needs and what the fill reads as. */
  readonly stacked = input(false, { transform: booleanAttribute });

  /** The dash for a series' position, or null where it draws solid. */
  protected dashFor(seriesIndex: number): string | null {
    return this.patterns()[seriesIndex] || null;
  }

  /** Milliseconds between one marker's entrance and the next. The total is capped. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  /** What a `null` reading draws: `'break'` leaves a hole in the line, `'zero'` plots a point
   *  at zero. A missing measurement and a measured zero are different facts. */
  readonly gaps = input<ChartGaps>('break');

  /** How the line joins its readings. `'linear'` by default, which asserts nothing the data does
   *  not say; a curve is a claim about what happened BETWEEN two readings. `'step'` holds each
   *  reading to the next, `'smooth'` is a monotone cubic that draws no peak the data lacks. */
  readonly curve = input<ChartCurve>('linear');

  /** Whether a hovered or focused reading opens a tooltip, and for what. `'item'` names the
   *  marker itself. `'axis'` names every series at the category under the pointer, which is the
   *  reading a multi-series line is compared on - it follows the container's `cursor`, so set
   *  `cursor="category"` on `ds-chart` with it or nothing marks the category being read. */
  readonly tooltip = input<ChartTooltipTrigger>('item');

  /** Where an `'axis'` panel hangs: `'reading'` puts it over the highest reading in the category,
   *  so it names what it points at and stays put while the pointer travels within one band;
   *  `'pointer'` follows the cursor. */
  readonly tooltipAnchor = input<'reading' | 'pointer'>('reading');

  /** How long the panel survives the pointer leaving the marker. Raise it only for a panel a
   *  reader has to REACH, which is WCAG 1.4.13's hoverable clause; about 140 crosses the gap. */
  readonly tooltipLingerMs = input(0, { transform: numberAttribute });

  /** Formats every value this series prints. Called with `'tick'` for an axis label and
   *  `'tooltip'` everywhere a value is printed in full. */
  readonly valueFormat = input<ChartValueFormat>(defaultChartFormat);

  /** The clicked reading, with the series it belongs to and its position in `categories`.
   *  Fires on click and on Enter or Space, whatever `interactive` says. */
  readonly pointClicked = output<{
    series: LineSeriesData;
    categoryIndex: number;
    value: number;
  }>();

  private readonly domainId = `line-series-${nextSeriesId++}`;

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
    // The container opens the panel, so a plot holding several marks can only ever show one.
    this.scales.reportTooltip(this.domainId, {
      context: this.tooltipContext,
      origin: this.tooltipOrigin,
      axisEntries: this.axisEntries,
    });
  }

  ngOnDestroy(): void {
    this.scales.releaseTooltip(this.domainId);
    this.scales.releaseDomain(`${this.domainId}-primary`);
    this.scales.releaseDomain(`${this.domainId}-secondary`);
  }

  readonly activeMark = chartActiveMark(() => this.tooltipLingerMs());

  private valuesOn(axis: ChartAxis): number[] {
    return this.data()
      .filter((series) => (series.axis ?? 'primary') === axis)
      .flatMap((series) =>
        series.data.filter((value): value is number => value !== null),
      );
  }

  /** A `null` past the end is the same missing reading as a `null` inside the run, so a series
   *  shorter than `categories` ends its line rather than running off the plot's edge. */
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
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  /** One tab stop PER SERIES: each line is a strand the reader walks with the arrows, and the
   *  strands are what the chart is comparing. WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable, which is what keeps a
   *  12-category, 2-series plot from being twenty-four stops in the page's tab order. */
  private readonly rovingBySeries = signal<ReadonlyMap<string, number>>(
    new Map(),
  );

  protected isTabStop(seriesId: string, markIndex: number): boolean {
    const chosen = this.rovingBySeries().get(seriesId);
    if (chosen !== undefined) {
      return chosen === markIndex;
    }
    const first = this.plotted().find((entry) => entry.series.id === seriesId)
      ?.markers[0];

    return first?.markIndex === markIndex;
  }

  /** The series a marker holds focus on, which narrows an `'axis'` panel to that one reading: a
   *  pointer answers for every series at once, a focused marker answers for its own. */
  private readonly focusedSeries = signal<string | null>(null);

  protected onMarkerEnter(markIndex: number, event: Event): void {
    this.activeMark.enter(markIndex, event);
  }

  protected onMarkerFocus(markIndex: number, event: FocusEvent): void {
    const marker = this.allMarkers()[markIndex];
    if (marker) {
      this.rovingBySeries.update((roving) =>
        new Map(roving).set(marker.seriesId, markIndex),
      );
      this.focusedSeries.set(marker.seriesId);
      this.scales.setActiveIndex(marker.categoryIndex);
    }
    this.onMarkerEnter(markIndex, event);
  }

  protected onMarkerBlur(): void {
    this.focusedSeries.set(null);
    this.activeMark.leave();
  }

  protected onMarkerNavigation(event: KeyboardEvent, markIndex: number): void {
    const marker = this.allMarkers()[markIndex];
    const strand = this.allMarkers().filter(
      (candidate) => candidate.seriesId === marker?.seriesId,
    );
    const current = strand.findIndex(
      (candidate) => candidate.markIndex === markIndex,
    );
    const next = nextRovingIndex(event.key, current, strand.length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    focusMark(
      (event.currentTarget as Element).closest('.lines'),
      strand[next].markIndex,
    );
  }

  protected isDimmed(seriesId: string): boolean {
    const highlighted = this.highlighted();

    // Not gated on `dimOthers`: that input governs what a POINTER over a mark does, and naming a
    // series in the legend is the reader asking for this one directly.
    return highlighted !== null && highlighted !== seriesId;
  }

  protected onMarkerClick(markIndex: number, event?: Event): void {
    if (this.pinOnClick() && event) {
      this.activeMark.pin(markIndex, event, '.series-marker');
    }
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

  /** What this series reads at the category the cursor is on, whatever `tooltip` says. It feeds
   *  the container's category panel, so one band answers for every mark on the plot rather than
   *  each mark owning a hover field of its own. */
  readonly axisEntries = computed<readonly ChartTooltipEntry[]>(() => {
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
              label: marker.seriesLabel,
              value: marker.value,
              formatted: marker.formattedValue,
              color: marker.color,
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

  /** The topmost reading at the active category, as its own element. The cursor band spans the
   *  whole plot, so anchoring an `'axis'` panel to it opens the panel at the top of the chart
   *  rather than over the readings it is about. */
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

  /** Where the panel hangs: the reading or the pointer in `'axis'` mode, the hovered mark
   *  otherwise. */
  readonly tooltipOrigin = computed<ChartTooltipOrigin | null>(() => {
    if (this.tooltip() !== 'axis') {
      return this.activeMark.origin();
    }
    if (this.tooltipAnchor() === 'pointer') {
      return this.scales.cursorPointer() ?? this.scales.cursorOrigin();
    }

    return this.topReadingElement() ?? this.scales.cursorOrigin();
  });

  /** Every series' reading at the category the CONTAINER says is active, which is what the
   *  category cursor sets. A series with no reading there contributes no row rather than a
   *  blank one. */
  private readonly axisTooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const categoryIndex = this.scales.activeIndex();
      if (categoryIndex < 0) {
        return null;
      }
      const focused = this.focusedSeries();
      const reporting = focused
        ? this.plotted().filter((entry) => entry.series.id === focused)
        : this.plotted();
      const entries = reporting.flatMap((entry) => {
        const marker = entry.markers.find(
          (candidate) => candidate.categoryIndex === categoryIndex,
        );

        return marker
          ? [
              {
                label: marker.seriesLabel,
                value: marker.value,
                formatted: marker.formattedValue,
                color: marker.color,
              },
            ]
          : [];
      });
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
