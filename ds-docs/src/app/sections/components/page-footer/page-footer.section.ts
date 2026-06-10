import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, PageFooterComponent } from 'ds';

@Component({
  selector: 'section-components-page-footer',
  standalone: true,
  imports: [ButtonComponent, PageFooterComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-page-footer" data-anchor="page-footer" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Page footer</h2>
      <p class="lede t-m">
        Layout helper for page-bottom rows. Three variants: <code class="t-mono">default</code>
        (border-top + spread), <code class="t-mono">compact</code> (subtle card),
        <code class="t-mono">save</code> (brand-tinted unsaved-changes affordance).
      </p>

      <h3 class="block-title t-h4">Default</h3>
      <div class="stage">
        <ds-page-footer>
          <div brand>Boilerplate · v0.3</div>
          <nav nav>
            <a class="link quiet" href="javascript:void(0)">Docs</a>
            <a class="link quiet" href="javascript:void(0)">Changelog</a>
            <a class="link quiet" href="javascript:void(0)">Status</a>
          </nav>
        </ds-page-footer>
      </div>

      <h3 class="block-title t-h4">Compact</h3>
      <div class="stage">
        <ds-page-footer variant="compact">
          <div brand>147 trades · Last hour</div>
          <div actions>
            <ds-button variant="outline" size="m">Export</ds-button>
            <ds-button variant="primary" size="m">Refresh</ds-button>
          </div>
        </ds-page-footer>
      </div>

      <h3 class="block-title t-h4">Save (unsaved-changes)</h3>
      <div class="stage">
        <ds-page-footer variant="save">
          <div brand>Unsaved changes · 3 fields edited</div>
          <div actions>
            <ds-button variant="outline" size="m">Discard</ds-button>
            <ds-button variant="primary" size="m">Save changes</ds-button>
          </div>
        </ds-page-footer>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }

    .stage {
      margin-top: var(--space-3);
      padding: 0 var(--space-4);
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
export class PageFooterSection {}
