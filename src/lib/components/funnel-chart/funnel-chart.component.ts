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
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartTooltipContext,
  ChartTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import {
  FUNNEL_VIEW_BOX_HEIGHT,
  FUNNEL_VIEW_BOX_WIDTH,
  funnelGeometry,
  rampPosition,
  stageDrops,
  stageGapUnits,
  stagePolygonPoints,
} from './funnel-chart.math';
import type { FunnelChartShape, FunnelChartStage } from './funnel-chart.types';

const defaultValueFormat = (value: number) => formatValue(value);

const SKELETON_STAGE_WIDTHS = ['88%', '62%', '80%', '54%', '72%'] as const;

@Component({
  selector: 'ds-funnel-chart',
  standalone: true,
  imports: [SkeletonComponent, ChartTooltipDirective],
  templateUrl: './funnel-chart.component.html',
  styleUrl: './funnel-chart.component.scss',
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

  readonly caption = input<string | null>(null);

  /** Accessible name. Generated from the data when omitted. */
  readonly summary = input<string | null>(null);

  /** The label-and-value disclosure every chart carries. Ignored while
   *  `showTable` is on, which already prints every label and value. */
  readonly dataTable = input<'toggle' | 'visible' | 'none'>('toggle');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyText = input<string>('No data');

  readonly error = input(false, { transform: booleanAttribute });

  readonly errorText = input<string>('Could not load the data');
  readonly valueFormat = input<(value: number) => string>(defaultValueFormat);

  /** Turns on the click affordance — the pointer cursor and any hover tint.
   *  The click output fires whether or not this is set, so a consumer that
   *  binds the output and forgets the flag still receives every click. */
  readonly interactive = input(false, { transform: booleanAttribute });

  readonly stageClicked = output<FunnelChartStage>();

  /** Milliseconds between one mark's entrance and the next. `0`, the default, is no stagger at
   *  all; `40` is the documented non-zero step. The total is capped, so a long series does not
   *  crawl in. */
  readonly staggerMs = input(0, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.staggerMs())}ms`;
  }

  /** Whether a hovered or focused stage opens a tooltip. `'axis'` is not offered — a
   *  funnel's stages are its categories, so an axis tooltip would repeat the item one. */
  readonly tooltip = input<Exclude<ChartTooltipTrigger, 'axis'>>('item');

  protected readonly tooltipTemplate =
    contentChild<TemplateRef<{ $implicit: ChartTooltipContext }>>(
      'dsChartTooltip',
    );

  protected readonly activeMark = chartActiveMark();
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
          },
        ],
      };
    },
  );

  protected readonly viewBox = `0 0 ${FUNNEL_VIEW_BOX_WIDTH} ${FUNNEL_VIEW_BOX_HEIGHT}`;

  protected readonly stages = computed(() => {
    const data = this.data();
    const values = data.map((stage) => stage.value);
    const geometry = funnelGeometry(values, this.shape());
    const drops = stageDrops(values);
    const gapUnits = stageGapUnits(data.length, FUNNEL_VIEW_BOX_HEIGHT);
    const format = this.valueFormat();
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
        this.valueFormat(),
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
    () => this.dataTable() !== 'none' && !this.showTable(),
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
