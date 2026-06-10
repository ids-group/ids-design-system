import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent, DrawerComponent } from 'ds';

@Component({
  selector: 'section-components-drawer',
  standalone: true,
  imports: [ButtonComponent, DrawerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-drawer" data-anchor="drawer" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Drawer</h2>
      <p class="lede t-m">
        Slide-in right-side panel for inline edit flows. Renders as fixed-position when
        <code class="t-mono">[open]</code> is true. Two sizes (md = 480 px, lg = 640 px).
        Use a drawer over a modal when the form needs more vertical room or runs alongside
        the underlying page state.
      </p>

      <h3 class="block-title t-h4">Live demo</h3>
      <p class="block-desc t-s">Click to open the drawer at viewport-right. Click the X to close.</p>
      <div class="demo">
        <ds-button variant="primary" size="m" (click)="open.set(true)">Open drawer</ds-button>
      </div>

      <ds-drawer [(open)]="open" title="Edit Sub-record" size="md">
        <ng-container drawer-body>
          <p class="t-s" style="color: var(--text-secondary); margin: 0 0 12px;">
            This is a live drawer rendered via <code class="t-mono">&lt;ds-drawer&gt;</code>.
            Two-way <code class="t-mono">[(open)]</code> model controls the visibility.
          </p>
        </ng-container>
        <ng-container drawer-footer>
          <ds-button variant="outline" (click)="open.set(false)">Cancel</ds-button>
          <ds-button variant="primary">Save</ds-button>
        </ng-container>
      </ds-drawer>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }

    .demo {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    code.t-mono {
      font: var(--font-weight-regular) var(--font-size-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--space-1);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `],
})
export class DrawerSection {
  protected readonly open = signal(false);
}
