import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/** Cells arrive formatted: how a value reads is the chart's decision, not the table's. */
export interface ChartDataRow {
  readonly key: string;
  readonly cells: readonly string[];
  /** A part of the row above rather than a row of its own - one bar's segment, one stage's drop.
   *  Drawn indented and quieter, so the nesting survives without a second table. */
  readonly nested?: boolean;
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

  /** Fires with the disclosure's state, so a chart with thousands of readings can build its rows
   *  only while they are on screen. */
  readonly toggled = output<boolean>();

  // The table is built the first time the disclosure opens and kept after that: a closed
  // `<details>` skips layout but not the DOM, and most readers never open it.
  private readonly openedOnce = signal(false);
  protected readonly built = computed(() => this.open() || this.openedOnce());

  protected onToggle(open: boolean): void {
    if (open) {
      this.openedOnce.set(true);
    }
    this.toggled.emit(open);
  }
}
