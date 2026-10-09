import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { ScatterChartComponent } from 'ds/scatter-chart';
import type { ScatterChartSeries } from 'ds/scatter-chart';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

// A deterministic pseudo-random walk, so the specimen is the same on every render and in every
// screenshot - a scatter seeded from Math.random cannot be compared against itself.
function readings(count: number, seed: number, slope: number, spread: number) {
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) % 2147483648;

    return state / 2147483648;
  };

  return Array.from({ length: count }, () => {
    const weight = 0.5 + next() * 29.5;

    return {
      x: Math.round(weight * 10) / 10,
      y: Math.round((weight * slope + (next() - 0.5) * spread) * 100) / 100,
    };
  }).sort((left, right) => left.x - right.x);
}

const PARCELS: readonly ScatterChartSeries[] = [
  { id: 'road', label: 'Road', data: readings(140, 7, 0.42, 4) },
  { id: 'air', label: 'Air', data: readings(110, 91, 0.95, 7) },
];

const ONE_SERIES: readonly ScatterChartSeries[] = [
  { id: 'road', label: 'Road', data: readings(140, 7, 0.42, 4) },
];

// Far past the plot's budget, which is what makes the decimator visible on the page rather than
// only in the gate.
const FLOOD: readonly ScatterChartSeries[] = [
  { id: 'sensor', label: 'Sensor', data: readings(12000, 13, 0.6, 9) },
];

@Component({
  selector: 'section-charts-scatter-chart',
  standalone: true,
  imports: [RouterLink, DocsSectionComponent, ScatterChartComponent],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scatter-chart.section.html',
  styleUrls: ['../../../shared/section-demo.scss'],
})
export class ScatterChartSection {
  protected readonly parcels = PARCELS;
  protected readonly oneSeries = ONE_SERIES;
  protected readonly flood = FLOOD;

  protected readonly lastClicked = signal<string>('nothing yet');

  protected onPointClicked(reading: {
    series: ScatterChartSeries;
    point: { x: number; y: number };
  }): void {
    this.lastClicked.set(
      `${reading.series.label}: ${reading.point.x} / ${reading.point.y}`,
    );
  }
}
