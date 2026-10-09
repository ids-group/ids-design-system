import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithDataTable,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
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
  chartDwell,
  describeSeries,
  formatPercent,
  markAt,
  rovingMarks,
  leaveMark,
  staggerDelay,
  chartRenderGate,
  CHART_SKELETON_COUNT,
  DsChartBase,
  skeletonFunnelClips,
  skeletonMarkCount,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
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
  FUNNEL_VIEW_BOX_HEIGHT,
  FUNNEL_VIEW_BOX_WIDTH,
  funnelGeometry,
  rampPosition,
  stageDrops,
  stageCenter,
  stageGapUnits,
  stagePolygonPoints,
} from './funnel-chart.math';
import type {
  FunnelChartDrop,
  FunnelChartShape,
  FunnelChartStage,
} from './funnel-chart.types';

function formatDrop(
  fraction: number | null,
  count: number | null,
  mode: FunnelChartDrop,
  format: (value: number) => string,
  locale: string,
): string {
  if (mode === 'none' || fraction === null) {
    return '—';
  }

  return mode === 'absolute' && count !== null
    ? `−${format(Math.abs(count))}`
    : formatPercent(fraction, 1, locale);
}

@Component({
  selector: 'ds-funnel-chart',
  standalone: true,
  imports: [
    SkeletonComponent,
    ChartTooltipDirective,
    ChartStatesComponent,
    IconComponent,
    ChartDataTableComponent,
  ],
  templateUrl: './funnel-chart.component.html',
  styleUrl: './funnel-chart.component.scss',
  host: { '[class.framed]': "frameResolved() === 'auto'" },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FunnelChartComponent
  extends DsChartBase
  implements
    ChartDimmable,
    ChartStaggered,
    ChartWithDataTable,
    ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  protected readonly leaveMark = leaveMark;

  /** Drawn in the order given; stages are never sorted, since their order is the meaning. */
  readonly data = input<readonly FunnelChartStage[]>([]);

  /** What the silhouette encodes. `'area'` (default) makes each stage's area proportional to its
   *  value. `'width'` reads widths straight off the values, which collapses the tail of a steep
   *  funnel. `'taper'` encodes nothing: the shape is fixed. */
  readonly shape = input<FunnelChartShape>('area');

  /** The value, percent and drop table printed under the funnel. While on, `dataTable` is not rendered. */
  readonly showTable = input(true, { transform: booleanAttribute });

  /** The label-and-value disclosure. Ignored while `showTable` is on. Unset falls back to
   *  `DS_CONFIG.chart.dataTable`, then `'none'`. */
  readonly dataTable = input<ChartDataTable | null>(null);
  /** What the Drop column reports: `'relative'` (default) the share that leaked at this stage,
   *  `'absolute'` the count, `'none'` no column. */
  readonly drop = input<FunnelChartDrop>('relative');

  /** How many stages the loading skeleton draws before the data is known. */
  readonly skeletonCount = input(CHART_SKELETON_COUNT, {
    transform: (raw: unknown) => numberAttribute(raw, CHART_SKELETON_COUNT),
  });

  readonly dataTableResolved = this.defaults.dataTable;

  /** The stage clicked or activated with Enter or Space, whether or not `interactive` is set. */
  readonly stageClicked = output<FunnelChartStage>();

  /** Dims every OTHER mark while one is hovered or focused. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Milliseconds between one stage's entrance and the next, top to bottom; `0` turns it off. The
   *  step narrows to keep the spread within 260ms. */
  readonly staggerMs = input(60, { transform: numberAttribute });

  protected markStagger(index: number): string {
    return `${staggerDelay(index, this.stages().length, this.staggerMs())}ms`;
  }

  /** Whether a hovered or focused stage opens a tooltip. */
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

  /** Badge position as a percentage of the shape's box, not viewBox units: the svg is
   *  `preserveAspectRatio="none"` and stretches horizontally. */
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
    if (this.defaults.pinOnClick()) {
      this.activeMark.pin(index, event);
    }
  }
  protected readonly roving = rovingMarks(() => this.stages().length);

  protected onMarkFocus(index: number, event: FocusEvent): void {
    this.roving.focus(index);
    this.activeMark.enter(index, event);
  }

  private readonly rowHighlight = signal(-1);
  private readonly rowDwell = chartDwell(() => this.defaults.hoverDelayMs());

  protected onRowEnter(index: number, event: Event): void {
    this.rowDwell.schedule(index, () => this.rowHighlight.set(index), event);
    this.activeMark.enter(
      index,
      event,
      markAt(
        (event.currentTarget as Element).closest('figure'),
        index,
        '.stage',
      ),
    );
  }

  protected onRowLeave(): void {
    this.rowDwell.cancel();
    this.rowHighlight.set(-1);
    this.activeMark.leave();
  }

  protected isDimmed(index: number): boolean {
    const rowHighlight = this.rowHighlight();
    if (rowHighlight !== -1) {
      return rowHighlight !== index;
    }

    return (
      this.dimOthers() &&
      this.activeMark.index() !== -1 &&
      this.activeMark.index() !== index
    );
  }

  protected onMarkNavigation(event: KeyboardEvent, index: number): void {
    this.roving.navigate(
      event,
      index,
      (event.currentTarget as Element).closest('svg'),
    );
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
                : this.intl().chart.fellAway(entry.formattedDrop),
          },
        ],
      };
    },
  );

  protected readonly viewBox = `0 0 ${FUNNEL_VIEW_BOX_WIDTH} ${FUNNEL_VIEW_BOX_HEIGHT}`;

  /** Gap between two bands, painted as a transparent stroke on each so the gap still answers the pointer. */
  protected readonly hitGapUnits = computed(() =>
    stageGapUnits(this.data().length, FUNNEL_VIEW_BOX_HEIGHT),
  );

  protected readonly tableRows = computed<readonly ChartDataRow[]>(() =>
    this.stages().map((entry) => ({
      key: entry.stage.id,
      cells: [entry.stage.label, entry.formattedValue],
    })),
  );

  protected readonly stages = computed(() => {
    const data = this.data();
    const values = data.map((stage) => stage.value);
    const geometry = funnelGeometry(values, this.shape());
    const drops = stageDrops(values);
    const gapUnits = stageGapUnits(data.length, FUNNEL_VIEW_BOX_HEIGHT);
    const format = (value: number) =>
      this.valueFormatResolved()(value, 'tooltip');
    // A share of the funnel's mouth, not of the column total: the stages are nested subsets.
    const firstValue = values.length ? values[0] : 0;
    const lastIndex = data.length - 1;

    return data.map((stage, index) => {
      const drop = drops[index];

      return {
        stage,
        // A polygon has no centre, and its bounding box centre drifts outside a steeply tapered band.
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
        formattedPercent: formatPercent(
          stage.value,
          firstValue,
          this.defaults.locale,
        ),
        formattedDrop: formatDrop(
          drop,
          index > 0 ? values[index - 1] - stage.value : null,
          this.drop(),
          format,
          this.defaults.locale,
        ),
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
        this.intl().chart,
        this.caption() ?? this.intl().chart.title,
        this.data().map((stage) => ({
          label: stage.label,
          value: stage.value,
        })),
        (value) => this.valueFormatResolved()(value, 'tooltip'),
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

  /** The stage table's columns: stage, value, share, and the drop when it is shown. */
  protected readonly skeletonColumns = computed(() =>
    Array.from({ length: this.drop() === 'none' ? 3 : 4 }),
  );

  /** Equal stages narrowing by the same step, the funnel's shape before its numbers. */
  protected readonly skeletonStages = computed(() =>
    skeletonFunnelClips(
      skeletonMarkCount(this.data().length, this.skeletonCount()),
    ),
  );
}
