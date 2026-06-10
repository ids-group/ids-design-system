import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, ButtonComponent, IconComponent } from 'ds';

@Component({
  selector: 'practice-do-dont',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-practice-do-dont" data-anchor="practice-do-dont" class="section">
      <div class="eyebrow t-overline">Practice</div>
      <h2 class="t-h2">Do / Don't</h2>
      <p class="lede t-m">{{ lede }}</p>

      <!-- ============================================================ Button hierarchy -->
      <h3 class="block-title t-h4">Button hierarchy</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            One primary action per view. Everything else is secondary or ghost — Cancel never
            competes with Save.
          </p>
          <div class="stage stage--row">
            <ds-button variant="outline" size="m">Cancel</ds-button>
            <ds-button variant="secondary" size="m">Save draft</ds-button>
            <ds-button size="m">Publish</ds-button>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Three solid primaries fight each other — the user has to read every label to find
            the canonical path.
          </p>
          <div class="stage stage--row">
            <ds-button size="m">Publish</ds-button>
            <ds-button size="m">Save draft</ds-button>
            <ds-button size="m">Notify team</ds-button>
          </div>
        </div>
      </div>

      <!-- ============================================================ Modal vs Drawer -->
      <h3 class="block-title t-h4">Modal vs Drawer</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            Modal for blocking confirms (destructive, terminal). Drawer for in-context detail
            that lets the user keep the page underneath visible.
          </p>
          <div class="stage stage--stack">
            <div class="mini mini--modal">
              Delete project?
              <span class="mini__sub">Modal — blocking confirm</span>
            </div>
            <div class="mini mini--drawer">
              Event details
              <span class="mini__sub">Drawer — in-context</span>
            </div>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Stack modals on top of modals. Each new layer drops the user further from the
            page and the back button stops meaning anything.
          </p>
          <div class="stage stage--stack">
            <div class="mini mini--modal-stack mini--1">Edit project</div>
            <div class="mini mini--modal-stack mini--2">Delete project?</div>
            <div class="mini mini--modal-stack mini--3">Confirm permanently delete?</div>
          </div>
        </div>
      </div>

      <!-- ============================================================ Table density -->
      <h3 class="block-title t-h4">Table density</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            Cozy is the default. Readable at a glance for the long tail of users and content.
          </p>
          <div class="stage">
            <div class="row row--cozy"><span>Project Alpha</span><span class="meta">Q3 2026</span></div>
            <div class="row row--cozy"><span>Project Beta</span><span class="meta">Q4 2026</span></div>
            <div class="row row--cozy"><span>Project Gamma</span><span class="meta">Q1 2027</span></div>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Ultra-compact density on a general list. Compact is opt-in via a density control,
            not the silent default.
          </p>
          <div class="stage">
            <div class="row row--tight"><span>Project Alpha</span><span class="meta">Q3 2026</span></div>
            <div class="row row--tight"><span>Project Beta</span><span class="meta">Q4 2026</span></div>
            <div class="row row--tight"><span>Project Gamma</span><span class="meta">Q1 2027</span></div>
            <div class="row row--tight"><span>Project Delta</span><span class="meta">Q2 2027</span></div>
            <div class="row row--tight"><span>Project Epsilon</span><span class="meta">Q3 2027</span></div>
          </div>
        </div>
      </div>

      <!-- ============================================================ Badge proliferation -->
      <h3 class="block-title t-h4">Badge proliferation</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            One status per record at the title-row level. Badges signal real state, not metadata.
          </p>
          <div class="stage">
            <div class="row row--cozy">
              <span>Project Alpha</span>
              <ds-badge variant="active" [withDot]="true">Active</ds-badge>
            </div>
            <div class="row row--cozy">
              <span>Project Beta</span>
              <ds-badge variant="planning">Planning</ds-badge>
            </div>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Every column wrapped in a coloured pill. Signal-to-noise collapses and the real
            status badge stops being noticed.
          </p>
          <div class="stage">
            <div class="row row--cozy badges-everywhere">
              <ds-badge variant="info">Alpha</ds-badge>
              <ds-badge variant="success">Q3</ds-badge>
              <ds-badge variant="warning">London</ds-badge>
              <ds-badge variant="active">Active</ds-badge>
              <ds-badge variant="neutral">Owner</ds-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ Empty state copy -->
      <h3 class="block-title t-h4">Empty state copy</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            Concrete subject ("allocation rule"), concrete next step. The CTA matches the verb
            in the title.
          </p>
          <div class="stage stage--empty">
            <p class="t-m empty-title">Set your first allocation rule</p>
            <p class="t-s empty-sub">Rules decide which broker sees a lead first.</p>
            <ds-button size="m">Add your first rule</ds-button>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Passive ("nothing here yet"), padded with cheer, instructs the user to find a
            button rather than offering one.
          </p>
          <div class="stage stage--empty">
            <p class="t-m empty-title">Nothing here yet</p>
            <p class="t-s empty-sub empty-sub--muted">Looks like you haven't created anything!</p>
            <ds-button variant="outline" size="m">Learn more</ds-button>
          </div>
        </div>
      </div>

      <!-- ============================================================ Status without colour -->
      <h3 class="block-title t-h4">Status without colour</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            Dot + label. Readable when copied, read aloud, or seen by a colour-blind user.
          </p>
          <div class="stage stage--row">
            <ds-badge variant="active" [withDot]="true">Active</ds-badge>
            <ds-badge variant="planning" [withDot]="true">Planning</ds-badge>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Dot alone — colour-blind users have no signal, and the label is invisible to a
            screen reader.
          </p>
          <div class="stage stage--row">
            <span class="dot dot--active"></span>
            <span class="dot dot--planning"></span>
          </div>
        </div>
      </div>

      <!-- ============================================================ Tooltip for critical info -->
      <h3 class="block-title t-h4">Tooltips vs banners</h3>
      <div class="pair">
        <div class="cell cell--do">
          <div class="cell__tag cell__tag--do">
            <ds-icon name="check" [size]="12" /> Do
          </div>
          <p class="t-s caption">
            Banner for warnings and errors that affect the current section. Persistent until
            the user resolves them.
          </p>
          <div class="stage">
            <div class="mock-banner">
              <ds-icon name="warn" [size]="16" />
              <div>
                <strong class="t-s">Approval required</strong>
                <p class="t-s">2 sub-records have unconfirmed budgets.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="cell cell--dont">
          <div class="cell__tag cell__tag--dont">
            <ds-icon name="x" [size]="12" /> Don't
          </div>
          <p class="t-s caption">
            Hide critical info inside a tooltip. Tooltips are ephemeral context, never required
            content for completing a task.
          </p>
          <div class="stage stage--center">
            <button type="button" class="info-trigger" aria-label="Approval required">
              <ds-icon name="info" [size]="14" />
            </button>
            <span class="tooltip">2 sub-records have unconfirmed budgets.</span>
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

    .pair {
      margin-top: var(--space-3);
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: relative;
    }
    .pair::before,
    .pair::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 3px;
    }
    .pair::before { left: 0; background: var(--success, #1b8a4a); }
    .pair::after { right: 0; background: var(--error, #b3261e); }
    .cell {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      min-width: 0;
    }
    .cell--do { border-right: var(--border-width-default) solid var(--border-divider); }
    .cell__tag {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      align-self: flex-start;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font: var(--font-weight-bold) var(--font-size-2xs)/1 var(--font-sans);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
    }
    .cell__tag--do { background: var(--success-subtle, #e4f5ec); color: var(--success-text, #0f5c2f); }
    .cell__tag--dont { background: var(--error-subtle, #fde7e6); color: var(--error-text, #7a1812); }
    .caption { color: var(--text-secondary); margin: 0; }

    .stage {
      margin-top: auto;
      padding: var(--space-3);
      background: var(--surface-secondary);
      border-radius: var(--radius-md);
      display: grid;
      gap: var(--space-2);
      min-height: 100px;
    }
    .stage--row { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
    .stage--stack { gap: var(--space-2); position: relative; }
    .stage--empty {
      text-align: center;
      padding: var(--space-5);
      gap: var(--space-1);
      justify-items: center;
      display: grid;
    }
    .stage--center { display: grid; place-items: center; }
    .empty-title { margin: 0; color: var(--text-primary); }
    .empty-sub { margin: 0 0 var(--space-3); color: var(--text-secondary); }
    .empty-sub--muted { color: var(--text-tertiary); }

    .mini {
      padding: var(--space-3);
      border-radius: var(--radius-sm);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      color: var(--text-primary);
      font-size: var(--font-size-s);
    }
    .mini__sub {
      display: block;
      color: var(--text-tertiary);
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
    }
    .mini--drawer { border-left: 3px solid var(--primary); }
    .mini--modal { box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08)); }
    .mini--modal-stack {
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
    }
    .mini--1 { margin-left: 0; opacity: 0.6; }
    .mini--2 { margin-left: var(--space-3); opacity: 0.85; }
    .mini--3 { margin-left: var(--space-6); }

    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      background: var(--surface-default);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: var(--font-size-s);
    }
    .row--cozy { padding: var(--space-3) var(--space-4); }
    .row--tight { padding: 2px var(--space-3); font-size: var(--font-size-xs); }
    .meta { color: var(--text-tertiary); }
    .badges-everywhere {
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: var(--space-1);
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-pill);
      display: inline-block;
    }
    .dot--active { background: var(--success, #1b8a4a); }
    .dot--planning { background: var(--text-tertiary, #888); }

    .mock-banner {
      display: flex;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--warning-subtle, var(--surface-subtle));
      color: var(--warning-text, var(--text-primary));
      border-radius: var(--radius-sm);
      border: var(--border-width-default) solid var(--border-divider);
    }
    .mock-banner p { margin: 2px 0 0; color: var(--text-secondary); }

    .info-trigger {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-pill);
      background: var(--surface-default);
      color: var(--text-tertiary);
      cursor: pointer;
    }
    .tooltip {
      margin-top: var(--space-2);
      padding: var(--space-1) var(--space-2);
      background: var(--surface-inverted, #1a1a1a);
      color: var(--text-on-primary, #fff);
      font-size: var(--font-size-xs);
      border-radius: var(--radius-sm);
    }

    @media (max-width: 820px) {
      .pair { grid-template-columns: 1fr; }
      .cell--do {
        border-right: 0;
        border-bottom: var(--border-width-default) solid var(--border-divider);
      }
    }
  `],
})
export class DoDontSection {
  protected readonly lede =
    'Seven recurring decisions where the design system has a strong opinion. Each pair shows the discipline next to the failure mode.';
}
