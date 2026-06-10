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
        multi-select inputs; neutral (grey, bordered) for filter chips and metadata. Add
        <code class="t-mono">[closable]</code> to render a close affordance.
      </p>

      <h3 class="block-title t-h4">Variants</h3>
      <div class="row">
        <ds-tag>Solid · default</ds-tag>
        <ds-tag variant="neutral">Ghost</ds-tag>
      </div>

      <h3 class="block-title t-h4">Closable</h3>
      <div class="row">
        <ds-tag [closable]="true">Project Alpha</ds-tag>
        <ds-tag variant="neutral" [closable]="true">Filter · Site North</ds-tag>
      </div>

      <h3 class="block-title t-h4">Interactive · selectable</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[interactive]</code> makes the tag a toggle button that emits <code class="t-mono">(toggled)</code> on click; <code class="t-mono">[selected]</code> renders the active state. Use for filter-chip rows.
      </p>
      <div class="row">
        <ds-tag variant="neutral" [interactive]="true" [selected]="true" (toggled)="toggle('north')">Site North</ds-tag>
        <ds-tag variant="neutral" [interactive]="true" [selected]="false" (toggled)="toggle('south')">Site South</ds-tag>
        <ds-tag variant="neutral" [interactive]="true" [selected]="false" (toggled)="toggle('east')">Site East</ds-tag>
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
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }

    .trunc {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .trunc__title {
      display: inline-flex; gap: var(--space-2);
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--space-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: var(--space-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
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
    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `],
})
export class TagSection {
  protected toggle(_site: string): void {
    // demo-only: real consumers flip their own selected state
  }
}
