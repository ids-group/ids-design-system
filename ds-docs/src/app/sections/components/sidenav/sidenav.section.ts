import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, SidenavComponent, SidenavGroupComponent, SidenavItemComponent } from 'ds';

/**
 * Sidenav showcase — renders DS components directly. The Item states grid
 * keeps minimal raw `<a class="item …">` markup so `.is-forced-hover` etc.
 * can pin a state statically; the `.item` visual styling comes from the
 * scoped <ds-sidenav-item> CSS (via the encapsulation matching on rendered
 * <ds-sidenav-item> instances) — when raw markup is used it inherits from
 * the global force-state hooks block in _forced-states.scss.
 */
@Component({
  selector: 'section-components-sidenav',
  standalone: true,
  imports: [IconComponent, SidenavComponent, SidenavGroupComponent, SidenavItemComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-sidenav" data-anchor="sidenav" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Sidenav</h2>
      <p class="lede t-m">
        App-level vertical navigation. Items carry an icon, a label, an optional count badge or alert dot. Collapsed mode keeps the icon and pushes the label into a tooltip.
      </p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">Three groups, brand mark at the top, one item active.</p>
      <div class="stage stage--frame">
        <ds-sidenav brand="Atlas">
          <ds-sidenav-item icon="home" label="Dashboard" [active]="true" />
          <ds-sidenav-item icon="calendar" label="Records" [badge]="12" />
          <ds-sidenav-item icon="package" label="Asset register" />
          <ds-sidenav-item icon="truck" label="Logistics plans" [hasAlert]="true" />
          <ds-sidenav-group label="Workspace">
            <ds-sidenav-item icon="users" label="Members" />
            <ds-sidenav-item icon="map" label="Sites" />
          </ds-sidenav-group>
          <ds-sidenav-group label="Admin">
            <ds-sidenav-item icon="activity" label="Activity" />
            <ds-sidenav-item icon="settings" label="Settings" />
          </ds-sidenav-group>
        </ds-sidenav>
      </div>

      <!-- ============================================================ Expandable groups -->
      <h3 class="block-title t-h4">Expandable groups</h3>
      <p class="block-desc t-s">
        <code class="t-mono">&lt;ds-sidenav-group expandable&gt;</code> renders the header as a toggle button with a caret. Group body collapses when <code class="t-mono">expanded=false</code>. Combine with the new <code class="t-mono">[icon]</code> input to set a group-level icon.
      </p>
      <div class="stage stage--frame">
        <ds-sidenav brand="Atlas">
          <ds-sidenav-item icon="home" label="Dashboard" [active]="true" />
          <ds-sidenav-group label="Operations" icon="truck" [expandable]="true">
            <ds-sidenav-item icon="calendar" label="Records" />
            <ds-sidenav-item icon="package" label="Asset register" />
            <ds-sidenav-item icon="map" label="Sites" />
          </ds-sidenav-group>
          <ds-sidenav-group label="Admin" icon="settings" [expandable]="true" [expanded]="false">
            <ds-sidenav-item icon="users" label="Members" />
            <ds-sidenav-item icon="activity" label="Activity" />
          </ds-sidenav-group>
        </ds-sidenav>
      </div>

      <!-- ============================================================ Collapsed -->
      <h3 class="block-title t-h4">Collapsed</h3>
      <p class="block-desc t-s">Labels and group headings hide; icons survive. Full label moves to a tooltip on hover (omitted here — static specimen).</p>
      <div class="stage stage--frame">
        <ds-sidenav brand="Atlas" [collapsed]="true">
          <ds-sidenav-item icon="home" label="Dashboard" [active]="true" />
          <ds-sidenav-item icon="calendar" label="Records" />
          <ds-sidenav-item icon="package" label="Asset register" />
          <ds-sidenav-item icon="truck" label="Logistics plans" [hasAlert]="true" />
          <ds-sidenav-item icon="users" label="Members" />
          <ds-sidenav-item icon="map" label="Sites" />
        </ds-sidenav>
      </div>

      <!-- ============================================================ Item states showcase -->
      <h3 class="block-title t-h4">Item states showcase</h3>
      <p class="block-desc t-s">Every item state side-by-side. Static specimens — no interaction needed.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-sidenav>
              <ds-sidenav-item icon="calendar" label="Records" />
            </ds-sidenav>
          </div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><nav class="sidenav"><a class="item is-forced-hover"><ds-icon name="calendar" [size]="20" /><span class="item-label">Records</span></a></nav></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><nav class="sidenav"><a class="item is-forced-focus"><ds-icon name="calendar" [size]="20" /><span class="item-label">Records</span></a></nav></div>
          <div class="state-cell__label">Focus-visible</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-sidenav>
              <ds-sidenav-item icon="calendar" label="Records" [active]="true" />
            </ds-sidenav>
          </div>
          <div class="state-cell__label">Active / selected</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><nav class="sidenav"><a class="item disabled"><ds-icon name="calendar" [size]="20" /><span class="item-label">Records</span></a></nav></div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-sidenav>
              <ds-sidenav-item icon="bell" label="Notifications" [active]="true" [badge]="3" />
            </ds-sidenav>
          </div>
          <div class="state-cell__label">Active + badge</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-sidenav>
              <ds-sidenav-item icon="truck" label="Logistics" [hasAlert]="true" />
            </ds-sidenav>
          </div>
          <div class="state-cell__label">Alert dot</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-sidenav [collapsed]="true">
              <ds-sidenav-item icon="calendar" label="Records" />
            </ds-sidenav>
          </div>
          <div class="state-cell__label">Collapsed · default</div>
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
            <span class="trunc__field">Item label (expanded)</span>
            <span class="trunc__behaviour">Single line, ellipsis at panel width. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Item label (collapsed)</span>
            <span class="trunc__behaviour">Hidden — the full label moves to a tooltip on hover or keyboard focus.</span>
          </li>
          <li>
            <span class="trunc__field">Count badge</span>
            <span class="trunc__behaviour">No clip — numeric, fixed surface area. Caps at 99+ if needed.</span>
          </li>
          <li>
            <span class="trunc__field">Group label</span>
            <span class="trunc__behaviour">Uppercase, single line, no clip. Wraps if forced (unlikely at panel widths).</span>
          </li>
          <li>
            <span class="trunc__field">Brand name</span>
            <span class="trunc__behaviour">Single line, ellipsis at panel width. Tooltip on hover. Hidden entirely when collapsed.</span>
          </li>
          <li>
            <span class="trunc__field">User name (footer)</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover. Role row truncates the same way.</span>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    /* ---------- Stage frame ---------- */
    .stage {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-canvas);
      border-radius: var(--r-lg);
    }
    .stage--frame {
      border: var(--bw-default) solid var(--border-divider);
      overflow: hidden;
      padding: 0;
      display: inline-block;
    }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--s-3);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--s-3);
      min-height: 64px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
    }
    .state-cell__stage > * { flex: 1; min-width: 0; }
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
      grid-template-columns: 220px 1fr;
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
export class SidenavSection {}
