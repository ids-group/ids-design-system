import { Component, ViewEncapsulation } from '@angular/core';
import { SpinnerComponent } from 'ds';

@Component({
  selector: 'section-components-spinner',
  standalone: true,
  imports: [SpinnerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-spinner" data-anchor="spinner" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Spinner</h2>
      <p class="lede t-m">
        Stateless rotating loader. Three sizes match the icon scale (sm 12 px, md 16 px,
        lg 24 px). Render via <code class="t-mono">&lt;ds-spinner size="sm|md|lg"&gt;</code>.
      </p>

      <h3 class="block-title t-h4">Sizes</h3>
      <div class="sizes">
        <div class="size-cell">
          <ds-spinner size="sm" />
          <code class="t-mono">size="sm" · 12 px</code>
        </div>
        <div class="size-cell">
          <ds-spinner />
          <code class="t-mono">size="md" · 16 px</code>
        </div>
        <div class="size-cell">
          <ds-spinner size="lg" />
          <code class="t-mono">size="lg" · 24 px</code>
        </div>
      </div>

      <h3 class="block-title t-h4">Inline usage</h3>
      <div class="inline-demo">
        <ds-spinner size="sm" />
        <span class="t-s">Saving changes…</span>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    .sizes {
      display: flex;
      gap: var(--s-6);
      align-items: flex-end;
      margin-top: var(--s-3);
      padding: var(--s-6) var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    .size-cell {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      align-items: center;
    }
    .size-cell code {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .inline-demo {
      display: inline-flex;
      gap: var(--s-2);
      align-items: center;
      margin-top: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
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
export class SpinnerSection {}
