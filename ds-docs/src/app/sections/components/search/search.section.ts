import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, SearchComponent } from 'ds';

@Component({
  selector: 'section-components-search',
  standalone: true,
  imports: [IconComponent, SearchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-search" data-anchor="search" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Search</h2>
      <p class="lede t-m">
        Top-bar search affordance — leading magnifier icon, mid-content control, optional ⌘K keyboard hint.
      </p>

      <!-- ============================================================ Default + filled + focus states -->
      <h3 class="block-title t-h4">Default · filled · focus</h3>
      <p class="block-desc t-s">Three static specimens — the empty bar, a typed query, and a forced-focus visual.</p>
      <div class="states states--cols-3">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-search placeholder="Search projects, resources, people…" />
          </div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-search value="Project Alpha" />
          </div>
          <div class="state-cell__label">Filled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage force-focus">
            <ds-search placeholder="Search projects, resources, people…" />
          </div>
          <div class="state-cell__label">Focus</div>
        </div>
      </div>

      <!-- ============================================================ With keyboard hint -->
      <h3 class="block-title t-h4">With keyboard hint</h3>
      <p class="block-desc t-s">Trailing <code>kbd</code> chip advertises the global open shortcut.</p>
      <div class="row">
        <ds-search class="wide" placeholder="Search projects, resources, people…" shortcut="⌘ K" />
      </div>

      <!-- ============================================================ Without leading icon -->
      <h3 class="block-title t-h4">Without leading icon</h3>
      <p class="block-desc t-s">Icon may be omitted when the bar is inside a section labelled "Search".</p>
      <div class="row">
        <ds-search class="wide" placeholder="Search projects, resources, people…" shortcut="⌘ K" [showIcon]="false" />
      </div>

      <!-- ============================================================ Compact -->
      <h3 class="block-title t-h4">Compact</h3>
      <p class="block-desc t-s">Narrower container for sidebar / inline placements — no kbd hint.</p>
      <div class="row">
        <div class="compact-shell">
          <ds-search placeholder="Search…" />
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
            <span class="trunc__field">Query</span>
            <span class="trunc__behaviour">Single line, no clip while focused. Ellipsis when blurred + overflowing.</span>
          </li>
          <li>
            <span class="trunc__field">Hint kbd</span>
            <span class="trunc__behaviour">No clip — fixed glyph length.</span>
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
    .row { display: flex; gap: var(--s-3); align-items: center; flex-wrap: wrap; margin-top: var(--s-3); }

    ds-search.wide { max-width: 560px; flex: 1; }
    .compact-shell { width: 280px; }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--s-4);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .states--cols-3 { grid-template-columns: repeat(3, 1fr); }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--s-4);
      min-height: 96px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
    }
    .state-cell__stage > * { flex: 1; }

    /* Showcase-only: pin focus-within visual without real interaction. */
    .state-cell__stage.force-focus ::ng-deep .search {
      border-color: var(--primary);
      box-shadow: var(--focus-ring);
    }

    .state-cell__label {
      text-align: center;
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
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
export class SearchSection {}
