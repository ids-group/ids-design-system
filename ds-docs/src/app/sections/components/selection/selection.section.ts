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
      <!-- Live ds-checkbox; pin classes on the stage read bare role tokens via
           ::ng-deep (see styles below). API-expressible states use real inputs. -->
      <h3 class="block-title t-h4">Checkbox states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><ds-checkbox /></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-checkbox /></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-checkbox /></div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-checkbox [checked]="true" /></div>
          <div class="state-cell__label">Checked</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-checkbox [checked]="true" /></div>
          <div class="state-cell__label">Checked · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-checkbox [indeterminate]="true" /></div>
          <div class="state-cell__label">Indeterminate</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-checkbox [disabled]="true" /></div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-checkbox [disabled]="true" [checked]="true" /></div>
          <div class="state-cell__label">Disabled · checked</div>
        </div>
      </div>

      <!-- ============================================================ Radio states showcase -->
      <!-- Live ds-radio; pin classes on the stage read bare role tokens via ::ng-deep. -->
      <h3 class="block-title t-h4">Radio states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><ds-radio /></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-hover"><ds-radio /></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-radio /></div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-radio [checked]="true" /></div>
          <div class="state-cell__label">Selected</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-radio [checked]="true" /></div>
          <div class="state-cell__label">Selected · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-radio [disabled]="true" /></div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-radio [disabled]="true" [checked]="true" /></div>
          <div class="state-cell__label">Disabled · selected</div>
        </div>
      </div>

      <!-- ============================================================ Switch states showcase -->
      <!-- Live ds-switch; pin-focus on the stage reads bare role token via ::ng-deep.
           success/error/disabled use real variant/disabled inputs. -->
      <h3 class="block-title t-h4">Switch states showcase</h3>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><ds-switch /></div>
          <div class="state-cell__label">Off</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-switch /></div>
          <div class="state-cell__label">Off · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-switch [checked]="true" /></div>
          <div class="state-cell__label">On</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage pin-focus"><ds-switch [checked]="true" /></div>
          <div class="state-cell__label">On · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-switch variant="success" [checked]="true" /></div>
          <div class="state-cell__label">Success · on</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-switch variant="error" [checked]="true" /></div>
          <div class="state-cell__label">Error · on</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-switch [disabled]="true" /></div>
          <div class="state-cell__label">Disabled · off</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><ds-switch [disabled]="true" [checked]="true" /></div>
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
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }

    /* ---------- Grids ---------- */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      margin-top: var(--space-3);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
      align-items: center;
      margin-top: var(--space-3);
    }
    .stack { display: flex; flex-direction: column; gap: var(--space-3); }

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

    /* State pins — ds-checkbox/radio/switch have no --_* resolvers; restate the
       bare role tokens their own rules use directly.
       hover: --primary (border-color)
       focus: --focus-ring (box-shadow) */
    :host ::ng-deep .pin-hover .check:not(:disabled),
    :host ::ng-deep .pin-hover .radio:not(:disabled) { border-color: var(--primary); }
    :host ::ng-deep .pin-focus .check,
    :host ::ng-deep .pin-focus .radio,
    :host ::ng-deep .pin-focus .switch { outline: none; box-shadow: var(--focus-ring); }
  `],
})
export class SelectionSection {}
