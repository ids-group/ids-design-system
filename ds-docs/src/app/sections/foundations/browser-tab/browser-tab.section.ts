import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds';

@Component({
  selector: 'section-foundations-browser-tab',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-browser-tab" data-anchor="browser-tab" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Browser tab &amp; document</h2>
      <p class="lede t-m">
        Title, favicon, theme-color and tab grouping — the off-canvas surface the user sees in
        their tab bar. Long URLs and breadcrumb paths clip with ellipsis; full path is exposed via
        title attribute or copy-to-clipboard.
      </p>

      <h3 class="block-title t-h4">Tab specimen</h3>
      <div class="tab-spec">
        <div class="row">
          <div class="tab is-active">
            <span class="fav" aria-hidden="true">A</span>
            <span class="title">Project Alpha · Projects · Acme</span>
            <span class="close" aria-hidden="true">×</span>
          </div>
          <div class="tab">
            <span class="fav alert" aria-hidden="true">A</span>
            <span class="title">Schedule · 3 conflicts · Acme</span>
          </div>
          <div class="tab">
            <span class="fav" aria-hidden="true">A</span>
            <span class="title">Resource allocation · Acme</span>
          </div>
        </div>
        <div class="url">
          <ds-icon name="search" [size]="12" />
          <span class="t-mono">app.acme.com / projects / project-alpha / schedule</span>
        </div>
      </div>

      <h3 class="block-title t-h4">Rules</h3>
      <dl class="rules">
        <dt>Title format</dt>
        <dd>
          <code class="t-mono">{{ '{Record} · {Section} · Acme' }}</code> — leaf first, brand last so multi-tab triage works.
          Index pages: <code class="t-mono">{{ '{Section} · Acme' }}</code>. Login: <code class="t-mono">Acme</code> only.
        </dd>
        <dt>Title state</dt>
        <dd>
          Prefix with <code class="t-mono">●</code> for unsaved
          (<code class="t-mono">● Project Alpha · Projects · Acme</code>); prefix with
          <code class="t-mono">(N)</code> for unread alerts
          (<code class="t-mono">(3) Logistics plan · Acme</code>).
        </dd>
        <dt>Favicon</dt>
        <dd>
          Brand letter on brand surface; alert dot via <code class="t-mono">.fav.alert</code> nested under <code class="t-mono">.tab-spec</code> for
          unread count or attention state. Size matches <code class="t-mono">--icon-md</code> so it reads
          legibly at retina + sub-retina densities.
        </dd>
        <dt>Theme-color</dt>
        <dd>
          <code class="t-mono">&lt;meta name="theme-color"&gt;</code> matches <code class="t-mono">--primary</code>
          for branded chrome; reset to <code class="t-mono">--surface-default</code> on logout to avoid
          carry-over branding.
        </dd>
        <dt>Tab grouping</dt>
        <dd>
          Cap at 7 tabs per group; suggest the browser's native tab-grouping when the user opens more.
          Tabs in the same group share the favicon brand colour.
        </dd>
      </dl>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }

    .tab-spec {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      background: var(--neutral-200);
      overflow: hidden;
      margin-top: var(--space-3);

      .row {
        display: flex;
        gap: var(--space-1);
        padding: var(--space-2) var(--space-2) 0;
      }

      .tab {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        background: var(--neutral-150);
        border: var(--border-width-default) solid var(--border-divider);
        border-bottom: 0;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        font: var(--font-weight-medium) var(--font-size-xs)/var(--line-height-flat) var(--font-sans);
        color: var(--text-secondary);
        min-width: 0;
        max-width: var(--tab-spec-maxw);

        &.is-active {
          background: var(--surface-default);
          color: var(--text-primary);
          font-weight: var(--font-weight-semibold);
        }
      }

      .fav {
        width: var(--icon-md);
        height: var(--icon-md);
        background: var(--primary);
        color: var(--primary-on);
        border-radius: var(--radius-sm);
        display: grid;
        place-items: center;
        font: var(--font-weight-extrabold) var(--font-size-2xs)/1 var(--font-display);
        flex-shrink: 0;
        position: relative;

        &.alert::after {
          content: "";
          position: absolute;
          top: calc(var(--tab-spec-dot-offset) * -1);
          right: calc(var(--tab-spec-dot-offset) * -1);
          width: var(--space-2);
          height: var(--space-2);
          background: var(--error);
          border-radius: var(--radius-pill);
          border: var(--border-width-default) solid var(--surface-default);
        }
      }

      .title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }

      .close {
        font-size: var(--font-size-s);
        color: var(--text-tertiary);
        width: var(--space-4);
        height: var(--space-4);
        display: grid;
        place-items: center;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .url {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        background: var(--surface-default);
        border-top: var(--border-width-default) solid var(--border-divider);
        font: var(--font-weight-regular) var(--font-size-xs)/var(--line-height-flat) var(--font-mono);
        color: var(--text-secondary);
      }
    }

    .rules {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-3) var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .rules dt {
      font: var(--font-weight-bold) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-primary);
      margin: 0;
    }
    .rules dd {
      margin: 0;
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }
    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-default);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }

    @media (max-width: 720px) {
      .rules { grid-template-columns: 1fr; }
    }
  `],
})
export class BrowserTabSection {}
