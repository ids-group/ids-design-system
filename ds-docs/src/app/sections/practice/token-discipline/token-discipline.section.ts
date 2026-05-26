import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds';

interface TokenPair {
  readonly title: string;
  readonly why: string;
  readonly good: string;
  readonly bad: string;
}

@Component({
  selector: 'practice-token-discipline',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-practice-token-discipline" data-anchor="practice-token-discipline" class="section">
      <div class="eyebrow t-overline">Practice</div>
      <h2 class="t-h2">Token discipline</h2>
      <p class="lede t-m">{{ lede }}</p>

      <h3 class="block-title t-h4">The rule</h3>
      <p class="block-desc t-s">
        Every value that has a design role — colour, spacing, radius, border width, motion —
        consumes a <code class="t-mono">var(--token)</code>. Literals
        (<code class="t-mono">#ccc</code>, <code class="t-mono">12px</code>,
        <code class="t-mono">200ms</code>) inside component CSS are a token gap to fix, never a
        shortcut to take. Dark mode, density and rebrand all rely on this contract.
      </p>

      <h3 class="block-title t-h4">Comparison tiles</h3>
      <p class="block-desc t-s">
        The six recurring cases. Each pair shows the value a component should write next to the
        value it should never write.
      </p>
      <div class="pairs">
        @for (pair of pairs; track pair.title) {
          <div class="pair">
            <div class="pair__head">
              <h4 class="t-h5">{{ pair.title }}</h4>
              <p class="t-s muted">{{ pair.why }}</p>
            </div>
            <div class="pair__body">
              <div class="tile tile--good">
                <div class="tile__tag">
                  <ds-icon name="check" [size]="12" /> Good
                </div>
                <pre class="tile__code t-mono">{{ pair.good }}</pre>
              </div>
              <div class="tile tile--bad">
                <div class="tile__tag">
                  <ds-icon name="x" [size]="12" /> Bad
                </div>
                <pre class="tile__code t-mono">{{ pair.bad }}</pre>
              </div>
            </div>
          </div>
        }
      </div>

      <h3 class="block-title t-h4">When a literal is justified</h3>
      <ul class="rules">
        <li>
          The value has no design role — e.g. an SVG viewBox dimension or a fixed glyph size
          owned by the asset itself.
        </li>
        <li>
          A token <em>should</em> exist but doesn't yet. Promote the literal to a new semantic
          token before merging.
        </li>
        <li>
          Never: as a shortcut to skip thinking about what role the value plays. If you can't
          name the role, the value doesn't belong in the component.
        </li>
      </ul>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }
    .block-desc code.t-mono {
      background: var(--surface-subtle);
      padding: 0 var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }

    .pairs {
      margin-top: var(--s-3);
      display: grid;
      gap: var(--s-4);
    }
    .pair {
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(220px, 1fr) minmax(0, 2fr);
    }
    .pair__head {
      padding: var(--s-4) var(--s-5);
      border-right: var(--bw-default) solid var(--border-divider);
      background: var(--surface-secondary);
    }
    .pair__head .muted {
      color: var(--text-secondary);
      margin-top: var(--s-1);
    }
    .pair__body {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .tile {
      padding: var(--s-3) var(--s-4);
      display: grid;
      gap: var(--s-2);
      min-width: 0;
    }
    .tile--good { background: var(--success-subtle, var(--surface-subtle)); }
    .tile--bad {
      background: var(--danger-subtle, var(--surface-subtle));
      border-left: var(--bw-default) solid var(--border-divider);
    }
    .tile__tag {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      align-self: flex-start;
      padding: 2px 8px;
      border-radius: var(--r-pill);
      font: var(--fw-bold) var(--fs-2xs)/1 var(--font-sans);
      text-transform: uppercase;
      letter-spacing: var(--ls-wider);
    }
    .tile--good .tile__tag { background: var(--success, #1b8a4a); color: var(--text-on-brand, #fff); }
    .tile--bad .tile__tag { background: var(--danger, #b3261e); color: var(--text-on-brand, #fff); }
    .tile__code {
      margin: 0;
      padding: var(--s-2) var(--s-3);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-sm);
      font-size: var(--fs-xs);
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .rules {
      margin-top: var(--s-3);
      padding-left: var(--s-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--s-2);
      max-width: var(--col-cap-text);
    }

    @media (max-width: 820px) {
      .pair { grid-template-columns: 1fr; }
      .pair__head { border-right: 0; border-bottom: var(--bw-default) solid var(--border-divider); }
    }
    @media (max-width: 560px) {
      .pair__body { grid-template-columns: 1fr; }
      .tile--bad { border-left: 0; border-top: var(--bw-default) solid var(--border-divider); }
    }
  `],
})
export class TokenDisciplineSection {
  protected readonly lede =
    'Every padding, colour, radius, border, font size and motion curve in component CSS reads a token. Literals are token gaps to promote, not shortcuts to take.';

  protected readonly pairs: TokenPair[] = [
    {
      title: 'Spacing',
      why: 'Density change or rebrand should propagate without code edits.',
      good: 'padding: var(--s-2) var(--s-3);',
      bad: 'padding: 8px 12px;',
    },
    {
      title: 'Colours',
      why: 'Dark mode and theme swaps work through semantic roles — literals bypass the contract.',
      good: 'color: var(--text-secondary);\nborder-color: var(--border-default);',
      bad: 'color: #555;\nborder-color: #ccc;',
    },
    {
      title: 'Radii',
      why: 'Sharp-vs-soft rebrand requires every radius configurable from one place.',
      good: 'border-radius: var(--r-md);',
      bad: 'border-radius: 12px;',
    },
    {
      title: 'Borders',
      why: 'Width and colour both move through tokens — keeps the system coherent under hi-DPI.',
      good: 'border: var(--bw-default) solid var(--border-default);',
      bad: 'border: 1px solid #ddd;',
    },
    {
      title: 'Typography',
      why: 'The type ramp is governed centrally — a one-line edit re-tunes every component.',
      good: 'font: var(--fw-medium) var(--fs-m)/var(--lh-base) var(--font-sans);',
      bad: 'font: 500 16px/1.5 -apple-system, sans-serif;',
    },
    {
      title: 'Motion',
      why: 'Motion taste varies per client; one set of curves keeps the product feeling like one product.',
      good: 'transition: opacity var(--dur-fast) var(--ease-standard);',
      bad: 'transition: opacity 200ms cubic-bezier(.4, 0, .2, 1);',
    },
  ];
}
