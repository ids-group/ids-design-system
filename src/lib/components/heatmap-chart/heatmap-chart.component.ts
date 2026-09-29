import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  CHART_HEAT_COLORS,
  chartDwell,
  chartRenderGate,
  staggerDelay,
} from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import { ChartDataTableComponent } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import type { ChartDataRow } from '@ids-group-ltd/ids-design-system/components/chart-data-table';
import {
  ChartTooltipDirective,
  chartActiveMark,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import type {
  ChartItemTooltipTrigger,
  ChartTooltipContext,
} from '@ids-group-ltd/ids-design-system/components/chart-tooltip';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type {
  ChartFrame,
  ChartValueFormat,
} from '@ids-group-ltd/ids-design-system/core';
import { heatmapDomain, rampIndexOf } from './heatmap-chart.math';
import type { HeatmapChartCell, HeatmapChartRow } from './heatmap-chart.types';
import { resolveChartDefaults } from '@ids-group-ltd/ids-design-system/components';

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

/**
 * A matrix of readings, coloured by magnitude: depot by weekday, hour by date, queue by region.
 *
 * Colour is the only carrier of the quantity, so every cell names its own reading to assistive
 * tech and the annex table is always present (WCAG 1.4.1).
 */
@Component({
  selector: 'ds-heatmap-chart',
  standalone: true,
  exportAs: 'dsHeatmapChart',
  imports: [
    ChartTooltipDirective,
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
export class HeatmapChartComponent {
  protected readonly renderReady = chartRenderGate();

  /** The column headings, left to right. Their count decides how many readings of a row are drawn:
   *  a longer row loses its tail. */
  readonly columns = input<readonly string[]>([]);

  /** One entry per row, each carrying one reading per column. A `null` reading is drawn as the
   *  surface, not the ramp's coldest step. */
  readonly data = input<readonly HeatmapChartRow[]>([]);

  /** Printed above the grid as the visible title. */
  readonly caption = input<string | null>(null);

  /** Pins the floor of the colour scale. It only ever widens the scale, so a floor above the data
   *  cannot push a reading off the ramp. Unset, the scale starts at the lowest reading. */
  readonly min = input<number | null>(null);

  /** Pins the ceiling of the colour scale, the same way `min` pins its floor. Set both to compare
   *  two heat maps by colour; unset, each spans its own readings. */
  readonly max = input<number | null>(null);

  /** Prints each cell's reading inside it. Off by default: a dense grid has no room for numbers. */
  readonly showValues = input(false, { transform: booleanAttribute });

  /** Makes every measured cell a button. An unmeasured cell stays inert (no tab stop). */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Fades every cell but the one under the pointer. Off by default: dimming costs the separation
   *  between cells, which on a ramp carries magnitude. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** Holds the hovered cell and its tooltip in place when it is clicked, until a second click,
   *  Escape or a press outside releases it. `cellClicked` fires either way. Unset falls back to
   *  `DS_CONFIG.chart.pinOnClick`, then `true`. */
  readonly pinOnClick = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card the
   *  page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  readonly frame = input<ChartFrame | null>(null);

  /** A skeleton at the grid's own height, so the page does not resize when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Separate from an empty matrix: a failed request and no data mean different things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** Shown when there are no rows or no columns. Unset falls back to `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shown in place of the grid while `error` is set. Unset falls back to
   *  `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);

  /** Formats every reading the chart prints - the scale's two ends, each cell's accessible name
   *  and the annex table. Unset falls back to `DS_CONFIG.chart.valueFormat`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** Whether a hovered or focused cell opens a tooltip. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** Milliseconds between one column's entrance and the next, left to right; `0` turns the stagger
   *  off. The whole spread stays within 260ms, so a wide grid narrows the step. */
  readonly staggerMs = input(40, { transform: numberAttribute });

  // The stylesheet multiplies this by the column index; a table has no element holding a column.
  protected readonly columnStagger = computed(
    () => `${staggerDelay(1, this.columns().length, this.staggerMs())}ms`,
  );

  /** The clicked cell, with the row and the column it sits at. Never fires for an unmeasured
   *  cell. */
  readonly cellClicked = output<HeatmapChartCell>();

  protected readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

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
    // Enter and Space click the native button with `detail` 0; keys only focus in every other
    // chart, so they must not pin.
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
    Array.from({ length: Math.max(this.data().length, 4) }),
  );

  /** Flattened so one index addresses a cell: `chartActiveMark` counts marks, and a grid's marks
   *  are its cells. */
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
