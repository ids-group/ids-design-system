import { Component, ViewEncapsulation } from '@angular/core';
import {
  BreadcrumbsComponent,
  PageHeaderComponent,
  ButtonComponent,
  BadgeComponent,
  TabsComponent,
  TabComponent,
  IconComponent,
  type BreadcrumbItem,
} from 'ds';

@Component({
  selector: 'pattern-page-header',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    PageHeaderComponent,
    ButtonComponent,
    BadgeComponent,
    TabsComponent,
    TabComponent,
    IconComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-pattern-page-header" data-anchor="pattern-page-header" class="section">
      <div class="eyebrow t-overline">Patterns</div>
      <h2 class="t-h2">Page header</h2>
      <p class="lede t-m">{{ lede }}</p>

      <h3 class="block-title t-h4">Full record header</h3>
      <p class="block-desc t-s">
        Breadcrumb above the title row, one status badge inline with the title, a sub-line of
        identifiers, primary action on the right with a ghost secondary, and tabs anchored
        immediately below the title row.
      </p>
      <div class="stage">
        <ds-breadcrumbs [items]="crumbs" />
        <ds-page-header
          eyebrow="Project"
          title="Project Alpha"
          subtitle="30 Jul – 3 Aug 2026 · North Site, Suffolk · EVT-2026-0142"
        >
          <div meta>
            <ds-badge variant="active" [withDot]="true">Active</ds-badge>
          </div>
          <div actions>
            <ds-button variant="ghost">
              <ds-icon name="download" [size]="14" /> Export
            </ds-button>
            <ds-button>
              <ds-icon name="edit" [size]="14" /> Edit
            </ds-button>
          </div>
          <div tabs>
            <ds-tabs>
              <ds-tab label="Overview"><div class="pad t-s">Overview content.</div></ds-tab>
              <ds-tab label="Sub-records" [count]="4"><div class="pad t-s">Sub-records.</div></ds-tab>
              <ds-tab label="Resource allocation"><div class="pad t-s">Allocation.</div></ds-tab>
              <ds-tab label="Logistics plan" [count]="2"><div class="pad t-s">Logistics.</div></ds-tab>
              <ds-tab label="Activity"><div class="pad t-s">Activity feed.</div></ds-tab>
            </ds-tabs>
          </div>
        </ds-page-header>
      </div>

      <h3 class="block-title t-h4">Compact variant</h3>
      <p class="block-desc t-s">
        No breadcrumb, no tabs — just title + sub-line + action row. For embedded views (drawers,
        secondary pages) where the chrome already establishes location.
      </p>
      <div class="stage">
        <ds-page-header
          [compact]="true"
          title="Edit allocation"
          subtitle="3 lanes affected · auto-recompute on save"
        >
          <div actions>
            <ds-button variant="ghost">Discard</ds-button>
            <ds-button>Save</ds-button>
          </div>
        </ds-page-header>
      </div>

      <h3 class="block-title t-h4">Usage</h3>
      <ul class="rules">
        <li>One status badge maximum in the title row. Promote any second status to a banner or stat tile.</li>
        <li>Primary action sits on the right; secondary actions go in a ghost button or overflow menu.</li>
        <li>Tabs sit immediately below the title row — never above the breadcrumb.</li>
        <li>The Page header component is documented under Components &gt; Page header. This pattern covers composition.</li>
      </ul>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }
    .stage {
      margin-top: var(--s-3);
      padding: var(--s-5);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
      display: grid;
      gap: var(--s-3);
    }
    .pad { padding: var(--s-3) 0; color: var(--text-secondary); }
    .rules {
      margin-top: var(--s-3);
      padding-left: var(--s-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--s-2);
      max-width: var(--col-cap-text);
    }
  `],
})
export class PageHeaderSection {
  protected readonly lede =
    'How a record page assembles breadcrumb, title, status, primary actions and tabs into a single header. The component itself lives under Components — this pattern documents how to compose it.';

  protected readonly crumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Records', href: '/records' },
    { label: 'Project Alpha' },
  ];
}
