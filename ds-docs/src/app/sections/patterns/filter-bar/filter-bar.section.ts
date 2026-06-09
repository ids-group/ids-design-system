import { Component, ViewEncapsulation } from '@angular/core';
import { SearchComponent, ButtonComponent, IconComponent, SelectComponent, TagComponent, type SelectOption } from 'ds';

@Component({
  selector: 'pattern-filter-bar',
  standalone: true,
  imports: [SearchComponent, ButtonComponent, IconComponent, SelectComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-pattern-filter-bar" data-anchor="pattern-filter-bar" class="section">
      <div class="eyebrow t-overline">Patterns</div>
      <h2 class="t-h2">Filter bar</h2>
      <p class="lede t-m">{{ lede }}</p>

      <h3 class="block-title t-h4">Inline row</h3>
      <p class="block-desc t-s">
        Search on the left, dropdown facets, applied-filter tags, and a clear-all link — all
        sitting on one row above the list. Sits above the list it filters, never below.
      </p>
      <div class="stage">
        <div class="filterbar">
          <div class="search-slot">
            <ds-search placeholder="Search events…" />
          </div>

          <ds-select [options]="statusOptions" placeholder="Status" size="sm" />
          <ds-select [options]="memberOptions" placeholder="Member" size="sm" />

          <ds-button variant="outline" size="m">
            <ds-icon name="filter" [size]="14" /> More filters
          </ds-button>

          <span class="divider"></span>

          <span class="t-s applied-label">Applied:</span>
          <div class="applied">
            <ds-tag [closable]="true">Status: Confirmed</ds-tag>
            <ds-tag [closable]="true">Member: Acme Holdings</ds-tag>
          </div>

          <ds-button variant="text" size="m">Clear filters</ds-button>
        </div>
      </div>

      <h3 class="block-title t-h4">Stacked variant</h3>
      <p class="block-desc t-s">
        On narrow viewports the bar wraps to two rows: search on top, facets and applied tags
        below. Same composition, vertical reflow.
      </p>
      <div class="stage stage--narrow">
        <div class="filterbar filterbar--stacked">
          <div class="row row--top">
            <div class="search-slot search-slot--full">
              <ds-search placeholder="Search events…" />
            </div>
          </div>
          <div class="row row--bottom">
            <ds-select [options]="statusOptions" placeholder="Status" size="sm" />
            <ds-select [options]="memberOptions" placeholder="Member" size="sm" />
            <ds-button variant="outline" size="s">
              <ds-icon name="filter" [size]="14" /> More
            </ds-button>
            <span class="applied applied--stacked">
              <ds-tag [closable]="true">Confirmed</ds-tag>
              <ds-tag [closable]="true">Acme Holdings</ds-tag>
            </span>
            <ds-button variant="text" size="s">Clear</ds-button>
          </div>
        </div>
      </div>

      <h3 class="block-title t-h4">Usage</h3>
      <ul class="rules">
        <li>Sits above the list it filters, never below — search is read top-down.</li>
        <li>Don't mix free-text search with non-text facets inside the same input. Expose facets as siblings.</li>
        <li>Each applied tag is individually removable; the right-side link is the escape hatch for everything at once.</li>
        <li>On narrow widths, drop facet labels to icons before wrapping a single facet to a second line.</li>
      </ul>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }
    .stage {
      margin-top: var(--s-3);
      padding: var(--s-5);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .stage--narrow { max-width: 560px; }
    .filterbar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      align-items: center;
      padding: var(--s-3);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
    }
    .filterbar--stacked {
      flex-direction: column;
      align-items: stretch;
      gap: var(--s-3);
    }
    /* ds-select and ds-search default to host width:100%; in the filterbar
       they sit inline so we cap them to content-width with a min-width. */
    .filterbar ds-select { width: auto; min-width: 160px; flex: 0 0 auto; }
    .filterbar ds-search { width: auto; flex: 1 1 200px; max-width: 320px; }
    .row {
      display: flex;
      gap: var(--s-2);
      align-items: center;
      flex-wrap: wrap;
    }
    .row--top { width: 100%; }
    .search-slot { flex: 1; min-width: 200px; max-width: 320px; }
    .search-slot--full { flex: 1; max-width: none; }
    .divider {
      display: inline-block;
      width: 1px;
      align-self: stretch;
      background: var(--border-divider);
      margin: 0 var(--s-1);
    }
    .applied-label { color: var(--text-tertiary); }
    .applied { display: inline-flex; gap: var(--s-2); flex-wrap: wrap; }
    .applied--stacked { gap: var(--s-1); }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      padding: var(--s-1) var(--s-2);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-pill);
      background: var(--surface-default);
      color: var(--text-secondary);
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
    }
    .rules {
      margin-top: var(--s-3);
      padding-left: var(--s-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--s-2);
      max-width: var(--col-cap-text);
    }
  `],
})
export class FilterBarSection {
  protected readonly lede =
    'Search, dropdown facets, applied-filter tags and a clear-all escape hatch — composed above any list view. Reflows to a stacked variant on narrow viewports.';

  protected readonly statusOptions: SelectOption[] = [
    { label: 'All statuses', value: '' },
    { label: 'Planning', value: 'planning' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  protected readonly memberOptions: SelectOption[] = [
    { label: 'All members', value: '' },
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'North Site Co.', value: 'north' },
    { label: 'Delta Partners', value: 'delta' },
  ];
}
