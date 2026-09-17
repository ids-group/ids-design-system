import {
  ChangeDetectionStrategy,
  Component,
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
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  areaPath,
  defaultChartFormat,
  focusMark,
  lineSegments,
  nextRovingIndex,
  polylinePoints,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import type { LinePoint } from '@ids-group-ltd/ids-design-system/components';
import type {
  ChartAxis,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { chartActiveMark } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { CHART_SCALES } from './chart-scales.token';

/** @internal */
export interface LineSeriesData {
  id: string;
  label: string;
  /** One reading per category. A `null` is a missing reading, and `gaps` decides what it draws. */
  data: readonly (number | null)[];
  /** Which value axis the readings are measured against. Defaults to `'primary'`. */
  axis?: ChartAxis;
  /** Fills the band between the line and its axis baseline. */
  area?: boolean;
  /** Any CSS colour. Unset takes the categorical palette slot for the series' position. */
  color?: string;
}

/** What a `null` reading draws: a hole in the line, or a point at zero.
 *
 *  @internal */
export type LineSeriesGaps = 'break' | 'zero';

let nextSeriesId = 0;

/**
 * One line per series, drawn against the scales `ds-chart` supplies, on either of its two value
 * axes.
 *
 * Hosted on a `<g>` rather than an element of its own: an element the SVG specification does not
 * know is not rendered, and neither are its descendants. Written as `<svg:g dsLineSeries>`.
 *
 * @internal
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

  readonly showMarkers = input(true, { transform: booleanAttribute });

  readonly interactive = input(false, { transform: booleanAttribute });

  readonly staggerMs = input(0, { transform: numberAttribute });

  readonly gaps = input<LineSeriesGaps>('break');

  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  readonly tooltipLingerMs = input(0, { transform: numberAttribute });

  readonly valueFormat = input<ChartValueFormat>(defaultChartFormat);

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
  }

  ngOnDestroy(): void {
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

      return {
        series,
        color,
        seriesIndex: index,
        polylines: segments.map((segment) => polylinePoints(segment)),
        areaPaths: series.area
          ? segments.map((segment) => areaPath(segment, toY(0)))
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

  private readonly allMarkers = computed(() =>
    this.plotted().flatMap((entry) => entry.markers),
  );

  protected seriesStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  /** One tab stop per chart, not one per mark: WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable. */
  protected readonly rovingIndex = signal(0);

  protected readonly tabStopIndex = computed(() =>
    Math.min(this.rovingIndex(), Math.max(0, this.allMarkers().length - 1)),
  );

  protected onMarkerEnter(markIndex: number, event: Event): void {
    this.activeMark.enter(markIndex, event);
  }

  protected onMarkerFocus(markIndex: number, event: FocusEvent): void {
    this.rovingIndex.set(markIndex);
    this.onMarkerEnter(markIndex, event);
  }

  protected onMarkerNavigation(event: KeyboardEvent, markIndex: number): void {
    const next = nextRovingIndex(
      event.key,
      markIndex,
      this.allMarkers().length,
    );
    if (next === null) {
      return;
    }
    event.preventDefault();
    this.rovingIndex.set(next);
    focusMark((event.currentTarget as Element).closest('.lines'), next);
  }

  protected onMarkerClick(markIndex: number): void {
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

  readonly tooltipContext = computed<ChartTooltipContext | null>(() => {
    const marker = this.allMarkers()[this.activeMark.index()];
    if (this.tooltip() === 'none' || !marker) {
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
}
