import { Component, ViewEncapsulation } from '@angular/core';
import { BreadcrumbsComponent, IconComponent, type BreadcrumbItem } from 'ds';

@Component({
  selector: 'section-components-breadcrumbs',
  standalone: true,
  imports: [BreadcrumbsComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-breadcrumbs" data-anchor="breadcrumbs" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Breadcrumbs</h2>
      <p class="lede t-m">Trail to root. The last item is the current page (no href). Middle segments collapse to <code class="t-mono">…</code> before the leaf clips.</p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">Four levels — leaf is the current page, bold and non-interactive.</p>
      <div class="stage">
        <ds-breadcrumbs [items]="defaultTrail" />
      </div>

      <!-- ============================================================ Long trail with ellipsis collapse -->
      <h3 class="block-title t-h4">Long trail · ellipsis collapse</h3>
      <p class="block-desc t-s">Six original levels collapsed to root · … · parent · leaf. The middle "…" is a static glyph; the live affordance would be a menu trigger that re-expands.</p>
      <div class="stage">
        <ds-breadcrumbs [items]="longTrail" />
      </div>
      <div class="legend t-s">
        <span class="legend__cell"><span class="legend__dim">Full path:</span> Workspace · Clients · Acme Co. · Policies · 2026 Cycle · P-12894</span>
      </div>

      <!-- ============================================================ Single level -->
      <h3 class="block-title t-h4">Single level</h3>
      <p class="block-desc t-s">Root + leaf — the shortest meaningful trail. Anything shorter renders no breadcrumb at all.</p>
      <div class="stage">
        <ds-breadcrumbs [items]="singleLevel" />
      </div>

      <!-- ============================================================ Custom separator -->
      <h3 class="block-title t-h4">Custom separator</h3>
      <p class="block-desc t-s">
        Default separator is <code class="t-mono">chevronRight</code>. Override via the <code class="t-mono">[separator]</code> input or globally via <code class="t-mono">provideDsConfig({{ '{' }} breadcrumbs: {{ '{' }} separator: 'arrowRight' {{ '}' }} {{ '}' }})</code>.
      </p>
      <div class="stage">
        <ds-breadcrumbs [items]="defaultTrail" separator="arrowRight" />
      </div>

      <!-- ============================================================ Non-clickable -->
      <h3 class="block-title t-h4">Non-clickable</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[clickable]="false"</code> disables item activation — useful for read-only trails (audit logs, archived snapshots) where you want the path visible but not navigable.
      </p>
      <div class="stage">
        <ds-breadcrumbs [items]="defaultTrail" [clickable]="false" />
      </div>

      <!-- ============================================================ Service-driven -->
      <h3 class="block-title t-h4">Service-driven (route-aware apps)</h3>
      <p class="block-desc t-s">
        Omit <code class="t-mono">[items]</code> and the component reads from <code class="t-mono">BreadcrumbsService.items</code> — apps push crumbs from route data or an effect when the page model resolves.
      </p>
      <pre class="snippet t-mono"><code>{{ '// in a page component or route effect' }}
import {{ '{' }} BreadcrumbsService {{ '}' }} from 'ds';
private readonly crumbs = inject(BreadcrumbsService);
this.crumbs.set([
  {{ '{' }} label: 'Workspace', href: '/' {{ '}' }},
  {{ '{' }} label: 'Records', href: '/records' {{ '}' }},
  {{ '{' }} label: 'P-12894' {{ '}' }},
]);

{{ '// template — items input omitted, reads from service' }}
&lt;ds-breadcrumbs /&gt;</code></pre>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Item label</span>
            <span class="trunc__behaviour">Single line, ellipsis at long labels. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Separator</span>
            <span class="trunc__behaviour">Single glyph (slash or chevron) — no clip.</span>
          </li>
          <li>
            <span class="trunc__field">Current item</span>
            <span class="trunc__behaviour">Bold; truncates last if overflows total width.</span>
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

    .stage {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
      display: flex;
      align-items: center;
    }

    .legend {
      margin-top: var(--s-2);
      color: var(--text-tertiary);
    }
    .legend__cell { display: inline-flex; gap: var(--s-2); align-items: baseline; }
    .legend__dim {
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
    }

    /* ---------- Truncation block (shared convention from button.section.ts) ---------- */
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

    .snippet {
      display: block;
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-md);
      font-size: var(--fs-xs);
      color: var(--text-primary);
      white-space: pre-wrap;
      overflow-x: auto;
    }
  `],
})
export class BreadcrumbsSection {
  protected readonly defaultTrail: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Clients', href: '/clients' },
    { label: 'Acme Co.', href: '/clients/acme' },
    { label: 'P-12894' },
  ];

  protected readonly longTrail: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: '…' },
    { label: 'Policies', href: '/clients/acme/policies' },
    { label: 'P-12894' },
  ];

  protected readonly singleLevel: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Settings' },
  ];
}
