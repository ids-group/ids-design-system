import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';

/** Cells arrive already formatted. */
export interface ChartDataRow {
  readonly key: string;
  readonly cells: readonly string[];
  /** A part of the row above (one bar's segment, one stage's drop); drawn indented and quieter. */
  readonly nested?: boolean;
}

/** The annex table under a chart: the non-visual route to the numbers. */
@Component({
  selector: 'ds-chart-data-table',
  standalone: true,
  templateUrl: './chart-data-table.component.html',
  styleUrl: './chart-data-table.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDataTableComponent {
  protected readonly intl = inject(DS_INTL);

  readonly columns = input<readonly string[]>([]);
  readonly rows = input<readonly ChartDataRow[]>([]);

  readonly caption = input<string | null>(null);

  readonly open = input(false, { transform: booleanAttribute });

  /** First cell of each row as a row header. */
  readonly rowHeader = input(false, { transform: booleanAttribute });

  /** Fires with the disclosure's state. */
  readonly toggled = output<boolean>();

  private readonly openedOnce = signal(false);
  protected readonly built = computed(() => this.open() || this.openedOnce());

  protected onToggle(open: boolean): void {
    if (open) {
      this.openedOnce.set(true);
    }
    this.toggled.emit(open);
  }
}
