import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, CheckboxComponent, EmptyStateComponent, IconComponent, TableComponent, type TableColumn } from 'ds';

interface EventRow {
  readonly id: string;
  readonly project: string;
  readonly date: string;
  readonly venue: string;
  readonly status: 'active' | 'confirmed' | 'planning' | 'completed';
  readonly statusLabel: string;
  readonly capacity: string;
}

@Component({
  selector: 'section-components-table',
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, EmptyStateComponent, IconComponent, TableComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-table" data-anchor="table" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Table</h2>
      <p class="lede t-m">
        Tabular data with sort, row-selection, sticky header, skeleton loading, empty state, and a bulk-action bar.
        Built for dense admin lists — records, schedules, rosters.
      </p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">Standard table — header, six rows, status pill column, trailing actions.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>ID</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th class="numeric">Capacity</th>
            </tr>
          </thead>
          <tbody>
            @for (row of events; track row.id) {
              <tr>
                <td><span class="t-s-bold">{{ row.project }}</span></td>
                <td><span class="mono muted">{{ row.id }}</span></td>
                <td>{{ row.date }}</td>
                <td>{{ row.venue }}</td>
                <td><span class="badge {{ row.status }}"><span class="dot"></span> {{ row.statusLabel }}</span></td>
                <td class="numeric">{{ row.capacity }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ============================================================ Sortable columns -->
      <h3 class="block-title t-h4">Sortable columns</h3>
      <p class="block-desc t-s">Click a header to cycle asc → desc → none. Active column shows a coloured chevron.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th class="sortable sorted-asc">
                Record <ds-icon class="sort-icon" name="sortAsc" [size]="12" />
              </th>
              <th class="sortable">
                Dates <ds-icon class="sort-icon" name="sort" [size]="12" />
              </th>
              <th class="sortable">
                Venue <ds-icon class="sort-icon" name="sort" [size]="12" />
              </th>
              <th class="sortable numeric">
                <ds-icon class="sort-icon" name="sort" [size]="12" /> Capacity
              </th>
            </tr>
          </thead>
          <tbody>
            @for (row of events.slice(0, 4); track row.id) {
              <tr>
                <td><span class="t-s-bold">{{ row.project }}</span></td>
                <td>{{ row.date }}</td>
                <td>{{ row.venue }}</td>
                <td class="numeric">{{ row.capacity }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ============================================================ Header sort states -->
      <h3 class="block-title t-h4">Header sort states</h3>
      <p class="block-desc t-s">Every sort affordance — none, ascending, descending, hover.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage state-cell__stage--tbl">
            <table class="table">
              <thead><tr><th class="sortable">Record <ds-icon class="sort-icon" name="sort" [size]="12" /></th></tr></thead>
              <tbody><tr><td>Project Alpha</td></tr></tbody>
            </table>
          </div>
          <div class="state-cell__label">Sortable · idle</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage state-cell__stage--tbl">
            <table class="table">
              <thead><tr><th class="sortable sorted-asc is-forced-sorted-asc">Record <ds-icon class="sort-icon" name="sortAsc" [size]="12" /></th></tr></thead>
              <tbody><tr><td>Project Alpha</td></tr></tbody>
            </table>
          </div>
          <div class="state-cell__label">Sorted · ascending</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage state-cell__stage--tbl">
            <table class="table">
              <thead><tr><th class="sortable sorted-desc is-forced-sorted-desc">Record <ds-icon class="sort-icon" name="sortDesc" [size]="12" /></th></tr></thead>
              <tbody><tr><td>Project Alpha</td></tr></tbody>
            </table>
          </div>
          <div class="state-cell__label">Sorted · descending</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage state-cell__stage--tbl">
            <table class="table">
              <thead><tr><th class="sortable is-forced-hover">Record <ds-icon class="sort-icon" name="sort" [size]="12" /></th></tr></thead>
              <tbody><tr><td>Project Alpha</td></tr></tbody>
            </table>
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
      </div>

      <!-- ============================================================ Row selection + bulk bar -->
      <h3 class="block-title t-h4">Row selection · bulk-action bar</h3>
      <p class="block-desc t-s">Leading checkbox column. The bulk-action bar appears when one or more rows are selected.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th class="select-col"><ds-checkbox /></th>
              <th>Record</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="selected">
              <td><ds-checkbox [checked]="true" /></td>
              <td><span class="t-s-bold">Project Alpha</span></td>
              <td>30 Apr – 3 May 2026</td>
              <td>North Site</td>
              <td><span class="badge active"><span class="dot"></span> Active</span></td>
            </tr>
            <tr class="selected">
              <td><ds-checkbox [checked]="true" /></td>
              <td><span class="t-s-bold">Project Beta</span></td>
              <td>22 – 25 May 2026</td>
              <td>East Campus</td>
              <td><span class="badge confirmed"><span class="dot"></span> Confirmed</span></td>
            </tr>
            <tr class="selected">
              <td><ds-checkbox [checked]="true" /></td>
              <td><span class="t-s-bold">Q3 Initiative</span></td>
              <td>22 – 25 Aug 2026</td>
              <td>South Hub</td>
              <td><span class="badge confirmed"><span class="dot"></span> Confirmed</span></td>
            </tr>
            <tr>
              <td><ds-checkbox /></td>
              <td><span class="t-s-bold">Annual Summit</span></td>
              <td>5 – 9 Sep 2026</td>
              <td>HQ Auditorium</td>
              <td><span class="badge planning"><span class="dot"></span> Planning</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bulk-bar-wrap">
        <div class="bulk-bar">
          <span class="count">3 selected</span>
          <span class="divider"></span>
          <button class="button outline"><ds-icon name="archive" [size]="14" /> Archive</button>
          <button class="button outline"><ds-icon name="download" [size]="14" /> Export</button>
          <span class="divider"></span>
          <button class="button outline">Clear</button>
        </div>
      </div>

      <!-- ============================================================ Sticky header -->
      <h3 class="block-title t-h4">Sticky header</h3>
      <p class="block-desc t-s">Header stays pinned while the body scrolls. Capped at ~220 px to force the scroll.</p>
      <div class="scroll-wrap scroll-wrap--capped">
        <table class="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (row of longList; track row.id) {
              <tr>
                <td><span class="t-s-bold">{{ row.project }}</span></td>
                <td>{{ row.date }}</td>
                <td>{{ row.venue }}</td>
                <td><span class="badge {{ row.status }}"><span class="dot"></span> {{ row.statusLabel }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ============================================================ Bordered -->
      <h3 class="block-title t-h4">Bordered</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[bordered]="true"</code> wraps the table in an outer border + radius.
        Off by default so tables nested inside <code class="t-mono">&lt;ds-card padding="none"&gt;</code> don't double-border.
      </p>
      <ds-table [data]="events" [columns]="loadingColumns" [bordered]="true" [stickyHeader]="false" />

      <!-- ============================================================ Loading skeleton -->
      <h3 class="block-title t-h4">Loading · skeleton</h3>
      <p class="block-desc t-s">First-load placeholder — rows are replaced with shimmer skeletons that lock-step with every other <code class="t-mono">&lt;ds-skeleton&gt;</code> on the page. Use <code class="t-mono">[loading]="'skeleton'"</code> when you have no rows to show yet.</p>
      <ds-table [data]="events" [columns]="loadingColumns" [loading]="'skeleton'" [stickyHeader]="false" />

      <!-- ============================================================ Loading overlay -->
      <h3 class="block-title t-h4">Loading · overlay</h3>
      <p class="block-desc t-s">Re-fetch indicator — existing rows stay visible behind a translucent overlay with a centred spinner. Use <code class="t-mono">[loading]="'overlay'"</code> for refresh / re-sort / filter-change.</p>
      <ds-table [data]="events" [columns]="loadingColumns" [loading]="'overlay'" [stickyHeader]="false" />

      <!-- ============================================================ Empty states -->
      <h3 class="block-title t-h4">Empty states</h3>
      <p class="block-desc t-s">Four canonical row-empty variants. Headers always stay so the schema is legible.</p>

      <!-- (a) Plain — minimal centered message, no icon / no CTA. -->
      <div class="block-sub t-overline">a · Plain row</div>
      <p class="block-desc t-s">Mirrors source — single tertiary line in a colspan cell. Use when the empty state is transient or context-obvious.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th class="numeric">Capacity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="empty">No records match your filters</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- (b) No data — first-run / nothing exists yet. Icon + title + body + primary CTA. -->
      <div class="block-sub t-overline">b · No data · primary CTA</div>
      <p class="block-desc t-s">First-run variant — nothing exists yet, so the CTA invites creation.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th class="numeric">Capacity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="empty">
                <ds-empty-state
                  variant="none"
                  icon="inbox"
                  title="No records yet"
                  body="Create your first record to start tracking schedules, venues and capacity.">
                  <ds-button actions variant="secondary" size="m">
                    <ds-icon name="plus" [size]="14" /> New record
                  </ds-button>
                </ds-empty-state>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- (c) Filtered — query returned nothing. Secondary "clear filters" action. -->
      <div class="block-sub t-overline">c · Filtered · clear-filters CTA</div>
      <p class="block-desc t-s">Data exists but the current filter or search excluded every row.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th class="numeric">Capacity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="empty">
                <ds-empty-state
                  variant="none"
                  icon="search"
                  title="No matches for your filters"
                  body="Try a broader query or clear the active filters to see every record.">
                  <ds-button actions variant="outline" size="m">Clear filters</ds-button>
                </ds-empty-state>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- (d) Error — request failed. Retry is the primary action. -->
      <div class="block-sub t-overline">d · Failed to load · retry CTA</div>
      <p class="block-desc t-s">Network or server failure. Icon tints danger; retry is the only sensible primary action.</p>
      <div class="scroll-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th class="numeric">Capacity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="empty">
                <ds-empty-state
                  variant="error"
                  title="Couldn't load records"
                  body="Network error — the request timed out after 30 seconds.">
                  <ds-button actions variant="secondary" size="m">
                    <ds-icon name="refresh" [size]="14" /> Retry
                  </ds-button>
                </ds-empty-state>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ============================================================ Dense · zebra -->
      <h3 class="block-title t-h4">Dense · zebra</h3>
      <p class="block-desc t-s">Compact padding plus odd-row tint for spreadsheet-style scanning.</p>
      <div class="scroll-wrap">
        <table class="table compact zebra">
          <thead>
            <tr>
              <th>Record</th>
              <th>ID</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th class="numeric">Capacity</th>
            </tr>
          </thead>
          <tbody>
            @for (row of events; track row.id) {
              <tr>
                <td><span class="t-s-bold">{{ row.project }}</span></td>
                <td><span class="mono muted">{{ row.id }}</span></td>
                <td>{{ row.date }}</td>
                <td>{{ row.venue }}</td>
                <td><span class="badge {{ row.status }}"><span class="dot"></span> {{ row.statusLabel }}</span></td>
                <td class="numeric">{{ row.capacity }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Cell text</span>
            <span class="trunc__behaviour">Single line, ellipsis at column width. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Header label</span>
            <span class="trunc__behaviour">Single line, no clip.</span>
          </li>
          <li>
            <span class="trunc__field">Action column</span>
            <span class="trunc__behaviour">No clip — icon-only buttons.</span>
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
    .block-sub {
      margin-top: var(--s-5);
      color: var(--text-tertiary);
      letter-spacing: var(--ls-wider);
    }

    .scroll-wrap { margin-top: var(--s-3); border: var(--bw-default) solid var(--border-divider); }
    .scroll-wrap--capped { max-height: 220px; overflow-y: auto; }

    /* Tabular figures on numeric cells so digits line up across rows. */
    .table .numeric { font-variant-numeric: tabular-nums; }

    /* Inline mono / muted cell helpers. */
    .mono { font-family: var(--font-mono); font-size: var(--fs-xs); }
    .muted { color: var(--text-tertiary); }

    /* Bulk-bar gets a tinted pad so the dark pill reads against the page. */
    .bulk-bar-wrap {
      display: flex;
      justify-content: center;
      margin-top: var(--s-4);
      padding: var(--s-6);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .bulk-bar-wrap .bulk-bar { margin: 0; }
    /* Smaller ghost buttons inside the dark bar. */
    .bulk-bar .button {
      height: var(--hit-min);
      padding: 0 var(--s-3);
      font: var(--fw-semibold) var(--fs-s)/var(--lh-flat) var(--font-sans);
      border-color: transparent;
    }

    /* ---------- States showcase (header sort cells) ---------- */
    .states {
      display: grid;
      gap: var(--s-3);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell { display: flex; flex-direction: column; gap: var(--s-2); }
    .state-cell__stage {
      display: flex; align-items: center; justify-content: center;
      padding: var(--s-3);
      min-height: 96px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
      overflow: hidden;
    }
    .state-cell__stage--tbl { padding: 0; align-items: stretch; }
    .state-cell__stage--tbl .table { width: 100%; }
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
export class TableSection {
  protected readonly loadingColumns: TableColumn<EventRow>[] = [
    { key: 'project', label: 'Record' },
    { key: 'date',    label: 'Dates' },
    { key: 'venue',   label: 'Venue' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'capacity', label: 'Capacity', align: 'right' },
  ];

  protected readonly events: readonly EventRow[] = [
    { id: 'ORD-2026-0142', project: 'Project Alpha',  date: '30 Apr – 3 May 2026',  venue: 'North Site',     status: 'active',    statusLabel: 'Active',     capacity: '1,200' },
    { id: 'ORD-2026-0156', project: 'Project Beta',   date: '22 – 25 May 2026',     venue: 'East Campus',    status: 'confirmed', statusLabel: 'Confirmed',  capacity: '680'   },
    { id: 'ORD-2026-0157', project: 'Q3 Initiative',  date: '22 – 25 Aug 2026',     venue: 'South Hub',      status: 'confirmed', statusLabel: 'Confirmed',  capacity: '420'   },
    { id: 'ORD-2026-0188', project: 'Annual Summit',  date: '5 – 9 Sep 2026',       venue: 'HQ Auditorium',  status: 'planning',  statusLabel: 'Planning',   capacity: '900'   },
    { id: 'EVT-2026-0091', project: 'Download 2026',  date: '13 – 16 Jun 2026',     venue: 'Donington Park', status: 'completed', statusLabel: 'Completed',  capacity: '4,500' },
    { id: 'EVT-2026-0104', project: 'Field Day',      date: '8 – 9 Jul 2026',       venue: 'West Pavilion',  status: 'active',    statusLabel: 'Active',     capacity: '320'   },
  ];

  protected readonly longList: readonly EventRow[] = [
    ...this.events,
    { id: 'EVT-2026-0119', project: 'Autumn Forum',   date: '14 – 16 Oct 2026',     venue: 'North Site',     status: 'planning',  statusLabel: 'Planning',   capacity: '540'   },
    { id: 'EVT-2026-0126', project: 'Year-End Gala',  date: '12 Dec 2026',          venue: 'HQ Auditorium',  status: 'planning',  statusLabel: 'Planning',   capacity: '1,800' },
    { id: 'EVT-2025-0220', project: 'Winter Retreat', date: '18 – 21 Dec 2025',     venue: 'Lakeside Lodge', status: 'completed', statusLabel: 'Completed',  capacity: '180'   },
    { id: 'EVT-2025-0204', project: 'Q4 Review',      date: '5 Nov 2025',           venue: 'HQ Auditorium',  status: 'completed', statusLabel: 'Completed',  capacity: '260'   },
  ];
}
