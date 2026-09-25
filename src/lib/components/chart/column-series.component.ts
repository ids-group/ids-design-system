import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  untracked,
  inject,
  input,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';
import {
  CHART_SERIES_COLORS,
  chartValueFormat,
  describeShare,
  listenForMarkFocus,
  markOf,
  rovingMarks,
  leaveMark,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import {
  DS_INTL,
  injectDsLocale,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartAxis,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import type { MarkHit } from '@ids-group-ltd/ids-design-system/components';
import {
  CHART_PIN_GAP,
  CHART_PIN_RADIUS,
  ChartPinMarkerComponent,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { CHART_SCALES } from './chart-scales.token';
import type { ChartAxisEntry } from './chart-scales.token';
import { chartViewHeight } from './chart.math';
import type { ChartStackOffset } from './chart.math';

export interface ColumnSeriesPoint {
  id?: string;
  label: string;
  value: number;
  color?: string;
  fill?: 'solid' | 'hatched';
}

/** Distance from a mark's own tip to its value label's baseline. */
const VALUE_LABEL_GAP = 8;

/** Blank left at a stacked segment's lower end, so the boundary between two segments is a gap in
 *  the surface colour rather than a drawn rule. A rule is a third ink the palette has to stay
 *  legible against and it vanishes in print; a gap survives both, and it is the secondary encoding
 *  the palette's 6-8 dE separation band asks for. */
const STACK_SEGMENT_GAP = 2;

let nextSeriesId = 0;

/**
 * One column per datum, drawn against the scales `ds-chart` supplies.
 *
 * Hosted on a `<g>` rather than an element of its own: an element the SVG specification does not
 * know is not rendered, and neither are its descendants, so `<ds-column-series>` inside the
 * container's canvas would draw nothing. Written as `<svg:g dsColumnSeries>`.
 */
@Component({
  // The repository's `component-selector` rule asks for an element selector, and one cannot work
  // inside a canvas: an element the SVG specification does not know is not rendered, and neither
  // are its children. Measured in Chrome 153 - a rect under an HTML host and under an
  // SVG-namespaced unknown host both report a 0x0 box, the same rect under a `<g>` reports 80x80.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsColumnSeries]',
  standalone: true,
  imports: [ChartPinMarkerComponent],
  exportAs: 'dsColumnSeries',
  templateUrl: './column-series.component.html',
  styleUrl: './column-series.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnSeriesComponent implements OnDestroy {
  protected readonly leaveMark = leaveMark;

  private readonly scales = inject(CHART_SCALES);
  private readonly locale = injectDsLocale();
  protected readonly intl = inject(DS_INTL);

  /** Not `input.required`: the preset reads `tooltipContext()` from a binding on this same
   *  element, and a required input throws NG0950 for the pass before its own value is written. */
  readonly data = input<readonly ColumnSeriesPoint[]>([]);

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

  /** Turns on the click affordance - the pointer cursor and the hover tint. `pointClicked`
   *  fires whether or not this is set. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Holds the hovered mark and its tooltip in place when it is clicked, until a second click,
   *  Escape or a press outside releases it. Under the category cursor the container holds the
   *  category instead. Unset falls back to `DS_CONFIG.chart.pinOnClick`, then `true`. */
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

  /** Fades every mark but the one under the pointer. Off by default: the dimming buys loudness
   *  for one mark and pays for it with the separation between the rest. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next. The total is capped, so a long
   *  series does not crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  /** Declares that the marks are parts of one whole, which is what makes a share of their total
   *  a real quantity. On, each mark's share appears on the tooltip's second line. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  /** Whether a hovered or focused column opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** Where the tooltip is pinned. `'mark'` is the column itself; `'cell'` is the full-height
   *  category cell, which puts the panel at the top of the plot whatever the column's value. */
  readonly tooltipAnchor = input<'mark' | 'cell'>('mark');

  /** How long the panel survives the pointer leaving the mark. Raise it only for a panel a
   *  reader has to REACH, which is WCAG 1.4.13's hoverable clause; about 140 crosses the gap. */
  readonly tooltipLingerMs = input(0, { transform: numberAttribute });

  /** Formats every value this series prints. Called with `'tick'` for an axis label and
   *  `'tooltip'` everywhere a value is printed in full. */
  readonly valueFormat = input<ChartValueFormat>(
    chartValueFormat(injectDsLocale()),
  );

  /** The mark's share of its category's own slot, before the maximum width caps it. Measured off
   *  the slot rather than off `bandWidth()`, which has the container's own padding already taken
   *  out of it - applying both would narrow every uncapped column twice. */
  readonly columnWidthRatio = input(0.8, { transform: numberAttribute });

  /** This series' position among the slots a category's band is divided into. */
  readonly slot = input(0, { transform: numberAttribute });

  /** How many slots the band is divided into - the number of series drawn side by side. One, the
   *  default, is the whole band, which is what a single series has always taken. */
  readonly slotCount = input(1, { transform: numberAttribute });

  /** Where each mark starts and ends on the value axis, one entry per point. Unset, every mark
   *  runs from zero to its own value, which is the unstacked case. */
  readonly offsets = input<readonly ChartStackOffset[] | null>(null);

  /** Which value axis the columns are measured against. `'secondary'` reads them off the second
   *  axis, the way `axis: 'secondary'` does on a line series' data. */
  readonly axis = input<ChartAxis>('primary');

  /** One colour for the whole series, which is what several series drawn together need. Unset,
   *  each mark takes the categorical palette by its own position - the right reading when the
   *  marks ARE the categories, which is the single-series case. A point's own colour wins over
   *  both. */
  readonly seriesColor = input<string | null>(null);

  /** `seriesColor` for the fill pattern. A point's own `fill` wins. */
  readonly seriesFill = input<'solid' | 'hatched' | null>(null);

  /** Names the series in the tooltip, where the category then becomes the panel's heading. Unset,
   *  the panel names the category instead, which is what a chart of one series has to say. */
  readonly seriesLabel = input<string | null>(null);

  /** Identifies this series to the legend, so hovering a legend item can single it out. */
  readonly seriesKey = input<string | null>(null);

  /** The series the reader is pointing at in the legend. Every other series fades. */
  readonly highlighted = input<string | null>(null);

  protected readonly dimmedBySeries = computed(() => {
    const highlighted = this.highlighted();

    return highlighted !== null && highlighted !== this.seriesKey();
  });

  /** The clicked datum. Fires on click and on Enter or Space, whatever `interactive` says. */
  readonly pointClicked = output<ColumnSeriesPoint>();

  private readonly seriesId = nextSeriesId++;

  private readonly domainId = `column-series-${this.seriesId}`;

  /** Per instance: two charts on one page would otherwise share the first `<pattern>` to reach the
   *  document, and every hatched mark would take that chart's colour. */
  protected readonly hatchId = `ds-column-hatch-${this.seriesId}`;

  /** Where each mark actually spans, which is what the axis has to hold: a stacked segment's top
   *  is its category's running total, not its own reading. */
  private readonly spans = computed<readonly ChartStackOffset[]>(() => {
    const given = this.offsets();

    return this.data().map(
      (point, index) =>
        given?.[index] ?? {
          from: 0,
          to: Number.isFinite(point.value) ? point.value : 0,
        },
    );
  });

  constructor() {
    effect(() =>
      this.scales.reportDomain(
        this.domainId,
        this.spans().flatMap((span) => [span.from, span.to]),
        this.axis(),
      ),
    );
    // The container opens the panel, so a plot holding several marks can only ever show one.
    this.scales.reportTooltip(this.domainId, {
      context: this.tooltipContext,
      origin: computed(() => this.activeMark.origin()),
      pinned: this.activeMark.pinned,
      offersTooltip: computed(() => this.tooltip() !== 'none'),
      axisOrigin: computed(() => {
        const categoryIndex = this.scales.activeIndex();

        return categoryIndex < 0
          ? null
          : (this.barElements()[categoryIndex]?.nativeElement ?? null);
      }),
      axisEntries: this.axisEntries,
    });
    const host = inject<ElementRef<Element>>(ElementRef);
    listenForMarkFocus(
      host,
      (event, hit) => this.onMarkFocus(event, hit),
      () => this.activeMark.leave(),
    );
    let answeringLabel = false;
    effect(() => {
      const hover = this.scales.categoryLabelHover?.() ?? null;
      untracked(() => {
        const mark =
          hover &&
          host.nativeElement.querySelector(
            `[data-mark-index="${hover.index}"]`,
          );
        if (hover && mark) {
          answeringLabel = true;
          this.activeMark.enter(
            hover.index,
            hover.event,
            this.tooltipMark(),
            mark,
          );
        } else if (answeringLabel) {
          answeringLabel = false;
          this.activeMark.leave();
        }
      });
    });
  }

  // A reader naming a category by its label is asking for that column, so the rest step back
  // whatever `dimOthers` says, as they do for a legend entry.
  protected readonly dimsFromLabel = computed(
    () => (this.scales.categoryLabelHover?.() ?? null) !== null,
  );

  ngOnDestroy(): void {
    this.scales.releaseTooltip(this.domainId);
    this.scales.releaseDomain(this.domainId);
  }

  readonly activeMark = chartActiveMark(
    () => this.tooltipLingerMs(),
    () => this.scales.hoverDelayMs?.() ?? 0,
  );

  private readonly barElements = viewChildren<ElementRef<Element>>('barEl');

  /** One SERIES' slot inside a category's band: the whole band while a chart draws one series,
   *  a share of it per series when several are grouped. The box that catches the pointer is sized
   *  from this rather than from the drawn column, so a short column stays reachable. */
  private readonly slotStep = computed(() => {
    const count = this.data().length;
    const slots = Math.max(1, this.slotCount());

    return count > 0 ? this.scales.plot().width / count / slots : 0;
  });

  protected readonly slotBandPx = computed(
    () => `${this.scales.bandWidth() / Math.max(1, this.slotCount())}px`,
  );

  protected readonly markWidthPx = computed(
    () => `${this.slotStep() * this.columnWidthRatio()}px`,
  );

  /** The whole canvas, reserved end included. Overshooting when the container drops that
   *  reservation costs nothing - the outer `<svg>` clips it - while falling short would leave a
   *  strip under the plot that answers no pointer. */
  protected readonly hitHeight = computed(() => {
    const plot = this.scales.plot();

    return chartViewHeight(plot.height, plot.top, true);
  });

  /** Stacked series sit on top of one another, so a full-slot hit box on each one means only the
   *  series drawn last is ever reachable. Stacked, a mark catches the pointer over its own segment
   *  and nothing else. */
  protected readonly stacked = computed(() => this.offsets() !== null);

  /** Keeps a thin segment reachable without letting it reach into its neighbours. */
  private static readonly MIN_STACK_HIT = 6;

  protected hitBox(mark: { top: number; height: number }): {
    y: number;
    height: number;
  } {
    if (!this.stacked()) {
      return { y: 0, height: this.hitHeight() };
    }
    const height = Math.max(mark.height, ColumnSeriesComponent.MIN_STACK_HIT);
    const overflow = height - mark.height;

    return { y: mark.top - overflow / 2, height };
  }

  protected readonly hatchInUse = computed(() =>
    this.marks().some((mark) => mark.hatched),
  );

  protected readonly marks = computed(() => {
    const toX = this.scales.xPosition();
    const toY =
      this.axis() === 'secondary'
        ? this.scales.secondaryYPosition()
        : this.scales.yPosition();
    const spans = this.spans();
    const format = this.valueFormat();

    return this.data().map((point, index) => {
      const span = spans[index];
      const foot = toY(span.from);
      const tip = toY(span.to);
      const below = tip > foot;
      // Only a segment that has one under it gives up the gap: taking it off the baseline segment
      // would lift the whole stack off the axis.
      const gap =
        span.from === 0 ? 0 : Math.min(STACK_SEGMENT_GAP, Math.abs(tip - foot));
      const baseline = below ? foot + gap : foot - gap;
      const color =
        point.color ??
        this.seriesColor() ??
        CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length];

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
        pinY: Math.min(tip, baseline) + CHART_PIN_RADIUS + CHART_PIN_GAP,
        // Growing from the baseline, never the mark's own tip - a column below zero grows
        // downward, so its transform-origin flips to the top edge it hangs from.
        origin: below ? 'top' : 'bottom',
        formattedValue: format(point.value, 'tooltip'),
        color,
        hatched: (point.fill ?? this.seriesFill()) === 'hatched',
      };
    });
  });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.marks().length, this.staggerMs())}ms`;
  }

  private readonly tooltipMark = computed(() =>
    this.tooltipAnchor() === 'mark' ? '.bar' : undefined,
  );

  protected onMarkClick(event: MouseEvent): void {
    const hit = markOf(event);
    const mark = hit && this.marks()[hit.index];
    if (!hit || !mark) {
      return;
    }
    this.pointClicked.emit(mark.point);
    if (this.pins()) {
      this.activeMark.pin(hit.index, event, this.tooltipMark(), hit.element);
    }
  }

  protected onMarkOver(event: PointerEvent): void {
    const hit = markOf(event);
    if (hit && !this.scales.cursorOn?.()) {
      this.activeMark.enter(hit.index, event, this.tooltipMark(), hit.element);
    }
  }

  protected onMarkOut(event: PointerEvent): void {
    const hit = markOf(event);
    const next =
      event.relatedTarget instanceof Element
        ? event.relatedTarget.closest('[data-mark-index]')
        : null;
    if (hit && next !== hit.element && !this.scales.cursorOn?.()) {
      this.activeMark.leave();
    }
  }

  protected readonly roving = rovingMarks(() => this.marks().length);

  private onMarkFocus(event: FocusEvent, hit: MarkHit): void {
    this.roving.focus(hit.index);
    this.activeMark.enter(hit.index, event, this.tooltipMark(), hit.element);
  }

  protected onMarkKey(event: KeyboardEvent): void {
    const hit = markOf(event);
    if (!hit) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // Only the column's own key opens it: a key pressed on a control inside belongs to that
      // control.
      const mark = this.marks()[hit.index];
      if (this.interactive() && event.target === hit.element && mark) {
        event.preventDefault();
        this.pointClicked.emit(mark.point);
      }

      return;
    }
    this.roving.navigate(event, hit.index, hit.element.closest('.columns'));
  }

  protected entryLabel(mark: {
    point: ColumnSeriesPoint;
    formattedValue: string;
  }): string {
    return `${mark.point.label}, ${mark.formattedValue}`;
  }

  /** This series' reading at the category the cursor is on. Filled whatever `tooltip` says: it
   *  feeds the container's category panel, never a panel of this mark's own. */
  readonly axisEntries = computed<readonly ChartAxisEntry[]>(() => {
    const categoryIndex = this.scales.activeIndex();
    const mark = this.marks()[categoryIndex];
    if (categoryIndex < 0 || !mark) {
      return [];
    }

    return [
      {
        label: this.seriesLabel() ?? mark.point.label,
        value: mark.point.value,
        formatted: mark.formattedValue,
        color: mark.color,
        hatched: mark.hatched,
        detail: this.shareDetail(categoryIndex),
        y: mark.tip,
      },
    ];
  });

  private shareDetail(index: number): string | undefined {
    return this.partOfWhole()
      ? describeShare(
          this.data().map((point) => point.value),
          index,
          this.locale,
          (share) => this.intl().chart.shareOfTotal(share),
        )
      : undefined;
  }

  readonly tooltipContext = computed<ChartTooltipContext | null>(() => {
    const mark = this.marks()[this.activeMark.index()];
    if (this.tooltip() === 'none' || !mark) {
      return null;
    }

    const series = this.seriesLabel();

    return {
      category: series ? mark.point.label : '',
      entries: [
        {
          label: series ?? mark.point.label,
          value: mark.point.value,
          formatted: mark.formattedValue,
          color: mark.color,
          hatched: mark.hatched,
          detail: this.shareDetail(this.activeMark.index()),
        },
      ],
    };
  });
}
