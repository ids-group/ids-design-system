import { Component, ViewEncapsulation } from '@angular/core';

interface ScrollToken {
  readonly token: string;
  readonly use: string;
}

const TOKENS: readonly ScrollToken[] = [
  { token: '--scrollbar-w',            use: '10 px — global scrollbar width' },
  { token: '--scrollbar-thumb',        use: 'Thumb at rest (neutral-300 light / neutral-600 dark)' },
  { token: '--scrollbar-thumb-hover',  use: 'Thumb on hover (neutral-400)' },
  { token: '--scrollbar-thumb-active', use: 'Thumb while dragging (neutral-500)' },
];

@Component({
  selector: 'section-foundations-scrollbar',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-scrollbar" data-anchor="scrollbar" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Scrollbar</h2>
      <p class="lede t-m">
        System chrome the user touches every minute — has to feel like part of the product, not the OS. The global
        scrollbar styling is auto-applied (forwarded into <code class="t-mono">ds.scss</code>); no per-component opt-in is
        needed.
      </p>

      <!-- ============================================================ Live demo -->
      <h3 class="block-title t-h4">Live demo</h3>
      <p class="block-desc t-s">Drag the thumb in either pane below. Vertical scroll on the left, horizontal on the right.</p>
      <div class="demo-grid">
        <div class="scroll-pane scroll-pane--vertical">
          @for (row of rows; track row) {
            <div class="scroll-pane__row">
              <code class="t-mono scroll-pane__num">{{ pad(row) }}</code>
              <span class="scroll-pane__txt">Scrollable content row — drag the thumb to test feel.</span>
            </div>
          }
        </div>
        <div class="scroll-pane scroll-pane--horizontal">
          <div class="hwide">
            @for (col of cols; track col) {
              <div class="hcol">
                <div class="t-overline">Col {{ col }}</div>
                <div class="t-s">Wide content keeps the horizontal scrollbar visible. Drag to test.</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ============================================================ Tokens -->
      <h3 class="block-title t-h4">Tokens</h3>
      <table class="tbl">
        <thead>
          <tr><th>Token</th><th>Use</th></tr>
        </thead>
        <tbody>
          @for (t of tokens; track t.token) {
            <tr>
              <td><code class="t-mono">{{ t.token }}</code></td>
              <td>{{ t.use }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Specification -->
      <h3 class="block-title t-h4">Specification</h3>
      <dl class="spec">
        <dt>Width</dt>
        <dd>10 px (<code class="t-mono">--scrollbar-w</code>)</dd>
        <dt>Track</dt>
        <dd>Transparent at rest; <code class="t-mono">--surface-subtle</code> on hover</dd>
        <dt>Thumb</dt>
        <dd><code class="t-mono">--neutral-300</code>; hover <code class="t-mono">--neutral-400</code>; active <code class="t-mono">--neutral-500</code></dd>
        <dt>Radius</dt>
        <dd><code class="t-mono">--r-pill</code> on the thumb</dd>
        <dt>Reveal</dt>
        <dd>Overlay where supported (macOS); fallback to inline 10 px gutter on Windows / Linux</dd>
        <dt>Dark mode</dt>
        <dd>Track <code class="t-mono">--neutral-800</code>; thumb <code class="t-mono">--neutral-600</code></dd>
      </dl>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Scroll-pane content</span>
            <span class="trunc__behaviour">Never clipped horizontally — the pane scrolls instead. Rows wrap inside the pane.</span>
          </li>
          <li>
            <span class="trunc__field">Row label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Long labels truncate before causing horizontal scroll inside a vertical pane.</span>
          </li>
          <li>
            <span class="trunc__field">Horizontal column</span>
            <span class="trunc__behaviour">Fixed width; pane scrolls horizontally to reveal more columns.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    /* ---------- Demo panes ---------- */
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .scroll-pane {
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      padding: var(--s-3);
    }
    .scroll-pane--vertical {
      max-height: 320px;
      overflow-y: auto;
    }
    .scroll-pane--horizontal {
      overflow-x: auto;
    }
    .scroll-pane__row {
      display: grid;
      grid-template-columns: 40px 1fr;
      gap: var(--s-3);
      padding: var(--s-2) 0;
      border-bottom: var(--bw-default) solid var(--border-divider);
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
    }
    .scroll-pane__row:last-child { border-bottom: 0; }
    .scroll-pane__num { color: var(--text-tertiary); }
    .scroll-pane__txt {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .hwide {
      display: flex;
      gap: var(--s-3);
      width: max-content;
    }
    .hcol {
      width: 220px;
      display: grid;
      gap: var(--s-1);
      padding: var(--s-3);
      background: var(--surface-secondary);
      border-radius: var(--r-sm);
    }

    /* ---------- Tokens table ---------- */
    .tbl {
      width: 100%;
      margin-top: var(--s-3);
      border-collapse: separate;
      border-spacing: 0;
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      overflow: hidden;
      background: var(--surface-default);
    }
    .tbl th,
    .tbl td {
      padding: var(--s-3) var(--s-4);
      text-align: left;
      border-bottom: var(--bw-default) solid var(--border-divider);
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
    }
    .tbl th {
      background: var(--surface-secondary);
      font-weight: var(--fw-bold);
      color: var(--text-secondary);
      font-size: var(--fs-xs);
      text-transform: uppercase;
      letter-spacing: var(--ls-wider);
    }
    .tbl tr:last-child td { border-bottom: 0; }

    /* ---------- Spec list ---------- */
    .spec {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: var(--s-2) var(--s-4);
      margin-top: var(--s-3);
      max-width: var(--col-cap-text);
    }
    .spec dt {
      font: var(--fw-bold) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }
    .spec dd {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--fs-s);
    }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--s-2);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--s-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--s-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--fw-bold) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }

    @media (max-width: 720px) {
      .demo-grid { grid-template-columns: 1fr; }
      .spec { grid-template-columns: 1fr; }
      .trunc__list li { grid-template-columns: 1fr; }
    }
  `],
})
export class ScrollbarSection {
  protected readonly tokens = TOKENS;
  protected readonly rows = Array.from({ length: 30 }, (_, i) => i + 1);
  protected readonly cols = Array.from({ length: 12 }, (_, i) => i + 1);

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
