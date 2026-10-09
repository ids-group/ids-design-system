import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { WaterfallChartComponent } from 'ds/waterfall-chart';
import type { WaterfallChartBar } from 'ds/waterfall-chart';
import { DocsChartDataEditorComponent } from '../../../shared/docs-chart-data-editor.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

// Deck 10's own numbers, so the page and the probe assert the same chain.
const SETTLEMENT: readonly WaterfallChartBar[] = [
  { id: 'billed', label: 'Billed', value: 1200, kind: 'total' },
  { id: 'commission', label: 'Commission', value: -320 },
  { id: 'refunds', label: 'Refunds', value: -210 },
  { id: 'adjustment', label: 'Adjustment', value: 130 },
  { id: 'net', label: 'Net', value: 0, kind: 'total' },
];

const WITH_SUBTOTAL: readonly WaterfallChartBar[] = [
  { id: 'open', label: 'Opening', value: 800, kind: 'total' },
  { id: 'new', label: 'New', value: 340 },
  { id: 'churn', label: 'Churn', value: -120 },
  { id: 'half', label: 'Half year', value: 0, kind: 'subtotal' },
  { id: 'new2', label: 'New', value: 280 },
  { id: 'churn2', label: 'Churn', value: -95 },
  { id: 'close', label: 'Closing', value: 0, kind: 'total' },
];

// A chain that crosses the baseline: the axis has to hold both signs, and the connectors have to
// stay readable where a bar hangs below zero.
const BELOW_ZERO: readonly WaterfallChartBar[] = [
  { id: 'start', label: 'Start', value: 200, kind: 'total' },
  { id: 'writeoff', label: 'Write-off', value: -450 },
  { id: 'recovery', label: 'Recovery', value: 180 },
  { id: 'end', label: 'End', value: 0, kind: 'total' },
];

@Component({
  selector: 'section-charts-waterfall-chart',
  standalone: true,
  imports: [
    RouterLink,
    DocsChartDataEditorComponent,
    DocsSectionComponent,
    WaterfallChartComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './waterfall-chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss'],
})
export class WaterfallChartSection {
  protected readonly settlement = SETTLEMENT;
  protected readonly withSubtotal = WITH_SUBTOTAL;
  protected readonly belowZero = BELOW_ZERO;
  protected readonly loadingBars =
    signal<readonly WaterfallChartBar[]>(SETTLEMENT);

  protected readonly lastClicked = signal<string>('nothing yet');

  protected onBarClicked(datum: WaterfallChartBar): void {
    this.lastClicked.set(`${datum.label}: ${datum.value}`);
  }
}
