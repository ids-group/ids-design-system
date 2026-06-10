import { Component, ViewEncapsulation } from '@angular/core';
import { SkeletonComponent } from 'ds';

@Component({
  selector: 'section-components-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-skeleton" data-anchor="skeleton" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Skeleton</h2>
      <p class="lede t-m">
        Shimmer placeholder while data is loading. Render via
        <code class="t-mono">&lt;ds-skeleton width="…" height="…"&gt;</code>;
        the <code class="t-mono">[circle]</code> input rounds to a pill
        (avatars, status dots).
      </p>

      <h3 class="block-title t-h4">Common patterns</h3>
      <div class="patterns">
        <div class="pattern">
          <div class="pattern__lbl t-caption">Single line</div>
          <ds-skeleton width="280px" height="14px" />
        </div>

        <div class="pattern">
          <div class="pattern__lbl t-caption">Paragraph (3 lines)</div>
          <ds-skeleton width="100%" height="14px" />
          <ds-skeleton width="100%" height="14px" />
          <ds-skeleton width="60%" height="14px" />
        </div>

        <div class="pattern">
          <div class="pattern__lbl t-caption">Avatar</div>
          <ds-skeleton [circle]="true" width="40px" height="40px" />
        </div>

        <div class="pattern">
          <div class="pattern__lbl t-caption">Table row (in cells)</div>
          <div class="table-row">
            <ds-skeleton height="14px" />
            <ds-skeleton height="14px" />
            <ds-skeleton height="14px" />
            <ds-skeleton height="14px" />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }

    .patterns {
      display: grid;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    .pattern { display: flex; flex-direction: column; gap: var(--space-2); }
    .pattern__lbl { color: var(--text-secondary); }
    .table-row {
      display: grid;
      grid-template-columns: 2fr 2fr 2fr 1fr;
      gap: var(--space-3);
    }
    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `],
})
export class SkeletonSection {}
