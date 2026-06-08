import { Component, ViewEncapsulation } from '@angular/core';

interface SpacingStop {
  readonly name: string;
  readonly px: string;
}

const STOPS: readonly SpacingStop[] = [
  { name: '0',   px: '0px' },
  { name: 'px',  px: '1px' },
  { name: '0-5', px: '2px' },
  { name: '1',   px: '4px' },
  { name: '1-5', px: '6px' },
  { name: '2',   px: '8px' },
  { name: '2-5', px: '10px' },
  { name: '3',   px: '12px' },
  { name: '4',   px: '16px' },
  { name: '5',   px: '20px' },
  { name: '6',   px: '24px' },
  { name: '8',   px: '32px' },
  { name: '10',  px: '40px' },
  { name: '12',  px: '48px' },
  { name: '14',  px: '56px' },
  { name: '16',  px: '64px' },
  { name: '20',  px: '80px' },
  { name: '24',  px: '96px' },
  { name: '32',  px: '128px' },
];

@Component({
  selector: 'section-foundations-spacing',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-spacing" data-anchor="spacing" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Spacing</h2>
      <p class="lede t-m">
        4-pixel base. Component padding lives at s-2 / s-3 / s-4. Page gutters at s-5 / s-6. Section breaks at s-10+.
      </p>

      <!-- ============================================================ Scale visualisation -->
      <h3 class="block-title t-h4">Scale</h3>
      <p class="block-desc t-s">Every <code class="t-mono">--s-*</code> token as a bar. Token name, computed pixel value, then the bar at true scale.</p>
      <div class="scale-list">
        @for (stop of stops; track stop.name) {
          <div class="scale-row">
            <code class="t-mono token-name">--s-{{ stop.name }}</code>
            <code class="t-mono token-px">{{ stop.px }}</code>
            <div class="bar-track">
              <div class="bar" [style.width]="'var(--s-' + stop.name + ')'"></div>
            </div>
          </div>
        }
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

    .scale-list {
      display: grid;
      gap: var(--s-2);
      margin-top: var(--s-4);
    }
    .scale-row {
      display: grid;
      grid-template-columns: 96px 64px 1fr;
      gap: var(--s-4);
      align-items: center;
      padding: var(--s-2) var(--s-3);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-sm);
    }
    .token-name { color: var(--text-secondary); }
    .token-px { color: var(--text-tertiary); }
    .bar-track {
      height: 16px;
      background: var(--surface-secondary);
      border-radius: var(--r-sm);
      overflow: hidden;
    }
    .bar {
      height: 100%;
      min-width: 1px;
      background: var(--primary);
      border-radius: var(--r-sm);
    }
  `],
})
export class SpacingSection {
  protected readonly stops = STOPS;
}
