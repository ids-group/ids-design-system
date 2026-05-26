import { Component, ViewEncapsulation } from '@angular/core';
import { DropdownComponent, IconComponent, type DropdownOption } from 'ds';

/**
 * Select section — renders DS components directly. The States showcase grid
 * keeps minimal raw `<div class="dropdown is-forced-*">` cells so hover /
 * focus visuals can be pinned statically. The "Open · static specimen"
 * blocks also use raw `.dropdown.open + .dropdown-panel` markup because the
 * live `<ds-dropdown>` panel is portaled by CDK Overlay and can't be pinned
 * inline. Force-state surface lives in styles/_forced-states.scss.
 */
@Component({
  selector: 'section-components-select',
  standalone: true,
  imports: [DropdownComponent, IconComponent],
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
          <div class="state-cell__stage">
            <div class="field-stack">
              <span class="field-label">Owner</span>
              <div class="dropdown is-forced-focus">
                <span class="trigger-text is-placeholder">Pick an owner…</span>
                <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
              </div>
            </div>
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
          <div class="state-cell__stage">
            <div class="field-stack">
              <span class="field-label">Owner</span>
              <div class="dropdown is-forced-hover">
                <span class="trigger-text is-placeholder">Pick an owner…</span>
                <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
              </div>
            </div>
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
      <p class="block-desc t-s">Panel rendered as static HTML to show all option states at once. Live panel is portaled by CDK Overlay — this raw markup pins the open visual inline.</p>
      <div class="open-stage">
        <div class="open-trigger dropdown open">
          <span class="trigger-text">Hospital Indemnity</span>
          <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
        </div>
        <div class="static-panel dropdown-panel">
          <ul class="dropdown-list">
            <li>
              <button type="button" class="option">
                <span class="option-label">All Products</span>
              </button>
            </li>
            <li>
              <button type="button" class="option is-selected">
                <span class="option-label">Hospital Indemnity</span>
                <ds-icon class="option-check" name="check" [size]="14" />
              </button>
            </li>
            <li>
              <button type="button" class="option is-active">
                <span class="option-label">Critical Illness</span>
              </button>
            </li>
            <li>
              <button type="button" class="option">
                <span class="option-label">Accident</span>
              </button>
            </li>
            <li>
              <button type="button" class="option is-disabled" disabled>
                <span class="option-label">Life Insurance (coming soon)</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <h4 class="sub-title t-overline">Open · with leading icons</h4>
      <div class="open-stage">
        <div class="open-trigger dropdown open">
          <span class="trigger-text">Hospital Indemnity</span>
          <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
        </div>
        <div class="static-panel dropdown-panel">
          <ul class="dropdown-list">
            <li>
              <button type="button" class="option">
                <ds-icon class="option-icon" name="list" [size]="16" />
                <span class="option-label">All Products</span>
              </button>
            </li>
            <li>
              <button type="button" class="option is-selected">
                <ds-icon class="option-icon" name="home" [size]="16" />
                <span class="option-label">Hospital Indemnity</span>
                <ds-icon class="option-check" name="check" [size]="14" />
              </button>
            </li>
            <li>
              <button type="button" class="option">
                <ds-icon class="option-icon" name="error" [size]="16" />
                <span class="option-label">Critical Illness</span>
              </button>
            </li>
            <li>
              <button type="button" class="option">
                <ds-icon class="option-icon" name="truck" [size]="16" />
                <span class="option-label">Accident</span>
              </button>
            </li>
            <li>
              <button type="button" class="option">
                <ds-icon class="option-icon" name="star" [size]="16" />
                <span class="option-label">Life Insurance</span>
              </button>
            </li>
          </ul>
        </div>
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
          <div class="state-cell__stage">
            <div class="dropdown is-forced-hover">
              <span class="trigger-text is-placeholder">Pick a product…</span>
              <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
            </div>
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="dropdown is-forced-focus">
              <span class="trigger-text">Hospital Indemnity</span>
              <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
            </div>
          </div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="dropdown open">
              <span class="trigger-text">Hospital Indemnity</span>
              <span class="chevron"><ds-icon name="chevronDown" [size]="14" /></span>
            </div>
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
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-4);
      margin-top: var(--s-3);
    }

    .states {
      display: grid;
      gap: var(--s-4);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .states--cols-3 { grid-template-columns: repeat(3, 1fr); }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--s-4);
      min-height: 96px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
    }
    .state-cell__stage > * { flex: 1; }
    .state-cell__label {
      text-align: center;
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* Wrapper for raw .dropdown cells that need an external label / hint
       (the .is-forced-* hover/focus state grids and the error/success cells). */
    .field-stack {
      display: flex; flex-direction: column;
      gap: var(--s-1-5);
      width: 100%;
    }
    .field-label {
      font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }
    .field-hint {
      font: var(--fw-regular) var(--fs-xs)/var(--lh-base) var(--font-sans);
      color: var(--text-tertiary);

      &.error { color: var(--danger-text); }
    }

    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
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

    .sub-title {
      margin-top: var(--s-5);
      color: var(--text-tertiary);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
    }
    .cell-wrap {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .caption {
      color: var(--text-tertiary);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
    }

    /* "Open · static specimen" — pins panel visible inline. */
    .open-stage {
      display: inline-flex; flex-direction: column;
      gap: var(--s-1);
      margin-top: var(--s-3);
      width: 280px;
    }
    .open-trigger { pointer-events: none; }
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
