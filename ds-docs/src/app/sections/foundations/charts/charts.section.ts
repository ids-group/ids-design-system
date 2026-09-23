import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { ColumnChartComponent } from 'ds/column-chart';
import type { ColumnChartPoint } from 'ds/column-chart';
import { IconComponent } from 'ds/icons';
import { SkeletonComponent } from 'ds/skeleton';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface AxisToken {
  readonly token: string;
  readonly role: string;
  readonly value: string;
}

const AXIS_TOKENS: readonly AxisToken[] = [
  {
    token: '--chart-axis-line-color',
    role: 'Axis baseline + tick lines',
    value: 'neutral-300',
  },
  {
    token: '--chart-axis-label-color',
    role: 'Tick labels',
    value: 'text-tertiary',
  },
  {
    token: '--chart-grid-line-color',
    role: 'Horizontal grid lines',
    value: 'neutral-150',
  },
  {
    token: '--chart-cursor-line-color',
    role: 'Hover cursor / crosshair',
    value: 'neutral-400',
  },
  {
    token: '--chart-tooltip-bg-color / fg',
    role: 'Tooltip surface',
    value: 'neutral-900 → neutral-0 (inverted)',
  },
  {
    token: '--chart-line-width',
    role: 'Line stroke width',
    value: '2 px (3 px bold)',
  },
  {
    token: '--chart-dot-radius',
    role: 'Data-point radius',
    value: '4 px (6 px active)',
  },
];

const CATEGORICAL = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const SEQUENTIAL = [1, 2, 3, 4, 5, 6] as const;
const DIVERGENT = [-3, -2, -1, 0, 1, 2, 3] as const;

const LINE_DATA: readonly number[] = [22, 28, 35, 31, 38, 44, 42, 48];
const LINE_LABELS: readonly string[] = [
  'Wk26',
  'Wk28',
  'Wk30',
  'Wk32',
  'Wk34',
  'Wk36',
  'Wk38',
  'Wk40',
];

interface BarRow {
  readonly label: string;
  readonly v: number;
}
const BAR_DATA: readonly BarRow[] = [
  { label: 'Alpha', v: 180 },
  { label: 'Beta', v: 220 },
  { label: 'Gamma', v: 140 },
  { label: 'Delta', v: 195 },
  { label: 'Sigma', v: 165 },
];

interface PieSeg {
  readonly label: string;
  readonly v: number;
  readonly c: string;
}
const PIE: readonly PieSeg[] = [
  { label: 'Ready', v: 64, c: 'var(--chart-categorical-1)' },
  { label: 'Pre-build', v: 22, c: 'var(--chart-categorical-2)' },
  { label: 'Out', v: 14, c: 'var(--chart-categorical-3)' },
];

interface StackRow {
  readonly label: string;
  readonly a: number;
  readonly b: number;
  readonly c: number;
}
const STACK: readonly StackRow[] = [
  { label: 'Wk 28', a: 12, b: 8, c: 5 },
  { label: 'Wk 29', a: 14, b: 9, c: 6 },
  { label: 'Wk 30', a: 18, b: 11, c: 7 },
  { label: 'Wk 31', a: 22, b: 14, c: 8 },
  { label: 'Wk 32', a: 19, b: 12, c: 6 },
];

const HEAT_ROWS: readonly string[] = [
  'LED walls',
  'Sub bass',
  'Trusses',
  'Cable runs',
  'Comms',
];
const HEAT_WEEKS: readonly string[] = [
  'Wk 28',
  'Wk 29',
  'Wk 30',
  'Wk 31',
  'Wk 32',
];
const HEAT: readonly (readonly number[])[] = [
  [-1, 0, 1, 2, 3],
  [-2, -1, 0, 1, 2],
  [-3, -2, -1, 0, 1],
  [-1, 0, 1, 1, 2],
  [0, 1, 2, 2, 3],
];

const W = 640,
  H = 240;
const PAD = { l: 32, r: 16, t: 16, b: 32 };
const innerW = W - PAD.l - PAD.r;
const innerH = H - PAD.t - PAD.b;

const LINE_MAX = 50;
const BAR_MAX = 250;
const STACK_MAX = 44;

function lineX(i: number, pointCount: number): number {
  return PAD.l + (i / (pointCount - 1)) * innerW;
}
function lineY(value: number): number {
  return PAD.t + innerH - (value / LINE_MAX) * innerH;
}
function barX(i: number, pointCount: number, barW: number): number {
  return PAD.l + ((i + 0.5) / pointCount) * innerW - barW / 2;
}
function barY(value: number): number {
  return PAD.t + innerH - (value / BAR_MAX) * innerH;
}
function barH(value: number): number {
  return (value / BAR_MAX) * innerH;
}
function stackX(i: number, pointCount: number, barW: number): number {
  return PAD.l + ((i + 0.5) / pointCount) * innerW - barW / 2;
}
function stackBarH(value: number): number {
  return (value / STACK_MAX) * innerH;
}

@Component({
  selector: 'section-foundations-charts',
  standalone: true,
  imports: [
    IconComponent,
    SkeletonComponent,
    DocsSectionComponent,
    ColumnChartComponent,
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

  protected readonly cats = CATEGORICAL;
  protected readonly seqs = SEQUENTIAL;
  protected readonly divs = DIVERGENT;
  protected readonly axisTokens = AXIS_TOKENS;
  protected readonly pie = PIE;
  protected readonly heatWeeks = HEAT_WEEKS;
  protected readonly heatRows = HEAT_ROWS;
  protected readonly heat = HEAT;

  protected readonly w = W;
  protected readonly h = H;
  protected readonly padL = PAD.l;
  protected readonly padR = PAD.r;
  protected readonly padT = PAD.t;
  protected readonly innerH = innerH;

  protected readonly gridYs = [0, 0.25, 0.5, 0.75, 1].map(
    (t) => PAD.t + t * innerH,
  );

  protected readonly yTicksLine = [0, 25, 50].map((value) => ({
    v: value,
    y: lineY(value),
  }));
  protected readonly xTicksLine = LINE_LABELS.slice(0, 6).map((label, i) => ({
    label,
    x: PAD.l + (i / 5) * innerW,
  }));
  protected readonly yTicksBar = [0, 100, 200].map((value) => ({
    v: value,
    y: barY(value),
  }));

  protected readonly barW = (innerW / BAR_DATA.length) * 0.6;
  protected readonly stackW = (innerW / STACK.length) * 0.5;

  protected readonly linePoints = computed(() =>
    LINE_DATA.map((value, i) => ({
      x: lineX(i, LINE_DATA.length),
      y: lineY(value),
    })),
  );
  protected readonly linePath = computed(() =>
    this.linePoints()
      .map((point, i) =>
        i === 0 ? `M${point.x} ${point.y}` : `L${point.x} ${point.y}`,
      )
      .join(' '),
  );

  protected readonly barRects = computed(() =>
    BAR_DATA.map((d, i) => ({
      label: d.label,
      x: barX(i, BAR_DATA.length, this.barW),
      cx: barX(i, BAR_DATA.length, this.barW) + this.barW / 2,
      y: barY(d.v),
      h: barH(d.v),
    })),
  );

  protected readonly stackBars = computed(() =>
    STACK.map((d, i) => {
      const hA = stackBarH(d.a);
      const hB = stackBarH(d.b);
      const hC = stackBarH(d.c);
      const yA = PAD.t + innerH - hA;
      const yB = yA - hB;
      const yC = yB - hC;

      return {
        label: d.label,
        x: stackX(i, STACK.length, this.stackW),
        cx: stackX(i, STACK.length, this.stackW) + this.stackW / 2,
        yA,
        hA,
        yB,
        hB,
        yC,
        hC,
      };
    }),
  );

  protected readonly pieArcs = computed(() => {
    const cx = 100,
      cy = 100,
      r = 80;
    let acc = -Math.PI / 2;

    return PIE.map((segment) => {
      const start = acc;
      const end = acc + (segment.v / 100) * 2 * Math.PI;
      acc = end;
      const x1 = cx + Math.cos(start) * r;
      const y1 = cy + Math.sin(start) * r;
      const x2 = cx + Math.cos(end) * r;
      const y2 = cy + Math.sin(end) * r;
      const large = end - start > Math.PI ? 1 : 0;

      return {
        label: segment.label,
        c: segment.c,
        d: `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      };
    });
  });

  protected divToken(value: number): string {
    if (value < 0) {
      return `var(--chart-divergent--${Math.abs(value)})`;
    }

    return `var(--chart-divergent-${value})`;
  }
}
