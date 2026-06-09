import { Component, ViewEncapsulation } from '@angular/core';
import { CardComponent, type CardElevation, type CardPadding } from 'ds';

@Component({
  selector: 'section-components-card',
  standalone: true,
  imports: [CardComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-card" data-anchor="card" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Cards</h2>
      <p class="lede t-m">Surface container for compositions — header, body, footer slots. Three paddings, three elevations.</p>

      <!-- ============================================================ Elevations × paddings -->
      <h3 class="block-title t-h4">Elevations × paddings</h3>
      <p class="block-desc t-s">Nine cells. Same content, every combination of elevation and padding.</p>
      <div class="matrix">
        <div></div>
        <div class="t-overline">padding="sm"</div>
        <div class="t-overline">padding="md"</div>
        <div class="t-overline">padding="lg"</div>
        @for (elevation of elevations; track elevation) {
          <div class="t-overline matrix__row-label">{{ elevation }}</div>
          @for (padding of paddings; track padding) {
            <ds-card [elevation]="elevation" [padding]="padding">
              <div class="t-overline matrix__cell-eyebrow">Project</div>
              <h4 class="t-h5 matrix__cell-title">Project Alpha</h4>
              <p class="t-s matrix__cell-body">30 Apr – 3 May 2026 · North Site</p>
              <span class="t-s matrix__cell-link link">View details</span>
            </ds-card>
          }
        }
      </div>

      <!-- ============================================================ Composition: header / body / footer -->
      <h3 class="block-title t-h4">Header · body · footer</h3>
      <p class="block-desc t-s">Card is a single content surface — compose head, body and foot as inner regions.</p>
      <div class="grid-3">
        <ds-card elevation="raised" padding="md">
          <div class="card-head">
            <div class="t-overline">Project</div>
            <span class="card-head__meta t-caption">ORD-2026-0142</span>
          </div>
          <div class="card-body">
            <h4 class="t-h5 card-body__title">Project Alpha</h4>
            <p class="t-s card-body__text">30 Apr – 3 May 2026 · North Site</p>
          </div>
          <div class="card-foot">
            <span class="t-caption muted">Updated 4m ago</span>
            <span class="t-s link">View details</span>
          </div>
        </ds-card>

        <ds-card elevation="raised" padding="md">
          <div class="card-head">
            <div class="t-overline">Project</div>
            <span class="card-head__meta t-caption">ORD-2026-0156</span>
          </div>
          <div class="card-body">
            <h4 class="t-h5 card-body__title">Project Beta</h4>
            <p class="t-s card-body__text">22 – 25 May 2026 · Two-site rollout. Sign-off pending site survey.</p>
          </div>
          <div class="card-foot">
            <span class="t-caption muted">Updated yesterday</span>
            <span class="t-s link">View details</span>
          </div>
        </ds-card>

        <ds-card elevation="raised" padding="md">
          <div class="card-head">
            <div class="t-overline">Initiative</div>
            <span class="card-head__meta t-caption">ORD-2026-0157</span>
          </div>
          <div class="card-body">
            <h4 class="t-h5 card-body__title">Q3 Initiative</h4>
            <p class="t-s card-body__text">22 – 25 Aug 2026 · South Hub</p>
          </div>
          <div class="card-foot">
            <span class="t-caption muted">Draft</span>
            <span class="t-s link">View details</span>
          </div>
        </ds-card>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Header title</span>
            <span class="trunc__behaviour">Single line, ellipsis at ~32 ch. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Body copy</span>
            <span class="trunc__behaviour">Wrap freely. No line clamp by default; consumer applies clamp if needed.</span>
          </li>
          <li>
            <span class="trunc__field">Footer actions</span>
            <span class="trunc__behaviour">Stay below; collapse to icon-only on narrow widths.</span>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); }
    .muted { color: var(--text-tertiary); }

    /* ---------- Elevations × paddings matrix ---------- */
    .matrix {
      display: grid;
      grid-template-columns: 120px repeat(3, 1fr);
      gap: var(--s-4);
      align-items: stretch;
      margin-top: var(--s-3);
    }
    .matrix > .t-overline { align-self: end; padding-bottom: var(--s-1); }
    .matrix__row-label { color: var(--text-tertiary); align-self: center; }
    .matrix__cell-eyebrow { color: var(--text-tertiary); }
    .matrix__cell-title { margin: var(--s-2) 0 var(--s-1); }
    .matrix__cell-body { color: var(--text-secondary); margin: 0 0 var(--s-3); }
    .matrix__cell-link { color: var(--text-link); text-decoration: underline; text-underline-offset: 3px; }
    .link { color: var(--text-link); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }

    /* ---------- Composition grid ---------- */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .card-head {
      display: flex; align-items: baseline; justify-content: space-between;
      gap: var(--s-3);
      padding-bottom: var(--s-3);
      border-bottom: var(--bw-default) solid var(--border-divider);
    }
    .card-head__meta { color: var(--text-tertiary); font-family: var(--font-mono); }
    .card-body { padding: var(--s-3) 0; }
    .card-body__title { margin: 0 0 var(--s-1); }
    .card-body__text { color: var(--text-secondary); margin: 0; }
    .card-foot {
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--s-3);
      padding-top: var(--s-3);
      border-top: var(--bw-default) solid var(--border-divider);
    }
    .card-foot a { color: var(--text-link); text-decoration: underline; text-underline-offset: 3px; }

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
export class CardSection {
  protected readonly elevations: readonly CardElevation[] = ['flat', 'raised', 'hover'];
  protected readonly paddings: readonly CardPadding[] = ['sm', 'md', 'lg'];
}
