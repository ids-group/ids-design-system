import { Component, ViewEncapsulation, signal } from '@angular/core';
import { PaginationComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-pagination',
  standalone: true,
  imports: [PaginationComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-pagination" data-anchor="pagination" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Pagination</h2>
      <p class="lede t-m">Page navigation for tabular data — ellipsis when ranges exceed 7 visible items.</p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">12 pages, current page in the middle. One ellipsis appears between the leading 1 and the centred range.</p>
      <div class="row">
        <ds-pagination
          [total]="120"
          [pageSize]="10"
          [currentPage]="pageDefault()"
          (pageChange)="pageDefault.set($event)"
        />
      </div>

      <!-- ============================================================ States showcase -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Page-button states side-by-side. Raw <code>.pagination-button</code> markup so forced-state hooks pin the visual without interaction.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><button class="pagination-button">4</button></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button class="pagination-button is-forced-hover">4</button></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button class="pagination-button is-active">4</button></div>
          <div class="state-cell__label">Active · current page</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <button class="pagination-button" disabled aria-label="Previous">
              <ds-icon name="chevronLeft" [size]="14" />
            </button>
          </div>
          <div class="state-cell__label">Prev · disabled (page 1)</div>
        </div>
      </div>

      <!-- ============================================================ Ranges -->
      <h3 class="block-title t-h4">Ranges</h3>
      <p class="block-desc t-s">Ellipsis kicks in once the total exceeds 7 items. With more pages, the centred window stays 3 items wide; ellipses fill the gap on either side as needed.</p>
      <div class="ranges">
        <div class="ranges__row">
          <div class="ranges__label t-overline">3 pages · no ellipsis</div>
          <ds-pagination [total]="30" [pageSize]="10" [currentPage]="2" [showLabel]="false" />
        </div>
        <div class="ranges__row">
          <div class="ranges__label t-overline">8 pages · one ellipsis</div>
          <ds-pagination [total]="80" [pageSize]="10" [currentPage]="2" [showLabel]="false" />
        </div>
        <div class="ranges__row">
          <div class="ranges__label t-overline">24 pages · two ellipses</div>
          <ds-pagination [total]="240" [pageSize]="10" [currentPage]="12" [showLabel]="false" />
        </div>
        <div class="ranges__row">
          <div class="ranges__label t-overline">100 pages · two ellipses</div>
          <ds-pagination [total]="1000" [pageSize]="10" [currentPage]="50" [showLabel]="false" />
        </div>
      </div>

      <!-- ============================================================ With page-size select -->
      <h3 class="block-title t-h4">With page-size select</h3>
      <p class="block-desc t-s">Pager with the built-in items-per-page selector. The <code>&lt;ds-pagination&gt;</code> component renders its own size control — no external dropdown needed.</p>
      <div class="page-size-row">
        <ds-pagination
          [total]="500"
          [(pageSize)]="pageSizeWith"
          [(currentPage)]="pageWith"
          [showLabel]="false"
        />
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Page number</span>
            <span class="trunc__behaviour">Single digit / short numeral — no clip ever.</span>
          </li>
          <li>
            <span class="trunc__field">Ellipsis</span>
            <span class="trunc__behaviour">Three dots only — no clip.</span>
          </li>
          <li>
            <span class="trunc__field">Total count</span>
            <span class="trunc__behaviour">Plain text — wraps in narrow viewports.</span>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); }
    .row { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; margin-top: var(--space-3); }
    code {
      font: var(--font-weight-medium) var(--font-size-2xs)/var(--line-height-flat) var(--font-mono);
      padding: 0 var(--space-1);
      background: var(--surface-secondary);
      border-radius: var(--radius-sm);
    }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell { display: flex; flex-direction: column; gap: var(--space-2); }
    .state-cell__stage {
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-4);
      min-height: 72px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
    }
    .state-cell__label {
      text-align: center;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* ---------- Ranges block ---------- */
    .ranges {
      display: flex; flex-direction: column;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .ranges__row {
      display: flex; flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
    }
    .ranges__label { color: var(--text-tertiary); }

    /* ---------- With page-size ---------- */
    .page-size-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
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
  `],
})
export class PaginationSection {
  protected readonly pageDefault = signal(4);
  protected readonly pageWith = signal(3);
  protected readonly pageSizeWith = signal(20);
}
