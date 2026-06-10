import { Component, ViewEncapsulation, signal } from '@angular/core';
import { NumberStepperComponent } from 'ds';

@Component({
  selector: 'section-components-number-stepper',
  standalone: true,
  imports: [NumberStepperComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-number-stepper" data-anchor="number-stepper" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Number stepper</h2>
      <p class="lede t-m">
        Spinbox for small bounded quantities — increment / decrement buttons around a numeric value.
        Respects <code class="t-mono">min</code> / <code class="t-mono">max</code> / <code class="t-mono">step</code>.
        Render via <code class="t-mono">&lt;ds-number-stepper [(value)]="qty"&gt;</code>.
      </p>

      <!-- ============================================================ Sizes -->
      <h3 class="block-title t-h4">Sizes</h3>
      <p class="block-desc t-s">Three sizes aligned with input / select field heights.</p>
      <div class="row">
        <div class="cell">
          <ds-number-stepper size="sm" [(value)]="qtySm" />
          <code class="t-mono">size="sm"</code>
        </div>
        <div class="cell">
          <ds-number-stepper [(value)]="qtyMd" />
          <code class="t-mono">size="md" · default</code>
        </div>
        <div class="cell">
          <ds-number-stepper size="lg" [(value)]="qtyLg" />
          <code class="t-mono">size="lg"</code>
        </div>
      </div>

      <!-- ============================================================ Bounds + step -->
      <h3 class="block-title t-h4">Bounds & step</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[min]</code> / <code class="t-mono">[max]</code> clamp the value; the buttons disable at the bounds. <code class="t-mono">[step]</code> sets the increment.
      </p>
      <div class="row">
        <div class="cell">
          <ds-number-stepper [(value)]="bounded" [min]="0" [max]="10" />
          <code class="t-mono">min=0 max=10 · value {{ bounded() }}</code>
        </div>
        <div class="cell">
          <ds-number-stepper [(value)]="stepped" [step]="5" [min]="0" [max]="100" />
          <code class="t-mono">step=5 · value {{ stepped() }}</code>
        </div>
      </div>

      <!-- ============================================================ Disabled -->
      <h3 class="block-title t-h4">Disabled</h3>
      <div class="row">
        <div class="cell">
          <ds-number-stepper [value]="3" [disabled]="true" />
          <code class="t-mono">[disabled]="true"</code>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-6);
      align-items: flex-end;
      margin-top: var(--space-3);
      padding: var(--space-5) var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    .cell {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      align-items: flex-start;
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
export class NumberStepperSection {
  protected readonly qtySm = signal(2);
  protected readonly qtyMd = signal(2);
  protected readonly qtyLg = signal(2);
  protected readonly bounded = signal(5);
  protected readonly stepped = signal(25);
}
