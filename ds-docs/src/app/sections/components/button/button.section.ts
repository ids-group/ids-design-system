import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, IconComponent } from 'ds';

interface VariantSpec {
  readonly label: string;
  readonly key: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'error';
}

@Component({
  selector: 'section-components-button',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-button" data-anchor="button" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Buttons</h2>
      <p class="lede t-m">Text-label actions across variants, sizes and states. Plus leading icon · button-group · split · toggle. For icon-only actions see the Icon button component.</p>

      <!-- ============================================================ Variants × sizes -->
      <h3 class="block-title t-h4">Variants × sizes</h3>
      <div class="matrix">
        <div></div>
        <div class="t-overline">L · default</div>
        <div class="t-overline">M</div>
        <div class="t-overline">S</div>
        @for (variant of variants; track variant.key) {
          <div class="t-overline matrix__row-label">{{ variant.label }}</div>
          <ds-button [variant]="variant.key" size="l">{{ variant.label }}</ds-button>
          <ds-button [variant]="variant.key" size="m">{{ variant.label }}</ds-button>
          <ds-button [variant]="variant.key" size="s">{{ variant.label }}</ds-button>
        }
      </div>

      <!-- ============================================================ States showcase -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Every state side-by-side. Static specimens — no interaction needed.</p>
      <div class="states states--cols-4">
        <!-- Live ds-button; pin classes on the stage read the component's own
             resolvers via ::ng-deep (see styles below). -->
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button>Save</ds-button></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-button>Save</ds-button></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-button>Save</ds-button></div>
          <div class="state-cell__label">Focus-visible</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-active"><ds-button>Save</ds-button></div>
          <div class="state-cell__label">Active / pressed</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button [disabled]="true">Save</ds-button></div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button [loading]="true">Saving</ds-button></div>
          <div class="state-cell__label">Loading</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-button><ds-icon name="plus" [size]="16" />New record</ds-button>
          </div>
          <div class="state-cell__label">With icon</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-button variant="secondary">Filters <ds-icon name="chevronDown" [size]="14" /></ds-button>
          </div>
          <div class="state-cell__label">Trailing chevron</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <button class="button-toggle" aria-pressed="true"><ds-icon name="check" [size]="14" /> Confirmed</button>
          </div>
          <div class="state-cell__label">Toggle · pressed</div>
        </div>
      </div>

      <!-- ============================================================ Variant states matrix -->
      <h3 class="block-title t-h4">Variant states — secondary · outline · error · text</h3>
      <div class="states states--cols-4">
        <!-- Secondary row -->
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="secondary">Cancel</ds-button></div>
          <div class="state-cell__label">Secondary · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-button variant="secondary">Cancel</ds-button></div>
          <div class="state-cell__label">Secondary · hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-button variant="secondary">Cancel</ds-button></div>
          <div class="state-cell__label">Secondary · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="secondary" [disabled]="true">Cancel</ds-button></div>
          <div class="state-cell__label">Secondary · disabled</div>
        </div>

        <!-- Outline row -->
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="outline">More</ds-button></div>
          <div class="state-cell__label">Outline · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-button variant="outline">More</ds-button></div>
          <div class="state-cell__label">Outline · hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-button variant="outline">More</ds-button></div>
          <div class="state-cell__label">Outline · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="outline" [disabled]="true">More</ds-button></div>
          <div class="state-cell__label">Outline · disabled</div>
        </div>

        <!-- Error row -->
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="error">Delete</ds-button></div>
          <div class="state-cell__label">Error · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-button variant="error">Delete</ds-button></div>
          <div class="state-cell__label">Error · hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-button variant="error">Delete</ds-button></div>
          <div class="state-cell__label">Error · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="error" [disabled]="true">Delete</ds-button></div>
          <div class="state-cell__label">Error · disabled</div>
        </div>

        <!-- Text row -->
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="text">View log</ds-button></div>
          <div class="state-cell__label">Text · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-button variant="text">View log</ds-button></div>
          <div class="state-cell__label">Text · hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-button variant="text">View log</ds-button></div>
          <div class="state-cell__label">Text · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-button variant="text" [disabled]="true">View log</ds-button></div>
          <div class="state-cell__label">Text · disabled</div>
        </div>
      </div>

      <!-- ============================================================ With icon -->
      <h3 class="block-title t-h4">With icon</h3>
      <p class="block-desc t-s">Leading or trailing icon alongside a label. For icon-only actions use <code class="t-mono">&lt;ds-icon-button&gt;</code> (see the Icon button section).</p>
      <div class="row">
        <ds-button>
          <ds-icon name="plus" [size]="16" /> New record
        </ds-button>
        <ds-button variant="secondary">
          Filters <ds-icon name="chevronDown" [size]="14" />
        </ds-button>
        <ds-button variant="outline">
          <ds-icon name="download" [size]="16" /> Export CSV
        </ds-button>
      </div>

      <!-- ============================================================ Full width -->
      <h3 class="block-title t-h4">Full width</h3>
      <p class="block-desc t-s">Set <code class="t-mono">fullWidth</code> to stretch the button to its container — for mobile primary CTAs and full-bleed form submits. The host becomes block-level at 100% width.</p>
      <div class="fullwidth-demo">
        <ds-button fullWidth>Continue</ds-button>
        <ds-button variant="outline" fullWidth>Cancel</ds-button>
      </div>

      <!-- ============================================================ Group · split · toggle · text -->
      <h3 class="block-title t-h4">Button group · split · toggle · text</h3>
      <div class="row">
        <div class="button-group">
          <button class="button outline"><ds-icon name="grid" [size]="16" /></button>
          <button class="button outline"><ds-icon name="list" [size]="16" /></button>
          <button class="button outline"><ds-icon name="map" [size]="16" /></button>
        </div>
        <div class="button-split">
          <button class="button">Save</button>
          <button class="button" aria-label="More save options"><ds-icon name="chevronDown" [size]="14" /></button>
        </div>
        <button class="button-toggle" aria-pressed="false"><ds-icon name="filter" [size]="14" /> Conflicts only</button>
        <button class="button-toggle" aria-pressed="true"><ds-icon name="check" [size]="14" /> Confirmed</button>
        <ds-button variant="text">View activity log</ds-button>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Label</span>
            <span class="trunc__behaviour">Single line, ellipsis on overflow. Buttons must fit — rephrase if you need multi-line. No tooltip.</span>
          </li>
          <li>
            <span class="trunc__field">Icon-only</span>
            <span class="trunc__behaviour">No visible label; full label MUST live in aria-label and tooltip-on-hover.</span>
          </li>
          <li>
            <span class="trunc__field">Split-button menu items</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover when clipped.</span>
          </li>
        </ul>
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
    .row { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; margin-top: var(--space-3); }
    .fullwidth-demo {
      display: flex; flex-direction: column; gap: var(--space-3);
      margin-top: var(--space-3);
      max-width: 320px;
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }

    /* ---------- Variants × sizes matrix ---------- */
    .matrix {
      display: grid;
      grid-template-columns: 120px repeat(3, 1fr);
      gap: var(--space-4) var(--space-6);
      align-items: center;
      margin-top: var(--space-3);
    }
    .matrix__row-label { color: var(--text-tertiary); }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .state-cell__stage {
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-4);
      min-height: 72px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
    }
    .state-cell__label {
      text-align: center;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--space-2);
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--space-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--font-weight-bold) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }

    /* State pins — force a visual state on live ds-buttons by reading the
       component's own resolvers; values never duplicated here. */
    :host ::ng-deep .pin-hover .button  { background: var(--_button-bg-hover); }
    :host ::ng-deep .pin-active .button { background: var(--_button-bg-active); box-shadow: var(--_button-pressed-shadow); }
    :host ::ng-deep .pin-focus .button  { outline: none; box-shadow: var(--_button-focus-shadow); z-index: var(--btn-focus-z); }
    /* text variant: hover recolors instead of filling; focus keeps no fill */
    :host ::ng-deep .pin-hover .button.text { background: transparent; color: var(--primary-pressed); }
    :host ::ng-deep .pin-focus .button.text { background: transparent; }
  `],
})
export class ButtonSection {
  protected readonly variants: readonly VariantSpec[] = [
    { label: 'Primary',   key: 'primary' },
    { label: 'Secondary', key: 'secondary' },
    { label: 'Tertiary',  key: 'tertiary' },
    { label: 'Outline',   key: 'outline' },
    { label: 'Error',     key: 'error' },
  ];
}
