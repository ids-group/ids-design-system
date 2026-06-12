import { Component, ViewEncapsulation } from '@angular/core';
import { DropdownComponent, type DropdownOption } from 'ds';

@Component({
  selector: 'section-components-select',
  standalone: true,
  imports: [DropdownComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-select" data-anchor="select" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Select</h2>
      <p class="lede t-m">Native single-select dropdown with custom chevron. Sizes, states, with-value, disabled, error.</p>

      <!-- ============================================================ Sizes -->
      <h3 class="block-title t-h4">Sizes</h3>
      <div class="grid-3">
        <ds-dropdown size="sm" label="Owner · sm" [options]="ownerOptions" placeholder="Pick an owner…" />
        <ds-dropdown label="Owner · md" [options]="ownerOptions" placeholder="Pick an owner…" />
        <ds-dropdown size="lg" label="Owner · lg" [options]="ownerOptions" placeholder="Pick an owner…" />
      </div>

      <!-- ============================================================ States showcase -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Every select state side-by-side. Static specimens — no interaction needed.</p>
      <div class="states states--cols-3">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown label="Owner" [options]="ownerOptions" placeholder="Pick an owner…" />
          </div>
          <div class="state-cell__label">Empty default</div>
        </div>
        <div class="state-cell">
          <!-- Live ds-dropdown; pin-focus on the stage reads bare tokens from
               the component's own .dropdown rules via ::ng-deep. -->
          <div class="state-cell__stage pin-focus">
            <ds-dropdown label="Owner" [options]="ownerOptions" placeholder="Pick an owner…" />
          </div>
          <div class="state-cell__label">Empty · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown label="Owner" [options]="ownerOptions" value="brooks" />
          </div>
          <div class="state-cell__label">With value</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover">
            <ds-dropdown label="Owner" [options]="ownerOptions" placeholder="Pick an owner…" />
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown label="Owner" [options]="ownerOptions" value="brooks" [disabled]="true" />
          </div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown label="Owner" [options]="ownerOptions" value="brooks" [readOnly]="true" />
          </div>
          <div class="state-cell__label">Read-only</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="field-stack">
              <ds-dropdown label="Tier" [options]="tierOptions" placeholder="Choose tier…" [error]="true" />
              <span class="field-hint error">Pick one</span>
            </div>
          </div>
          <div class="state-cell__label">Error</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="field-stack">
              <ds-dropdown label="Tier" [options]="tierOptions" value="t2" />
              <span class="field-hint">OK</span>
            </div>
          </div>
          <div class="state-cell__label">Success</div>
        </div>
      </div>

      <!-- ============================================================ Long option list -->
      <h3 class="block-title t-h4">Long option list</h3>
      <p class="block-desc t-s">15 options demonstrate the styled popover — the panel caps at 320px and scrolls internally, with width matched to the trigger.</p>
      <div class="grid-3">
        <ds-dropdown label="Region" [options]="regionOptions" placeholder="Pick a region…" />
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Option label</span>
            <span class="trunc__behaviour">Single line, ellipsis at control width. Native dropdown handles overflow.</span>
          </li>
          <li>
            <span class="trunc__field">Selected value</span>
            <span class="trunc__behaviour">Single line, ellipsis when overflowing the control.</span>
          </li>
        </ul>
      </div>

      <!-- ============================================================ Custom dropdown variant -->
      <h3 class="block-title t-h4">Custom dropdown — &lt;ds-dropdown&gt;</h3>
      <p class="block-desc t-s">
        Alternative trigger that opens a fully styled popover via CDK Overlay. Use when the showcase or product needs
        branded options, leading icons, or a consistent panel across browsers. Native &lt;ds-select&gt; remains the
        default for forms that benefit from native a11y.
      </p>

      <h4 class="sub-title t-overline">Closed trigger · sizes</h4>
      <div class="grid-3">
        <div class="cell-wrap">
          <ds-dropdown size="sm" [options]="productOptions" placeholder="Pick a product · sm" />
          <div class="caption t-overline">sm</div>
        </div>
        <div class="cell-wrap">
          <ds-dropdown [options]="productOptions" placeholder="Pick a product · md" />
          <div class="caption t-overline">md</div>
        </div>
        <div class="cell-wrap">
          <ds-dropdown size="lg" [options]="productOptions" placeholder="Pick a product · lg" />
          <div class="caption t-overline">lg</div>
        </div>
      </div>

      <h4 class="sub-title t-overline">Open · static specimen</h4>
      <p class="block-desc t-s">Live component with <code>staticPreview</code> — panel rendered inline in normal flow, all option states visible at once.</p>
      <div class="preview-wrap open-specimen">
        <ds-dropdown [staticPreview]="true" value="hi" [options]="openSpecimenOptions" />
      </div>

      <h4 class="sub-title t-overline">Open · with leading icons</h4>
      <div class="preview-wrap">
        <ds-dropdown [staticPreview]="true" value="hi" [options]="iconOptions" />
      </div>

      <h4 class="sub-title t-overline">Trigger states</h4>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown [options]="productOptions" placeholder="Pick a product…" />
          </div>
          <div class="state-cell__label">Empty default</div>
        </div>
        <div class="state-cell">
          <!-- Live ds-dropdown; pin classes on the stage reach the .dropdown
               button via ::ng-deep; hover/focus use bare tokens (no --_* resolvers). -->
          <div class="state-cell__stage pin-hover">
            <ds-dropdown [options]="productOptions" placeholder="Pick a product…" />
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus">
            <ds-dropdown [options]="productOptions" value="hi" />
          </div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage state-cell__stage--overflow">
            <ds-dropdown [staticPreview]="true" value="hi" [options]="productOptions" />
          </div>
          <div class="state-cell__label">Open</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown [options]="productOptions" placeholder="Pick a product…" [error]="true" />
          </div>
          <div class="state-cell__label">Error</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropdown [options]="productOptions" value="hi" [disabled]="true" />
          </div>
          <div class="state-cell__label">Disabled</div>
        </div>
      </div>

      <h4 class="sub-title t-overline">Long list · live</h4>
      <p class="block-desc t-s">Open the trigger — the panel caps at 320px and scrolls internally.</p>
      <div class="grid-3">
        <div class="cell-wrap">
          <ds-dropdown [options]="regionOptions" placeholder="Pick a region…" />
          <div class="caption t-overline">15 options · scrolls</div>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      margin-top: var(--space-3);
    }

    .states {
      display: grid;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .states--cols-3 { grid-template-columns: repeat(3, 1fr); }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--space-4);
      min-height: 96px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
    }
    .state-cell__stage > * { flex: 1; }
    .state-cell__label {
      text-align: center;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* Wrapper for raw .dropdown cells that need an external label / hint. */
    .field-stack {
      display: flex; flex-direction: column;
      gap: var(--space-1-5);
      width: 100%;
    }
    .field-label {
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-base) var(--font-sans);
      color: var(--text-secondary);
    }
    .field-hint {
      font: var(--font-weight-regular) var(--font-size-xs)/var(--line-height-base) var(--font-sans);
      color: var(--text-tertiary);

      &.error { color: var(--error-text); }
    }

    .trunc {
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .trunc__title {
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

    .sub-title {
      margin-top: var(--space-5);
      color: var(--text-tertiary);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
    }
    .cell-wrap {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .caption {
      color: var(--text-tertiary);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
    }

    /* State pins — ds-dropdown has no --_* resolvers; restate the bare role
       tokens the component's own rules use (hover: --border-strong;
       focus: --primary + --focus-field). */
    :host ::ng-deep .pin-hover .dropdown:not(:disabled):not(.disabled):not(.open) { border-color: var(--border-strong); }
    :host ::ng-deep .pin-focus .dropdown:not(.disabled) { outline: none; border-color: var(--primary); box-shadow: var(--focus-field); }

    /* staticPreview open specimen wrappers */
    .preview-wrap {
      width: 280px;
      margin-top: var(--space-3);
    }

    /* Pin "Critical Illness" (3rd option) as keyboard-active in the open specimen.
       Restates is-active token from _dropdown-overlay.scss:
       &.is-active:not(.is-disabled) { background: var(--surface-secondary) } */
    :host ::ng-deep .open-specimen .dropdown-list li:nth-child(3) .option { background: var(--surface-secondary); }

    /* The "Open" trigger-state cell panel overflows its min-height stage box. */
    .state-cell__stage--overflow { overflow: visible; align-items: flex-start; }
  `],
})
export class SelectSection {
  protected readonly ownerOptions: DropdownOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jamie Lin', value: 'lin' },
    { label: 'Morgan Reyes', value: 'reyes' },
  ];

  protected readonly tierOptions: DropdownOption[] = [
    { label: 'Tier 1', value: 't1' },
    { label: 'Tier 2', value: 't2' },
    { label: 'Tier 3', value: 't3' },
  ];

  protected readonly productOptions: DropdownOption[] = [
    { label: 'All Products', value: 'all' },
    { label: 'Hospital Indemnity', value: 'hi' },
    { label: 'Critical Illness', value: 'ci' },
    { label: 'Accident', value: 'acc' },
    { label: 'Life Insurance', value: 'life' },
  ];

  protected readonly openSpecimenOptions: DropdownOption[] = [
    { label: 'All Products', value: 'all' },
    { label: 'Hospital Indemnity', value: 'hi' },
    { label: 'Critical Illness', value: 'ci' },
    { label: 'Accident', value: 'acc' },
    { label: 'Life Insurance (coming soon)', value: 'life', disabled: true },
  ];

  protected readonly iconOptions: DropdownOption[] = [
    { label: 'All Products', value: 'all', icon: 'list' },
    { label: 'Hospital Indemnity', value: 'hi', icon: 'home' },
    { label: 'Critical Illness', value: 'ci', icon: 'error' },
    { label: 'Accident', value: 'acc', icon: 'truck' },
    { label: 'Life Insurance', value: 'life', icon: 'star' },
  ];

  protected readonly regionOptions: DropdownOption[] = [
    { label: 'North America — East', value: 'na-e' },
    { label: 'North America — West', value: 'na-w' },
    { label: 'South America — Andean', value: 'sa-a' },
    { label: 'South America — Southern Cone', value: 'sa-s' },
    { label: 'Europe — Northern', value: 'eu-n' },
    { label: 'Europe — Western', value: 'eu-w' },
    { label: 'Europe — Central', value: 'eu-c' },
    { label: 'Europe — Southern', value: 'eu-s' },
    { label: 'Middle East & North Africa', value: 'mena' },
    { label: 'Sub-Saharan Africa', value: 'ssa' },
    { label: 'Asia — South', value: 'as-s' },
    { label: 'Asia — Southeast', value: 'as-se' },
    { label: 'Asia — East', value: 'as-e' },
    { label: 'Oceania', value: 'oc' },
    { label: 'Antarctica (research only)', value: 'ant' },
  ];
}
