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
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    .tab-spec {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      background: var(--neutral-200);
      overflow: hidden;
      margin-top: var(--s-3);

      .row {
        display: flex;
        gap: var(--s-1);
        padding: var(--s-2) var(--s-2) 0;
      }

      .tab {
        display: flex;
        align-items: center;
        gap: var(--s-2);
        padding: var(--s-2) var(--s-3);
        background: var(--neutral-150);
        border: var(--bw-default) solid var(--border-divider);
        border-bottom: 0;
        border-radius: var(--r-md) var(--r-md) 0 0;
        font: var(--fw-medium) var(--fs-xs)/var(--lh-flat) var(--font-sans);
        color: var(--text-secondary);
        min-width: 0;
        max-width: var(--tab-spec-maxw);

        &.is-active {
          background: var(--surface-default);
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }
      }

      .fav {
        width: var(--icon-md);
        height: var(--icon-md);
        background: var(--primary);
        color: var(--primary-on);
        border-radius: var(--r-sm);
        display: grid;
        place-items: center;
        font: var(--fw-extrabold) var(--fs-2xs)/1 var(--font-display);
        flex-shrink: 0;
        position: relative;

        &.alert::after {
          content: "";
          position: absolute;
          top: calc(var(--tab-spec-dot-offset) * -1);
          right: calc(var(--tab-spec-dot-offset) * -1);
          width: var(--s-2);
          height: var(--s-2);
          background: var(--error);
          border-radius: var(--r-pill);
          border: var(--bw-default) solid var(--surface-default);
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
        font-size: var(--fs-s);
        color: var(--text-tertiary);
        width: var(--s-4);
        height: var(--s-4);
        display: grid;
        place-items: center;
        border-radius: var(--r-sm);
        flex-shrink: 0;
      }

      .url {
        display: flex;
        align-items: center;
        gap: var(--s-2);
        padding: var(--s-2) var(--s-4);
        background: var(--surface-default);
        border-top: var(--bw-default) solid var(--border-divider);
        font: var(--fw-regular) var(--fs-xs)/var(--lh-flat) var(--font-mono);
        color: var(--text-secondary);
      }
    }

    .rules {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--s-3) var(--s-4);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .rules dt {
      font: var(--fw-bold) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-primary);
      margin: 0;
    }
    .rules dd {
      margin: 0;
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-default);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }

    @media (max-width: 720px) {
      .rules { grid-template-columns: 1fr; }
    }
  `],
})
export class BrowserTabSection {}
