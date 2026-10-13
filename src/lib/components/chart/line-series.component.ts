import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  CHART_TOOLTIP_LINGER_MS,
  areaPath,
  chartValueFormat,
  focusMark,
  tweenMarks,
  listenForMarkFocus,
  markOf,
  bandPath,
  lineSegments,
  nextRovingIndex,
  linePath,
  leaveMark,
  staggerDelay,
  dimmedBy,
  leftMark,
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
import type { ChartAxisEntry, ChartAxisReadout } from './chart-scales.token';
import {
  categoryKeys,
  changeBetween,
  outsideRange,
  topDown,
} from './chart.math';

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
  /** Erases the line back along itself and leaves the value axis to the other series; set it rather
   *  than removing the series to animate a legend hiding it. */
  hidden?: boolean;
}

let nextSeriesId = 0;

// The active marker's default radius, `--chart-dot-radius-active`.
const PIN_MARKER_CLEARANCE = 6;

// From the higher end of a thickened change to the baseline of its percentage.
const CHANGE_LABEL_GAP = 10;

// View units between two samples of a line; a travelling marker interpolates between them.
const PATH_SAMPLE_STEP = 2;

interface PathSamples {
  readonly geometry: string;
  readonly xs: Float64Array;
  readonly ys: Float64Array;
  readonly lengths: Float64Array;
}

const sampledPaths = new WeakMap<SVGPathElement, PathSamples>();

// Read once per geometry: every `getPointAtLength` forces style and layout.
function samplesOf(path: SVGPathElement): PathSamples {
  const geometry = `${path.getAttribute('d')}|${path.style.getPropertyValue('d')}`;
  const cached = sampledPaths.get(path);
  if (cached?.geometry === geometry) {
    return cached;
  }
  const total = path.getTotalLength();
  const count = Math.max(2, Math.ceil(total / PATH_SAMPLE_STEP) + 1);
  const samples: PathSamples = {
    geometry,
    xs: new Float64Array(count),
    ys: new Float64Array(count),
    lengths: new Float64Array(count),
  };
  for (let index = 0; index < count; index++) {
    const length = (total * index) / (count - 1);
    const point = path.getPointAtLength(length);
    samples.xs[index] = point.x;
    samples.ys[index] = point.y;
    samples.lengths[index] = length;
  }
  // Mid-glide the drawn line is not the one its `d` names.
  if (path.getAnimations().length === 0) {
    sampledPaths.set(path, samples);
  }

  return samples;
}

// The first index whose value reaches `target`, over ascending values.
function firstReaching(values: Float64Array, target: number): number {
  let low = 0;
  let high = values.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low;
}

function shareBetween(
  values: Float64Array,
  index: number,
  target: number,
): number {
  const span = index === 0 ? 0 : values[index] - values[index - 1];

  return span > 0 ? (target - values[index - 1]) / span : 1;
}

function interpolate(
  values: Float64Array,
  index: number,
  share: number,
): number {
  return index === 0
    ? values[0]
    : values[index - 1] + (values[index] - values[index - 1]) * share;
}

// Distance along a line drawn left to right at which it reaches `x`; on a vertical run at `x` (a
// step's riser), the sample nearest `y`.
function lengthAt(samples: PathSamples, x: number, y: number): number {
  const index = firstReaching(samples.xs, x);
  let nearest = index;
  for (
    let candidate = index + 1;
    candidate < samples.xs.length && samples.xs[candidate] - x < 0.5;
    candidate++
  ) {
    if (
      Math.abs(samples.ys[candidate] - y) < Math.abs(samples.ys[nearest] - y)
    ) {
      nearest = candidate;
    }
  }
  if (nearest !== index) {
    return samples.lengths[nearest];
  }

  return interpolate(
    samples.lengths,
    index,
    shareBetween(samples.xs, index, x),
  );
}

function pointAtLength(
  samples: PathSamples,
  length: number,
): { x: number; y: number } {
  const index = firstReaching(samples.lengths, length);
  const share = shareBetween(samples.lengths, index, length);

  return {
    x: interpolate(samples.xs, index, share),
    y: interpolate(samples.ys, index, share),
  };
}

// The drawn piece of a series that spans both x positions; a gap between them leaves none.
function lineThrough(
  paths: Iterable<SVGPathElement>,
  fromX: number,
  toX: number,
): PathSamples | null {
  const low = Math.min(fromX, toX);
  const high = Math.max(fromX, toX);
  for (const path of paths) {
    const samples = samplesOf(path);
    if (
      samples.xs[0] <= low + 0.5 &&
      samples.xs[samples.xs.length - 1] >= high - 0.5
    ) {
      return samples;
    }
  }

  return null;
}

// The new keys in order, each removed key placed after the key it followed.
function mergedKeys(
  previous: readonly string[],
  next: readonly string[],
): string[] {
  const merged = [...next];
  const kept = new Set(next);
  previous.forEach((key, index) => {
    if (kept.has(key)) {
      return;
    }
    const before = previous
      .slice(0, index)
      .reverse()
      .find((candidate) => merged.includes(candidate));
    merged.splice(
      before === undefined ? 0 : merged.indexOf(before) + 1,
      0,
      key,
    );
  });

  return merged;
}

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

  /** Fades every series but the one under the pointer or singled out by `highlighted`. Off by default:
   *  it costs separation between the rest. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** The series to single out, as hovering one of its markers does: it draws bold, and under
   *  `dimOthers` the others fade. */
  readonly highlighted = input<string | null>(null);

  /** On the hovered reading, thickens the stretches from the reading before it and to the reading
   *  after it, each in its own rising or falling colour (`--ds-chart-positive-color`,
   *  `--ds-chart-negative-color`) and, unless it starts at zero, with its own change in percent. With several series it follows the one singled out: hovered, focused or highlighted. */
  readonly showChange = input(false, { transform: booleanAttribute });

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

  /** Milliseconds the panel survives the pointer leaving the marker within the chart. */
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
      for (const axis of ['primary', 'secondary'] as const) {
        for (const hidden of [false, true]) {
          this.scales.reportDomain(
            this.reportIdOf(axis, hidden),
            this.valuesOn(axis, hidden),
            axis,
            hidden,
          );
        }
      }
    });
    this.scales.reportTooltip(this.domainId, {
      context: this.tooltipContext,
      origin: this.tooltipOrigin,
      offersTooltip: computed(() => this.tooltip() !== 'none'),
      readsCategory: computed(() => this.tooltip() === 'axis'),
      axisOrigin: this.topReadingElement,
      axisReadingY: this.topReadingY,
      axisEntries: this.axisEntries,
      axisPointElements: this.axisPointElements,
      axisReadout: this.axisReadout,
      valuesByCategory: this.valuesByCategory,
    });
    afterRenderEffect({
      write: () => {
        this.scales.activeIndex();
        this.plotted();
        untracked(() =>
          this.zone.runOutsideAngular(() => this.moveTravelMarkers()),
        );
      },
    });
    afterRenderEffect({
      write: () => {
        const plotted = this.plotted();
        untracked(() =>
          this.zone.runOutsideAngular(() =>
            this.morphOnCategoryChange(plotted),
          ),
        );
      },
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
    for (const axis of ['primary', 'secondary'] as const) {
      this.scales.releaseDomain(this.reportIdOf(axis, false));
      this.scales.releaseDomain(this.reportIdOf(axis, true));
    }
  }

  readonly activeMark = chartActiveMark(
    () => this.tooltipLingerMs(),
    () => this.scales.hoverDelayMs?.() ?? 0,
  );

  private reportIdOf(axis: ChartAxis, hidden: boolean): string {
    return `${this.domainId}-${axis}${hidden ? '-hidden' : ''}`;
  }

  private valuesOn(axis: ChartAxis, hidden: boolean): number[] {
    return this.data()
      .filter(
        (series) =>
          (series.axis ?? 'primary') === axis &&
          (series.hidden ?? false) === hidden,
      )
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
    const keys = categoryKeys(categories);
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
            key: `${series.id}-${keys[point.categoryIndex]}`,
            categoryKey: keys[point.categoryIndex],
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
            hidden: series.hidden ?? false,
          })),
      };
    });
  });

  private readonly visibleCount = computed(
    () => this.data().filter((series) => !series.hidden).length,
  );

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

  /** Active when its own marker is hovered, or its category is active while the category cursor is
   *  off; under the cursor a travelling marker answers the category instead. */
  protected isActiveMarker(marker: {
    markIndex: number;
    categoryIndex: number;
  }): boolean {
    return (
      marker.markIndex === this.activeMark.index() ||
      (!this.scales.cursorOn?.() &&
        marker.categoryIndex === this.scales.activeIndex())
    );
  }

  protected isOutsideRange(categoryIndex: number): boolean {
    return outsideRange(this.scales.selectedRange?.() ?? null, categoryIndex);
  }

  private readonly host = inject<ElementRef<Element>>(ElementRef);

  private readonly zone = inject(NgZone);

  private readonly travel = new Map<
    string,
    {
      categoryIndex: number;
      toX: number;
      toY: number;
      x: number;
      y: number;
      cancel: () => void;
    }
  >();

  // One marker per series rides the line from the reading it left to the one the category cursor is
  // on, on the panel's timing; a data change at the same category moves it on the marks' timing.
  private moveTravelMarkers(): void {
    const categoryIndex = this.scales.activeIndex();
    const host = this.host.nativeElement;
    for (const entry of this.plotted()) {
      const id = entry.series.id;
      const marker = host.querySelector<SVGCircleElement>(
        `.travel-marker[data-series-id="${CSS.escape(id)}"]`,
      );
      const state = this.travel.get(id);
      const target = entry.series.hidden
        ? undefined
        : entry.markers.find(
            (candidate) => candidate.categoryIndex === categoryIndex,
          );
      if (!marker || !target) {
        state?.cancel();
        this.travel.delete(id);
        marker?.classList.remove('is-shown');
        continue;
      }
      if (
        state &&
        state.categoryIndex === categoryIndex &&
        state.toX === target.x &&
        state.toY === target.y
      ) {
        continue;
      }
      state?.cancel();
      const next = {
        categoryIndex,
        toX: target.x,
        toY: target.y,
        x: target.x,
        y: target.y,
        cancel: (): void => undefined,
      };
      const place = (x: number, y: number): void => {
        next.x = x;
        next.y = y;
        // `transform`, not `cx`: a geometry change re-lays out the SVG and repaints the whole page each frame.
        marker.style.transform = `translate(${x}px, ${y}px)`;
      };
      this.travel.set(id, next);
      if (!state || !marker.classList.contains('is-shown')) {
        place(target.x, target.y);
        marker.classList.add('is-shown');
        continue;
      }
      next.x = state.x;
      next.y = state.y;
      const line =
        state.categoryIndex === categoryIndex
          ? null
          : lineThrough(
              host.querySelectorAll<SVGPathElement>(
                `.series-line[data-series-id="${CSS.escape(id)}"]:not(.mark-leave)`,
              ),
              state.x,
              target.x,
            );
      if (line) {
        next.cancel = tweenMarks(
          marker,
          [lengthAt(line, state.x, state.y)],
          [lengthAt(line, target.x, target.y)],
          ([length]) => {
            const point = pointAtLength(line, length);
            place(point.x, point.y);
          },
          'tooltip-move',
          () => place(target.x, target.y),
        );
      } else {
        next.cancel = tweenMarks(
          marker,
          [state.x, state.y],
          [target.x, target.y],
          ([x, y]) => place(x, y),
          state.categoryIndex === categoryIndex ? 'mark' : 'tooltip-move',
        );
      }
    }
  }

  // Where each series' points are drawn, by category key; a morph starts from here.
  private drawnPoints = new Map<
    string,
    Map<string, { x: number; y: number }>
  >();
  private drawnKeys: readonly string[] = [];
  // Where each series' area meets its axis, in view units.
  private drawnBaselines = new Map<string, number>();
  private stopMorph: () => void = () => undefined;
  private morphing = false;

  // CSS cannot interpolate a `d` whose point count changed, so when a category comes or goes the line
  // morphs here, over the union of both point sets: a new point leaves its neighbour, a removed one
  // merges into its neighbour. The markers ride the same values, so they stay on the line.
  private morphOnCategoryChange(
    plotted: readonly {
      series: LineSeriesData;
      linePaths: readonly string[];
      areaPaths: readonly string[];
      markers: readonly { categoryKey: string; x: number; y: number }[];
    }[],
  ): void {
    const keys = categoryKeys(this.scales.categories());
    const previousKeys = this.drawnKeys;
    const previous = this.drawnPoints;
    const targets = new Map(
      plotted.map((entry) => [
        entry.series.id,
        new Map(
          entry.markers.map((marker) => [
            marker.categoryKey,
            { x: marker.x, y: marker.y },
          ]),
        ),
      ]),
    );
    const targetBaselines = new Map(
      plotted.map((entry) => [entry.series.id, this.baselineOf(entry.series)]),
    );
    const previousBaselines = this.drawnBaselines;
    this.drawnKeys = keys;
    const sameCategories =
      previousKeys.length === keys.length &&
      keys.every((key, index) => key === previousKeys[index]);
    // A value change belongs to the CSS transitions, unless it lands during a morph, which then
    // retargets from where the points are.
    if (previousKeys.length === 0 || (sameCategories && !this.morphing)) {
      this.drawnPoints = targets;
      this.drawnBaselines = targetBaselines;

      return;
    }
    this.stopMorph();
    const merged = mergedKeys(previousKeys, keys);
    const host = this.host.nativeElement;
    const plans = plotted
      .filter(
        (entry) =>
          entry.linePaths.length === 1 && previous.has(entry.series.id),
      )
      .map((entry) => {
        const id = entry.series.id;
        const from = previous.get(id) ?? new Map();
        const to = targets.get(id) ?? new Map();
        const order = merged.filter((key) => from.has(key) || to.has(key));
        const near = (
          key: string,
          within: ReadonlyMap<string, { x: number; y: number }>,
        ) => {
          const at = order.indexOf(key);
          const found =
            order
              .slice(0, at)
              .reverse()
              .find((candidate) => within.has(candidate)) ??
            order.slice(at + 1).find((candidate) => within.has(candidate));

          return found === undefined ? undefined : within.get(found);
        };
        const escaped = CSS.escape(id);
        const baseline = targetBaselines.get(id) ?? 0;
        // A band over `lower` has a second edge of its own; it keeps to the CSS transitions.
        const fillsToBaseline =
          !!entry.series.area &&
          !entry.series.lower &&
          entry.areaPaths.length === 1;

        return {
          id,
          order,
          starts: order.map(
            (key) => from.get(key) ?? near(key, from) ?? to.get(key),
          ),
          ends: order.map(
            (key) => to.get(key) ?? near(key, to) ?? from.get(key),
          ),
          baselineFrom: previousBaselines.get(id) ?? baseline,
          baselineTo: baseline,
          paths: [
            ...host.querySelectorAll<SVGPathElement>(
              `.series-line[data-series-id="${escaped}"]:not(.mark-leave), .series-halo[data-series-id="${escaped}"]`,
            ),
          ],
          areas: fillsToBaseline
            ? [
                ...host.querySelectorAll<SVGPathElement>(
                  `.series-area[data-series-id="${escaped}"]:not(.mark-leave)`,
                ),
              ]
            : [],
          // A removed point is still in the DOM while it fades, and slides into its neighbour meanwhile.
          markers: order.map((key) =>
            host.querySelector<SVGCircleElement>(
              `.series-marker[data-point-key="${CSS.escape(id + '-' + key)}"]`,
            ),
          ),
          leaving: order.map((key) => !to.has(key)),
        };
      });
    this.drawnPoints = targets;
    this.drawnBaselines = targetBaselines;
    if (plans.length === 0) {
      return;
    }
    const flat = (
      points: readonly ({ x: number; y: number } | undefined)[],
      baseline: number,
    ) => [
      ...points.flatMap((point) => [point?.x ?? 0, point?.y ?? 0]),
      baseline,
    ];
    const from = plans.flatMap((plan) => flat(plan.starts, plan.baselineFrom));
    const to = plans.flatMap((plan) => flat(plan.ends, plan.baselineTo));
    const leavingMarkers = plans.flatMap((plan) =>
      plan.markers.filter(
        (marker, index): marker is SVGCircleElement =>
          !!marker && plan.leaving[index],
      ),
    );
    // A leaving marker keeps where it slid to until it is gone.
    const styled = plans.flatMap((plan) => [
      ...plan.paths,
      ...plan.areas,
      ...plan.markers.filter(
        (marker, index): marker is SVGCircleElement =>
          !!marker && !plan.leaving[index],
      ),
    ]);
    const curve = this.curve();
    const live = new Map(targets);
    const liveBaselines = new Map(targetBaselines);
    const apply = (values: readonly number[]): void => {
      let offset = 0;
      for (const plan of plans) {
        const points = plan.order.map((_, index) => ({
          categoryIndex: index,
          value: 0,
          x: values[offset + 2 * index],
          y: values[offset + 2 * index + 1],
        }));
        const baseline = values[offset + 2 * plan.order.length];
        offset += 2 * plan.order.length + 1;
        const path = `path("${linePath(points, curve)}")`;
        for (const element of plan.paths) {
          element.style.setProperty('d', path);
        }
        const area = `path("${areaPath(points, baseline, curve)}")`;
        for (const element of plan.areas) {
          element.style.setProperty('d', area);
        }
        plan.markers.forEach((marker, index) => {
          marker?.style.setProperty('cx', `${points[index].x}px`);
          marker?.style.setProperty('cy', `${points[index].y}px`);
        });
        live.set(
          plan.id,
          new Map(plan.order.map((key, index) => [key, points[index]])),
        );
        liveBaselines.set(plan.id, baseline);
      }
      this.drawnPoints = live;
      this.drawnBaselines = liveBaselines;
    };
    const release = (): void => {
      for (const element of styled) {
        element.style.removeProperty('d');
        element.style.removeProperty('cx');
        element.style.removeProperty('cy');
        element.style.removeProperty('transition');
      }
    };
    for (const element of [...styled, ...leavingMarkers]) {
      element.style.setProperty('transition', 'none');
    }
    apply(from);
    let cancel: () => void = () => undefined;
    this.morphing = true;
    this.stopMorph = () => {
      cancel();
      release();
      this.morphing = false;
    };
    cancel = tweenMarks(host, from, to, apply, 'mark', () => {
      release();
      this.drawnPoints = targets;
      this.drawnBaselines = targetBaselines;
      this.morphing = false;
      this.stopMorph = () => undefined;
    });
  }

  private baselineOf(series: LineSeriesData): number {
    const toY =
      (series.axis ?? 'primary') === 'secondary'
        ? this.scales.secondaryYPosition()
        : this.scales.yPosition();

    return toY(0);
  }

  private readonly hoveredSeries = computed(
    () => this.allMarkers()[this.activeMark.index()]?.seriesId ?? null,
  );

  /** One rule for the legend and the markers: the series either singles out draws bold, and under
   *  `dimOthers` the others fade. */
  private readonly spotlight = computed(
    () => this.highlighted() ?? this.hoveredSeries(),
  );

  protected isSpotlit(seriesId: string): boolean {
    return this.visibleCount() > 1 && this.spotlight() === seriesId;
  }

  private readonly locale = injectDsLocale();

  protected readonly changes = computed(() => {
    if (!this.showChange()) {
      return [];
    }
    const categoryIndex = this.scales.cursorOn?.()
      ? this.scales.activeIndex()
      : (this.allMarkers()[this.activeMark.index()]?.categoryIndex ?? -1);
    const visible = this.plotted().filter((entry) => !entry.series.hidden);
    const seriesId =
      visible.length === 1 ? visible[0].series.id : this.spotlight();
    const markers =
      visible.find((entry) => entry.series.id === seriesId)?.markers ?? [];
    const current = markers.find(
      (marker) => marker.categoryIndex === categoryIndex,
    );
    if (!current) {
      return [];
    }
    const stretches = [
      [
        markers.find((marker) => marker.categoryIndex === categoryIndex - 1),
        current,
      ],
      [
        current,
        markers.find((marker) => marker.categoryIndex === categoryIndex + 1),
      ],
    ] as const;

    return stretches.flatMap(([from, to]) => {
      if (!from || !to) {
        return [];
      }

      return [
        {
          key: `${current.seriesId}-${from.categoryIndex}`,
          path: linePath([from, to], this.curve()),
          ...changeBetween(from.value, to.value, this.locale),
          x: (from.x + to.x) / 2,
          y: Math.min(from.y, to.y) - CHANGE_LABEL_GAP,
        },
      ];
    });
  });

  protected readonly pinnedMarkers = this.activeMark.pinnedAt(
    (index) => this.allMarkers()[index],
  );

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
    if (leftMark(event, hit)) {
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
    return dimmedBy(this.dimOthers(), this.spotlight(), seriesId);
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
      const marker = entry.series.hidden
        ? undefined
        : entry.markers.find(
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
                axis: entry.series.axis ?? 'primary',
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
    if (!marker || marker.hidden) {
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

  private readonly topReading = computed(() => {
    const categoryIndex = this.scales.activeIndex();
    if (categoryIndex < 0) {
      return null;
    }

    return this.allMarkers()
      .filter(
        (marker) => marker.categoryIndex === categoryIndex && !marker.hidden,
      )
      .reduce<{ markIndex: number; y: number } | null>(
        (top, marker) => (top === null || marker.y < top.y ? marker : top),
        null,
      );
  });

  /** The topmost reading at the active category, as an element; the cursor band spans the plot and would open an `'axis'` panel at the top. */
  private readonly topReadingElement = computed<Element | null>(() => {
    const highest = this.topReading();

    return highest
      ? (this.markerElements()[highest.markIndex]?.nativeElement ?? null)
      : null;
  });

  private readonly topReadingY = computed(() =>
    this.topReadingElement() ? null : (this.topReading()?.y ?? null),
  );

  private readonly axisReadout = computed<ChartAxisReadout | null>(() => {
    const marker = this.allMarkers()[this.activeMark.index()];
    const series =
      marker && this.data().find((entry) => entry.id === marker.seriesId);

    return marker && !marker.hidden
      ? {
          categoryIndex: marker.categoryIndex,
          y: marker.y,
          axis: series?.axis ?? 'primary',
        }
      : null;
  });

  private readonly valuesByCategory = computed(() => {
    const perCategory = this.scales.categories().map((): number[] => []);
    for (const marker of this.allMarkers()) {
      if (!marker.hidden) {
        perCategory[marker.categoryIndex]?.push(marker.value);
      }
    }

    return perCategory;
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
