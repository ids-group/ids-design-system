import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'section-components-link',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-link" data-anchor="link" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Link</h2>
      <p class="lede t-m">
        Anchor styling via the <code class="t-mono">.link</code> CSS class. No Angular
        wrapper — apply directly to any <code class="t-mono">&lt;a&gt;</code> or
        <code class="t-mono">&lt;button&gt;</code>. Five modifiers cover quiet, inline,
        standalone (bold), small and large sizes.
      </p>

      <h3 class="block-title t-h4">States</h3>
      <div class="row">
        <a class="link" href="javascript:void(0)">Default</a>
        <a class="link is-forced-hover" href="javascript:void(0)">Hover (forced)</a>
        <a class="link is-forced-active" href="javascript:void(0)">Active (forced)</a>
        <a class="link is-forced-focus" href="javascript:void(0)">Focus (forced)</a>
        <a class="link is-disabled" aria-disabled="true">Disabled</a>
      </div>

      <h3 class="block-title t-h4">Variants</h3>
      <div class="row">
        <a class="link" href="javascript:void(0)">Default link</a>
        <a class="link quiet" href="javascript:void(0)">Quiet link</a>
        <a class="link standalone" href="javascript:void(0)">Standalone (bold)</a>
        <a class="link sm" href="javascript:void(0)">Small link</a>
        <a class="link lg" href="javascript:void(0)">Large link</a>
      </div>

      <h3 class="block-title t-h4">Inline usage</h3>
      <p class="block-desc t-s">
        Use <code class="t-mono">.link.inline</code> when the anchor sits inside body
        text — it inherits font-weight/size from the surrounding paragraph. For example,
        read the <a class="link inline" href="javascript:void(0)">contributing guide</a>
        for more detail.
      </p>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-3); max-width: var(--col-cap-text); }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-4);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      align-items: baseline;
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
export class LinkSection {}
