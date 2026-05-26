import { Component, ViewEncapsulation } from '@angular/core';

interface SurfaceRow {
  readonly token: string;
  readonly name: string;
  readonly desc: string;
}

const SURFACES: readonly SurfaceRow[] = [
  { token: '--surface-canvas',    name: 'Canvas',    desc: 'Outermost page backdrop. Frames every other surface.' },
  { token: '--surface-default',   name: 'Default',   desc: 'Cards, tables, modals — the standard content surface.' },
  { token: '--surface-secondary', name: 'Secondary', desc: 'Hover lanes, table heads, code blocks, addon backgrounds.' },
  { token: '--surface-overlay',   name: 'Overlay',   desc: 'Popovers, dropdowns, toast region — anything CDK-portaled.' },
  { token: '--surface-inverted',  name: 'Inverted',  desc: 'Bulk-action bar, dark callout cards, tooltip background.' },
  { token: '--surface-tint',      name: 'Tint',      desc: 'Brand-tinted callouts (banners, page-footer save state).' },
  { token: '--surface-disabled',  name: 'Disabled',  desc: 'Disabled control fill. Reads as inactive without losing shape.' },
  { token: '--surface-scrim',     name: 'Scrim',     desc: 'Modal/drawer backdrop. Alpha-tinted; never used as a standalone fill.' },
];

@Component({
  selector: 'section-foundations-surface-levels',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-surface-levels" data-anchor="surface-levels" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Surface levels</h2>
      <p class="lede t-m">
        Eight surface roles. They're not strict elevation tiers — they're contextual lanes that
        compose. A card on the canvas can have a subtle hover lane and a muted code block inside it.
      </p>

      <div class="grid">
        @for (s of surfaces; track s.token) {
          <div class="cell">
            <div class="swatch" [style.background]="'var(' + s.token + ')'"></div>
            <div class="t-s-bold cell__name">{{ s.name }}</div>
            <code class="t-mono cell__tok">{{ s.token }}</code>
            <div class="t-xs cell__desc">{{ s.desc }}</div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--s-4);
      margin-top: var(--s-6);
    }
    .cell { display: flex; flex-direction: column; gap: var(--s-1); }
    .swatch {
      height: 80px;
      border-radius: var(--r-lg);
      border: var(--bw-default) solid var(--border-divider);
      margin-bottom: var(--s-2);
    }
    .cell__name { color: var(--text-primary); }
    .cell__tok { font-size: 10px; color: var(--text-tertiary); }
    .cell__desc { color: var(--text-secondary); margin-top: var(--s-1); line-height: 1.5; }

    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
    }
  `],
})
export class SurfaceLevelsSection {
  protected readonly surfaces = SURFACES;
}
