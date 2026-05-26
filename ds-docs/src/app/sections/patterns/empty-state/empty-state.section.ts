import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, EmptyStateComponent, IconComponent } from 'ds';

@Component({
  selector: 'pattern-empty-state',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-pattern-empty-state" data-anchor="pattern-empty-state" class="section">
      <div class="eyebrow t-overline">Patterns</div>
      <h2 class="t-h2">Empty-state variants</h2>
      <p class="lede t-m">{{ lede }}</p>

      <div class="blocks">
        <!-- 1 · No data — default; nothing exists yet; one primary CTA. -->
        <div class="block">
          <h3 class="block-title t-h4">No data</h3>
          <p class="block-desc t-s">
            The default — section is empty because nothing exists yet.
          </p>
          <div class="card">
            <ds-empty-state
              variant="none"
              title="No asset allocated yet"
              body="Pick from the asset register to start building this Sub-record.">
              <ds-button actions variant="primary" size="m">
                <ds-icon name="plus" [size]="14" /> Allocate resources
              </ds-button>
            </ds-empty-state>
          </div>
        </div>

        <!-- 2 · Loading overlay — data exists but is being refetched. -->
        <div class="block">
          <h3 class="block-title t-h4">Loading overlay</h3>
          <p class="block-desc t-s">
            Data exists but is being refetched. The previous content stays visible behind a
            dimming layer.
          </p>
          <div class="card">
            <ds-empty-state
              variant="loading"
              title="12 asset lines"
              body="LED walls · Sub bass stacks · …">
            </ds-empty-state>
          </div>
        </div>

        <!-- 3 · Error with retry — network/server failure; retry is the only primary action. -->
        <div class="block">
          <h3 class="block-title t-h4">Error with retry</h3>
          <p class="block-desc t-s">
            Network or server failure. Retry is the only sensible primary action.
          </p>
          <div class="card">
            <ds-empty-state
              variant="error"
              title="Couldn't load resource allocations"
              body="Network error — the request timed out after 30 seconds.">
              <ds-button actions variant="primary" size="m">
                <ds-icon name="rotate" [size]="14" /> Retry
              </ds-button>
              <ds-button actions variant="ghost" size="m">Report issue</ds-button>
            </ds-empty-state>
          </div>
        </div>

        <!-- 4 · Permission denied — authenticated but role doesn't grant access. -->
        <div class="block">
          <h3 class="block-title t-h4">Permission denied</h3>
          <p class="block-desc t-s">
            The user is authenticated but their role doesn't grant access to this resource.
            Don't suggest "log in again" — give them an escape route.
          </p>
          <div class="card">
            <ds-empty-state
              variant="locked"
              title="You don't have access to this Logistics plan"
              body="Logistics plans are restricted to Logistics and Producer roles. Ask Alex Park or your team lead.">
              <ds-button actions variant="ghost" size="m">Back to dashboard</ds-button>
              <ds-button actions variant="ghost" size="m">Request access</ds-button>
            </ds-empty-state>
          </div>
        </div>
      </div>

      <h3 class="block-title t-h4">Usage</h3>
      <ul class="rules">
        <li>One primary action per empty state — never more. Pair with a ghost secondary only when retry needs an escape hatch.</li>
        <li>Concrete subject ("asset"), concrete next step ("pick from the asset register"). Skip generic copy and cheer.</li>
        <li>Loading overlay reuses the previous content silhouette behind a dim scrim — don't drop to a full skeleton when data was previously visible.</li>
        <li>Permission denied never suggests "log in again" — the user is already authenticated; give them a real escape route.</li>
      </ul>

      <!-- ============================================================ Truncation -->
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
            <span class="trunc__behaviour">Wraps, no clip. Capped at ~360px via max-width so a long sentence doesn't span the full card width.</span>
          </li>
          <li>
            <span class="trunc__field">CTA label</span>
            <span class="trunc__behaviour">Short verb phrases only (Retry, Allocate resources). If the action needs a sentence, the empty state copy is wrong.</span>
          </li>
          <li>
            <span class="trunc__field">Icon</span>
            <span class="trunc__behaviour">Fixed 28px inside a 64px rounded tile. Doesn't scale with title length — always centred above the title.</span>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    .blocks {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      margin-top: var(--s-4);
    }
    .block {
      display: flex;
      flex-direction: column;
    }
    .block .block-title { margin-top: 0; }
    .block .block-desc { margin-bottom: var(--s-3); }

    .card {
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      padding: 0;
      position: relative;
      overflow: hidden;
    }

    .rules {
      margin-top: var(--s-3);
      padding-left: var(--s-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--s-2);
      max-width: var(--col-cap-text);
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
export class EmptyStateSection {
  protected readonly lede =
    'Four canonical variants. Each has a distinct icon background, a clear message, and at most one primary action.';
}
