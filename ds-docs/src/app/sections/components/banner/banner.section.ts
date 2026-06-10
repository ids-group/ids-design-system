import { Component, ViewEncapsulation } from '@angular/core';
import { BannerComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-banner',
  standalone: true,
  imports: [BannerComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-banner" data-anchor="banner" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Banner</h2>
      <p class="lede t-m">
        Inline page-level message. Six severities — info, success, warning, severe, error, neutral —
        each with a default icon, optional title, and optional dismiss control.
      </p>

      <!-- ============================================================ Variants -->
      <h3 class="block-title t-h4">Variants</h3>
      <p class="block-desc t-s">Every banner severity as a permanent specimen.</p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="info" title="Inventory sync paused" [dismissible]="true">
              Last sync 14 minutes ago. Resume to fetch the latest asset register.
            </ds-banner>
          </div>
          <div class="state-cell__label">Info</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="success" title="3 logistics plans recomputed" [dismissible]="true">
              All allocations are within the 95% capacity limit.
            </ds-banner>
          </div>
          <div class="state-cell__label">Success</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="warning" title="Approaching capacity limit" [dismissible]="true">
              Lane 04 is at 92% of the 95% volume cap.
            </ds-banner>
          </div>
          <div class="state-cell__label">Warning</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="error" title="Resource conflict detected" [dismissible]="true">
              2× Conference room kit is allocated to both Alpha (30 Jul) and Delta (5 Aug). Resolve before save.
            </ds-banner>
          </div>
          <div class="state-cell__label">Error</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="neutral" title="Maintenance window scheduled" [dismissible]="true">
              Read-only access this Sunday 02:00–04:00 UTC.
            </ds-banner>
          </div>
          <div class="state-cell__label">Neutral</div>
        </div>
      </div>

      <!-- ============================================================ With actions -->
      <h3 class="block-title t-h4">With actions</h3>
      <p class="block-desc t-s">Banner with a primary follow-up action — used when the user must respond.</p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="severe" title="Recompute required">
              Changing the build start will recompute 3 Logistics plans and 12 Resource allocations across Alpha, Beta and Gamma.
              <ng-container actions>
                <button class="button m">Preview impact</button>
                <button class="button outline m">Cancel</button>
              </ng-container>
            </ds-banner>
          </div>
          <div class="state-cell__label">Severe · with actions</div>
        </div>
      </div>

      <!-- ============================================================ Compact -->
      <h3 class="block-title t-h4">Compact</h3>
      <p class="block-desc t-s">Single-line variant — title and dismiss only, no body.</p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="info" title="Schedule updated · changes go live in 5 min" [compact]="true" [dismissible]="true" />
          </div>
          <div class="state-cell__label">Compact · info</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="warning" title="Unsaved changes — leaving will discard them" [compact]="true" [dismissible]="true" />
          </div>
          <div class="state-cell__label">Compact · warning</div>
        </div>
      </div>

      <!-- ============================================================ Layout: row vs stacked -->
      <h3 class="block-title t-h4">Layout</h3>
      <p class="block-desc t-s">
        <code class="t-mono">layout="stacked"</code> (default) wraps actions onto a new line; use for multi-line messages or several CTAs.
        <code class="t-mono">layout="row"</code> keeps actions on the right edge, vertically centred with the body; use for one-line messages with a single trailing CTA.
      </p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="info" title="Schedule updated" layout="row">
              Changes go live in 5 minutes.
              <ng-container actions>
                <button class="button m">Preview</button>
              </ng-container>
            </ds-banner>
          </div>
          <div class="state-cell__label">layout="row"</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="warning" title="Approaching capacity limit" layout="stacked">
              Lane 04 is at 92% of the 95% volume cap. Re-balance allocations or raise the cap before scheduling new pickups.
              <ng-container actions>
                <button class="button m">Re-balance</button>
                <button class="button outline m">Raise cap</button>
              </ng-container>
            </ds-banner>
          </div>
          <div class="state-cell__label">layout="stacked"</div>
        </div>
      </div>

      <!-- ============================================================ Accent rail toggle -->
      <h3 class="block-title t-h4">Accent rail</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[accentRail]="true"</code> (default) renders a coloured rail on the left edge to amplify variant. Toggle off for borderless / minimal contexts.
      </p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-banner variant="success" title="All checks passed" [accentRail]="false">
              12 resource allocations validated against the 95% capacity rule.
            </ds-banner>
          </div>
          <div class="state-cell__label">accentRail="false"</div>
        </div>
      </div>

      <!-- ============================================================ Inline -->
      <h3 class="block-title t-h4">Inline</h3>
      <p class="block-desc t-s">Borderless variant for use inside a panel — no card chrome of its own.</p>
      <div class="panel">
        <div class="panel__title t-overline">Project Alpha · activity</div>
        <ds-banner variant="success" title="All checks passed" class="banner-inline-host">
          12 resource allocations validated against the 95% capacity rule.
        </ds-banner>
        <div class="panel__row">
          <span class="t-s">Schedule confirmed · 4 May 2026</span>
          <span class="t-xs muted">Sam Carter</span>
        </div>
        <div class="panel__row">
          <span class="t-s">Site survey signed off</span>
          <span class="t-xs muted">Avery Brooks</span>
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
            <span class="trunc__field">Title</span>
            <span class="trunc__behaviour">Single line, ellipsis at row width. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Body</span>
            <span class="trunc__behaviour">Wrap, no clip. No clamp — banners are page-level and must stay fully readable.</span>
          </li>
          <li>
            <span class="trunc__field">Inline link in body</span>
            <span class="trunc__behaviour">Wraps with the body text. Underlined; never clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Dismiss icon</span>
            <span class="trunc__behaviour">Always visible. Never overlapped by title or body — body min-width: 0 keeps wrap correct.</span>
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
    .states--cols-1 { grid-template-columns: 1fr; }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--space-4);
      min-height: 88px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
    }
    .state-cell__stage > * { flex: 1; }
    .state-cell__label {
      text-align: center;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* ---------- Panel host for inline banner ----------
       Docs-only: strip the banner's card chrome so it sits flush inside the panel.
       Uses ::ng-deep because <ds-banner> is encapsulated; DS itself has no inline mode. */
    .panel {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-lg);
      display: flex; flex-direction: column;
      gap: var(--space-3);

      ::ng-deep .banner-inline-host .banner {
        border: 0;
        border-radius: 0;
        padding-left: 0;
        padding-right: 0;
        background: transparent;
        border-top: var(--border-width-default) solid var(--border-divider);
        border-bottom: var(--border-width-default) solid var(--border-divider);
      }
    }
    .panel__title {
      color: var(--text-tertiary);
    }
    .panel__row {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-2) 0;
      border-top: var(--border-width-default) solid var(--border-divider);
    }
    .muted { color: var(--text-tertiary); }

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
export class BannerSection {}
