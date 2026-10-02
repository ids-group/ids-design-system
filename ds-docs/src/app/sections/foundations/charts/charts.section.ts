import { Component, ViewEncapsulation, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ColumnChartComponent } from 'ds/column-chart';
import type { ColumnChartPoint, ColumnChartSeries } from 'ds/column-chart';
import { HeatmapChartComponent } from 'ds/heatmap-chart';
import type { HeatmapChartRow } from 'ds/heatmap-chart';
import { LineChartComponent } from 'ds/line-chart';
import type { LineChartSeries } from 'ds/line-chart';
import { PieChartComponent } from 'ds/pie-chart';
import type { PieChartSlice } from 'ds/pie-chart';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface AxisToken {
  readonly token: string;
  readonly role: string;
  readonly value: string;
}

const AXIS_TOKENS: readonly AxisToken[] = [
  {
    token: '--ds-chart-axis-line-color',
    role: 'Axis baseline + tick lines',
    value: 'neutral-300',
  },
  {
    token: '--ds-chart-axis-label-color',
    role: 'Tick labels',
    value: 'text-tertiary',
  },
  {
    token: '--ds-chart-grid-line-color',
    role: 'Horizontal grid lines',
    value: 'neutral-150',
  },
  {
    token: '--ds-chart-cursor-line-color',
    role: 'Hover cursor / crosshair',
    value: 'neutral-400',
  },
  {
    token: '--ds-chart-tooltip-bg-color / -text-color / -border-color',
    role: 'Tooltip surface',
    value: '--tooltip-bg-color / --tooltip-text-color / --tooltip-border-color',
  },
  {
    token: '--ds-chart-line-width',
    role: 'Line stroke width',
    value: '2 px (3 px bold)',
  },
  {
    token: '--ds-chart-dot-radius',
    role: 'Data-point radius',
    value: '4 px (6 px active)',
  },
];

const EIGHT_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const SEQUENTIAL = [1, 2, 3, 4, 5, 6] as const;
const DIVERGENT = [-3, -2, -1, 0, 1, 2, 3] as const;

const WEEKS: readonly string[] = ['Wk 28', 'Wk 29', 'Wk 30', 'Wk 31', 'Wk 32'];

const ALLOCATION_SERIES: readonly LineChartSeries[] = [
  {
    id: 'allocations',
    label: 'Allocations',
    data: [22, 28, 35, 31, 38, 44, 42, 48],
  },
];

const ALLOCATION_WEEKS: readonly string[] = [
  'Wk 26',
  'Wk 28',
  'Wk 30',
  'Wk 32',
  'Wk 34',
  'Wk 36',
  'Wk 38',
  'Wk 40',
];

const EVENT_POINTS: readonly ColumnChartPoint[] = [
  { label: 'Alpha', value: 180 },
  { label: 'Beta', value: 220 },
  { label: 'Gamma', value: 140 },
  { label: 'Delta', value: 195 },
  { label: 'Sigma', value: 165 },
];

const STATUS_SLICES: readonly PieChartSlice[] = [
  { id: 'ready', label: 'Ready', value: 64 },
  { id: 'pre-build', label: 'Pre-build', value: 22 },
  { id: 'out', label: 'Out', value: 14 },
];

const MIX_SERIES: readonly ColumnChartSeries[] = [
  {
    id: 'audio',
    label: 'Audio',
    data: WEEKS.map((label, index) => ({
      label,
      value: [12, 14, 18, 22, 19][index],
    })),
  },
  {
    id: 'lighting',
    label: 'Lighting',
    data: WEEKS.map((label, index) => ({
      label,
      value: [8, 9, 11, 14, 12][index],
    })),
  },
  {
    id: 'video',
    label: 'Video',
    data: WEEKS.map((label, index) => ({
      label,
      value: [5, 6, 7, 8, 6][index],
    })),
  },
];

const SHORTAGE_ROWS: readonly HeatmapChartRow[] = [
  { id: 'screens', label: 'Screens', data: [2, 3, 4, 5, 6] },
  { id: 'speakers', label: 'Speakers', data: [1, 2, 3, 4, 5] },
  { id: 'trusses', label: 'Trusses', data: [0, 1, 2, 3, 4] },
  { id: 'cables', label: 'Cables', data: [2, 3, 4, 4, 5] },
];

@Component({
  selector: 'section-foundations-charts',
  standalone: true,
  imports: [
    DocsSectionComponent,
    ColumnChartComponent,
    HeatmapChartComponent,
    LineChartComponent,
    PieChartComponent,
    RouterLink,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './charts.section.html',
  styleUrl: './charts.section.scss',
})
export class ChartsSection {
  protected readonly frameDemoPoints = signal<readonly ColumnChartPoint[]>([
    { label: 'Jan', value: 1840 },
    { label: 'Feb', value: 2260 },
    { label: 'Mar', value: 2105 },
  ]);

  protected readonly tooltipDemoMonths = ['Jan', 'Feb', 'Mar', 'Apr'];

  protected readonly tooltipDemoSeries: readonly LineChartSeries[] = [
    { id: 'north', label: 'North', data: [42, 48, 45, 53] },
    { id: 'south', label: 'South', data: [35, 31, 38, 41] },
    { id: 'east', label: 'East', data: [22, 27, 30, 28] },
  ];

  protected readonly slots = EIGHT_SLOTS;
  protected readonly seqs = SEQUENTIAL;
  protected readonly divs = DIVERGENT;
  protected readonly axisTokens = AXIS_TOKENS;

  protected readonly weeks = WEEKS;
  protected readonly allocationWeeks = ALLOCATION_WEEKS;
  protected readonly allocationSeries = ALLOCATION_SERIES;
  protected readonly eventPoints = EVENT_POINTS;
  protected readonly statusSlices = STATUS_SLICES;
  protected readonly mixSeries = MIX_SERIES;
  protected readonly shortageRows = SHORTAGE_ROWS;
  protected readonly noPoints: readonly ColumnChartPoint[] = [];

  protected divToken(value: number): string {
    if (value < 0) {
      return `var(--chart-divergent--${Math.abs(value)})`;
    }

    return `var(--chart-divergent-${value})`;
  }
}
