import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { IconComponent } from 'ds';

interface AxisToken {
  readonly token: string;
  readonly role: string;
  readonly value: string;
}

const AXIS_TOKENS: readonly AxisToken[] = [
  { token: '--chart-axis-line',   role: 'Axis baseline + tick lines',  value: 'neutral-300' },
  { token: '--chart-axis-label',  role: 'Tick labels',                 value: 'text-tertiary' },
  { token: '--chart-grid-line',   role: 'Horizontal grid lines',       value: 'neutral-150' },
  { token: '--chart-cursor-line', role: 'Hover cursor / crosshair',    value: 'neutral-400' },
  { token: '--chart-tooltip-bg / fg', role: 'Tooltip surface',         value: 'neutral-900 → neutral-0 (inverted)' },
  { token: '--chart-line-w',      role: 'Line stroke width',           value: '2 px (3 px bold)' },
  { token: '--chart-dot-r',       role: 'Data-point radius',           value: '4 px (6 px active)' },
];

const CATEGORICAL = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const SEQUENTIAL  = [1, 2, 3, 4, 5, 6] as const;
const DIVERGENT   = [-3, -2, -1, 0, 1, 2, 3] as const;

const LINE_DATA: readonly number[] = [22, 28, 35, 31, 38, 44, 42, 48];
const LINE_LABELS: readonly string[] = ['Wk26', 'Wk28', 'Wk30', 'Wk32', 'Wk34', 'Wk36', 'Wk38', 'Wk40'];

interface BarRow { readonly label: string; readonly v: number; }
const BAR_DATA: readonly BarRow[] = [
  { label: 'Alpha', v: 180 },
  { label: 'Beta',  v: 220 },
  { label: 'Gamma', v: 140 },
  { label: 'Delta', v: 195 },
  { label: 'Sigma', v: 165 },
];

interface DonutSeg { readonly label: string; readonly v: number; readonly c: string; }
const DONUT: readonly DonutSeg[] = [
  { label: 'Ready',     v: 64, c: 'var(--chart-cat-1)' },
  { label: 'Pre-build', v: 22, c: 'var(--chart-cat-2)' },
  { label: 'Out',       v: 14, c: 'var(--chart-cat-3)' },
];

interface StackRow { readonly label: string; readonly a: number; readonly b: number; readonly c: number; }
const STACK: readonly StackRow[] = [
  { label: 'Wk 28', a: 12, b: 8,  c: 5 },
  { label: 'Wk 29', a: 14, b: 9,  c: 6 },
  { label: 'Wk 30', a: 18, b: 11, c: 7 },
  { label: 'Wk 31', a: 22, b: 14, c: 8 },
  { label: 'Wk 32', a: 19, b: 12, c: 6 },
];

const HEAT_ROWS: readonly string[] = ['LED walls', 'Sub bass', 'Trusses', 'Cable runs', 'Comms'];
const HEAT_WEEKS: readonly string[] = ['Wk 28', 'Wk 29', 'Wk 30', 'Wk 31', 'Wk 32'];
const HEAT: readonly (readonly number[])[] = [
  [-1,  0,  1,  2,  3],
  [-2, -1,  0,  1,  2],
  [-3, -2, -1,  0,  1],
  [-1,  0,  1,  1,  2],
  [ 0,  1,  2,  2,  3],
];

const W = 640, H = 240;
const PAD = { l: 32, r: 16, t: 16, b: 32 };
const innerW = W - PAD.l - PAD.r;
const innerH = H - PAD.t - PAD.b;

const LINE_MAX = 50;
const BAR_MAX  = 250;
const STACK_MAX = 44;

function lineX(i: number, n: number): number { return PAD.l + (i / (n - 1)) * innerW; }
function lineY(v: number): number { return PAD.t + innerH - (v / LINE_MAX) * innerH; }
function barX(i: number, n: number, barW: number): number {
  return PAD.l + ((i + 0.5) / n) * innerW - barW / 2;
}
function barY(v: number): number { return PAD.t + innerH - (v / BAR_MAX) * innerH; }
function barH(v: number): number { return (v / BAR_MAX) * innerH; }
function stackX(i: number, n: number, barW: number): number {
  return PAD.l + ((i + 0.5) / n) * innerW - barW / 2;
}
function stackBarH(v: number): number { return (v / STACK_MAX) * innerH; }

@Component({
  selector: 'section-foundations-charts',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-charts" data-anchor="charts" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Charts &amp; dataviz</h2>
      <p class="lede t-m">
        Categorical, sequential and divergent palettes. Axis / grid / legend tokens.
        Five reference chart types with empty + loading states.
      </p>

      <h3 class="block-title t-h4">Categorical palette (8)</h3>
      <p class="block-desc t-s">Hand-tuned for perceptual distance, not ramp position. First six pass AA against light AND dark surface-default.</p>
      <div class="palette palette--8">
        @for (n of cats; track n) {
          <div class="swatch">
            <div class="swatch__chip" [style.background]="'var(--chart-cat-' + n + ')'"></div>
            <code class="t-mono">--chart-cat-{{ n }}</code>
          </div>
        }
      </div>

      <h3 class="block-title t-h4">Sequential ramp</h3>
      <p class="block-desc t-s">Single-hue, light → dark. Use for ordinal magnitudes (e.g. utilisation %, days-until-deadline).</p>
      <div class="palette palette--6">
        @for (n of seqs; track n) {
          <div class="swatch">
            <div class="swatch__chip" [style.background]="'var(--chart-seq-' + n + ')'"></div>
            <code class="t-mono">--chart-seq-{{ n }}</code>
          </div>
        }
      </div>

      <h3 class="block-title t-h4">Divergent ramp</h3>
      <p class="block-desc t-s">Red ← neutral → green for signed values where 0 is neutral.</p>
      <div class="palette palette--7">
        @for (n of divs; track n) {
          <div class="swatch">
            <div class="swatch__chip" [style.background]="divToken(n)"></div>
            <code class="t-mono">{{ n > 0 ? '+' + n : n }}</code>
          </div>
        }
      </div>

      <h3 class="block-title t-h4">Axis · grid · legend tokens</h3>
      <table class="tbl">
        <thead><tr><th>Token</th><th>Role</th><th>Default</th></tr></thead>
        <tbody>
          @for (t of axisTokens; track t.token) {
            <tr>
              <td><code class="t-mono">{{ t.token }}</code></td>
              <td>{{ t.role }}</td>
              <td>{{ t.value }}</td>
            </tr>
          }
        </tbody>
      </table>

      <h3 class="block-title t-h4">Reference charts</h3>

      <!-- LINE -->
      <div class="chart">
        <div class="head">
          <h4 class="title">Resource allocations / week</h4>
          <span class="sub">Q3 2026</span>
        </div>
        <svg class="svg" [attr.viewBox]="'0 0 ' + w + ' ' + h">
          <g class="grid">
            @for (t of gridYs; track $index) {
              <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="t" [attr.y2]="t" />
            }
          </g>
          <g class="axis">
            <line [attr.x1]="padL" [attr.x2]="padL" [attr.y1]="padT" [attr.y2]="padT + innerH" />
            <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="padT + innerH" [attr.y2]="padT + innerH" />
            @for (yt of yTicksLine; track yt.v) {
              <text [attr.x]="padL - 8" [attr.y]="yt.y + 4" text-anchor="end">{{ yt.v }}</text>
            }
            @for (xt of xTicksLine; track xt.label) {
              <text [attr.x]="xt.x" [attr.y]="h - 8" text-anchor="middle">{{ xt.label }}</text>
            }
          </g>
          <path [attr.d]="linePath()" fill="none" stroke="var(--chart-cat-1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          @for (p of linePoints(); track $index) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="var(--chart-cat-1)" />
          }
        </svg>
        <div class="legend">
          <span class="item">
            <span class="dot" style="background: var(--chart-cat-1)"></span>
            Allocations
          </span>
        </div>
      </div>

      <div class="grid-2">
        <!-- BAR -->
        <div class="chart">
          <div class="head">
            <h4 class="title">Kit out, by event</h4>
            <span class="sub">Aug 2026</span>
          </div>
          <svg class="svg" [attr.viewBox]="'0 0 ' + w + ' ' + h">
            <g class="grid">
              @for (t of gridYs; track $index) {
                <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="t" [attr.y2]="t" />
              }
            </g>
            <g class="axis">
              <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="padT + innerH" [attr.y2]="padT + innerH" />
              @for (yt of yTicksBar; track yt.v) {
                <text [attr.x]="padL - 8" [attr.y]="yt.y + 4" text-anchor="end">{{ yt.v }}</text>
              }
              @for (b of barRects(); track b.label) {
                <text [attr.x]="b.cx" [attr.y]="h - 8" text-anchor="middle">{{ b.label }}</text>
              }
            </g>
            @for (b of barRects(); track b.label) {
              <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="barW" [attr.height]="b.h" fill="var(--chart-cat-1)" rx="2" />
            }
          </svg>
        </div>

        <!-- DONUT -->
        <div class="chart">
          <div class="head">
            <h4 class="title">Kit register status</h4>
            <span class="sub">412 items</span>
          </div>
          <div class="donut-row">
            <svg width="200" height="200" viewBox="0 0 200 200">
              @for (a of donutArcs(); track a.label) {
                <path [attr.d]="a.d" [attr.stroke]="a.c" stroke-width="22" fill="none" />
              }
              <text x="100" y="96" text-anchor="middle" font-size="11" fill="var(--text-tertiary)" font-family="var(--font-sans)">Total</text>
              <text x="100" y="118" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text-primary)" font-family="var(--font-sans)">412</text>
            </svg>
            <div class="legend donut-legend">
              @for (s of donut; track s.label) {
                <span class="item">
                  <span class="dot" [style.background]="s.c"></span>
                  {{ s.label }} <span class="donut-pct">{{ s.v }}%</span>
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- STACKED -->
      <div class="chart">
        <div class="head">
          <h4 class="title">Kit type mix / week</h4>
        </div>
        <svg class="svg" [attr.viewBox]="'0 0 ' + w + ' ' + h">
          <g class="axis">
            <line [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="padT + innerH" [attr.y2]="padT + innerH" />
            @for (s of stackBars(); track s.label) {
              <text [attr.x]="s.cx" [attr.y]="h - 8" text-anchor="middle">{{ s.label }}</text>
            }
          </g>
          @for (s of stackBars(); track s.label) {
            <rect [attr.x]="s.x" [attr.y]="s.yA" [attr.width]="stackW" [attr.height]="s.hA" fill="var(--chart-cat-1)" />
            <rect [attr.x]="s.x" [attr.y]="s.yB" [attr.width]="stackW" [attr.height]="s.hB" fill="var(--chart-cat-2)" />
            <rect [attr.x]="s.x" [attr.y]="s.yC" [attr.width]="stackW" [attr.height]="s.hC" fill="var(--chart-cat-3)" />
          }
        </svg>
        <div class="legend">
          <span class="item"><span class="dot" style="background: var(--chart-cat-1)"></span>Audio</span>
          <span class="item"><span class="dot" style="background: var(--chart-cat-2)"></span>Lighting</span>
          <span class="item"><span class="dot" style="background: var(--chart-cat-3)"></span>Video</span>
        </div>
      </div>

      <!-- HEATMAP -->
      <div class="chart">
        <div class="head">
          <h4 class="title">Kit excess / shortage by week (divergent)</h4>
          <span class="sub">Negative = shortage · Positive = excess</span>
        </div>
        <div class="heat">
          <span></span>
          @for (w of heatWeeks; track w) {
            <span class="t-overline heat__col-h">{{ w }}</span>
          }
          @for (row of heatRows; track row; let r = $index) {
            <span class="t-s-bold heat__row-h">{{ row }}</span>
            @for (v of heat[r]; track $index) {
              <div class="heat__cell"
                   [style.background]="divToken(v)"
                   [style.color]="v <= -2 || v >= 2 ? 'var(--neutral-0)' : 'var(--text-primary)'">
                {{ v > 0 ? '+' + v : v }}
              </div>
            }
          }
        </div>
      </div>

      <h3 class="block-title t-h4">Empty &amp; loading states</h3>
      <div class="grid-2">
        <div class="chart empty">
          <div class="head"><h4 class="title">Allocations / week</h4></div>
          <div class="body">
            <div>
              <ds-icon name="chart" [size]="32" />
              <p class="empty__msg">No data for this period.<br /><span class="t-xs">Pick a different week range.</span></p>
            </div>
          </div>
        </div>
        <div class="chart">
          <div class="head">
            <h4 class="title">Allocations / week</h4>
            <span class="sub">Loading…</span>
          </div>
          <div class="skeleton"></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }

    .palette {
      display: grid;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }
    .palette--8 { grid-template-columns: repeat(8, 1fr); }
    .palette--6 { grid-template-columns: repeat(6, 1fr); }
    .palette--7 { grid-template-columns: repeat(7, 1fr); }
    .swatch { display: flex; flex-direction: column; gap: var(--space-1); }
    .swatch__chip { width: 100%; height: 56px; border-radius: var(--radius-md); }
    .swatch code { font-size: 10px; color: var(--text-tertiary); }

    .tbl {
      width: 100%;
      margin-top: var(--space-3);
      border-collapse: collapse;
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
    }
    .tbl th, .tbl td {
      text-align: left;
      padding: var(--space-3) var(--space-4);
      border-bottom: var(--border-width-default) solid var(--border-divider);
    }
    .tbl th {
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    .chart {
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);

      .head {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);
      }

      .title {
        font: var(--font-weight-bold) var(--font-size-s)/1 var(--font-sans);
        margin: 0;
      }

      .sub {
        font: var(--font-weight-regular) var(--font-size-xs)/1 var(--font-sans);
        color: var(--text-tertiary);
        margin-left: auto;
      }

      .legend {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
        font: var(--font-weight-medium) var(--font-size-xs)/1 var(--font-sans);
        color: var(--text-secondary);

        .item {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }

        .dot {
          width: var(--chart-legend-dot);
          height: var(--chart-legend-dot);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }
      }

      .svg {
        width: 100%;
        height: auto;
        display: block;

        .axis line,
        .axis path { stroke: var(--chart-axis-line); }

        .axis text {
          fill: var(--chart-axis-label);
          font: var(--font-weight-medium) var(--chart-axis-fs)/1 var(--font-sans);
        }

        .grid line { stroke: var(--chart-grid-line); }
      }

      &.empty .body {
        height: var(--chart-empty-h);
        display: grid;
        place-items: center;
        background: var(--surface-secondary);
        border-radius: var(--radius-md);
        color: var(--text-tertiary);
        font: var(--font-weight-medium) var(--font-size-s)/1.4 var(--font-sans);
        text-align: center;
      }

      .skeleton {
        height: var(--chart-skeleton-h);
        border-radius: var(--radius-md);
        background: linear-gradient(
          90deg,
          var(--surface-secondary) 0%,
          var(--neutral-150) 50%,
          var(--surface-secondary) 100%
        );
        background-size: 200% 100%;
        animation: chart-shimmer var(--duration-loop-slow) linear infinite;
      }
    }

    @keyframes chart-shimmer {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      margin-top: var(--space-4);
    }
    @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }

    .donut-row { display: flex; align-items: center; gap: var(--space-6); }
    .donut-legend { flex-direction: column; align-items: flex-start; }
    .donut-pct { color: var(--text-tertiary); margin-left: var(--space-2); }

    .heat {
      display: grid;
      grid-template-columns: 120px repeat(5, 1fr);
      gap: var(--space-1);
    }
    .heat__col-h { text-align: center; padding: var(--space-1) 0; color: var(--text-tertiary); }
    .heat__row-h { padding: var(--space-2) 0; color: var(--text-primary); }
    .heat__cell {
      height: 36px;
      border-radius: var(--radius-sm);
      display: grid;
      place-items: center;
      font: var(--font-weight-bold) 11px/1 var(--font-mono);
    }

    .empty__msg { margin: var(--space-2) 0 0; }

    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `],
})
export class ChartsSection {
  protected readonly cats = CATEGORICAL;
  protected readonly seqs = SEQUENTIAL;
  protected readonly divs = DIVERGENT;
  protected readonly axisTokens = AXIS_TOKENS;
  protected readonly donut = DONUT;
  protected readonly heatWeeks = HEAT_WEEKS;
  protected readonly heatRows = HEAT_ROWS;
  protected readonly heat = HEAT;

  protected readonly w = W;
  protected readonly h = H;
  protected readonly padL = PAD.l;
  protected readonly padR = PAD.r;
  protected readonly padT = PAD.t;
  protected readonly innerH = innerH;

  protected readonly gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD.t + t * innerH);

  protected readonly yTicksLine = [0, 25, 50].map((v) => ({ v, y: lineY(v) }));
  protected readonly xTicksLine = LINE_LABELS.slice(0, 6).map((label, i) => ({
    label,
    x: PAD.l + (i / 5) * innerW,
  }));
  protected readonly yTicksBar = [0, 100, 200].map((v) => ({ v, y: barY(v) }));

  protected readonly barW = (innerW / BAR_DATA.length) * 0.6;
  protected readonly stackW = (innerW / STACK.length) * 0.5;

  protected readonly linePoints = computed(() =>
    LINE_DATA.map((v, i) => ({ x: lineX(i, LINE_DATA.length), y: lineY(v) })),
  );
  protected readonly linePath = computed(() =>
    this.linePoints().map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(' '),
  );

  protected readonly barRects = computed(() =>
    BAR_DATA.map((d, i) => ({
      label: d.label,
      x:  barX(i, BAR_DATA.length, this.barW),
      cx: barX(i, BAR_DATA.length, this.barW) + this.barW / 2,
      y:  barY(d.v),
      h:  barH(d.v),
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
        x:  stackX(i, STACK.length, this.stackW),
        cx: stackX(i, STACK.length, this.stackW) + this.stackW / 2,
        yA, hA, yB, hB, yC, hC,
      };
    }),
  );

  protected readonly donutArcs = computed(() => {
    const cx = 100, cy = 100, r = 80;
    let acc = -Math.PI / 2;
    return DONUT.map((s) => {
      const start = acc;
      const end = acc + (s.v / 100) * 2 * Math.PI;
      acc = end;
      const x1 = cx + Math.cos(start) * r;
      const y1 = cy + Math.sin(start) * r;
      const x2 = cx + Math.cos(end)   * r;
      const y2 = cy + Math.sin(end)   * r;
      const large = end - start > Math.PI ? 1 : 0;
      return { label: s.label, c: s.c, d: `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}` };
    });
  });

  protected divToken(v: number): string {
    if (v < 0) return `var(--chart-div--${Math.abs(v)})`;
    return `var(--chart-div-${v})`;
  }
}
