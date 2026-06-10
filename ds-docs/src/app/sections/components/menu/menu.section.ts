import { Component, ViewEncapsulation } from '@angular/core';
import { MenuComponent, MenuItemComponent } from 'ds';

@Component({
  selector: 'section-components-menu',
  standalone: true,
  imports: [MenuComponent, MenuItemComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-menu" data-anchor="menu" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Menu</h2>
      <p class="lede t-m">
        Inline list of actions. Used inside modals, popovers, or any container that already
        provides its own surface. Each item is a full-width button with an optional leading
        icon. <code>danger</code> turns the item red for destructive actions (Sign out, Delete);
        <code>disabled</code> dims it and blocks clicks. A floating-overlay variant
        triggered from a button is a follow-up.
      </p>

      <!-- ============================================================ Default -->
      <h3 class="block-title t-h4">Default</h3>
      <p class="block-desc t-s">Four items with icons — the typical user-account menu shape.</p>
      <div class="stage">
        <ds-menu>
          <ds-menu-item icon="users">Profile settings</ds-menu-item>
          <ds-menu-item icon="settings">Preferences</ds-menu-item>
          <ds-menu-item icon="bell">Notifications</ds-menu-item>
          <ds-menu-item icon="x" [danger]="true">Sign out</ds-menu-item>
        </ds-menu>
      </div>

      <!-- ============================================================ Disabled item -->
      <h3 class="block-title t-h4">Disabled item</h3>
      <p class="block-desc t-s">A row blocked from interaction.</p>
      <div class="stage">
        <ds-menu>
          <ds-menu-item icon="edit">Rename</ds-menu-item>
          <ds-menu-item icon="copy" [disabled]="true">Duplicate</ds-menu-item>
          <ds-menu-item icon="download">Export</ds-menu-item>
        </ds-menu>
      </div>

      <!-- ============================================================ Danger -->
      <h3 class="block-title t-h4">Danger</h3>
      <p class="block-desc t-s">Destructive action — colour pulled from <code>--error-text</code>.</p>
      <div class="stage">
        <ds-menu>
          <ds-menu-item icon="x" [danger]="true">Delete project</ds-menu-item>
        </ds-menu>
      </div>

      <!-- ============================================================ Text only -->
      <h3 class="block-title t-h4">Text only</h3>
      <p class="block-desc t-s">Icons are optional — omit for a compact text-only list.</p>
      <div class="stage">
        <ds-menu>
          <ds-menu-item>View</ds-menu-item>
          <ds-menu-item>Rename</ds-menu-item>
          <ds-menu-item>Archive</ds-menu-item>
          <ds-menu-item [danger]="true">Delete</ds-menu-item>
        </ds-menu>
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

    .stage {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
      display: flex;
      justify-content: center;
    }
    /* Width is showcase-positioning; surface styling lives in
       <ds-menu>'s scoped CSS (component owns its surface). */
    .stage ds-menu { width: 280px; }

    code {
      font: var(--font-weight-medium) var(--font-size-xs)/var(--line-height-base) var(--font-mono);
      padding: 0 var(--space-1);
      background: var(--surface-secondary);
      border-radius: var(--radius-sm);
    }
  `],
})
export class MenuSection {}
