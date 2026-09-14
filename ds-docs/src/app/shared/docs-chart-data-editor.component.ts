import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  model,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { IconButtonComponent } from 'ds/icon-button';
import { InputComponent } from 'ds/input';
import { NumberStepperComponent } from 'ds/number-stepper';
import { replayMarks } from './replay-marks';

export interface ChartDataEditorRow {
  readonly label: string;
  readonly value: number;
}

// Chart figures run from nine digits down through negatives, so the stepper is bounded
// only far enough out to keep the specimens reachable.
const VALUE_BOUND = 1_000_000_000;

let nextRowId = 0;

// A step of 1 is invisible on a nine-digit value, so the exponent drops one below the magnitude.
function magnitudeStep(magnitude: number): number {
  if (!Number.isFinite(magnitude) || Math.abs(magnitude) < 100) {
    return 1;
  }

  return 10 ** (Math.floor(Math.log10(Math.abs(magnitude))) - 1);
}

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

  protected replay(): void {
    replayMarks(this.rows);
  }

  protected setLabel(index: number, label: string): void {
    this.patch(index, { label });
  }

  protected setValue(index: number, value: number): void {
    this.patch(index, { value });
  }

  // Zero carries no magnitude of its own, so it borrows the series' — otherwise a fresh row in a
  // chart of thousands steps by 1 and the stepper looks broken.
  protected stepFor(value: number): number {
    return magnitudeStep(value || this.typicalMagnitude());
  }

  protected removeRow(index: number): void {
    this.rows.update((rows) =>
      rows.filter((unusedRow, position) => position !== index),
    );
  }

  protected addRow(): void {
    nextRowId += 1;
    const magnitude = this.typicalMagnitude();
    const step = magnitudeStep(magnitude);
    // Donut and funnel track by `id`; bar and column ignore the key entirely, so one
    // shape of added row serves all four.
    const added = {
      id: `docs-editor-row-${nextRowId}`,
      label: `Row ${nextRowId}`,
      value: Math.round(magnitude / step) * step,
    } as unknown as TRow;

    this.rows.update((rows) => [...rows, added]);
  }

  private readonly typicalMagnitude = computed(() => {
    const magnitudes = this.rows()
      .map((row) => Math.abs(row.value))
      .filter((magnitude) => Number.isFinite(magnitude) && magnitude > 0)
      .sort((left, right) => left - right);

    return magnitudes.length === 0
      ? 0
      : magnitudes[Math.floor(magnitudes.length / 2)];
  });

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
