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

      <h3 class="block-title t-h4">Static specimen (rendered inline)</h3>
      <div class="specimen-stage">
        <ds-drawer [open]="true" title="Edit Sub-record" size="md">
          <ng-container drawer-body>
            <p class="t-s">Drawer body content goes here. Forms, lists, anything that needs vertical room.</p>
          </ng-container>
          <ng-container drawer-footer>
            <ds-button variant="ghost">Cancel</ds-button>
            <ds-button variant="primary">Save changes</ds-button>
          </ng-container>
        </ds-drawer>
      </div>

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
          <ds-button variant="ghost" (click)="open.set(false)">Cancel</ds-button>
          <ds-button variant="primary">Save</ds-button>
        </ng-container>
      </ds-drawer>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    .specimen-stage {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);

      /* Showcase-only: pull <ds-drawer> out of fixed overlay flow so the
         static specimen sits inline within this stage. DS lib component
         itself stays unaware of showcase. */
      ::ng-deep .drawer {
        position: relative;
        inset: auto;
        width: 100%;
        max-width: 480px;
        animation: none;
        box-shadow: none;
        border: var(--bw-default) solid var(--border-divider);
        border-radius: var(--r-lg);
      }
    }

    .demo {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }
  `],
})
export class DrawerSection {
  protected readonly open = signal(false);
}
