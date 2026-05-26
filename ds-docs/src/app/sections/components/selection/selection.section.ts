import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent, RadioComponent, SwitchComponent } from 'ds';

@Component({
  selector: 'section-components-selection',
  standalone: true,
  imports: [CheckboxComponent, RadioComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-selection" data-anchor="selection" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Selection</h2>
      <p class="lede t-m">
        Checkbox, radio, switch, segmented, slider — every interactive primitive that toggles state.
      </p>

      <!-- ============================================================ Checkbox · radio · switch -->
      <h3 class="block-title t-h4">Checkbox · radio · switch</h3>
      <div class="grid-3">
        <div class="stack">
          <label class="control-row"><ds-checkbox /> Default</label>
          <label class="control-row"><ds-checkbox [checked]="true" /> Checked</label>
          <label class="control-row"><ds-checkbox [indeterminate]="true" /> Indeterminate</label>
          <label class="control-row"><ds-checkbox [disabled]="true" /> Disabled</label>
        </div>
        <div class="stack">
          <label class="control-row"><ds-radio name="r" value="single" /> Single date</label>
          <label class="control-row"><ds-radio name="r" value="range" [checked]="true" /> Date range</label>
          <label class="control-row"><ds-radio name="r" value="recurring" /> Recurring</label>
          <label class="control-row"><ds-radio [disabled]="true" /> Disabled</label>
        </div>
        <div class="stack">
          <label class="control-row"><ds-switch /> Sync with Inventory service</label>
          <label class="control-row"><ds-switch [checked]="true" /> Auto-recompute</label>
          <label class="control-row"><ds-switch variant="success" [checked]="true" /> Live</label>
          <label class="control-row"><ds-switch variant="error" [checked]="true" /> Locked</label>
        </div>
      </div>

      <!-- ============================================================ Checkbox states showcase -->
      <!--
        State-showcase grids use RAW <input class="check"> markup so the
        .is-forced-hover / .is-forced-focus hooks can pin a transient state
        statically for the screenshot. The :hover/:focus-visible behaviour
        of <ds-checkbox> itself is live in interactive specimens above.
      -->
      <h3 class="block-title t-h4">Checkbox states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check" /></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check is-forced-hover" /></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check is-forced-focus" /></div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check" checked /></div>
          <div class="state-cell__label">Checked</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check is-forced-focus" checked /></div>
          <div class="state-cell__label">Checked · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-checkbox [indeterminate]="true" /></div>
          <div class="state-cell__label">Indeterminate</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check" disabled /></div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="check" disabled checked /></div>
          <div class="state-cell__label">Disabled · checked</div>
        </div>
      </div>

      <!-- ============================================================ Radio states showcase -->
      <h3 class="block-title t-h4">Radio states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio" /></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio is-forced-hover" /></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio is-forced-focus" /></div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio" checked /></div>
          <div class="state-cell__label">Selected</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio is-forced-focus" checked /></div>
          <div class="state-cell__label">Selected · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio" disabled /></div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="radio" class="radio" disabled checked /></div>
          <div class="state-cell__label">Disabled · selected</div>
        </div>
      </div>

      <!-- ============================================================ Switch states showcase -->
      <h3 class="block-title t-h4">Switch states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch" /></div>
          <div class="state-cell__label">Off</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch is-forced-focus" /></div>
          <div class="state-cell__label">Off · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch" checked /></div>
          <div class="state-cell__label">On</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch is-forced-focus" checked /></div>
          <div class="state-cell__label">On · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch success" checked /></div>
          <div class="state-cell__label">Success · on</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch error" checked /></div>
          <div class="state-cell__label">Error · on</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch" disabled /></div>
          <div class="state-cell__label">Disabled · off</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><input type="checkbox" class="switch" disabled checked /></div>
          <div class="state-cell__label">Disabled · on</div>
        </div>
      </div>

      <!-- ============================================================ Segmented · slider -->
      <h3 class="block-title t-h4">Segmented · slider</h3>
      <div class="grid-2">
        <div class="segmented">
          <button class="segmented-btn">2025</button>
          <button class="segmented-btn" aria-pressed="true">2026</button>
          <button class="segmented-btn">2027</button>
        </div>
        <input class="slider" type="range" value="80" />
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover when clipped — the label IS the affordance.</span>
          </li>
          <li>
            <span class="trunc__field">Segmented option</span>
            <span class="trunc__behaviour">Single line, no clip. If the set won't fit, switch to a Select.</span>
          </li>
          <li>
            <span class="trunc__field">Slider value readout</span>
            <span class="trunc__behaviour">Numeric only — no clip; widen the field instead.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    /* ---------- Grids ---------- */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-6);
      margin-top: var(--s-3);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--s-6);
      align-items: center;
      margin-top: var(--s-3);
    }
    .stack { display: flex; flex-direction: column; gap: var(--s-3); }

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
      display: flex; align-items: center; justify-content: center;
      padding: var(--s-4);
      min-height: 72px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
    }
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
export class SelectionSection {}
