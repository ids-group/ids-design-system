import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'section-home',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-home" data-anchor="home" class="section">
      <header class="page-hero">
        <div class="t-overline eyebrow">Boilerplate &middot; Design system</div>
        <h1 class="display">An admin design system, in primitives.</h1>
        <p class="lede">
          A reusable starting point for any admin product — tokens, components and patterns.
          Built tokens-first so a client theme propagates without touching components.
          Domain-specific status taxonomies, copy and brand live in the consumer app's
          <code class="t-mono">_brand-&lt;client&gt;.scss</code> file (see <code class="t-mono">mm-broker/src/app/styles/_brand-manage-my.scss</code>).
        </p>
        <div class="badges">
          <span class="badge badge--solid">v0.3</span>
          <span class="badge badge--neutral">160+ tokens</span>
          <span class="badge badge--neutral">36 components</span>
          <span class="badge badge--neutral">5 patterns</span>
          <span class="badge badge--neutral">Light only</span>
        </div>
      </header>

      <section class="start-section">
        <div class="t-overline eyebrow">Welcome</div>
        <h2 class="t-h2 title">Start here</h2>
        <p class="lede-secondary">
          A white-label boilerplate design system. Re-skin per consumer app via a
          <code class="t-mono">_brand-&lt;client&gt;.scss</code> partial that overrides
          DS palette + font tokens under a <code class="t-mono">[data-brand="&lt;client&gt;"]</code>
          attribute selector. Default contents are generic admin-tool components —
          tables, forms, banners, sidenav, page headers. Re-theme without touching
          components by overriding tokens.
        </p>

        <div class="block">
          <h3 class="t-h4 block-title">How to</h3>
          <div class="grid-3">
            <article class="howto-card">
              <div class="howto-num">01</div>
              <h4 class="howto-title">Add a new client theme</h4>
              <p class="howto-body">
                Create <code class="t-mono">_brand-&lt;client&gt;.scss</code> in the consumer app's
                styles folder. Inside <code class="t-mono">[data-brand="&lt;client&gt;"]</code>,
                override the palette ramp (<code class="t-mono">--blue-50…900</code>),
                brand HSL channels (<code class="t-mono">--primary-h/s/l</code>) and font stack.
                Activate with <code class="t-mono">&lt;html data-brand="&lt;client&gt;"&gt;</code>.
                Components stay untouched.
              </p>
              <div class="howto-foot">
                Reference: <code class="t-mono">mm-broker/src/app/styles/_brand-manage-my.scss</code>
              </div>
            </article>

            <article class="howto-card">
              <div class="howto-num">02</div>
              <h4 class="howto-title">Extend with a new component</h4>
              <p class="howto-body">
                Author against tokens — never raw values. Use idiomatic class names
                with <code class="t-mono">&amp;.modifier</code> nesting. Pair tokens correctly
                (background + matching foreground). Add a per-component section to
                this docs site.
              </p>
              <div class="howto-foot">
                See <a href="#section-practice-do-dont" class="t-link">Practice &rsaquo; Do / Don't</a>
              </div>
            </article>

            <article class="howto-card">
              <div class="howto-num">03</div>
              <h4 class="howto-title">Read this documentation</h4>
              <p class="howto-body">
                Linear top-to-bottom: Components → Foundations → Patterns → Practice →
                Reference. Each component block reads as a self-contained unit. Use the
                left TOC for jumps. The Tweaks panel (bottom-right) flips brand,
                density and font size live.
              </p>
              <div class="howto-foot">
                Press <kbd>⌘</kbd>+<kbd>.</kbd> to open Tweaks
              </div>
            </article>
          </div>
        </div>

        <div class="block">
          <h3 class="t-h4 block-title">Quick links</h3>
          <div class="start-links">
            <a href="#section-button" class="start-link">
              <div class="start-link__num">A</div>
              <div class="start-link__body">
                <div class="start-link__title">Components</div>
                <div class="start-link__desc">Buttons, fields, tables, banners, navigation — 36 in total.</div>
              </div>
              <div class="start-link__arrow">→</div>
            </a>
            <a href="#section-color" class="start-link">
              <div class="start-link__num">B</div>
              <div class="start-link__body">
                <div class="start-link__title">Foundations</div>
                <div class="start-link__desc">Colour, type, spacing, radius, surfaces, motion, icons.</div>
              </div>
              <div class="start-link__arrow">→</div>
            </a>
            <a href="#section-pattern-page-header" class="start-link">
              <div class="start-link__num">C</div>
              <div class="start-link__body">
                <div class="start-link__title">Patterns</div>
                <div class="start-link__desc">Page headers, filter bars, form layouts, activity.</div>
              </div>
              <div class="start-link__arrow">→</div>
            </a>
            <a href="#section-practice-token-discipline" class="start-link">
              <div class="start-link__num">D</div>
              <div class="start-link__body">
                <div class="start-link__title">Practice</div>
                <div class="start-link__desc">Token discipline, do/don't catalogue.</div>
              </div>
              <div class="start-link__arrow">→</div>
            </a>
            <a href="#section-tokens-reference" class="start-link">
              <div class="start-link__num">E</div>
              <div class="start-link__body">
                <div class="start-link__title">Reference</div>
                <div class="start-link__desc">Token catalogue — names, values, intended use.</div>
              </div>
              <div class="start-link__arrow">→</div>
            </a>
            <div class="start-link start-link--note">
              <div class="start-link__num">⌘</div>
              <div class="start-link__body">
                <div class="start-link__title">Live tweaking</div>
                <div class="start-link__desc">Theme, brand, density and font size sit in the Tweaks panel, bottom-right. Try brand swap — components reflow without code changes.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }

    /* Page hero — top of docs landing */
    .page-hero {
      padding-bottom: var(--space-12);
      border-bottom: var(--border-width-default) solid var(--border-divider);
      margin-bottom: var(--space-12);
    }
    .page-hero .eyebrow { color: var(--primary); }
    .page-hero .display {
      font: var(--font-weight-extrabold) 56px/1.05 var(--font-sans);
      letter-spacing: var(--letter-spacing-tight);
      margin: var(--space-3) 0 var(--space-4);
      color: var(--text-primary);
    }
    .page-hero .lede {
      font: var(--font-weight-regular) var(--font-size-l)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
      max-width: 640px;
      margin: 0;
    }
    .page-hero .badges {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-6);
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--badge-pad-y) var(--badge-pad-x);
      border-radius: var(--radius-pill);
      font: var(--font-weight-semibold) var(--font-size-xs)/1 var(--font-sans);
    }
    .badge.badge--solid {
      background: var(--primary);
      color: var(--primary-on);
    }
    .badge.badge--neutral {
      background: var(--surface-secondary);
      color: var(--text-secondary);
      border: var(--border-width-default) solid var(--border-divider);
    }

    /* Start-here section */
    .start-section { display: block; }
    .eyebrow { color: var(--primary); }
    .title {
      font: var(--font-weight-extrabold) var(--font-size-h2)/var(--line-height-tight) var(--font-display);
      letter-spacing: var(--letter-spacing-tight);
      margin: var(--space-3) 0 var(--space-4);
      color: var(--text-primary);
    }
    .lede-secondary {
      font: var(--font-weight-regular) var(--font-size-l)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
      max-width: 720px;
      margin: 0;
    }

    .block { margin-top: var(--space-10); display: block; }
    .block-title { margin: 0 0 var(--space-4); }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-4);
    }
    @media (max-width: 1100px) { .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 720px)  { .grid-3 { grid-template-columns: 1fr; } }

    /* How-to card */
    .howto-card {
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }
    .howto-num {
      font: var(--font-weight-extrabold) var(--font-size-xs)/1 var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--primary-strong);
      margin-bottom: var(--space-3);
    }
    .howto-title {
      margin: 0 0 var(--space-3);
      font: var(--font-weight-bold) var(--font-size-h5)/var(--line-height-snug) var(--font-sans);
      color: var(--text-primary);
    }
    .howto-body {
      margin: 0 0 var(--space-3);
      font: var(--font-weight-regular) var(--font-size-m)/1.6 var(--font-sans);
      color: var(--text-primary);
    }
    .howto-foot {
      font: var(--font-weight-regular) var(--font-size-s)/1.5 var(--font-sans);
      color: var(--text-secondary);
    }
    .t-link { color: var(--text-link); text-decoration: none; }
    .t-link:hover { text-decoration: underline; }

    /* Quick-link tiles */
    .start-links {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-3);
    }
    @media (max-width: 1100px) { .start-links { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 640px)  { .start-links { grid-template-columns: 1fr; } }

    .start-link {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      color: inherit;
      text-decoration: none;
      transition: background var(--duration-fast) var(--ease-standard),
                  border-color var(--duration-fast) var(--ease-standard),
                  transform var(--duration-fast) var(--ease-standard);
    }
    .start-link:hover {
      background: var(--surface-secondary);
      border-color: var(--border-default);
      transform: translateY(-1px);
    }
    .start-link__num {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      color: var(--primary-strong);
      display: grid;
      place-items: center;
      font: var(--font-weight-extrabold) var(--font-size-m)/1 var(--font-sans);
    }
    .start-link__title {
      font: var(--font-weight-bold) var(--font-size-m)/1.35 var(--font-sans);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }
    .start-link__desc {
      font: var(--font-weight-regular) var(--font-size-s)/1.5 var(--font-sans);
      color: var(--text-secondary);
    }
    .start-link__arrow {
      font: var(--font-weight-bold) 18px/1 var(--font-sans);
      color: var(--text-tertiary);
      transition: transform var(--duration-fast) var(--ease-standard),
                  color var(--duration-fast) var(--ease-standard);
    }
    .start-link:hover .start-link__arrow {
      color: var(--primary);
      transform: translateX(2px);
    }

    .start-link--note {
      background: var(--surface-secondary);
      border-style: dashed;
    }
    .start-link--note:hover {
      transform: none;
      background: var(--surface-secondary);
    }
    .start-link--note .start-link__num {
      background: var(--surface-default);
      color: var(--text-secondary);
    }

    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
    kbd {
      display: inline-block;
      padding: var(--kbd-pad-y) var(--kbd-pad-x);
      font: var(--font-weight-medium) 11px/1 var(--font-mono);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
    }
  `],
})
export class HomeSection {}
