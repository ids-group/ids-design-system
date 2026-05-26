import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, StatusDotComponent } from 'ds';

@Component({
  selector: 'section-components-status-dot',
  standalone: true,
  imports: [IconComponent, StatusDotComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-status-dot" data-anchor="status-dot" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Status dots</h2>
      <p class="lede t-m">Tiny coloured atom paired with a label. Same palette as lifecycle badges — use when a full pill is too heavy.</p>

      <h3 class="block-title t-h4">Variants</h3>
      <div class="row">
        <span class="status-line"><ds-status-dot status="active" /> Active</span>
        <span class="status-line"><ds-status-dot status="warning" /> Pending</span>
        <span class="status-line"><ds-status-dot status="error" /> Conflict</span>
        <span class="status-line"><ds-status-dot status="planning" /> Planning</span>
        <span class="status-line"><ds-status-dot status="confirmed" /> Confirmed</span>
        <span class="status-line"><ds-status-dot status="completed" /> Completed</span>
      </div>

      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Status pill</span>
            <span class="trunc__behaviour">No clip — lifecycle labels are fixed and short (Planning, Active, etc.).</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .row {
      display: flex; gap: var(--s-5); align-items: center; flex-wrap: wrap;
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .status-line {
      display: inline-flex; align-items: center; gap: var(--s-2);
      font: var(--fw-medium) var(--fs-s)/var(--lh-flat) var(--font-sans);
      color: var(--text-primary);
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
export class StatusDotSection {}
