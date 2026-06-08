import { Component, ViewEncapsulation } from '@angular/core';
import {
  IconComponent,
  type IconName,
} from 'ds';

interface IconSize {
  readonly token: string;
  readonly px: number;
  readonly use: string;
}

const SIZES: readonly IconSize[] = [
  { token: '--icon-xs', px: 12, use: 'Inline meta, tag close' },
  { token: '--icon-sm', px: 14, use: 'Compact buttons, dense tables' },
  { token: '--icon-md', px: 16, use: 'UI default' },
  { token: '--icon-lg', px: 20, use: 'Sidenav, larger buttons' },
  { token: '--icon-xl', px: 24, use: 'Hero, banner icons' },
];

const SAMPLES: readonly IconName[] = [
  'search', 'calendar', 'truck', 'box', 'users', 'map',
  'activity', 'settings', 'bell', 'chart', 'filter', 'edit',
];

@Component({
  selector: 'section-components-icon',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-icon" data-anchor="icon" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Icon</h2>
      <p class="lede t-m">
        Inline SVG icons rendered through <code class="t-mono">&lt;ds-icon&gt;</code>. 2-px stroke, rounded caps,
        <code class="t-mono">currentColor</code> fills. Driven by the <code class="t-mono">name</code> input and a fixed size scale.
      </p>

      <!-- ============================================================ Sizes -->
      <h3 class="block-title t-h4">Sizes</h3>
      <p class="block-desc t-s">Five canonical sizes. Every glyph renders inside a 24-unit viewBox at <code class="t-mono">stroke-width: 1.75</code>.</p>
      <div class="size-row">
        @for (size of sizes; track size.px) {
          <div class="size-cell">
            <div class="size-cell__stage" [style.height.px]="32">
              <ds-icon name="calendar" [size]="size.px" />
            </div>
            <code class="t-mono size-cell__tok">{{ size.token }}</code>
            <div class="t-caption">{{ size.px }}px · {{ size.use }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Sample names -->
      <h3 class="block-title t-h4">Sample names</h3>
      <p class="block-desc t-s">The library is broader; these are the most common app glyphs. See <a class="link" href="#section-icons">Foundations · Icons</a> for the full library.</p>
      <div class="sample-grid">
        @for (name of samples; track name) {
          <div class="sample-cell">
            <ds-icon [name]="name" [size]="20" />
            <code class="t-mono sample-cell__name">{{ name }}</code>
          </div>
        }
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
            <span class="trunc__field">Icon + text pair</span>
            <span class="trunc__behaviour">Glyph fixed; text label takes the remaining width and clips with ellipsis.</span>
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
    .link { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }

    /* ---------- Size scale ---------- */
    .size-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-6);
      margin-top: var(--s-3);
      align-items: flex-end;
    }
    .size-cell {
      display: grid;
      gap: var(--s-1);
      justify-items: center;
      min-width: 120px;
    }
    .size-cell__stage {
      display: grid;
      place-items: center;
      color: var(--icon-strong);
    }
    .size-cell__tok { font-size: 11px; color: var(--text-secondary); }

    /* ---------- Sample grid ---------- */
    .sample-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--s-2);
      margin-top: var(--s-3);
    }
    .sample-cell {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      padding: var(--s-3);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      background: var(--surface-default);
      color: var(--icon-strong);
      min-width: 0;
    }
    .sample-cell__name {
      font-size: var(--fs-xs);
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
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

    @media (max-width: 720px) {
      .trunc__list li { grid-template-columns: 1fr; }
    }
  `],
})
export class IconSection {
  protected readonly sizes = SIZES;
  protected readonly samples = SAMPLES;
}
