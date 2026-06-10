import { Component, ViewEncapsulation } from '@angular/core';
import { ICONS, IconComponent, type IconName } from 'ds';

interface SizeRow {
  readonly name: string;
  readonly token: string;
  readonly px: number;
  readonly use: string;
}

const SIZES: readonly SizeRow[] = [
  { name: 'xs', token: '--icon-xs', px: 12, use: 'Inline meta, tag close' },
  { name: 'sm', token: '--icon-sm', px: 14, use: 'Compact buttons, dense tables' },
  { name: 'md', token: '--icon-md', px: 16, use: 'UI default' },
  { name: 'lg', token: '--icon-lg', px: 20, use: 'Sidenav, larger buttons' },
  { name: 'xl', token: '--icon-xl', px: 24, use: 'Hero, banner icons' },
];

@Component({
  selector: 'section-foundations-icons',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-icons" data-anchor="icons" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Iconography</h2>
      <p class="lede t-m">
        2-px stroke, rounded caps, <code class="t-mono">currentColor</code> fills. Sizes derive from a fixed scale.
        Rendered via the <code class="t-mono">&lt;ds-icon&gt;</code> component which inlines SVG paths from
        <code class="t-mono">ICONS</code>.
      </p>

      <!-- ============================================================ Size scale -->
      <h3 class="block-title t-h4">Size scale</h3>
      <p class="block-desc t-s">Five canonical sizes. Every glyph renders inside a 24-unit viewBox at <code class="t-mono">stroke-width: 1.75</code>.</p>
      <div class="size-row">
        @for (s of sizes; track s.name) {
          <div class="size-cell">
            <div class="size-cell__stage" [style.height.px]="32">
              <ds-icon name="calendar" [size]="s.px" />
            </div>
            <code class="t-mono size-cell__tok">{{ s.token }}</code>
            <div class="t-caption">{{ s.px }}px · {{ s.use }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Full gallery -->
      <h3 class="block-title t-h4">Library ({{ names.length }})</h3>
      <p class="block-desc t-s">Every name in the <code class="t-mono">ICONS</code> registry. Pass as a string to <code class="t-mono">&lt;ds-icon name="…"&gt;</code>.</p>
      <div class="icon-grid">
        @for (name of names; track name) {
          <div class="icon-cell">
            <ds-icon [name]="name" [size]="20" />
            <code class="t-mono icon-cell__name">{{ name }}</code>
          </div>
        }
      </div>

      <!-- ============================================================ Colour roles -->
      <h3 class="block-title t-h4">Colour roles</h3>
      <p class="block-desc t-s">Icons inherit <code class="t-mono">currentColor</code>. The role tokens below set the parent <code class="t-mono">color</code>.</p>
      <div class="role-row">
        <div class="role-cell" style="color: var(--icon-strong)">
          <ds-icon name="settings" [size]="20" />
          <code class="t-mono role-cell__tok">--icon-strong</code>
        </div>
        <div class="role-cell" style="color: var(--icon-default)">
          <ds-icon name="settings" [size]="20" />
          <code class="t-mono role-cell__tok">--icon-default</code>
        </div>
        <div class="role-cell" style="color: var(--icon-muted)">
          <ds-icon name="settings" [size]="20" />
          <code class="t-mono role-cell__tok">--icon-muted</code>
        </div>
        <div class="role-cell role-cell--on-brand" style="color: var(--icon-on-primary)">
          <ds-icon name="settings" [size]="20" />
          <code class="t-mono role-cell__tok">--icon-on-primary</code>
        </div>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Glyph</span>
            <span class="trunc__behaviour">Never clipped — the SVG sits in a square frame at one of the fixed sizes.</span>
          </li>
          <li>
            <span class="trunc__field">Name label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Names are short identifiers — never wrap.</span>
          </li>
          <li>
            <span class="trunc__field">Icon + text pair</span>
            <span class="trunc__behaviour">Glyph fixed; text label takes the remaining width and clips with ellipsis.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }

    /* ---------- Size scale ---------- */
    .size-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-6);
      margin-top: var(--space-4);
      align-items: flex-end;
    }
    .size-cell {
      display: grid;
      gap: var(--space-1);
      justify-items: center;
      min-width: 120px;
    }
    .size-cell__stage {
      display: grid;
      place-items: center;
      color: var(--icon-strong);
    }
    .size-cell__tok { font-size: 11px; color: var(--text-secondary); }

    /* ---------- Icon gallery ---------- */
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-2);
      margin-top: var(--space-3);
    }
    .icon-cell {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-md);
      background: var(--surface-default);
      color: var(--icon-strong);
      min-width: 0;
    }
    .icon-cell__name {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    /* ---------- Role row ---------- */
    .role-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
    .role-cell {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-md);
      background: var(--surface-default);
    }
    .role-cell--on-brand {
      background: var(--primary);
      border-color: var(--primary);
    }
    .role-cell__tok {
      font-size: 11px;
      color: inherit;
    }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--space-2);
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--space-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--font-weight-bold) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }

    @media (max-width: 720px) {
      .trunc__list li { grid-template-columns: 1fr; }
    }
  `],
})
export class IconsSection {
  protected readonly names = Object.keys(ICONS) as IconName[];
  protected readonly sizes = SIZES;
}
