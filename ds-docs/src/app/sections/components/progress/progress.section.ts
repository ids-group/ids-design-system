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
            <span class="trunc__behaviour">Width input is ignored. Animation runs at --dur-loop-slow.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    .states {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    .state { display: flex; flex-direction: column; gap: var(--s-1); }
    .state__lbl { font-size: 11px; color: var(--text-secondary); }

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
export class ProgressSection {}
