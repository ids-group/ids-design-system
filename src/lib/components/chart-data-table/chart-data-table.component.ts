import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';

/** One row of the annex table, already formatted: the chart owns how a value reads, and two
 *  charts formatting the same number differently is a chart decision, not a table one. */
export interface ChartDataRow {
  readonly key: string;
  readonly cells: readonly string[];
}

/**
 * The annex table under a chart: the non-visual route to the numbers, and the one a reader with
 * no pointer has at all.
 *
 * Every chart drew its own `<details>`, `<summary>`, caption and `<table>` around a body that is
 * the only part that differs, so the chrome is here and the cells stay with the chart that knows
 * how to read them.
 */
@Component({
  selector: 'ds-chart-data-table',
  standalone: true,
  templateUrl: './chart-data-table.component.html',
  styleUrl: './chart-data-table.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDataTableComponent {
  readonly columns = input<readonly string[]>([]);
  readonly rows = input<readonly ChartDataRow[]>([]);

  /** The chart's own caption, reused so the table says what it is a table OF. */
  readonly caption = input<string | null>(null);

  readonly open = input(false, { transform: booleanAttribute });

  /** Renders each row's first cell as a `<th scope="row">`, for a matrix whose rows are named
   *  rather than numbered. */
  readonly rowHeader = input(false, { transform: booleanAttribute });
}
