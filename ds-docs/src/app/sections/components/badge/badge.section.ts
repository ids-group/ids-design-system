import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, IconComponent, StatusDotComponent, TagComponent } from 'ds';

@Component({
  selector: 'section-components-badge',
  standalone: true,
  imports: [BadgeComponent, IconComponent, StatusDotComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-badge" data-anchor="badge" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Badges, tags &amp; status</h2>
      <p class="lede t-m">Stable status language across the product: Planning · Confirmed · Active · Completed.</p>

      <!-- ============================================================ Lifecycle states showcase -->
      <h3 class="block-title t-h4">Lifecycle states showcase</h3>
      <p class="block-desc t-s">Every event-status badge as a specimen.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge variant="planning" [withDot]="true">Planning</ds-badge>
          </div>
          <div class="state-cell__label">Planning</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge variant="confirmed" [withDot]="true">Confirmed</ds-badge>
          </div>
          <div class="state-cell__label">Confirmed</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge variant="active" [withDot]="true">Active</ds-badge>
          </div>
          <div class="state-cell__label">Active</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge variant="completed" [withDot]="true">Completed</ds-badge>
          </div>
          <div class="state-cell__label">Completed</div>
        </div>
      </div>

      <!-- ============================================================ Semantic states showcase -->
      <h3 class="block-title t-h4">Semantic states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="info">Info</ds-badge></div>
          <div class="state-cell__label">Info</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="success">Allocated</ds-badge></div>
          <div class="state-cell__label">Success</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="warning">Pending</ds-badge></div>
          <div class="state-cell__label">Warning</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="error">Conflict</ds-badge></div>
          <div class="state-cell__label">Error</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="neutral">Draft</ds-badge></div>
          <div class="state-cell__label">Neutral</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="neutral" [solid]="true">New</ds-badge></div>
          <div class="state-cell__label">Solid</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="neutral" [solid]="true">12</ds-badge></div>
          <div class="state-cell__label">Count · solid</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-badge variant="neutral">3</ds-badge></div>
          <div class="state-cell__label">Count · neutral</div>
        </div>
      </div>

      <!-- ============================================================ Per-instance tone -->
      <h3 class="block-title t-h4">Per-instance tone</h3>
      <p class="block-desc t-s">Override <code>--ds-badge-bg</code> / <code>--ds-badge-fg</code> inline for off-token tones (carrier brands etc). Prefer semantic variants for design-system tones.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge [style.--ds-badge-bg]="'#E1EFFF'" [style.--ds-badge-fg]="'#0A6DB3'">Aflac</ds-badge>
          </div>
          <div class="state-cell__label">Carrier · Aflac</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge [style.--ds-badge-bg]="'#D8F1EA'" [style.--ds-badge-fg]="'#15805A'">Guardian</ds-badge>
          </div>
          <div class="state-cell__label">Carrier · Guardian</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-badge [style.--ds-badge-bg]="'#FFF1D7'" [style.--ds-badge-fg]="'#A86B1A'">Assurity</ds-badge>
          </div>
          <div class="state-cell__label">Carrier · Assurity</div>
        </div>
      </div>

      <!-- ============================================================ Tags · status dots showcase -->
      <h3 class="block-title t-h4">Tags · status dots showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tag [closable]="true">Project Alpha</ds-tag>
          </div>
          <div class="state-cell__label">Tag · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tag variant="neutral" [closable]="true">Project Beta</ds-tag>
          </div>
          <div class="state-cell__label">Tag · neutral</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <span class="status-line"><ds-status-dot status="active" /> Active</span>
          </div>
          <div class="state-cell__label">Status dot · active</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <span class="status-line"><ds-status-dot status="warning" /> Pending</span>
          </div>
          <div class="state-cell__label">Status dot · pending</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <span class="status-line"><ds-status-dot status="error" /> Conflict</span>
          </div>
          <div class="state-cell__label">Status dot · conflict</div>
        </div>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Badge / tag label</span>
            <span class="trunc__behaviour">Single line, ellipsis at ~22 ch. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Status pill</span>
            <span class="trunc__behaviour">No clip — lifecycle labels are fixed and short (Planning, Active, etc.).</span>
          </li>
          <li>
            <span class="trunc__field">w3w</span>
            <span class="trunc__behaviour">No clip — the three-word address is a fixed length.</span>
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
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
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

    /* Inline status-dot + label cluster used in cells. */
    .status-line {
      display: inline-flex; align-items: center; gap: var(--space-2);
      font: var(--font-weight-medium) var(--font-size-s)/var(--line-height-flat) var(--font-sans);
      color: var(--text-primary);
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
export class BadgeSection {}
