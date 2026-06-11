import { Component, ViewEncapsulation } from '@angular/core';
import { TabsComponent, TabComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-tabs',
  standalone: true,
  imports: [TabsComponent, TabComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-tabs" data-anchor="tabs" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Tabs</h2>
      <p class="lede t-m">Switch among peer panels. Two visual variants — line for primary navigation, pills for compact filters. Optional icon and count chip per tab.</p>

      <!-- ============================================================ Variants -->
      <h3 class="block-title t-h4">Variants</h3>
      <p class="block-desc t-s">Line — primary navigation. Pills — compact filter row.</p>

      <div class="variant-row">
        <div class="variant-row__label t-overline">Line</div>
        <ds-tabs class="variant-row__stage">
          <ds-tab label="Overview">
            <p class="t-s muted pad">Project at a glance.</p>
          </ds-tab>
          <ds-tab label="Sub-records">
            <p class="t-s muted pad">Linked sub-records.</p>
          </ds-tab>
          <ds-tab label="Resource allocation">
            <p class="t-s muted pad">Allocation matrix.</p>
          </ds-tab>
          <ds-tab label="Activity">
            <p class="t-s muted pad">Activity feed.</p>
          </ds-tab>
        </ds-tabs>
      </div>

      <div class="variant-row">
        <div class="variant-row__label t-overline">Pills</div>
        <ds-tabs class="variant-row__stage" variant="pills">
          <ds-tab label="All"><p class="t-s muted pad">All records.</p></ds-tab>
          <ds-tab label="Active"><p class="t-s muted pad">Active records.</p></ds-tab>
          <ds-tab label="Planning"><p class="t-s muted pad">Planning records.</p></ds-tab>
          <ds-tab label="Completed"><p class="t-s muted pad">Completed records.</p></ds-tab>
        </ds-tabs>
      </div>

      <!-- ============================================================ With count · icon · disabled -->
      <h3 class="block-title t-h4">With count badge · icon · disabled</h3>
      <p class="block-desc t-s">A trailing count chip, a leading glyph, and a disabled tab — composed on the line variant.</p>
      <div class="variant-row">
        <div class="variant-row__stage">
          <div class="tabs">
            <button type="button" class="tab active">
              <ds-icon name="inbox" [size]="14" />
              <span>Inbox</span>
              <span class="badge neutral count">12</span>
            </button>
            <button type="button" class="tab">
              <ds-icon name="flag" [size]="14" />
              <span>Flagged</span>
            </button>
            <button type="button" class="tab">
              <span>Drafts</span>
              <span class="badge neutral count">3</span>
            </button>
            <button type="button" class="tab" disabled>
              <ds-icon name="archive" [size]="14" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================ States showcase -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Every line-tab state side-by-side. Static specimens — no interaction needed.</p>
      <div class="states states--cols-4">
        <!-- Live ds-tabs; pin classes on the stage read the component's own
             resolvers via ::ng-deep (see styles below). selectedIndex=1 keeps
             the first tab non-active so hover/focus/default can be shown. -->
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tabs [selectedIndex]="1"><ds-tab label="Overview" /><ds-tab label="." /></ds-tabs>
          </div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover">
            <ds-tabs [selectedIndex]="1"><ds-tab label="Overview" /><ds-tab label="." /></ds-tabs>
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus">
            <ds-tabs [selectedIndex]="1"><ds-tab label="Overview" /><ds-tab label="." /></ds-tabs>
          </div>
          <div class="state-cell__label">Focus-visible</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tabs [selectedIndex]="0"><ds-tab label="Overview" /></ds-tabs>
          </div>
          <div class="state-cell__label">Active</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tabs [selectedIndex]="0"><ds-tab label="Overview" [disabled]="true" /></ds-tabs>
          </div>
          <div class="state-cell__label">Disabled</div>
        </div>
      </div>

      <!-- ============================================================ Pills states showcase -->
      <h3 class="block-title t-h4">Pills states showcase</h3>
      <p class="block-desc t-s">Same matrix on the pills variant — note the filled active chip.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tabs variant="pills" [selectedIndex]="1"><ds-tab label="All" /><ds-tab label="." /></ds-tabs>
          </div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover">
            <ds-tabs variant="pills" [selectedIndex]="1"><ds-tab label="All" /><ds-tab label="." /></ds-tabs>
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus">
            <ds-tabs variant="pills" [selectedIndex]="1"><ds-tab label="All" /><ds-tab label="." /></ds-tabs>
          </div>
          <div class="state-cell__label">Focus-visible</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tabs variant="pills" [selectedIndex]="0"><ds-tab label="All" /></ds-tabs>
          </div>
          <div class="state-cell__label">Active</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-tabs variant="pills" [selectedIndex]="0"><ds-tab label="All" [disabled]="true" /></ds-tabs>
          </div>
          <div class="state-cell__label">Disabled</div>
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
            <span class="trunc__field">Tab label</span>
            <span class="trunc__behaviour">Single line, no clip — labels are short. Tooltip on hover if forced clip.</span>
          </li>
          <li>
            <span class="trunc__field">Badge count</span>
            <span class="trunc__behaviour">Numeric only — no clip.</span>
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
    .muted { color: var(--text-secondary); }
    .pad { padding: var(--space-3) 0; }

    /* ---------- Variant rows ---------- */
    .variant-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: var(--space-4);
      align-items: start;
      margin-top: var(--space-4);
    }
    .variant-row__label {
      color: var(--text-tertiary);
      padding-top: var(--space-3);
    }
    .variant-row__stage { display: block; min-width: 0; }

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

    /* State pins — force a visual state on live ds-tabs by reading the
       component's own resolvers; tokens without resolvers noted below. */
    /* line: hover recolors the non-active tab */
    :host ::ng-deep .pin-hover .tab:not(.active) { color: var(--_tab-fg-hover); }
    /* focus: --focus-ring and --radius-sm are bare tokens (no --_* resolver) */
    :host ::ng-deep .pin-focus .tab:not(.active) { outline: none; box-shadow: var(--focus-ring); border-radius: var(--radius-sm); }
    /* pills: hover fills with brand-subtle tint */
    :host ::ng-deep .pin-hover .tabs.pills .tab:not(.active) { background: var(--_tab-pill-bg-hover); color: var(--_tab-fg-hover); }
    :host ::ng-deep .pin-focus .tabs.pills .tab:not(.active) { outline: none; box-shadow: var(--focus-ring); border-radius: var(--radius-sm); }
  `],
})
export class TabsSection {}
