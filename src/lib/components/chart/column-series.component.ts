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
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import {
  CHART_SERIES_COLORS,
  defaultChartFormat,
  describeShare,
  focusMark,
  nextRovingIndex,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import { ICONS } from '@ids-group-ltd/ids-design-system/core';
import type { ChartValueFormat } from '@ids-group-ltd/ids-design-system/core';
import { chartActiveMark } from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { CHART_SCALES } from './chart-scales.token';
import { chartViewHeight } from './chart.math';

/** @internal */
export interface ColumnSeriesPoint {
  id?: string;
  label: string;
  value: number;
  color?: string;
}

/** The disc's radius, and half the glyph's box, in the same CSS pixels the plot is drawn in. */
const PIN_DISC_RADIUS = 11;
const PIN_GLYPH_SIZE = 14;

/** Distance from a mark's own tip to its value label's baseline. */
const VALUE_LABEL_GAP = 8;

let nextSeriesId = 0;

/**
 * One column per datum, drawn against the scales `ds-chart` supplies.
 *
 * Hosted on a `<g>` rather than an element of its own: an element the SVG specification does not
 * know is not rendered, and neither are its descendants, so `<ds-column-series>` inside the
 * container's canvas would draw nothing. Written as `<svg:g dsColumnSeries>`.
 *
 * @internal
 */
@Component({
  // The repository's `component-selector` rule asks for an element selector, and one cannot work
  // inside a canvas: an element the SVG specification does not know is not rendered, and neither
  // are its children. Measured in Chrome 153 - a rect under an HTML host and under an
  // SVG-namespaced unknown host both report a 0x0 box, the same rect under a `<g>` reports 80x80.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsColumnSeries]',
  standalone: true,
  exportAs: 'dsColumnSeries',
  templateUrl: './column-series.component.html',
  styleUrl: './column-series.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnSeriesComponent implements OnDestroy {
  private readonly scales = inject(CHART_SCALES);

  /** Not `input.required`: the preset reads `tooltipContext()` from a binding on this same
   *  element, and a required input throws NG0950 for the pass before its own value is written. */
  readonly data = input<readonly ColumnSeriesPoint[]>([]);

  readonly showValues = input(true, { transform: booleanAttribute });

  readonly interactive = input(false, { transform: booleanAttribute });

  readonly pinOnClick = input(false, { transform: booleanAttribute });

  readonly dimOthers = input(false, { transform: booleanAttribute });

  readonly staggerMs = input(0, { transform: numberAttribute });

  readonly partOfWhole = input(false, { transform: booleanAttribute });

  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  readonly tooltipAnchor = input<'mark' | 'cell'>('mark');

  readonly tooltipLingerMs = input(0, { transform: numberAttribute });

  readonly valueFormat = input<ChartValueFormat>(defaultChartFormat);

  /** The mark's share of its category's own slot, before the maximum width caps it. Measured off
   *  the slot rather than off `bandWidth()`, which has the container's own padding already taken
   *  out of it - applying both would narrow every uncapped column twice. */
  readonly columnWidthRatio = input(0.8, { transform: numberAttribute });

  readonly pointClicked = output<ColumnSeriesPoint>();

  private readonly domainId = `column-series-${nextSeriesId++}`;

  constructor() {
    effect(() =>
      this.scales.reportDomain(
        this.domainId,
        this.data().map((point) => point.value),
      ),
    );
  }

  ngOnDestroy(): void {
    this.scales.releaseDomain(this.domainId);
  }

  readonly activeMark = chartActiveMark(() => this.tooltipLingerMs());

  /** One category's whole slot. The box that catches the pointer is sized from this rather than
   *  from the drawn column, so a short column stays reachable. */
  private readonly bandStep = computed(() => {
    const count = this.data().length;

    return count > 0 ? this.scales.plot().width / count : 0;
  });

  protected readonly bandStepPx = computed(() => `${this.bandStep()}px`);

  protected readonly markWidthPx = computed(
    () => `${this.bandStep() * this.columnWidthRatio()}px`,
  );

  protected readonly hitHeight = computed(() => {
    const plot = this.scales.plot();

    return chartViewHeight(plot.height, plot.top);
  });

  protected readonly pinDiscRadius = PIN_DISC_RADIUS;
  protected readonly pinGlyphSize = PIN_GLYPH_SIZE;
  protected readonly pinGlyphOffset = -PIN_GLYPH_SIZE / 2;
  protected readonly pinGlyph: SafeHtml = inject(
    DomSanitizer,
  ).bypassSecurityTrustHtml(ICONS.pin);

  protected readonly marks = computed(() => {
    const toX = this.scales.xPosition();
    const toY = this.scales.yPosition();
    const baseline = this.scales.zeroOffset();
    const format = this.valueFormat();

    return this.data().map((point, index) => {
      const tip = toY(point.value);
      const below = tip > baseline;

      return {
        key: point.id ?? String(index),
        point,
        x: toX(index),
        tip,
        below,
        baseline,
        top: Math.min(tip, baseline),
        height: Math.abs(tip - baseline),
        labelY: below ? tip + VALUE_LABEL_GAP : tip - VALUE_LABEL_GAP,
        pinY: Math.min(tip, baseline) + PIN_DISC_RADIUS,
        // Growing from the baseline, never the mark's own tip - a column below zero grows
        // downward, so its transform-origin flips to the top edge it hangs from.
        origin: below ? 'top' : 'bottom',
        formattedValue: format(point.value, 'tooltip'),
        color:
          point.color ??
          CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
      };
    });
  });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  protected onMarkClick(
    payload: ColumnSeriesPoint,
    index: number,
    event: Event,
  ): void {
    this.pointClicked.emit(payload);
    if (this.pinOnClick()) {
      this.activeMark.pin(
        index,
        event,
        this.tooltipAnchor() === 'mark' ? '.bar' : undefined,
      );
    }
  }

  protected onMarkEnter(index: number, event: Event): void {
    this.activeMark.enter(
      index,
      event,
      this.tooltipAnchor() === 'mark' ? '.bar' : undefined,
    );
  }

  /** One tab stop per chart, not one per mark: WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable, and that is what keeps a
   *  twenty-five mark chart from being twenty-five stops in the page's tab order. */
  protected readonly rovingIndex = signal(0);

  protected readonly tabStopIndex = computed(() =>
    Math.min(this.rovingIndex(), Math.max(0, this.marks().length - 1)),
  );

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.rovingIndex.set(index);
    this.onMarkEnter(index, event);
  }

  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    const next = nextRovingIndex(event.key, index, this.marks().length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    this.rovingIndex.set(next);
    focusMark((event.currentTarget as Element).closest('.columns'), next);
  }

  protected onPointKey(point: ColumnSeriesPoint, event: Event): void {
    // Only the column's own key opens it: a key pressed on a control inside belongs to that
    // control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.pointClicked.emit(point);
  }

  protected entryLabel(mark: {
    point: ColumnSeriesPoint;
    formattedValue: string;
  }): string {
    return `${mark.point.label}, ${mark.formattedValue}`;
  }

  readonly tooltipContext = computed<ChartTooltipContext | null>(() => {
    const mark = this.marks()[this.activeMark.index()];
    if (this.tooltip() === 'none' || !mark) {
      return null;
    }

    return {
      category: '',
      entries: [
        {
          label: mark.point.label,
          value: mark.point.value,
          formatted: mark.formattedValue,
          color: mark.color,
          detail: this.partOfWhole()
            ? describeShare(
                this.data().map((point) => point.value),
                this.activeMark.index(),
              )
            : undefined,
        },
      ],
    };
  });
}
