import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';

/** Cells arrive formatted: how a value reads is the chart's decision, not the table's. */
export interface ChartDataRow {
  readonly key: string;
  readonly cells: readonly string[];
}

/**
 * The annex table under a chart: the non-visual route to the numbers, and the only one a reader
 * with no pointer has.
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

  readonly caption = input<string | null>(null);

  readonly open = input(false, { transform: booleanAttribute });

  /** Renders each row's first cell as a `<th scope="row">`, for a matrix whose rows are named
   *  rather than numbered. */
  readonly rowHeader = input(false, { transform: booleanAttribute });
}
