import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, EmptyStateComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-empty-state',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-empty-state" data-anchor="empty-state" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Empty state</h2>
      <p class="lede t-m">
        The base component for any "nothing-to-show" state. One icon, a title that names what
        is missing, one sentence of body, and at most two actions. For richer scenarios
        (loading overlay, error retry, permission denied) see
        <a class="link" href="#section-pattern-empty-state">Patterns &rsaquo; Empty-state variants</a>.
      </p>

      <h3 class="block-title t-h4">Variants</h3>
      <p class="block-desc t-s">Four canonical variants. Each ships a distinct icon-tile tint.</p>
      <div class="variants-grid">
        <div class="variant-card">
          <ds-empty-state variant="none" title="No data" body="The default — section is empty."></ds-empty-state>
        </div>
        <div class="variant-card">
          <ds-empty-state variant="loading" title="Loading" body="Data refetching."></ds-empty-state>
        </div>
        <div class="variant-card">
          <ds-empty-state variant="error" title="Error" body="Something went wrong."></ds-empty-state>
        </div>
        <div class="variant-card">
          <ds-empty-state variant="locked" title="No access" body="Permission denied."></ds-empty-state>
        </div>
      </div>

      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Full demo of each variant with title, body and one primary action.</p>
      <div class="states-grid">
        <div class="state-card">
          <ds-empty-state
            variant="none"
            title="No asset allocated yet"
            body="Pick from the asset register to start building this Sub-record.">
            <ds-button actions variant="primary" size="m">
              <ds-icon name="plus" [size]="14" /> Allocate resources
            </ds-button>
          </ds-empty-state>
        </div>
        <div class="state-card">
          <ds-empty-state
            variant="error"
            title="Couldn't load resource allocations"
            body="Network error — the request timed out after 30 seconds.">
            <ds-button actions variant="primary" size="m">
              <ds-icon name="rotate" [size]="14" /> Retry
            </ds-button>
          </ds-empty-state>
        </div>
      </div>

      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Title</span>
            <span class="trunc__behaviour">Wraps to a second line if needed. Never clip — the user needs the full sentence to understand the state.</span>
          </li>
          <li>
            <span class="trunc__field">Body</span>
            <span class="trunc__behaviour">Wraps, no clip. Capped at ~360 px via max-width so a long sentence doesn't span the full card width.</span>
          </li>
          <li>
            <span class="trunc__field">CTA label</span>
            <span class="trunc__behaviour">Short verb phrases only (Retry, Allocate resources). If the action needs a sentence, the empty state copy is wrong.</span>
          </li>
          <li>
            <span class="trunc__field">Icon</span>
            <span class="trunc__behaviour">Fixed 28 px inside a 64 px rounded tile. Doesn't scale with title length — always centred above the title.</span>
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
    .link { color: var(--text-link); text-decoration: none; }
    .link:hover { text-decoration: underline; }

    .variants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
    .variant-card {
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .states-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
    .state-card {
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

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
export class EmptyStateComponentSection {}
