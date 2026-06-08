import { Component, ViewEncapsulation } from '@angular/core';
import { BreadcrumbsComponent, IconComponent, SearchComponent, TopBarComponent, type BreadcrumbItem } from 'ds';

@Component({
  selector: 'section-components-topbar',
  standalone: true,
  imports: [BreadcrumbsComponent, IconComponent, SearchComponent, TopBarComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-topbar" data-anchor="topbar" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Top bar</h2>
      <p class="lede t-m">
        Application chrome at the top of every page. Brand left, optional search or breadcrumb centre, action cluster right.
      </p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">Full composition — brand title, centred search, action cluster with avatar.</p>
      <div class="stage stage--frame">
        <ds-topbar>
          <span title>Atlas</span>
          <ds-search search placeholder="Search records, items, people…" shortcut="⌘ K" />
          <ng-container actions>
            <button class="action" aria-label="Help"><ds-icon name="help" [size]="18" /></button>
            <button class="action" aria-label="Notifications"><ds-icon name="bell" [size]="18" /><span class="ping"></span></button>
            <span class="avatar">AB</span>
          </ng-container>
        </ds-topbar>
      </div>

      <!-- ============================================================ Minimal -->
      <h3 class="block-title t-h4">Minimal</h3>
      <p class="block-desc t-s">Brand + actions only. No search, no breadcrumb. Useful inside dialogs or app shells with a dedicated search route.</p>
      <div class="stage stage--frame">
        <ds-topbar>
          <span title>Atlas</span>
          <ng-container actions>
            <button class="action" aria-label="Notifications"><ds-icon name="bell" [size]="18" /></button>
            <span class="avatar">AB</span>
          </ng-container>
        </ds-topbar>
      </div>

      <!-- ============================================================ With breadcrumb -->
      <h3 class="block-title t-h4">With breadcrumb</h3>
      <p class="block-desc t-s">Breadcrumb trail anchored left next to the brand — common on deep record pages where context outweighs lookup.</p>
      <div class="stage stage--frame">
        <ds-topbar>
          <span title>Atlas</span>
          <ds-breadcrumbs breadcrumbs [items]="trail" />
          <ng-container actions>
            <button class="action" aria-label="Notifications"><ds-icon name="bell" [size]="18" /></button>
            <span class="avatar">AB</span>
          </ng-container>
        </ds-topbar>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">App / account label</span>
            <span class="trunc__behaviour">Single line, ellipsis at ~20 ch. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Search input</span>
            <span class="trunc__behaviour">Single line, no clip while focused. Placeholder ellipses if the bar shrinks.</span>
          </li>
          <li>
            <span class="trunc__field">Breadcrumb segments</span>
            <span class="trunc__behaviour">Middle segments collapse to … before the leaf clips. Leaf truncates last with a tooltip.</span>
          </li>
          <li>
            <span class="trunc__field">Action icons</span>
            <span class="trunc__behaviour">No visible label — full label lives in aria-label and tooltip-on-hover.</span>
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

    /* ---------- Stage frame ---------- */
    .stage { margin-top: var(--s-3); }
    .stage--frame {
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      overflow: hidden;
    }

    /* ---------- Inline action icon-buttons inside topbar actions slot ---------- */
    .action {
      position: relative;
      width: var(--hit-min);
      height: var(--hit-min);
      display: grid;
      place-items: center;
      border: 0;
      background: transparent;
      border-radius: var(--r-md);
      color: var(--icon-default);
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease-standard);

      &:hover { background: var(--surface-secondary); color: var(--icon-strong); }
      &:focus-visible { outline: none; box-shadow: var(--focus-ring); }

      .ping {
        position: absolute;
        top: var(--s-1-5);
        right: var(--s-1-5);
        width: var(--status-dot-size);
        height: var(--status-dot-size);
        background: var(--error);
        border: var(--bw-strong) solid var(--surface-default);
        border-radius: var(--r-pill);
      }
    }

    /* ---------- Inline avatar specimen ---------- */
    .avatar {
      width: var(--avatar-sm);
      height: var(--avatar-sm);
      border-radius: var(--r-pill);
      background: var(--primary-muted);
      color: var(--primary-strong);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-flat) var(--font-sans);
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      letter-spacing: var(--ls-wide);
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
export class TopbarSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
