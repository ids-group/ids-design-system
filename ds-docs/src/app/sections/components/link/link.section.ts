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
      <!-- Pin classes go directly on the element; no ::ng-deep needed for
           global .link rules as section scope attr covers these elements. -->
      <div class="row">
        <a class="link" href="javascript:void(0)">Default</a>
        <a class="link pin-hover" href="javascript:void(0)">Hover (forced)</a>
        <a class="link pin-active" href="javascript:void(0)">Active (forced)</a>
        <a class="link pin-focus" href="javascript:void(0)">Focus (forced)</a>
        <a class="link pin-disabled" aria-disabled="true">Disabled</a>
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
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-3); max-width: var(--col-cap-text); }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      align-items: baseline;
    }
    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }

    /* State pins — read the link's own resolvers; fixes drift from old hooks
       that incorrectly pinned --primary / --primary-strong directly. */
    .link.pin-hover  { color: var(--_link-color-hover); text-decoration-color: var(--_link-color-hover); }
    .link.pin-active { color: var(--_link-color-active); text-decoration-color: var(--_link-color-active); }
    /* focus: --focus-ring and --radius-sm are bare tokens (no --_* resolver) */
    .link.pin-focus  { outline: none; box-shadow: var(--focus-ring); border-radius: var(--radius-sm); text-decoration-color: var(--_link-color); }
    /* disabled: aria-disabled="true" already triggers the real state in _link.scss; pin-disabled mirrors it for docs clarity */
    .link.pin-disabled { color: var(--text-disabled); text-decoration-color: var(--text-disabled); pointer-events: none; cursor: default; }
  `],
})
export class LinkSection {}
