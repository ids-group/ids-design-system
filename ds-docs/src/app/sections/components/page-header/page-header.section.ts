import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, BreadcrumbsComponent, ButtonComponent, IconComponent, PageHeaderComponent, TabsComponent, TabComponent, type BreadcrumbItem } from 'ds';

@Component({
  selector: 'section-components-page-header',
  standalone: true,
  imports: [BadgeComponent, BreadcrumbsComponent, ButtonComponent, IconComponent, PageHeaderComponent, TabsComponent, TabComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-page-header" data-anchor="page-header" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Page header</h2>
      <p class="lede t-m">
        Top of every page: title, optional lede, primary action area, optional bottom tabs. Distinct from the Page header pattern, which documents the full page composition around this block.
      </p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">Title, lede, actions row, bottom tabs — the full composition.</p>
      <div class="stage">
        <ds-page-header title="Project Alpha" subtitle="30 Apr – 3 May · North Site · 4 sub-records">
          <ng-container actions>
            <ds-button variant="ghost"><ds-icon name="archive" [size]="14" /> Archive</ds-button>
            <ds-button variant="ghost"><ds-icon name="download" [size]="14" /> Export</ds-button>
            <ds-button><ds-icon name="plus" [size]="14" /> Add sub-record</ds-button>
          </ng-container>
          <ds-tabs tabs>
            <ds-tab label="Overview"><span></span></ds-tab>
            <ds-tab label="Sub-records"><span></span></ds-tab>
            <ds-tab label="Resource allocation"><span></span></ds-tab>
            <ds-tab label="Logistics plan"><span></span></ds-tab>
            <ds-tab label="Activity"><span></span></ds-tab>
          </ds-tabs>
        </ds-page-header>
        <div class="content-placeholder" aria-hidden="true">Page content area</div>
      </div>

      <!-- ============================================================ Compact -->
      <h3 class="block-title t-h4">Compact</h3>
      <p class="block-desc t-s">No lede, single-line title with actions inline. Used on index pages and inside dialogs.</p>
      <div class="stage">
        <ds-page-header title="Records" [compact]="true">
          <ng-container actions>
            <ds-button variant="ghost"><ds-icon name="filter" [size]="14" /> Filters</ds-button>
            <ds-button><ds-icon name="plus" [size]="14" /> New record</ds-button>
          </ng-container>
        </ds-page-header>
        <div class="content-placeholder" aria-hidden="true">Page content area</div>
      </div>

      <!-- ============================================================ With breadcrumb above title -->
      <h3 class="block-title t-h4">With breadcrumb above title</h3>
      <p class="block-desc t-s">Full hierarchy demo — breadcrumb trail, eyebrow, title, lede, primary action.</p>
      <div class="stage">
        <ds-page-header eyebrow="Record · 2026 Cycle" title="Project Alpha" subtitle="30 Apr – 3 May · North Site · 4 sub-records">
          <ds-breadcrumbs breadcrumbs [items]="trail" />
          <ng-container actions>
            <ds-button><ds-icon name="plus" [size]="14" /> Add sub-record</ds-button>
          </ng-container>
        </ds-page-header>
        <div class="content-placeholder" aria-hidden="true">Page content area</div>
      </div>

      <!-- ============================================================ With status badge inline with title -->
      <h3 class="block-title t-h4">With status badge inline with title</h3>
      <p class="block-desc t-s">Lifecycle pill sits next to the title. Max one status badge per header.</p>
      <div class="stage">
        <ds-page-header title="Project Alpha" subtitle="30 Apr – 3 May · North Site">
          <ds-badge title-badge variant="confirmed" [withDot]="true">Confirmed</ds-badge>
          <ng-container actions>
            <ds-button><ds-icon name="edit" [size]="14" /> Edit</ds-button>
          </ng-container>
        </ds-page-header>
        <div class="content-placeholder" aria-hidden="true">Page content area</div>
      </div>

      <!-- ============================================================ With divider -->
      <h3 class="block-title t-h4">With divider</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[divider]="true"</code> draws a hairline rule beneath the meta row, separating the header from the page content. Default is flush (no divider) — opt in when the content below doesn't supply its own framing.
      </p>
      <div class="stage">
        <ds-page-header title="Project Alpha" subtitle="30 Apr – 3 May · North Site" [divider]="true">
          <ng-container actions>
            <ds-button><ds-icon name="edit" [size]="14" /> Edit</ds-button>
          </ng-container>
        </ds-page-header>
        <div class="content-placeholder" aria-hidden="true">Page content area</div>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Title</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover when clipped — the title carries identity.</span>
          </li>
          <li>
            <span class="trunc__field">Subtitle / lede</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Eyebrow</span>
            <span class="trunc__behaviour">Single line, no clip — keep eyebrow short by spec. Wraps if forced.</span>
          </li>
          <li>
            <span class="trunc__field">Breadcrumb segment</span>
            <span class="trunc__behaviour">Single line, ellipsis at ~24 ch per segment. Middle segments collapse to … before the leaf clips.</span>
          </li>
          <li>
            <span class="trunc__field">Status badge</span>
            <span class="trunc__behaviour">Single line, no clip — status labels are short by spec. Max one badge per header.</span>
          </li>
          <li>
            <span class="trunc__field">Action buttons</span>
            <span class="trunc__behaviour">Single line, no clip. Beyond two ghost + one primary actions, collapse the rest into an overflow menu.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    /* ---------- Stage ---------- */
    .stage {
      margin-top: var(--s-3);
      padding: var(--s-5);
      background: var(--surface-canvas);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }

    /* Pseudo content area under <ds-page-header> so the header's
       border-bottom (separator vs page content) doesn't look orphan
       in the docs stage isolation. Margin-top mirrors the stage's own
       inner padding so the placeholder reads as "real page content
       beginning here" — symmetric with the gap between the header's
       top edge and the stage's top padding above it. */
    .content-placeholder {
      margin-top: var(--s-5);
      padding: var(--s-8) var(--s-4);
      text-align: center;
      font: var(--fw-regular) var(--fs-xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      opacity: 0.6;
    }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--s-2);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--s-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--s-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--fw-bold) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }
  `],
})
export class PageHeaderSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
