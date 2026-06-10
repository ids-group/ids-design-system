import { Component, ViewEncapsulation } from '@angular/core';

interface OpacityStop {
  readonly token: string;
  readonly value: number;
  readonly use: string;
}

interface AlphaRef {
  readonly alpha: string;
  readonly where: string;
}

const STOPS: readonly OpacityStop[] = [
  { token: '--opacity-disabled',       value: 0.5,  use: 'Full disabled state on interactive components' },
  { token: '--opacity-muted',          value: 0.6,  use: 'Legacy alias — being phased out in favour of --text-* roles' },
  { token: '--opacity-text-disabled',  value: 0.38, use: 'Disabled text where a colour token isn’t available' },
  { token: '--opacity-scrim',          value: 0.55, use: 'Modal / drawer backdrop overlay' },
  { token: '--opacity-state-hover',    value: 0.08, use: 'Hover layer over surface (overlay vs surface swap)' },
  { token: '--opacity-state-pressed',  value: 0.16, use: 'Active / pressed layer' },
];

const LITERALS: readonly AlphaRef[] = [
  { alpha: '--shadow-tint-h/s/l',  where: 'Channel-split substrate for --z100..--z400. Light: 225 / 39% / 7%. Re-skin propagates through HSL channels.' },
  { alpha: '--focus-tint-rgb',     where: 'Focus halo RGB channel. Used inside --focus-field and --focus-overlay tokens.' },
  { alpha: '--surface-scrim',      where: 'Modal / drawer backdrop. Consumes --opacity-scrim (0.55) over neutral substrate.' },
];

@Component({
  selector: 'section-foundations-opacity',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-opacity" data-anchor="opacity" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Opacity &amp; alpha tokens</h2>
      <p class="lede t-m">
        Six semantic opacity tokens for component states (purpose-named, not an abstract scale).
        Composite alphas (shadows, focus rings) are channel-split so a re-skin propagates.
        Literal alphas only survive where they’re local to a single token.
      </p>

      <h3 class="block-title t-h4">Semantic opacity tokens</h3>
      <table class="stops">
        <thead><tr><th>Token</th><th>Value</th><th>Use</th><th>Sample</th></tr></thead>
        <tbody>
          @for (s of stops; track s.token) {
            <tr>
              <td><code class="t-mono">{{ s.token }}</code></td>
              <td><code class="t-mono">{{ s.value }}</code></td>
              <td>{{ s.use }}</td>
              <td><span class="swatch" [style.opacity]="s.value"></span></td>
            </tr>
          }
        </tbody>
      </table>

      <h3 class="block-title t-h4">Literal alphas in tokens (reference)</h3>
      <p class="block-desc t-s">
        Non-tokenised alphas used inside other tokens. Don’t reach for these directly — consume
        the parent token (<code class="t-mono">--shadow-modal</code>, <code class="t-mono">--focus-field</code>, <code class="t-mono">--surface-scrim</code>).
      </p>
      <table class="literals">
        <thead><tr><th>Alpha</th><th>Where it appears</th></tr></thead>
        <tbody>
          @for (lit of literals; track lit.alpha) {
            <tr>
              <td><code class="t-mono">{{ lit.alpha }}</code></td>
              <td>{{ lit.where }}</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }

    .stops, .literals {
      width: 100%;
      margin-top: var(--space-3);
      border-collapse: collapse;
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
    }
    .stops th, .stops td,
    .literals th, .literals td {
      text-align: left;
      padding: var(--space-3) var(--space-4);
      border-bottom: var(--border-width-default) solid var(--border-divider);
    }
    .stops th, .literals th {
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .swatch {
      display: inline-block;
      width: 100px;
      height: 24px;
      background: var(--primary);
      border-radius: var(--radius-sm);
    }
    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `],
})
export class OpacitySection {
  protected readonly stops = STOPS;
  protected readonly literals = LITERALS;
}
