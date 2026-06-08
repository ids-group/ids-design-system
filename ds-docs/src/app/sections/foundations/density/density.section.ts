import { Component, ViewEncapsulation } from '@angular/core';

interface Tier {
  readonly key: 'compact' | 'regular' | 'comfy';
  readonly label: string;
  readonly hit: string;
  readonly use: string;
  readonly wcag: string;
}

const TIERS: readonly Tier[] = [
  {
    key: 'compact',
    label: 'Compact',
    hit: '32 px',
    use: 'Power-user desktop screens with high information density (Bulk inventory matrix, Logistics grid)',
    wcag: 'Below WCAG 2.5.5 — desktop-only',
  },
  {
    key: 'regular',
    label: 'Regular (default)',
    hit: '40 px',
    use: 'The default. All non-matrix screens.',
    wcag: 'Meets WCAG 2.5.8 (24×24 minimum) with margin',
  },
  {
    key: 'comfy',
    label: 'Comfy',
    hit: '48 px',
    use: 'Field-ops on tablets / touch devices, accessibility preference',
    wcag: 'Meets WCAG 2.5.5 (44×44 enhanced)',
  },
];

@Component({
  selector: 'section-foundations-density',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-density" data-anchor="density" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Density</h2>
      <p class="lede t-m">
        Three density tiers, applied via <code class="t-mono">[data-density]</code> on a route container. They rewrite
        hit-target and component-scoped tokens — components consume the same role tokens, so no component CSS changes.
      </p>

      <!-- ============================================================ The three tiers -->
      <h3 class="block-title t-h4">The three tiers</h3>
      <table class="tbl">
        <thead>
          <tr>
            <th>Tier</th>
            <th>--hit-cozy</th>
            <th>Use case</th>
            <th>Touch / WCAG</th>
          </tr>
        </thead>
        <tbody>
          @for (t of tiers; track t.key) {
            <tr>
              <td><strong>{{ t.label }}</strong></td>
              <td><code class="t-mono">{{ t.hit }}</code></td>
              <td>{{ t.use }}</td>
              <td>{{ t.wcag }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Live comparison -->
      <h3 class="block-title t-h4">Live comparison</h3>
      <p class="block-desc t-s">
        Each sandbox wraps content in a <code class="t-mono">[data-density]</code> container. The same UI renders at
        three tiers — only the hit-target token changes.
      </p>
      <div class="dens-grid">
        @for (t of tiers; track t.key) {
          <div class="dens-sandbox" [attr.data-density]="t.key">
            <div class="dens-sandbox__head">
              <div class="t-overline">{{ t.label }}</div>
              <code class="t-mono dens-sandbox__attr">data-density="{{ t.key }}"</code>
            </div>
            <div class="dens-sandbox__body">
              <button type="button" class="dens-btn">Save changes</button>
              <input class="dens-input" type="text" placeholder="Search resources…" />
              <div class="dens-chips">
                <span class="dens-chip">Active</span>
                <span class="dens-chip">Pending</span>
                <span class="dens-chip">Failed</span>
              </div>
              <ul class="dens-list">
                <li>
                  <span class="dens-list__dot"></span>
                  <span class="dens-list__label">Project Alpha</span>
                  <span class="t-mono dens-list__meta">42</span>
                </li>
                <li>
                  <span class="dens-list__dot"></span>
                  <span class="dens-list__label">Project Beta</span>
                  <span class="t-mono dens-list__meta">18</span>
                </li>
                <li>
                  <span class="dens-list__dot"></span>
                  <span class="dens-list__label">Project Gamma</span>
                  <span class="t-mono dens-list__meta">7</span>
                </li>
              </ul>
            </div>
          </div>
        }
      </div>

      <!-- ============================================================ What density rewrites -->
      <h3 class="block-title t-h4">What density rewrites</h3>
      <ul class="dens-rewrites">
        <li>Hit targets — <code class="t-mono">--hit-cozy</code></li>
        <li>Checkbox / radio size, switch geometry</li>
        <li>Avatar default size, badge dot size, status dot size</li>
        <li>Sidenav width</li>
        <li>Segmented control button height</li>
      </ul>

      <!-- ============================================================ Choosing density -->
      <h3 class="block-title t-h4">Choosing density per screen</h3>
      <p class="block-desc t-s">
        Density is a <strong>screen-level decision</strong>, not user-global. The Tweaks panel exposes it for
        prototyping — in the product, set <code class="t-mono">[data-density]</code> on the route container, not
        on <code class="t-mono">&lt;html&gt;</code>.
      </p>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Sandbox label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tier names are short by design — no wrap needed.</span>
          </li>
          <li>
            <span class="trunc__field">Demo button label</span>
            <span class="trunc__behaviour">Inherits Button truncation — single line, ellipsis on overflow.</span>
          </li>
          <li>
            <span class="trunc__field">Demo list row</span>
            <span class="trunc__behaviour">Label single line with ellipsis; trailing meta never clips.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    /* ---------- Tiers table ---------- */
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
      vertical-align: top;
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

    /* ---------- Sandboxes ---------- */
    .dens-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .dens-sandbox {
      --hit-cozy: 40px;
      display: grid;
      gap: var(--s-3);
      padding: var(--s-4);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      background: var(--surface-default);
    }
    .dens-sandbox[data-density="compact"] { --hit-cozy: 32px; }
    .dens-sandbox[data-density="regular"] { --hit-cozy: 40px; }
    .dens-sandbox[data-density="comfy"]   { --hit-cozy: 48px; }
    .dens-sandbox__head { display: grid; gap: var(--s-0-5); }
    .dens-sandbox__attr { color: var(--text-tertiary); font-size: 11px; }
    .dens-sandbox__body { display: grid; gap: var(--s-3); }
    .dens-btn {
      height: var(--hit-cozy);
      padding: 0 var(--s-4);
      background: var(--primary);
      color: var(--neutral-0);
      border: 0;
      border-radius: var(--r-md);
      font: var(--fw-bold) var(--fs-s)/1 var(--font-sans);
      cursor: pointer;
    }
    .dens-input {
      height: var(--hit-cozy);
      padding: 0 var(--s-3);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
      background: var(--surface-default);
      font: var(--fw-regular) var(--fs-s)/1 var(--font-sans);
      color: var(--text-primary);
    }
    .dens-chips { display: flex; flex-wrap: wrap; gap: var(--s-2); }
    .dens-chip {
      display: inline-flex;
      align-items: center;
      height: calc(var(--hit-cozy) - var(--s-2));
      padding: 0 var(--s-3);
      background: var(--surface-secondary);
      border-radius: var(--r-pill);
      font: var(--fw-bold) var(--fs-xs)/1 var(--font-sans);
      color: var(--text-secondary);
    }
    .dens-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--s-1);
    }
    .dens-list li {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: var(--s-3);
      height: var(--hit-cozy);
      padding: 0 var(--s-3);
      border-radius: var(--r-sm);
      background: var(--surface-secondary);
    }
    .dens-list__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
    }
    .dens-list__label {
      font: var(--fw-regular) var(--fs-s)/1 var(--font-sans);
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dens-list__meta {
      color: var(--text-tertiary);
      font-size: 12px;
    }

    /* ---------- Rewrites list ---------- */
    .dens-rewrites {
      list-style: disc;
      padding-left: var(--s-5);
      line-height: 1.7;
      color: var(--text-secondary);
      margin-top: var(--s-3);
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
      .trunc__list li { grid-template-columns: 1fr; }
    }
  `],
})
export class DensitySection {
  protected readonly tiers = TIERS;
}
