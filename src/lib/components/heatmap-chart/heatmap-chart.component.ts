import type {
  ChartDimmable,
  ChartStaggered,
  ChartWithTooltipTrigger,
} from '@ids-group-ltd/ids-design-system/components';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_HEAT_COLORS,
  chartDwell,
  chartRenderGate,
  leaveMark,
  staggerDelay,
  DsChartBase,
} from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import {
  ChartTooltipDirective,
  ChartStatesComponent,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { heatmapDomain, rampIndexOf } from './heatmap-chart.math';
import type { HeatmapChartCell, HeatmapChartRow } from './heatmap-chart.types';

interface PlacedCell {
  readonly key: string;
  readonly columnIndex: number;
  readonly column: string;
  readonly value: number | null;
  readonly step: number | null;
  readonly color: string | null;
  readonly formattedValue: string;
  readonly accessibleName: string;
}

interface PlacedRow {
  readonly key: string;
  readonly row: HeatmapChartRow;
  readonly cells: readonly PlacedCell[];
}

/** A matrix of readings, coloured by magnitude. Every cell names its reading to assistive tech and the annex table is always present. */
@Component({
  selector: 'ds-heatmap-chart',
  standalone: true,
  exportAs: 'dsHeatmapChart',
  imports: [
    ChartTooltipDirective,
    ChartStatesComponent,
    SkeletonComponent,
    ChartDataTableComponent,
    IconComponent,
  ],
  templateUrl: './heatmap-chart.component.html',
  styleUrl: './heatmap-chart.component.scss',
  host: {
    '[class.framed]': "frameResolved() === 'auto'",
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapChartComponent
  extends DsChartBase
  implements ChartDimmable, ChartStaggered, ChartWithTooltipTrigger
{
  protected readonly renderReady = chartRenderGate();

  protected readonly leaveMark = leaveMark;

  /** The column headings, left to right; a row longer than this loses its tail. */
  readonly columns = input<readonly string[]>([]);

  /** One entry per row, one reading per column; a `null` reading is drawn as the surface. */
  readonly data = input<readonly HeatmapChartRow[]>([]);

  /** Pins the floor of the colour scale. It only OPENS the scale further; a floor above the data
   *  is ignored. Unset, the scale starts at the lowest reading. */
  readonly min = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Pins the ceiling of the colour scale, as `min` pins the floor. */
  readonly max = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });

  /** Prints each cell's reading inside it. */
  readonly showValues = input(false, { transform: booleanAttribute });

  /** Fades every cell but the one under the pointer. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Whether a hovered or focused cell opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** Milliseconds between one column's entrance and the next; `0` turns it off. The spread is capped at 260ms. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  // The stylesheet multiplies this by the column index.
  protected readonly columnStagger = computed(
    () => `${staggerDelay(1, this.columns().length, this.staggerMs())}ms`,
  );

  /** The clicked cell, with its row and column. Never fires for an unmeasured cell. */
  readonly cellClicked = output<HeatmapChartCell>();

  protected readonly activeMark = chartActiveMark(
    () => this.defaults.tooltipLingerMs(),
    () => this.defaults.hoverDelayMs(),
  );

  /** The ramp step under the pointer on the scale; every cell outside it fades. */
  protected readonly highlightedStep = signal<number | null>(null);

  private readonly stepDwell = chartDwell(() => this.defaults.hoverDelayMs());

  protected onStepEnter(step: number, event: PointerEvent): void {
    this.stepDwell.schedule(step, () => this.highlightedStep.set(step), event);
  }

  protected onStepLeave(): void {
    this.stepDwell.cancel();
    this.highlightedStep.set(null);
  }

  protected isCellDimmed(cell: PlacedCell): boolean {
    const step = this.highlightedStep();

    return step !== null && cell.step !== step;
  }

  protected onCellPress(cell: PlacedCell, index: number, event: Event): void {
    // Enter and Space click the native button with `detail` 0; keys must not pin.
    const fromKeyboard = event instanceof MouseEvent && event.detail === 0;
    if (cell.value !== null && this.defaults.pinOnClick() && !fromKeyboard) {
      this.activeMark.pin(index, event);
    }
  }

  protected readonly isEmpty = computed(
    () => this.data().length === 0 || this.columns().length === 0,
  );

  private readonly domain = computed(() => {
    const measured = heatmapDomain(this.data());
    const askedMin = this.min();
    const askedMax = this.max();

    return {
      min:
        askedMin !== null &&
        Number.isFinite(askedMin) &&
        askedMin < measured.min
          ? askedMin
          : measured.min,
      max:
        askedMax !== null &&
        Number.isFinite(askedMax) &&
        askedMax > measured.max
          ? askedMax
          : measured.max,
    };
  });

  protected readonly tableColumns = computed<readonly string[]>(() => [
    '',
    ...this.columns(),
  ]);

  protected readonly tableRows = computed<readonly ChartDataRow[]>(() =>
    this.rows().map((entry) => ({
      key: entry.key,
      cells: [
        entry.row.label,
        ...entry.cells.map((cell) => cell.formattedValue),
      ],
    })),
  );

  protected readonly rows = computed<readonly PlacedRow[]>(() => {
    const columns = this.columns();
    const { min, max } = this.domain();
    const format = this.valueFormatResolved();

    return this.data().map((row, rowIndex) => ({
      key: row.id ?? String(rowIndex),
      row,
      cells: columns.map((column, columnIndex) => {
        const value = row.data[columnIndex] ?? null;
        const step =
          value === null
            ? null
            : rampIndexOf(value, min, max, CHART_HEAT_COLORS.length);
        const formattedValue =
          value === null
            ? this.intl().chart.noReading
            : format(value, 'tooltip');

        return {
          key: `${row.id ?? rowIndex}-${columnIndex}`,
          columnIndex,
          column,
          value,
          step,
          color: step === null ? null : CHART_HEAT_COLORS[step],
          formattedValue,
          accessibleName: `${row.label}, ${column}: ${formattedValue}`,
        };
      }),
    }));
  });

  protected readonly scaleSteps = computed(() => CHART_HEAT_COLORS);

  protected readonly scaleMinLabel = computed(() =>
    this.valueFormatResolved()(this.domain().min, 'tick'),
  );

  protected readonly scaleMaxLabel = computed(() =>
    this.valueFormatResolved()(this.domain().max, 'tick'),
  );

  protected readonly accessibleName = computed(() => {
    const summary = this.summary();
    if (summary) {
      return summary;
    }
    const caption = this.caption();
    const { min, max } = this.domain();
    const format = this.valueFormatResolved();

    return this.intl().chart.heatmapSummary(
      caption ?? this.intl().chart.heatmapTitle,
      this.data().length,
      this.columns().length,
      format(min, 'tooltip'),
      format(max, 'tooltip'),
    );
  });

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: this.data().length || 4 }),
  );

  protected readonly skeletonColumns = computed(() =>
    Array.from({ length: this.columns().length || 6 }),
  );

  /** Flattened so one index addresses a cell (`chartActiveMark` counts marks). */
  private readonly flatCells = computed(() =>
    this.rows().flatMap((row) => row.cells),
  );

  protected cellIndex(rowIndex: number, columnIndex: number): number {
    return rowIndex * this.columns().length + columnIndex;
  }

  protected readonly tooltipContext = computed<ChartTooltipContext | null>(
    () => {
      const cell = this.flatCells()[this.activeMark.index()];
      if (this.tooltip() === 'none' || !cell || cell.value === null) {
        return null;
      }

      return {
        category: cell.column,
        entries: [
          {
            label: cell.accessibleName.split(':')[0],
            value: cell.value,
            formatted: cell.formattedValue,
            color: cell.color ?? '',
          },
        ],
      };
    },
  );

  protected onCellClick(
    row: PlacedRow,
    cell: PlacedCell,
    rowIndex: number,
  ): void {
    if (cell.value === null) {
      return;
    }
    this.cellClicked.emit({
      row: row.row,
      rowIndex,
      columnIndex: cell.columnIndex,
      column: cell.column,
      value: cell.value,
    });
  }
}
