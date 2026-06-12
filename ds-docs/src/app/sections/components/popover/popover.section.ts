import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, PopoverComponent } from 'ds';

@Component({
  selector: 'section-components-popover',
  standalone: true,
  imports: [ButtonComponent, PopoverComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-popover" data-anchor="popover" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Popover</h2>
      <p class="lede t-m">
        Light surface panel anchored to a trigger element. Use for contextual info that needs
        a few lines of content and at most one action — for richer interactions use a modal
        or drawer instead.
      </p>

      <h3 class="block-title t-h4">Static specimen</h3>
      <div class="specimen-stage">
        <ds-popover [staticPreview]="true">
          <h4 class="t-s-bold" style="margin: 0 0 4px;">Recompute summary</h4>
          <p class="t-s" style="color: var(--text-secondary); margin: 0 0 12px;">
            3 Logistics plans · 12 Resource allocations · 2 Sub-records affected.
          </p>
          <ds-button variant="primary" size="m" style="width: 100%;">View details</ds-button>
        </ds-popover>
      </div>

      <h3 class="block-title t-h4">Live demo</h3>
      <p class="block-desc t-s">Click the trigger to open. Click outside to dismiss.</p>
      <div class="demo">
        <button #trigger type="button" class="trigger-btn" (click)="pop.toggle(trigger)">
          Open summary
        </button>
        <ds-popover #pop>
          <h4 class="t-s-bold" style="margin: 0 0 4px;">Recompute summary</h4>
          <p class="t-s" style="color: var(--text-secondary); margin: 0 0 12px;">
            3 Logistics plans · 12 Resource allocations.
          </p>
          <ds-button variant="primary" size="m" style="width: 100%;">View details</ds-button>
        </ds-popover>
      </div>

      <h3 class="block-title t-h4">Alignment</h3>
      <p class="block-desc t-s">
        <code class="t-mono">align="start"</code> (default) anchors the panel to the trigger's left edge;
        <code class="t-mono">align="end"</code> anchors to the right. Use <code class="t-mono">"end"</code> when the trigger sits near the right edge of the viewport.
      </p>
      <div class="demo demo--row">
        <div class="demo__col">
          <button #startTrigger type="button" class="trigger-btn" (click)="popStart.toggle(startTrigger)">
            Align start
          </button>
          <ds-popover #popStart align="start">
            <p class="t-s" style="margin: 0;">Panel left-aligned to the trigger.</p>
          </ds-popover>
        </div>
        <div class="demo__col demo__col--end">
          <button #endTrigger type="button" class="trigger-btn" (click)="popEnd.toggle(endTrigger)">
            Align end
          </button>
          <ds-popover #popEnd align="end">
            <p class="t-s" style="margin: 0;">Panel right-aligned to the trigger.</p>
          </ds-popover>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }

    .specimen-stage {
      margin-top: var(--space-3);
      padding: var(--space-6);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
      display: flex;
      justify-content: flex-start;
    }
    /* Pin width for the static specimen panel — ::ng-deep reaches into the
       component-scoped .popover rendered by [staticPreview]. */
    .specimen-stage ::ng-deep .popover { width: 260px; }

    .demo {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-lg);
    }
    .trigger-btn {
      padding: var(--space-2) var(--space-3);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
      font: var(--font-weight-medium) var(--font-size-s)/var(--line-height-flat) var(--font-sans);
      color: var(--text-primary);
      cursor: pointer;
    }
    .trigger-btn:hover { background: var(--surface-secondary); }

    .demo--row {
      display: flex;
      gap: var(--space-4);
      justify-content: space-between;
    }
    .demo__col { display: flex; flex-direction: column; }
    .demo__col--end { align-items: flex-end; }
  `],
})
export class PopoverSection {}
