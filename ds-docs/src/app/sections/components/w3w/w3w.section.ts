import { Component, ViewEncapsulation } from '@angular/core';
import { W3wComponent } from 'ds';

@Component({
  selector: 'section-components-w3w',
  standalone: true,
  imports: [W3wComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-w3w" data-anchor="w3w" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">w3w</h2>
      <p class="lede t-m">
        Pill for what3words-style location identifiers (///daring.lion.race).
        Monospace body in brand colour so the identifier reads as a distinct,
        code-like token; the leading prefix mark is danger red. Click to copy
        the full identifier to clipboard. Sits with badges and tags as a
        pill-family component.
      </p>

      <h3 class="block-title t-h4">Specimen</h3>
      <div class="row">
        <ds-w3w prefix="///" address="daring.lion.race" />
      </div>

      <h3 class="block-title t-h4">Non-copyable</h3>
      <div class="row">
        <ds-w3w prefix="///" address="static.island.bay" [copyable]="false" />
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-3);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
  `],
})
export class W3wSection {}
