import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  CHART_HEAT_COLORS,
  chartRenderGate,
} from '@ids-group-ltd/ids-design-system/components';
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
 * Colour carries the quantity and nothing else carries it on the plot, so every cell names its own
 * reading to assistive tech and the annex table is not optional here the way it is on the other
 * charts - WCAG 1.4.1 is not satisfied by a grid of coloured squares.
 */
@Component({
  selector: 'ds-heatmap-chart',
  standalone: true,
  exportAs: 'dsHeatmapChart',
  imports: [ChartTooltipDirective, SkeletonComponent, ChartDataTableComponent],
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
   *  a row longer than this loses its tail, a shorter one ends early. */
  readonly columns = input<readonly string[]>([]);

  /** One entry per row, each carrying one reading per column. A `null` reading is a cell that
   *  was never measured and is drawn as the surface rather than as the ramp's coldest step. */
  readonly data = input<readonly HeatmapChartRow[]>([]);

  /** Printed above the grid as the visible title. */
  readonly caption = input<string | null>(null);

  /** Pins the floor of the colour scale. It only ever OPENS the scale further, so a floor above
   *  the data cannot push a reading off the ramp. Unset, the scale starts at the lowest reading. */
  readonly min = input<number | null>(null);

  /** Pins the ceiling of the colour scale, the same way `min` pins its floor. Set both to compare
   *  two heat maps by colour: unset, each one spans its own readings and the same hue means a
   *  different quantity on each. */
  readonly max = input<number | null>(null);

  /** Prints each cell's reading inside it. Off by default: a grid dense enough to be worth a heat
   *  map has no room for the numbers, which is why the annex table is always there. */
  readonly showValues = input(false, { transform: booleanAttribute });

  /** Makes every measured cell a button. An unmeasured cell stays inert - a grid of buttons with
   *  nothing behind them is a tab trap. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Fades every cell but the one under the pointer. Off by default: the dimming costs the
   *  separation BETWEEN the dimmed cells, which on a ramp is the only thing carrying magnitude. */
  readonly dimOthers = input(false, { transform: booleanAttribute });

  /** `'auto'` draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card the
   *  page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`. */
  readonly frame = input<ChartFrame | null>(null);

  /** A skeleton at the grid's own height, so the page does not resize when the data lands. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Separate from an empty matrix: "the request failed" and "there is nothing to show" read the
   *  same and mean opposite things. */
  readonly error = input(false, { transform: booleanAttribute });

  /** Shown when there are no rows or no columns. Unset falls back to `DS_INTL.chart.empty`. */
  readonly emptyText = input<string | null>(null);

  /** Shown in place of the grid while `error` is set. Unset falls back to
   *  `DS_INTL.chart.error`. */
  readonly errorText = input<string | null>(null);

  /** Formats every reading the chart prints - the scale's two ends, each cell's accessible name
   *  and the annex table. Unset falls back to `DS_CONFIG.chart.valueFormat`. */
  readonly valueFormat = input<ChartValueFormat | null>(null);

  /** Whether a hovered or focused cell opens a tooltip. A heat map's cells carry no printed value
   *  by default, so this is where a reading is read without reaching for the annex table. */
  readonly tooltip = input<ChartItemTooltipTrigger>('item');

  /** The clicked cell, with the row and the column it sits at. Never fires for an unmeasured
   *  cell, which has no reading to drill into. */
  readonly cellClicked = output<HeatmapChartCell>();

  private readonly defaults = resolveChartDefaults(this);
  protected readonly intl = inject(DS_INTL);
  readonly frameResolved = this.defaults.frame;
  readonly emptyTextResolved = this.defaults.emptyText;
  readonly errorTextResolved = this.defaults.errorText;
  readonly valueFormatResolved = this.defaults.valueFormat;

  protected readonly activeMark = chartActiveMark(() => 0);

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

  /** The row header column has no name of its own: the corner cell above it is blank, which is
   *  what a matrix's top-left is. */
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
          color: step === null ? null : CHART_HEAT_COLORS[step],
          formattedValue,
          accessibleName: `${row.label}, ${column}: ${formattedValue}`,
        };
      }),
    }));
  });

  /** The legend under the grid: the ramp's own steps with the readings at either end, which is the
   *  only thing that says what a colour is worth. */
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
   *  are its cells rather than its rows. */
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
