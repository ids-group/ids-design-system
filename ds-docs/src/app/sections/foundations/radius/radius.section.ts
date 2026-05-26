import { Component, ViewEncapsulation } from '@angular/core';

interface RadiusStop {
  readonly name: string;
  readonly value: string;
  readonly desc: string;
}

const RADII: readonly RadiusStop[] = [
  { name: '0',    value: '0px',    desc: 'Squared surfaces — middle of btn-group, in-range datepicker' },
  { name: 'sm',   value: '4px',    desc: 'kbd, indeterminate-checkbox tick, link focus halo' },
  { name: 'md',   value: '8px',    desc: 'Buttons, fields, tooltips, search, segmented, tags' },
  { name: 'lg',   value: '12px',   desc: 'Menus, popovers, dropdowns, cards, modals, drawers, toasts, empty-state icons' },
  { name: '2xl',  value: '24px',   desc: 'Heroic surfaces — reserved, no current consumer' },
  { name: 'pill', value: '999px',  desc: 'Pills, status chips, switches, avatars, segmented thumb' },
];

@Component({
  selector: 'section-foundations-radius',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-radius" data-anchor="radius" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Radius</h2>
      <p class="lede t-m">
        Five-stop scale (0 / sm / md / lg / 2xl) plus pill. The xl stop was retired — cards, modals, drawers, toasts and empty-state icons all consolidated onto <code class="t-mono">--r-lg</code>. <code class="t-mono">--r-pill</code> is themable via <code class="t-mono">--r-pill-value</code>.
      </p>

      <!-- ============================================================ Radius scale -->
      <h3 class="block-title t-h4">Scale</h3>
      <p class="block-desc t-s">One tile per stop. Top-left corner is the truthful one — tiles share the same dimensions so adjacent steps stay comparable.</p>
      <div class="radius-grid">
        @for (r of radii; track r.name) {
          <div class="radius-tile" [style.borderRadius]="'var(--r-' + r.name + ')'">
            <code class="t-mono token-name">--r-{{ r.name }}</code>
            <div class="t-h5 token-px">{{ r.value }}</div>
            <div class="t-caption token-desc">{{ r.desc }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Applied examples -->
      <h3 class="block-title t-h4">Applied</h3>
      <p class="block-desc t-s">Each radius on the surface it actually shapes. Real components — no painted tiles.</p>
      <div class="applied-grid">
        <!-- r-0 — squared group middle -->
        <div class="applied-cell">
          <div class="applied-cell__stage">
            <div class="demo-group">
              <button class="demo-group__btn demo-group__btn--start">First</button>
              <button class="demo-group__btn demo-group__btn--mid">Mid</button>
              <button class="demo-group__btn demo-group__btn--end">Last</button>
            </div>
          </div>
          <div class="applied-cell__label">--r-0 · group middle</div>
        </div>

        <!-- r-sm — kbd badge -->
        <div class="applied-cell">
          <div class="applied-cell__stage">
            <kbd class="demo-kbd">⌘</kbd>
            <kbd class="demo-kbd">K</kbd>
          </div>
          <div class="applied-cell__label">--r-sm · kbd</div>
        </div>

        <!-- r-md — button -->
        <div class="applied-cell">
          <div class="applied-cell__stage">
            <button class="demo-btn">Save changes</button>
          </div>
          <div class="applied-cell__label">--r-md · button</div>
        </div>

        <!-- r-lg — card -->
        <div class="applied-cell">
          <div class="applied-cell__stage">
            <div class="demo-card">
              <div class="demo-card__head t-s-bold">Capacity</div>
              <div class="demo-card__value t-h3">84%</div>
            </div>
          </div>
          <div class="applied-cell__label">--r-lg · card</div>
        </div>

        <!-- r-2xl — heroic surface -->
        <div class="applied-cell">
          <div class="applied-cell__stage">
            <div class="demo-hero">
              <div class="t-overline" style="color:var(--text-on-brand); opacity:.7">Q3 summary</div>
              <div class="t-h4" style="color:var(--text-on-brand)">All systems green</div>
            </div>
          </div>
          <div class="applied-cell__label">--r-2xl · hero</div>
        </div>

        <!-- pill — status chip -->
        <div class="applied-cell">
          <div class="applied-cell__stage">
            <span class="demo-pill demo-pill--active">Active</span>
            <span class="demo-pill demo-pill--planning">Planning</span>
          </div>
          <div class="applied-cell__label">--r-pill · status chip</div>
        </div>
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

    /* ---------- Scale tiles ---------- */
    .radius-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--s-4);
      margin-top: var(--s-4);
    }
    .radius-tile {
      display: grid;
      gap: var(--s-1);
      padding: var(--s-5);
      min-height: 140px;
      background: var(--surface-tint);
      border: var(--bw-default) solid var(--border-default);
      color: var(--text-primary);
    }
    .token-name { font-size: 11px; color: var(--text-secondary); }
    .token-px { margin-top: var(--s-1); }
    .token-desc { color: var(--text-secondary); line-height: 1.5; }

    /* ---------- Applied examples grid ---------- */
    .applied-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--s-3);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .applied-cell {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .applied-cell__stage {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      padding: var(--s-4);
      min-height: 96px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
    }
    .applied-cell__label {
      text-align: center;
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-mono);
      color: var(--text-tertiary);
    }

    /* ---------- Demo: button-group with squared middle ---------- */
    .demo-group { display: inline-flex; }
    .demo-group__btn {
      height: 32px; padding: 0 var(--s-3);
      font: var(--fw-medium) var(--fs-s)/var(--lh-flat) var(--font-sans);
      background: var(--surface-default);
      color: var(--text-primary);
      border: var(--bw-default) solid var(--border-default);
      cursor: default;
    }
    .demo-group__btn + .demo-group__btn { margin-left: calc(var(--bw-default) * -1); }
    .demo-group__btn--start { border-top-left-radius: var(--r-md); border-bottom-left-radius: var(--r-md); }
    .demo-group__btn--mid   { border-radius: var(--r-0); }
    .demo-group__btn--end   { border-top-right-radius: var(--r-md); border-bottom-right-radius: var(--r-md); }

    /* ---------- Demo: kbd ---------- */
    .demo-kbd {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 22px;
      padding: var(--kbd-pad-y) var(--kbd-pad-x);
      font: var(--fw-medium) var(--fs-xs)/var(--lh-flat) var(--font-mono);
      color: var(--text-secondary);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-bottom-width: 2px;
      border-radius: var(--r-sm);
    }

    /* ---------- Demo: button ---------- */
    .demo-btn {
      height: 40px; padding: 0 var(--s-4);
      font: var(--fw-semibold) var(--fs-s)/var(--lh-flat) var(--font-sans);
      color: var(--text-on-brand);
      background: var(--brand);
      border: 0;
      border-radius: var(--r-md);
      cursor: default;
    }

    /* ---------- Demo: card ---------- */
    .demo-card {
      width: 160px;
      display: grid; gap: var(--s-1);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-card);
    }
    .demo-card__head { color: var(--text-secondary); }

    /* ---------- Demo: heroic surface (r-2xl) ---------- */
    .demo-hero {
      width: 100%;
      display: grid; gap: var(--s-1);
      padding: var(--s-5) var(--s-5);
      background: var(--brand);
      border-radius: var(--r-2xl);
    }

    /* ---------- Demo: pill / status chip ---------- */
    .demo-pill {
      display: inline-flex; align-items: center;
      padding: var(--s-1) var(--s-3);
      font: var(--fw-semibold) var(--fs-xs)/var(--lh-flat) var(--font-sans);
      border-radius: var(--r-pill);
    }
    .demo-pill--active {
      background: var(--status-active-bg);
      color: var(--status-active-fg);
    }
    .demo-pill--planning {
      background: var(--status-planning-bg);
      color: var(--status-planning-fg);
    }
  `],
})
export class RadiusSection {
  protected readonly radii = RADII;
}
