import { Component, ViewEncapsulation } from '@angular/core';

interface Breakpoint {
  readonly token: string;
  readonly px: number;
  readonly desc: string;
}

interface GridTier {
  readonly name: string;
  readonly range: string;
  readonly cols: number;
  readonly gutter: string;
  readonly margin: string;
  readonly cap: string;
}

interface ColumnCap {
  readonly token: string;
  readonly value: string;
  readonly use: string;
}

const BREAKPOINTS: readonly Breakpoint[] = [
  { token: '--bp-xs',  px: 480,  desc: 'Phone portrait — Team app on the go' },
  { token: '--bp-sm',  px: 640,  desc: 'Phone landscape, small tablets' },
  { token: '--bp-md',  px: 768,  desc: 'Tablet portrait — Field-ops dashboard' },
  { token: '--bp-lg',  px: 1024, desc: 'Laptop / tablet landscape — minimum producer dashboard' },
  { token: '--bp-2xl', px: 1536, desc: 'Wide desktop — Bulk inventory matrix benefits from this' },
];

const TIERS: readonly GridTier[] = [
  { name: 'Desktop wide', range: '>= 1441 px',    cols: 12, gutter: '--space-6', margin: '--space-10', cap: '1280 px' },
  { name: 'Desktop',      range: '1025-1440 px',  cols: 12, gutter: '--space-5', margin: '--space-8',  cap: 'fluid' },
  { name: 'Tablet',       range: '641-1024 px',   cols: 8,  gutter: '--space-4', margin: '--space-6',  cap: 'fluid' },
  { name: 'Mobile',       range: '<= 640 px',     cols: 4,  gutter: '--space-3', margin: '--space-4',  cap: 'fluid' },
];

const COL_CAPS: readonly ColumnCap[] = [
  { token: '--col-cap-text',    value: '720px',  use: 'Body text never exceeds this — long-form prose, descriptions' },
  { token: '--col-cap-content', value: '1280px', use: 'Page content cap at the widest tier' },
];

@Component({
  selector: 'section-foundations-layout',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-layout" data-anchor="layout" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Layout</h2>
      <p class="lede t-m">
        Five min-width breakpoint tokens, one column-count per tier, content caps for prose and page width.
        Page gutters scale with the viewport; content caps at 1280 px on the widest tier, fluid below.
      </p>

      <!-- ============================================================ Breakpoints -->
      <h3 class="block-title t-h4">Breakpoints</h3>
      <p class="block-desc t-s">
        Use them in <code class="t-mono">&#64;media</code> queries via custom-property reference (PostCSS) or copy the
        values into hand-written queries.
      </p>
      <div class="bp-list">
        @for (bp of breakpoints; track bp.token) {
          <div class="bp-row">
            <code class="t-mono bp-row__tok">{{ bp.token }}</code>
            <div class="t-s-bold bp-row__px">{{ bp.px }} px</div>
            <div class="t-s bp-row__desc">{{ bp.desc }}</div>
            <div class="bp-row__bar">
              <div class="bp-row__fill" [style.width.%]="(bp.px / 1536) * 100"></div>
            </div>
          </div>
        }
      </div>

      <!-- ============================================================ Grid -->
      <h3 class="block-title t-h4">Layout grid</h3>
      <p class="block-desc t-s">
        One column-count per breakpoint. Page gutters and margins scale with the viewport. Use these tracks for the
        primary page grid — sub-regions inherit, never invent a local grid.
      </p>
      <div class="grid-tiers">
        @for (t of tiers; track t.name) {
          <div class="grid-tier">
            <div class="grid-tier__head">
              <div class="t-overline">{{ t.name }}</div>
              <div class="t-h5">{{ t.cols }} columns</div>
              <div class="t-xs grid-tier__range">{{ t.range }}</div>
            </div>
            <div class="grid-tier__viz" [style.--cols]="t.cols">
              @for (_ of cols(t.cols); track $index) {
                <span></span>
              }
            </div>
            <dl class="grid-tier__meta">
              <dt>Gutter</dt><dd><code class="t-mono">var({{ t.gutter }})</code></dd>
              <dt>Margin</dt><dd><code class="t-mono">var({{ t.margin }})</code></dd>
              <dt>Container</dt><dd><code class="t-mono">{{ t.cap }}</code></dd>
            </dl>
          </div>
        }
      </div>

      <!-- ============================================================ Content caps -->
      <h3 class="block-title t-h4">Content caps</h3>
      <div class="cap-list">
        @for (c of colCaps; track c.token) {
          <div class="cap-row">
            <code class="t-mono cap-row__tok">{{ c.token }}</code>
            <div class="t-s-bold cap-row__val">{{ c.value }}</div>
            <div class="t-s cap-row__use">{{ c.use }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Composition rules -->
      <h3 class="block-title t-h4">Composition rules</h3>
      <ul class="rules-list">
        <li><strong>One grid per page.</strong> Sub-regions align to the same column track they inherit — never invent a local grid.</li>
        <li><strong>Snap to columns, not to pixels.</strong> Two-column splits at desktop are 8 + 4 or 6 + 6 — never 7 + 5.</li>
        <li><strong>Sidenav lives outside the grid.</strong> Reserve a fixed rail (collapsed 64 px / open 240 px), then start the grid in the remaining width.</li>
        <li><strong>Content cap.</strong> Body text never exceeds 720 px width regardless of grid — use <code class="t-mono">--col-cap-text</code>.</li>
        <li><strong>Asymmetric layouts.</strong> 8 + 4 is canonical for record-detail pages (main + meta sidebar). 9 + 3 reserved for kit / track-plan picker rails.</li>
      </ul>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Breakpoint label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Token names are short — never wrap.</span>
          </li>
          <li>
            <span class="trunc__field">Grid tier description</span>
            <span class="trunc__behaviour">Wraps to two lines max. Never clipped — the card grows vertically.</span>
          </li>
          <li>
            <span class="trunc__field">Cap row use</span>
            <span class="trunc__behaviour">Wraps freely; the row grows vertically to fit.</span>
          </li>
        </ul>
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

    /* ---------- Breakpoints list ---------- */
    .bp-list { display: grid; gap: var(--space-2); margin-top: var(--space-3); }
    .bp-row {
      display: grid;
      grid-template-columns: 120px 80px 1fr 1fr;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-sm);
    }
    .bp-row__tok { color: var(--text-secondary); font-size: 12px; }
    .bp-row__desc { color: var(--text-secondary); }
    .bp-row__bar {
      height: 8px;
      background: var(--surface-secondary);
      border-radius: var(--radius-pill);
      overflow: hidden;
    }
    .bp-row__fill { height: 100%; background: var(--primary); }

    /* ---------- Grid tiers ---------- */
    .grid-tiers {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--space-4);
      margin-top: var(--space-3);
    }
    .grid-tier {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-md);
    }
    .grid-tier__head { display: grid; gap: var(--space-0-5); }
    .grid-tier__range { color: var(--text-tertiary); }
    .grid-tier__viz {
      display: grid;
      grid-template-columns: repeat(var(--cols, 12), 1fr);
      gap: 4px;
      height: 48px;
    }
    .grid-tier__viz span {
      background: color-mix(in srgb, var(--primary) 16%, transparent);
      border-radius: var(--radius-sm);
    }
    .grid-tier__meta {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-1) var(--space-3);
      margin: 0;
    }
    .grid-tier__meta dt {
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-base) var(--font-sans);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
    }
    .grid-tier__meta dd {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-s);
    }

    /* ---------- Content caps ---------- */
    .cap-list { display: grid; gap: var(--space-2); margin-top: var(--space-3); }
    .cap-row {
      display: grid;
      grid-template-columns: 200px 80px 1fr;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-sm);
    }
    .cap-row__tok { color: var(--text-secondary); font-size: 12px; }
    .cap-row__use { color: var(--text-secondary); }

    /* ---------- Rules list ---------- */
    .rules-list {
      list-style: disc;
      padding-left: var(--space-5);
      line-height: 1.7;
      color: var(--text-secondary);
      margin-top: var(--space-3);
      max-width: var(--col-cap-text);
    }
    .rules-list li + li { margin-top: var(--space-2); }
    .rules-list strong { color: var(--text-primary); }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--space-2);
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--space-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--font-weight-bold) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }

    @media (max-width: 720px) {
      .bp-row { grid-template-columns: 1fr; }
      .cap-row { grid-template-columns: 1fr; }
      .trunc__list li { grid-template-columns: 1fr; }
    }
  `],
})
export class LayoutSection {
  protected readonly breakpoints = BREAKPOINTS;
  protected readonly tiers = TIERS;
  protected readonly colCaps = COL_CAPS;

  protected cols(n: number): readonly null[] {
    return Array.from({ length: n }, () => null);
  }
}
