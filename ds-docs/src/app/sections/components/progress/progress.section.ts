import { Component, ViewEncapsulation } from '@angular/core';
import { ProgressComponent } from 'ds';

@Component({
  selector: 'section-components-progress',
  standalone: true,
  imports: [ProgressComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-progress" data-anchor="progress" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Progress</h2>
      <p class="lede t-m">
        Horizontal progress bar. Value 0..100 for determinate. Four status variants
        match the global colour roles, plus an indeterminate sweep for unknown duration.
      </p>

      <h3 class="block-title t-h4">Variants</h3>
      <div class="states">
        <div class="state">
          <code class="t-mono state__lbl">default · 30%</code>
          <ds-progress [value]="30" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">default · 70%</code>
          <ds-progress [value]="70" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">success · 70%</code>
          <ds-progress [value]="70" variant="success" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">warn · 92%</code>
          <ds-progress [value]="92" variant="warn" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">error · 100%</code>
          <ds-progress [value]="100" variant="error" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">indeterminate</code>
          <ds-progress variant="indeterminate" />
        </div>
      </div>

      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Value</span>
            <span class="trunc__behaviour">Clamped to 0..100 in the wrapper. Pass percentages, not absolute counts.</span>
          </li>
          <li>
            <span class="trunc__field">Indeterminate</span>
            <span class="trunc__behaviour">Width input is ignored. Animation runs at --duration-loop-slow.</span>
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

    .states {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    .state { display: flex; flex-direction: column; gap: var(--space-1); }
    .state__lbl { font-size: 11px; color: var(--text-secondary); }

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
export class ProgressSection {}
