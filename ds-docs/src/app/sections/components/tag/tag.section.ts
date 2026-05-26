import { Component, ViewEncapsulation } from '@angular/core';
import { TagComponent } from 'ds';

@Component({
  selector: 'section-components-tag',
  standalone: true,
  imports: [TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-tag" data-anchor="tag" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Tag</h2>
      <p class="lede t-m">
        Pill-shaped chip for short labels. Solid (brand-fill) for selected tokens in
        multi-select inputs; ghost (neutral) for filter chips and metadata. Add
        <code class="t-mono">[closable]</code> to render a close affordance.
      </p>

      <h3 class="block-title t-h4">Variants</h3>
      <div class="row">
        <ds-tag>Solid · default</ds-tag>
        <ds-tag variant="ghost">Ghost</ds-tag>
      </div>

      <h3 class="block-title t-h4">Closable</h3>
      <div class="row">
        <ds-tag [closable]="true">Project Alpha</ds-tag>
        <ds-tag variant="ghost" [closable]="true">Filter · Site North</ds-tag>
      </div>

      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Label</span>
            <span class="trunc__behaviour">Single line, ellipsis at ~16 ch. Tooltip on hover when clipped.</span>
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

    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
      display: inline-flex; gap: var(--s-2);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--s-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: var(--s-2);
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
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }
  `],
})
export class TagSection {}
