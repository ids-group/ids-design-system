import { Component, ViewEncapsulation } from '@angular/core';
import { StepperComponent } from 'ds';

@Component({
  selector: 'section-components-stepper',
  standalone: true,
  imports: [StepperComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-stepper" data-anchor="stepper" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Stepper</h2>
      <p class="lede t-m">
        Visual indicator of multi-step progress. Pass an array of step labels and a
        zero-indexed <code class="t-mono">current</code>. Nodes before current render
        as done (with check icon); the current node fills with brand; later nodes stay
        as outlined numerals.
      </p>

      <h3 class="block-title t-h4">Default</h3>
      <div class="demo">
        <ds-stepper [steps]="brief" [current]="2" />
      </div>

      <h3 class="block-title t-h4">States showcase</h3>
      <div class="states">
        <div class="state">
          <code class="t-mono state__lbl">current = 0 (just started)</code>
          <ds-stepper [steps]="brief" [current]="0" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">current = 2 (mid-flow)</code>
          <ds-stepper [steps]="brief" [current]="2" />
        </div>
        <div class="state">
          <code class="t-mono state__lbl">current = 5 (all done)</code>
          <ds-stepper [steps]="brief" [current]="5" />
        </div>
      </div>

      <h3 class="block-title t-h4">Single node states</h3>
      <div class="single-nodes">
        <div class="single-cell">
          <ds-stepper [steps]="['Step']" [current]="-1" />
          <code class="t-mono">.node · pending</code>
        </div>
        <div class="single-cell">
          <ds-stepper [steps]="['Step']" [current]="0" />
          <code class="t-mono">.node.active</code>
        </div>
        <div class="single-cell">
          <ds-stepper [steps]="['Step']" [current]="1" />
          <code class="t-mono">.node.done</code>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }

    .demo, .states {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    .states {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .state { display: flex; flex-direction: column; gap: var(--space-2); }
    .state__lbl { font-size: 11px; color: var(--text-secondary); }

    .single-nodes {
      display: flex;
      gap: var(--space-6);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    .single-cell { display: flex; flex-direction: column; gap: var(--space-2); align-items: center; }
    .single-cell code { font-size: 11px; color: var(--text-secondary); }

    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `],
})
export class StepperSection {
  protected readonly brief = ['Brief', 'Plan', 'Build', 'Review', 'Ship'];
}
