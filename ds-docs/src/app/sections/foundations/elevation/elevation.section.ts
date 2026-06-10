import { Component, ViewEncapsulation } from '@angular/core';

interface ShadowTier {
  readonly name: string;
  readonly value: string;
  readonly desc: string;
}

interface AppliedDemo {
  readonly token: string;
  readonly label: string;
  readonly desc: string;
  readonly stage: 'card' | 'popover' | 'toast' | 'modal';
}

interface TruncRow {
  readonly field: string;
  readonly behaviour: string;
}

const PRIMITIVE_TIERS: ShadowTier[] = [
  {
    name: 'z100',
    value: '0 1px 2px / 0 1px 3px',
    desc: 'Subtle lift — cards at rest, raised rows',
  },
  {
    name: 'z200',
    value: '0 4px 8px / 0 4px 16px',
    desc: 'Popovers, dropdowns, command palette',
  },
  {
    name: 'z300',
    value: '0 8px 16px / 0 16px 32px',
    desc: 'Toasts, larger floating surfaces',
  },
  {
    name: 'z400',
    value: '0 16px 32px / 0 24px 48px',
    desc: 'Modals, drawers, max-elevation chrome',
  },
];

const SEMANTIC_TIERS: ShadowTier[] = [
  { name: 'shadow-card',    value: 'alias → --z100', desc: 'Card at rest' },
  { name: 'shadow-popover', value: 'alias → --z200', desc: 'Popovers, dropdowns, combobox' },
  { name: 'shadow-toast',   value: 'alias → --z300', desc: 'Toasts, floating notifications' },
  { name: 'shadow-modal',   value: 'alias → --z400', desc: 'Modals, drawers' },
];

const APPLIED: AppliedDemo[] = [
  {
    token: 'shadow-card',
    label: 'Card · shadow-card',
    desc: 'Surface that sits on the canvas.',
    stage: 'card',
  },
  {
    token: 'shadow-popover',
    label: 'Popover · shadow-popover',
    desc: 'Anchored floating menu.',
    stage: 'popover',
  },
  {
    token: 'shadow-toast',
    label: 'Toast · shadow-toast',
    desc: 'Transient overlay above content.',
    stage: 'toast',
  },
  {
    token: 'shadow-modal',
    label: 'Modal · shadow-modal',
    desc: 'Max-elevation chrome above scrim.',
    stage: 'modal',
  },
];

const TRUNC: TruncRow[] = [
  {
    field: 'Primitive vs semantic',
    behaviour: 'Components consume semantic tokens (--shadow-popover, --shadow-modal). Never reach for --z200 / --z400 directly.',
  },
  {
    field: 'Theme tinting',
    behaviour: 'Shadows are channel-split through --shadow-tint-h/s/l. Dark themes override --shadow-tint-l to render the same alphas as soft light glows.',
  },
  {
    field: 'Stacking',
    behaviour: 'Elevation communicates depth visually. Use --layer-* tokens for actual z-index stacking — never compose your own.',
  },
];

@Component({
  selector: 'section-foundations-elevation',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-elevation" data-anchor="elevation" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Elevation</h2>
      <p class="lede t-m">
        Four primitive tiers plus four semantic aliases for popover, modal, toast, card. Shadows are
        channel-split through <code class="t-mono">--shadow-tint-h/s/l</code> so a re-skin can re-tint
        them and dark themes can render the same alphas as soft glows.
      </p>

      <!-- ============================================================ Shadow scale -->
      <h3 class="block-title t-h4">Shadow scale · primitive tiers</h3>
      <div class="shadow-grid">
        @for (tier of primitive; track tier.name) {
          <div class="shadow-cell">
            <div class="shadow-card" [style.boxShadow]="'var(--' + tier.name + ')'"></div>
            <code class="t-mono token-name">--{{ tier.name }}</code>
            <div class="t-caption token-desc">{{ tier.desc }}</div>
            <code class="t-mono token-value">{{ tier.value }}</code>
          </div>
        }
      </div>

      <h3 class="block-title t-h4">Shadow scale · semantic aliases</h3>
      <div class="shadow-grid">
        @for (tier of semantic; track tier.name) {
          <div class="shadow-cell">
            <div class="shadow-card" [style.boxShadow]="'var(--' + tier.name + ')'"></div>
            <code class="t-mono token-name">--{{ tier.name }}</code>
            <div class="t-caption token-desc">{{ tier.desc }}</div>
            <code class="t-mono token-value">{{ tier.value }}</code>
          </div>
        }
      </div>

      <!-- ============================================================ Applied -->
      <h3 class="block-title t-h4">Applied</h3>
      <p class="block-desc t-s">How each semantic shadow reads on a real surface.</p>
      <div class="applied-grid">
        @for (demo of applied; track demo.token) {
          <div class="applied-cell">
            <div class="applied-stage">
              @if (demo.stage === 'card') {
                <div class="demo-card" [style.boxShadow]="'var(--' + demo.token + ')'">
                  <div class="demo-card__title">Shipment SHP-9412</div>
                  <div class="demo-card__meta">Departed 09:42 · ETA 14:20</div>
                </div>
              }
              @if (demo.stage === 'popover') {
                <div class="demo-popover" [style.boxShadow]="'var(--' + demo.token + ')'">
                  <div class="demo-menu-item">Edit row</div>
                  <div class="demo-menu-item">Duplicate</div>
                  <div class="demo-menu-sep"></div>
                  <div class="demo-menu-item demo-menu-item--error">Delete</div>
                </div>
              }
              @if (demo.stage === 'toast') {
                <div class="demo-toast" [style.boxShadow]="'var(--' + demo.token + ')'">
                  <div class="demo-toast__bar"></div>
                  <div class="demo-toast__body">
                    <div class="demo-toast__title">Manifest saved</div>
                    <div class="demo-toast__msg">Changes synced to the broker.</div>
                  </div>
                </div>
              }
              @if (demo.stage === 'modal') {
                <div class="demo-modal-scrim">
                  <div class="demo-modal" [style.boxShadow]="'var(--' + demo.token + ')'">
                    <div class="demo-modal__title">Confirm dispatch</div>
                    <div class="demo-modal__body">Send 12 jobs to the broker queue?</div>
                    <div class="demo-modal__actions">
                      <button class="demo-btn demo-btn--ghost">Cancel</button>
                      <button class="demo-btn">Dispatch</button>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="applied-label t-s-bold">{{ demo.label }}</div>
            <div class="t-caption">{{ demo.desc }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Elevation rules</div>
        <ul class="trunc__list">
          @for (row of trunc; track row.field) {
            <li>
              <span class="trunc__field">{{ row.field }}</span>
              <span class="trunc__behaviour">{{ row.behaviour }}</span>
            </li>
          }
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
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); }

    /* ---------- Shadow scale grid ---------- */
    .shadow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-6);
      margin-top: var(--space-4);
      padding: var(--space-8) var(--space-6);
      background: var(--surface-canvas);
      border-radius: var(--radius-lg);
    }
    .shadow-cell {
      display: grid;
      gap: var(--space-2);
      justify-items: start;
    }
    .shadow-card {
      width: 100%;
      aspect-ratio: 1 / 1;
      max-width: 160px;
      background: var(--surface-default);
      border-radius: var(--radius-lg);
    }
    .token-name { font-size: 12px; color: var(--text-primary); }
    .token-desc { color: var(--text-secondary); line-height: 1.5; }
    .token-value { font-size: 11px; color: var(--text-tertiary); }

    /* ---------- Applied grid ---------- */
    .applied-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--space-6);
      margin-top: var(--space-4);
    }
    .applied-cell {
      display: grid;
      gap: var(--space-2);
    }
    .applied-stage {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) var(--space-4);
      min-height: 200px;
      background: var(--surface-canvas);
      border-radius: var(--radius-lg);
    }
    .applied-label { color: var(--text-primary); }

    /* ---------- Demo · card ---------- */
    .demo-card {
      width: 100%;
      max-width: 220px;
      padding: var(--space-4);
      background: var(--surface-default);
      border-radius: var(--radius-lg);
    }
    .demo-card__title {
      font: var(--font-weight-bold) var(--font-size-m)/var(--line-height-snug) var(--font-sans);
      color: var(--text-primary);
    }
    .demo-card__meta {
      margin-top: var(--space-1);
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }

    /* ---------- Demo · popover ---------- */
    .demo-popover {
      width: 100%;
      max-width: 200px;
      padding: var(--space-1);
      background: var(--surface-overlay);
      border-radius: var(--radius-lg);
    }
    .demo-menu-item {
      padding: var(--space-2) var(--space-3);
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-primary);
      border-radius: var(--radius-md);
    }
    .demo-menu-item--error { color: var(--error-text); }
    .demo-menu-sep {
      height: var(--border-width-default);
      margin: var(--space-1) var(--space-2);
      background: var(--border-divider);
    }

    /* ---------- Demo · toast ---------- */
    .demo-toast {
      display: flex;
      gap: var(--space-3);
      width: 100%;
      max-width: 280px;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-default);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .demo-toast__bar {
      width: var(--toast-bar-w, 3px);
      align-self: stretch;
      background: var(--success);
      border-radius: var(--radius-sm);
    }
    .demo-toast__title {
      font: var(--font-weight-bold) var(--font-size-s)/var(--line-height-snug) var(--font-sans);
      color: var(--text-primary);
    }
    .demo-toast__msg {
      margin-top: var(--space-0-5);
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }

    /* ---------- Demo · modal ---------- */
    .demo-modal-scrim {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: var(--space-4);
      background: var(--surface-scrim);
      border-radius: var(--radius-lg);
    }
    .demo-modal {
      width: 100%;
      max-width: 240px;
      padding: var(--space-4);
      background: var(--surface-overlay);
      border-radius: var(--radius-lg);
    }
    .demo-modal__title {
      font: var(--font-weight-bold) var(--font-size-m)/var(--line-height-snug) var(--font-sans);
      color: var(--text-primary);
    }
    .demo-modal__body {
      margin-top: var(--space-2);
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }
    .demo-modal__actions {
      display: flex;
      gap: var(--space-2);
      justify-content: flex-end;
      margin-top: var(--space-4);
    }
    .demo-btn {
      height: 28px;
      padding: 0 var(--space-3);
      background: var(--primary);
      color: var(--neutral-0);
      border: 0;
      border-radius: var(--radius-md);
      font: var(--font-weight-bold) var(--font-size-xs)/1 var(--font-sans);
      cursor: pointer;
    }
    .demo-btn--ghost {
      background: transparent;
      color: var(--text-secondary);
    }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .trunc__title {
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
      grid-template-columns: 220px 1fr;
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
  `],
})
export class ElevationSection {
  protected readonly primitive = PRIMITIVE_TIERS;
  protected readonly semantic = SEMANTIC_TIERS;
  protected readonly applied = APPLIED;
  protected readonly trunc = TRUNC;
}
