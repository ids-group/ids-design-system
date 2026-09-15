import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_RAMP_COLORS,
  chartColors,
  describeSeries,
  formatPercent,
  focusMark,
  formatValue,
  nextRovingIndex,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
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
  FUNNEL_VIEW_BOX_HEIGHT,
  FUNNEL_VIEW_BOX_WIDTH,
  funnelGeometry,
  rampPosition,
  stageDrops,
  stageCenter,
  stageGapUnits,
  stagePolygonPoints,
} from './funnel-chart.math';
import type { FunnelChartShape, FunnelChartStage } from './funnel-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

const SKELETON_STAGE_WIDTHS = ['88%', '62%', '80%', '54%', '72%'] as const;

@Component({
  selector: 'ds-funnel-chart',
  standalone: true,
  imports: [SkeletonComponent, ChartTooltipDirective, IconComponent],
  templateUrl: './funnel-chart.component.html',
  styleUrl: './funnel-chart.component.scss',
  host: { '[class.framed]': "frameResolved() === 'auto'" },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FunnelChartComponent {
  /** Drawn in the order given. The order of a funnel's stages is its meaning,
   *  so they are never sorted. */
  readonly data = input.required<readonly FunnelChartStage[]>();

  /** What the silhouette encodes. `'area'`, the default, makes each stage's AREA proportional to
   *  its value, which is the honest encoding that still leaves a tail wide enough to label.
   *  `'width'` reads the widths straight off the values, which collapses the tail of a steep
   *  funnel below a labellable width. `'taper'` encodes NOTHING: the shape is fixed whatever the
   *  data, and the numbers are read from the table beside it. */
  readonly shape = input<FunnelChartShape>('area');

  /** The value, percent and drop table printed under the funnel. It supersedes
   *  `dataTable`: while this is on, the disclosure every chart carries would
   *  repeat a strict subset of these same numbers, so it is not rendered. */
  readonly showTable = input(true, { transform: booleanAttribute });

  /** Whether the chart draws its own bordered, padded box. `'auto'`, the default, draws it;
   *  `'none'` leaves the chart bare, for one placed inside a card the page has already drawn.
   *  Unset falls back to `DS_CONFIG.chart.frame`, then `'auto'` — whether charts live inside cards
   *  is one decision per app rather than per plot. */
  readonly frame = input<ChartFrame | null>(null);
  /** Printed above the plot as the chart's visible title, and reused as the annex table's
   *  caption. */
  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** The label-and-value disclosure every chart carries. Ignored while `showTable` is on, which
   *  already prints every label and value. Unset falls back to `DS_CONFIG.chart.dataTable`, then
   *  `'toggle'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** Draws skeleton marks in place of the data, at the same count, so the chart does not resize
   *  when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shown in place of the plot when `data` is empty. Unset falls back to
   *  `DS_CONFIG.chart.emptyText`, then `'No data'`. */
  readonly emptyText = input<string | null>(null);

  /** Shows `errorText` in place of the plot. Separate from `loading` and from an empty `data`,
   *  because "the request failed" and "there is nothing to show" read the same to a reader and
   *  mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** The message the error state prints. Unset falls back to `DS_CONFIG.chart.errorText`, then
   *  `'Could not load the data'`. */
  readonly errorText = input<string | null>(null);
  /** Formats every value the chart prints, the annex table and the generated description
   *  included. Unset falls back to `DS_CONFIG.chart.valueFormat`, then the browser's locale
   *  grouping with a K/M/B suffix past four digits. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  readonly frameResolved = resolveWithConfig(
    this.frame,
    (config) => config.chart?.frame,
    'auto' as ChartFrame,
  );
  readonly dataTableResolved = resolveWithConfig(
    this.dataTable,
    (config) => config.chart?.dataTable,
    'none' as ChartDataTable,
  );
  readonly emptyTextResolved = resolveWithConfig(
    this.emptyText,
    (config) => config.chart?.emptyText,
    'No data',
  );
  readonly errorTextResolved = resolveWithConfig(
    this.errorText,
    (config) => config.chart?.errorText,
    'Could not load the data',
  );
  readonly valueFormatResolved = resolveWithConfig(
    this.valueFormat,
    (config) => config.chart?.valueFormat,
    defaultValueFormat as ChartValueFormat,
  );

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** The stage that was clicked, or activated with Enter or Space. Fires whether or not
   *  `interactive` is set. */
  readonly stageClicked = output<FunnelChartStage>();

  /** Holds the hovered mark and its tooltip in place when it is clicked, until Escape or a press
   *  outside releases it. Off by default: a click is already the drill-down hook, and a mark left
   *  lit after the pointer has gone needs a reader who knows why it is lit. `stageClicked` fires
   *  either way — pinning is a state, not a handler. */
  readonly pinOnClick = input(false, { transform: booleanAttribute });

  /** Dims every OTHER mark while one is hovered or focused, so the reader's eye is held on the
   *  one under the pointer. Off by default: the dimming costs the separation BETWEEN the dimmed
   *  marks — measured 2026-09-13, the worst pair of three dimmed series falls from dE 14.8 at full
   *  opacity to 2.1 at `--ds-chart-dim-opacity`'s default 0.3 — so it buys loudness for one mark
   *  and pays for it with the rest of the chart. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at
   *  all; `40` is the documented non-zero step. The total is capped, so a long series does not
   *  crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  /** Whether a hovered or focused stage opens a tooltip. `'axis'` is not offered — a
   *  funnel's stages are its categories, so an axis tooltip would repeat the item one. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  protected readonly activeMark = chartActiveMark();

  /** Where the badge goes, as a percentage of the shape's box. Percentages rather than viewBox
   *  units because this svg is `preserveAspectRatio="none"`: it stretches horizontally with the
   *  card, and anything measured in user units stretches with it. */
  protected readonly pinnedCenter = computed(() => {
    const entry = this.stages()[this.activeMark.index()];
    if (!this.activeMark.pinned() || !entry) {
      return null;
    }

    return {
      xPercent: (entry.center.x / FUNNEL_VIEW_BOX_WIDTH) * 100,
      yPercent: (entry.center.y / FUNNEL_VIEW_BOX_HEIGHT) * 100,
    };
  });

  protected onMarkClick(
    payload: FunnelChartStage,
    index: number,
    event: Event,
  ): void {
    this.stageClicked.emit(payload);
    if (this.pinOnClick()) {
      this.activeMark.pin(index, event);
    }
  }
  /** One tab stop per chart, not one per mark: WCAG 2.1.1's Understanding is explicit that not
   *  every mouse-operable control has to be separately focusable, and that is what keeps a
   *  twenty-five mark chart from being twenty-five stops in the page's tab order. */
  protected readonly rovingIndex = signal(0);

  protected readonly tabStopIndex = computed(() =>
    Math.min(this.rovingIndex(), Math.max(0, this.stages().length - 1)),
  );

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.rovingIndex.set(index);
    this.activeMark.enter(index, event);
  }

  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    const next = nextRovingIndex(event.key, index, this.stages().length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    this.rovingIndex.set(next);
    focusMark((event.currentTarget as Element).closest('svg'), next);
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const entry = this.stages()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !entry) {
        return null;
      }

      return {
        category: '',
        entries: [
          {
            label: entry.stage.label,
            value: entry.stage.value,
            formatted: `${entry.formattedValue} · ${entry.formattedPercent}`,
            color: entry.color,
            detail:
              entry.formattedDrop === '—'
                ? ''
                : `${entry.formattedDrop} fell away since the stage above`,
          },
        ],
      };
    },
  );

  protected readonly viewBox = `0 0 ${FUNNEL_VIEW_BOX_WIDTH} ${FUNNEL_VIEW_BOX_HEIGHT}`;

  /** The gap between two bands, painted as a TRANSPARENT STROKE on each. A stroke straddles the
   *  edge it is drawn on, so each band claims half the gap above it and half below — the gap stays
   *  exactly as wide to the eye and stops being dead space to the pointer. */
  protected readonly hitGapUnits = computed(() =>
    stageGapUnits(this.data().length, FUNNEL_VIEW_BOX_HEIGHT),
  );

  protected readonly stages = computed(() => {
    const data = this.data();
    const values = data.map((stage) => stage.value);
    const geometry = funnelGeometry(values, this.shape());
    const drops = stageDrops(values);
    const gapUnits = stageGapUnits(data.length, FUNNEL_VIEW_BOX_HEIGHT);
    const format = this.valueFormatResolved();
    // Every stage is a share of the funnel's mouth, not of the column total:
    // the stages are nested subsets, so they do not add up to 100%.
    const firstValue = values.length ? values[0] : 0;
    // The stages are one quantity draining, not eight categories, so they take a
    // single-hue ramp. The last one is the outcome the funnel is read for, so it
    // leaves the ramp and takes the accent.
    const lastIndex = data.length - 1;

    return data.map((stage, index) => {
      const drop = drops[index];

      return {
        stage,
        // The middle of the band, for the marker that says this one is held. A polygon has no
        // centre of its own, and its bounding box centre drifts outside a steeply tapered band.
        center: stageCenter(
          geometry[index],
          FUNNEL_VIEW_BOX_WIDTH,
          FUNNEL_VIEW_BOX_HEIGHT,
        ),
        points: stagePolygonPoints(
          geometry[index],
          FUNNEL_VIEW_BOX_WIDTH,
          FUNNEL_VIEW_BOX_HEIGHT,
          gapUnits,
        ),
        formattedValue: format(stage.value),
        formattedPercent: formatPercent(stage.value, firstValue),
        formattedDrop: drop === null ? '—' : formatPercent(drop, 1),
        color:
          index === lastIndex
            ? chartColors.seriesAccent
            : CHART_RAMP_COLORS[
                rampPosition(index, lastIndex, CHART_RAMP_COLORS.length)
              ],
      };
    });
  });

  protected readonly accessibleName = computed(
    () =>
      this.summary() ??
      describeSeries(
        this.caption() ?? 'Chart',
        this.data().map((stage) => ({
          label: stage.label,
          value: stage.value,
        })),
        this.valueFormatResolved(),
        this.showTable() || this.dataTableResolved() !== 'none',
      ),
  );

  protected entryLabel(entry: {
    stage: FunnelChartStage;
    formattedValue: string;
  }): string {
    return `${entry.stage.label}, ${entry.formattedValue}`;
  }

  protected onStageKey(stage: FunnelChartStage, event: Event): void {
    // A key pressed on a control inside the stage belongs to that control.
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.stageClicked.emit(stage);
  }

  protected readonly isEmpty = computed(() => this.data().length === 0);

  protected readonly showDataTable = computed(
    () => this.dataTableResolved() !== 'none' && !this.showTable(),
  );

  protected readonly chartHeight = computed(
    () =>
      `calc(var(--_funnel-chart-stage-height) * ${Math.max(this.data().length, 1)})`,
  );

  /** Placeholder stage widths while loading. The count follows the real stage
   *  count so the chart does not resize when the data lands, falling back to
   *  three when `data` is still empty. The widths vary — and deliberately do
   *  not narrow in order — because a column of equal full-width bars is
   *  indistinguishable from a funnel whose stages have all gone grey, and a
   *  narrowing one just reads as the funnel itself. Same reasoning as the
   *  table's skeleton rows. */
  protected readonly skeletonStages = computed(() =>
    Array.from(
      { length: Math.max(this.data().length, 3) },
      (unusedEntry, index) =>
        SKELETON_STAGE_WIDTHS[index % SKELETON_STAGE_WIDTHS.length],
    ),
  );
}
