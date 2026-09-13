import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  model,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { IconButtonComponent } from 'ds/icon-button';
import { InputComponent } from 'ds/input';
import { NumberStepperComponent } from 'ds/number-stepper';

export interface ChartDataEditorRow {
  readonly label: string;
  readonly value: number;
}

// Chart figures run from nine digits down through negatives, so the stepper is bounded
// only far enough out to keep the specimens reachable.
const VALUE_BOUND = 1_000_000_000;

let nextRowId = 0;

@Component({
  selector: 'docs-chart-data-editor',
  standalone: true,
  imports: [
    ButtonComponent,
    IconButtonComponent,
    InputComponent,
    NumberStepperComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chart-data-editor' },
  templateUrl: './docs-chart-data-editor.component.html',
  styleUrl: './docs-chart-data-editor.component.scss',
})
export class DocsChartDataEditorComponent<TRow extends ChartDataEditorRow> {
  readonly rows = model.required<readonly TRow[]>();

  protected readonly valueBound = VALUE_BOUND;
  protected readonly open = signal(false);

  protected setLabel(index: number, label: string): void {
    this.patch(index, { label });
  }

  protected setValue(index: number, value: number): void {
    this.patch(index, { value });
  }

  protected removeRow(index: number): void {
    this.rows.update((rows) =>
      rows.filter((unusedRow, position) => position !== index),
    );
  }

  protected addRow(): void {
    nextRowId += 1;
    // Donut and funnel track by `id`; bar and column ignore the key entirely, so one
    // shape of added row serves all four.
    const added = {
      id: `docs-editor-row-${nextRowId}`,
      label: `Row ${nextRowId}`,
      value: 0,
    } as unknown as TRow;

    this.rows.update((rows) => [...rows, added]);
  }

  // Spread, never rebuild: `id`, `color`, `slot` and `percent` are keys the editor
  // does not show and must not drop.
  private patch(index: number, patch: Partial<ChartDataEditorRow>): void {
    this.rows.update((rows) =>
      rows.map((row, position) =>
        position === index ? ({ ...row, ...patch } as TRow) : row,
      ),
    );
  }
}
