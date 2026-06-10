import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, TooltipDirective, TooltipPanelComponent } from 'ds';

@Component({
  selector: 'section-components-tooltip',
  standalone: true,
  imports: [ButtonComponent, TooltipDirective, TooltipPanelComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-tooltip" data-anchor="tooltip" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Tooltip</h2>
      <p class="lede t-m">
        Small dark popup that appears on hover or focus. Use sparingly — for truncated text,
        keyboard hints, and short clarifications. Apply via the
        <code class="t-mono">[dsTooltip]</code> directive.
      </p>

      <h3 class="block-title t-h4">States showcase (static specimens)</h3>
      <div class="states">
        <div class="state">
          <code class="t-mono state__lbl">placement="top"</code>
          <div class="state__stage">
            <span class="anchor t-xs">Anchor</span>
            <ds-tooltip-panel text="Recompute pending — 3 affected" placement="top" />
          </div>
        </div>
        <div class="state">
          <code class="t-mono state__lbl">placement="bottom"</code>
          <div class="state__stage">
            <ds-tooltip-panel text="Last synced 14m ago" placement="bottom" />
            <span class="anchor t-xs">Anchor</span>
          </div>
        </div>
        <div class="state">
          <code class="t-mono state__lbl">placement="left"</code>
          <div class="state__stage state__stage--horiz">
            <ds-tooltip-panel text="Locked" placement="left" />
            <span class="anchor t-xs">Anchor</span>
          </div>
        </div>
        <div class="state">
          <code class="t-mono state__lbl">placement="right"</code>
          <div class="state__stage state__stage--horiz">
            <span class="anchor t-xs">Anchor</span>
            <ds-tooltip-panel text="3 affected" placement="right" />
          </div>
        </div>
      </div>

      <h3 class="block-title t-h4">Live demo</h3>
      <p class="block-desc t-s">Hover or tab into the button to trigger the directive.</p>
      <div class="demo">
        <ds-button [dsTooltip]="'Recompute pending — 3 affected'" dsTooltipPlacement="top" variant="outline" size="m">
          Hover me · top
        </ds-button>
        <ds-button [dsTooltip]="'Last synced 14m ago'" dsTooltipPlacement="bottom" variant="outline" size="m">
          Hover me · bottom
        </ds-button>
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

    .states {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .state { display: flex; flex-direction: column; gap: var(--space-2); align-items: center; }
    .state__lbl { font-size: 11px; color: var(--text-secondary); }
    .state__stage { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
    .state__stage--horiz { flex-direction: row; gap: var(--space-3); }
    .anchor { color: var(--text-tertiary); }

    .demo {
      display: inline-flex;
      gap: var(--space-3);
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
export class TooltipSection {}
