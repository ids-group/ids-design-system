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
  CHART_TOOLTIP_LINGER_MS,
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

/** Distance from a mark's tip to its value label's baseline. */
const VALUE_LABEL_GAP = 8;
// The printed value's cap height at `--font-size-xs`.
const VALUE_LABEL_HEIGHT = 10;

/** Blank at a stacked segment's lower end: a background-colour gap, not a drawn rule (which vanishes in print). */
const STACK_SEGMENT_GAP = 2;

let nextSeriesId = 0;

/**
 * One column per datum, drawn against the scales `ds-chart` supplies.
 *
 * Hosted on a `<g>`: an element SVG does not know renders nothing, nor do its descendants. Written
 * as `<svg:g dsColumnSeries>`.
 */
@Component({
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

  protected readonly scales = inject(CHART_SCALES);
  private readonly host = inject<ElementRef<Element>>(ElementRef);
  private readonly locale = injectDsLocale();
  protected readonly intl = inject(DS_INTL);

  /** Not `input.required`: the preset reads `tooltipContext()` from a binding on this same element,
   *  and a required input throws NG0950 before its value is written. */
  readonly data = input<readonly ColumnSeriesPoint[]>([]);

  /** Prints each column's value above the column. */
  readonly showValues = input(true, { transform: booleanAttribute });

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

  /** Fades every mark but the one under the pointer. Off by default: it costs separation between the rest. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next, narrowed to fit 260ms. `0` is no stagger. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  /** Declares the marks are parts of one whole; each mark's share then appears on the tooltip's second line. */
  readonly partOfWhole = input(false, { transform: booleanAttribute });

  /** Whether a hovered or focused column opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** Where the tooltip is pinned: `'mark'` is the column, `'cell'` the full-height category cell (panel at the plot top). */
  readonly tooltipAnchor = input<'mark' | 'cell'>('mark');

  /** Milliseconds the panel survives the pointer leaving the mark. */
  readonly tooltipLingerMs = input(CHART_TOOLTIP_LINGER_MS, {
    transform: numberAttribute,
  });

  /** Formats every value this series prints: `'tick'` for an axis label, `'tooltip'` for a value in full. */
  readonly valueFormat = input<ChartValueFormat>(
    chartValueFormat(injectDsLocale()),
  );

  /** The mark's share of its category slot before the maximum width caps it. Measured off the slot,
   *  not `bandWidth()`, whose padding is already taken out (both would narrow columns twice). */
  readonly columnWidthRatio = input(0.8, { transform: numberAttribute });

  /** This series' position among the slots a category's band is divided into. */
  readonly slot = input(0, { transform: numberAttribute });

  /** How many slots the band is divided into: the series drawn side by side. */
  readonly slotCount = input(1, { transform: numberAttribute });

  /** Where each mark starts and ends on the value axis, one entry per point. Unset, marks run from zero. */
  readonly offsets = input<readonly ChartStackOffset[] | null>(null);

  /** The only series in its slot, as a waterfall's floating bars are: each answers the pointer over the whole plot height. */
  readonly soleSeries = input(false, { transform: booleanAttribute });

  /** Which value axis the columns are measured against; `'secondary'` reads the second axis. */
  readonly axis = input<ChartAxis>('primary');

  /** One colour for the whole series. Unset, each mark takes the categorical palette by position;
   *  a point's own colour wins. */
  readonly seriesColor = input<string | null>(null);

  /** `seriesColor` for the fill pattern. A point's own `fill` wins. */
  readonly seriesFill = input<'solid' | 'hatched' | null>(null);

  /** Names the series in the tooltip, making the category the panel's heading. */
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

  /** Per instance: otherwise every hatched mark takes the first chart's `<pattern>` colour. */
  protected readonly hatchId = `ds-column-hatch-${this.seriesId}`;

  /** Where each mark spans, which the axis has to hold: a stacked segment's top is the running total. */
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
    this.scales.reportTooltip(this.domainId, {
      context: this.tooltipContext,
      origin: computed(() => this.activeMark.origin()),
      pinned: this.activeMark.pinned,
      offersTooltip: computed(() => this.tooltip() !== 'none'),
      stacked: computed(() => this.offsets() !== null),
      axisOrigin: computed(() => {
        const categoryIndex = this.scales.activeIndex();

        return categoryIndex < 0
          ? null
          : (this.barElements()[categoryIndex]?.nativeElement ?? null);
      }),
      axisEntries: this.axisEntries,
      axisPointElements: this.axisPointElements,
    });
    const host = this.host;
    listenForMarkFocus(
      host,
      (event, hit) => this.onMarkFocus(event, hit),
      () => {
        this.activeMark.leave();
        if (this.scales.cursorOn?.()) {
          this.scales.setActiveIndex(-1);
        }
      },
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

  ngOnDestroy(): void {
    this.scales.releaseTooltip(this.domainId);
    this.scales.releaseDomain(this.domainId);
  }

  readonly activeMark = chartActiveMark(
    () => this.tooltipLingerMs(),
    () => this.scales.hoverDelayMs?.() ?? 0,
  );

  private readonly barElements = viewChildren<ElementRef<Element>>('barEl');

  /** One series' slot inside a category's band: the whole band, or a share per series when grouped. The pointer box is sized from it. */
  private readonly slotStep = computed(() => {
    const count = this.data().length;
    const slots = Math.max(1, this.slotCount());

    return count > 0 ? this.scales.plot().width / count / slots : 0;
  });

  protected readonly slotStepPx = computed(() => `${this.slotStep()}px`);

  protected readonly markWidthPx = computed(
    () => `${this.slotStep() * this.columnWidthRatio()}px`,
  );

  /** The whole canvas, reserved end included: falling short leaves a strip under the plot that answers no pointer. */
  protected readonly hitHeight = computed(() => {
    const plot = this.scales.plot();

    return chartViewHeight(plot.height, plot.top, true);
  });

  /** Stacked series overlap, so a stacked mark catches the pointer over its own segment only. */
  protected readonly stacked = computed(
    () => this.offsets() !== null && !this.soleSeries(),
  );

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
      // Only a segment with one under it gives up the gap; the baseline segment would lift the stack off the axis.
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
        pinY: this.pinYOf(tip, baseline, below),
        origin: below ? 'top' : 'bottom',
        formattedValue: format(point.value, 'tooltip'),
        color,
        hatched: (point.fill ?? this.seriesFill()) === 'hatched',
      };
    });
  });

  /** Inside the column's top when it holds the disc - the panel opens there - and over the column
   *  and its printed value when it is too short, so the disc never crosses the baseline. */
  private pinYOf(tip: number, baseline: number, below: boolean): number {
    const inset = CHART_PIN_RADIUS + CHART_PIN_GAP;
    const top = Math.min(tip, baseline);
    if (Math.abs(tip - baseline) >= 2 * inset) {
      return top + inset;
    }
    const value =
      this.showValues() && !below ? VALUE_LABEL_GAP + VALUE_LABEL_HEIGHT : 0;

    return top - value - inset;
  }

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
    if (this.scales.cursorOn?.()) {
      this.scales.setActiveIndex(hit.index);
    }
    this.activeMark.enter(hit.index, event, this.tooltipMark(), hit.element);
  }

  protected onMarkKey(event: KeyboardEvent): void {
    const hit = markOf(event);
    if (!hit) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // A key pressed on a control inside belongs to that control.
      const mark = this.marks()[hit.index];
      if (this.interactive() && event.target === hit.element && mark) {
        event.preventDefault();
        this.pointClicked.emit(mark.point);
      }

      return;
    }
    // The category cursor's `ds-chart` owns the other keys.
    if (this.scales.cursorOn?.()) {
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

  /** This series' reading at the cursor's category, filled whatever `tooltip` says; feeds only the container's category panel. */
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

  readonly axisPointElements = computed<readonly (Element | null)[]>(() =>
    this.axisEntries().length === 0
      ? []
      : [
          this.host.nativeElement.querySelector(
            `.columns [data-mark-index="${this.scales.activeIndex()}"]`,
          ),
        ],
  );

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
