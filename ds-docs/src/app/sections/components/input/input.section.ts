import { Component, ViewEncapsulation } from '@angular/core';
import {
  DropdownComponent,
  IconComponent,
  InputComponent,
  NumberStepperComponent,
  SearchComponent,
  TagComponent,
  TextareaComponent,
  type DropdownOption,
} from 'ds';

@Component({
  selector: 'section-components-input',
  standalone: true,
  imports: [
    DropdownComponent,
    IconComponent,
    InputComponent,
    NumberStepperComponent,
    SearchComponent,
    TagComponent,
    TextareaComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-input" data-anchor="input" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Fields</h2>
      <p class="lede t-m">
        Single-line text, textarea, dropdown, number, prefix/suffix add-ons, floating label, six states.
      </p>

      <!-- ============================================================ States showcase -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Every field state side-by-side. Static specimens — no interaction needed.</p>
      <div class="states states--cols-3">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Project name" placeholder="Project Alpha" />
          </div>
          <div class="state-cell__label">Empty default</div>
        </div>
        <div class="state-cell">
          <!-- Force-focus pinned via ::ng-deep — ds-input has no static focus input. -->
          <div class="state-cell__stage force-focus">
            <ds-input label="Project name" placeholder="Project Alpha" />
          </div>
          <div class="state-cell__label">Empty · focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Project name" value="Project Alpha 2026" />
          </div>
          <div class="state-cell__label">With value</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage force-focus">
            <ds-input label="Project name" value="Project Alpha 2026" />
          </div>
          <div class="state-cell__label">With value · focus</div>
        </div>
        <div class="state-cell">
          <!-- Force-hover pinned via ::ng-deep — ds-input has no static hover input. -->
          <div class="state-cell__stage force-hover">
            <ds-input label="Project name" placeholder="Project Alpha" />
          </div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Project ID" value="ORD-2026-0142" [disabled]="true" />
          </div>
          <div class="state-cell__label">Disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Project ID" value="ORD-2026-0142" [readOnly]="true" />
          </div>
          <div class="state-cell__label">Read-only</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Start date" value="2026-04-30" hint="Must be before end date" [invalid]="true" />
          </div>
          <div class="state-cell__label">Error</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Slug" value="project-alpha-2026" hint="Available" [success]="true" />
          </div>
          <div class="state-cell__label">Success</div>
        </div>
        <div class="state-cell">
          <!-- Loading: ds-input has no spinner slot. Raw markup needed. -->
          <div class="state-cell__stage">
            <div class="field">
              <span class="label">Slug</span>
              <div class="control">
                <input value="project-alpha-2026" />
                <span class="spinner sm"></span>
              </div>
              <span class="hint">Checking availability…</span>
            </div>
          </div>
          <div class="state-cell__label">Loading</div>
        </div>
      </div>

      <!-- ============================================================ Variant states -->
      <h3 class="block-title t-h4">Variant states — textarea · select · prefix · suffix · floating</h3>
      <div class="states states--cols-2">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-textarea label="Description" placeholder="Describe the event…" [rows]="3" />
          </div>
          <div class="state-cell__label">Textarea · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-textarea label="Description" [rows]="3" value="Multi-phase initiative for the north quadrant of the site." />
          </div>
          <div class="state-cell__label">Textarea · with value</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-textarea label="Brief" hint="Required" [rows]="3" [invalid]="true" />
          </div>
          <div class="state-cell__label">Textarea · error</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-textarea label="Brief" [rows]="3" [disabled]="true" value="Auto-generated from event template." />
          </div>
          <div class="state-cell__label">Textarea · disabled</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="field">
              <span class="label">Owner</span>
              <ds-dropdown [options]="ownerOptions" placeholder="Pick an owner…" />
            </div>
          </div>
          <div class="state-cell__label">Select · default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="field">
              <span class="label">Owner</span>
              <ds-dropdown [options]="ownerOptions" value="brooks" />
            </div>
          </div>
          <div class="state-cell__label">Select · with value</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Site URL" value="member.example.com" [withAddon]="true">
              <span dsInputPrefix class="addon">https://</span>
            </ds-input>
          </div>
          <div class="state-cell__label">Prefix</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-input label="Capacity" value="250" type="number" [withAddonRight]="true">
              <span dsInputSuffix class="addon right">people</span>
            </ds-input>
          </div>
          <div class="state-cell__label">Suffix</div>
        </div>
        <div class="state-cell">
          <!-- Floating label: ds-input has no [floating] variant. Raw markup needed. -->
          <div class="state-cell__stage">
            <div class="field floating">
              <div class="control">
                <span class="floating-label">Record name</span>
                <input />
              </div>
            </div>
          </div>
          <div class="state-cell__label">Floating · empty</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="field floating">
              <div class="control">
                <span class="floating-label">Project name</span>
                <input value="Project Alpha 2026" />
              </div>
            </div>
          </div>
          <div class="state-cell__label">Floating · filled</div>
        </div>
      </div>

      <!-- ============================================================ With icon · prefix · suffix · floating -->
      <h3 class="block-title t-h4">With icon · prefix · suffix · floating</h3>
      <div class="grid-3">
        <ds-input label="Search" placeholder="Search projects…">
          <ds-icon dsInputPrefix name="search" [size]="16" />
        </ds-input>
        <ds-input label="Cap length" value="13.55" type="number" [withAddonRight]="true">
          <span dsInputSuffix class="addon right">m</span>
        </ds-input>
        <ds-input label="Site URL" value="member.example.com" [withAddon]="true">
          <span dsInputPrefix class="addon">https://</span>
        </ds-input>
        <ds-input label="Capacity" value="250" type="number" [withAddonRight]="true">
          <span dsInputSuffix class="addon right">people</span>
        </ds-input>
        <!-- Floating label: ds-input has no [floating] variant. Raw markup needed. -->
        <div class="field floating">
          <div class="control">
            <span class="floating-label">Project name</span>
            <input value="Project Alpha 2026" />
          </div>
        </div>
        <div class="field floating">
          <div class="control">
            <span class="floating-label">Project ID</span>
            <input class="t-mono" value="EVT-2026-0142" />
          </div>
        </div>
      </div>

      <!-- ============================================================ Textarea · dropdown · number -->
      <h3 class="block-title t-h4">Textarea · dropdown · number</h3>
      <div class="grid-3">
        <ds-textarea label="Notes" [rows]="3" value="Site map TBC — confirmed via Sam Carter 2 May." />
        <div class="field">
          <span class="label">Member</span>
          <ds-dropdown [options]="memberOptions" value="acme" />
        </div>
        <div class="field">
          <span class="label">Team size</span>
          <ds-number-stepper [value]="42" [min]="0" />
        </div>
      </div>

      <!-- ============================================================ Textarea autosize -->
      <h3 class="block-title t-h4">Textarea · autosize</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[autosize]="true"</code> grows the textarea with its content (forces <code class="t-mono">resize="none"</code>). Bound by <code class="t-mono">[minRows]</code> / <code class="t-mono">[maxRows]</code>.
      </p>
      <div class="grid-2">
        <ds-textarea label="Auto-growing note" [autosize]="true" [minRows]="2" [maxRows]="8"
          value="Type more lines and the field grows up to 8 rows, then scrolls." />
      </div>

      <!-- ============================================================ Clearable -->
      <h3 class="block-title t-h4">Clearable</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[clearable]</code> shows an inline × button when the field has a non-empty value.
        Defaults to <code class="t-mono">true</code> for <code class="t-mono">type="search"</code> and <code class="t-mono">false</code> otherwise — pass an explicit boolean to override.
      </p>
      <div class="grid-2">
        <ds-input type="search" label="Search (auto-clearable)" [value]="'Project Alpha'" placeholder="Search projects…" />
        <ds-input label="Email (explicitly clearable)" [value]="'user@example.com'" [clearable]="true" placeholder="you@company.com" />
      </div>

      <!-- ============================================================ Password toggle -->
      <h3 class="block-title t-h4">Password toggle</h3>
      <p class="block-desc t-s">
        On <code class="t-mono">type="password"</code>, <code class="t-mono">[passwordToggle]="true"</code> adds an eye button that flips the field between masked and plain text. Two-way <code class="t-mono">[(passwordVisible)]</code> exposes the state.
      </p>
      <div class="grid-2">
        <ds-input type="password" label="Password" [passwordToggle]="true" [value]="'hunter2'" placeholder="Enter password" />
      </div>

      <!-- ============================================================ Required vs optional -->
      <h3 class="block-title t-h4">Required vs optional</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[required]="true"</code> appends a red asterisk to the label;
        <code class="t-mono">[optional]="true"</code> appends the muted "(optional)" suffix. They are mutually exclusive — pick one.
      </p>
      <div class="grid-2">
        <ds-input label="Project name" [required]="true" placeholder="e.g. Project Alpha" />
        <ds-input label="Description" [optional]="true" placeholder="Internal notes…" />
      </div>

      <!-- ============================================================ Search · tag input -->
      <h3 class="block-title t-h4">Search · tag input</h3>
      <div class="grid-2">
        <ds-search placeholder="Search projects, resources, people…" shortcut="⌘ K" />
        <div class="tag-input">
          <ds-tag [closable]="true">Project Alpha</ds-tag>
          <ds-tag [closable]="true">Project Beta</ds-tag>
          <ds-tag [closable]="true">Q3 Initiative</ds-tag>
          <input placeholder="Add project…" />
        </div>
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
            <span class="trunc__behaviour">Single line, no clip — labels are short by spec. Wraps if forced.</span>
          </li>
          <li>
            <span class="trunc__field">Input value</span>
            <span class="trunc__behaviour">No clip while focused (caret needs reach). Single-line ellipsis when blurred and overflowing; full value in title attr.</span>
          </li>
          <li>
            <span class="trunc__field">Hint</span>
            <span class="trunc__behaviour">Wrap to 2 lines, then ellipsis. No tooltip — hint is itself the tooltip.</span>
          </li>
          <li>
            <span class="trunc__field">Error message</span>
            <span class="trunc__behaviour">Wrap, no clip. Always fully visible — error must never hide.</span>
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

    /* ---------- Grids ---------- */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      margin-top: var(--space-3);
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      margin-top: var(--space-3);
    }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .states--cols-2 { grid-template-columns: repeat(2, 1fr); }
    .states--cols-3 { grid-template-columns: repeat(3, 1fr); }
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

    /* Showcase-only: pin focus-within / hover visuals on the inner <ds-input>
       .control without real interaction. ::ng-deep reaches past the
       component's emulated encapsulation boundary. */
    .state-cell__stage.force-focus ::ng-deep .control {
      border-color: var(--primary);
      box-shadow: var(--focus-field);
    }
    .state-cell__stage.force-hover ::ng-deep .control {
      border-color: var(--border-strong);
    }

    .state-cell__label {
      text-align: center;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* ---------- Tag input wrapper ---------- */
    .tag-input {
      display: flex; flex-wrap: wrap; align-items: center;
      gap: 6px;
      min-height: 44px;
      height: auto;
      padding: 6px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);

      input {
        flex: 1; min-width: 80px;
        border: 0; outline: 0; background: transparent;
        font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-flat) var(--font-sans);
        color: var(--text-primary);
      }
      input::placeholder { color: var(--text-tertiary); }
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
  `],
})
export class InputSection {
  protected readonly memberOptions: DropdownOption[] = [
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'Beacon Group', value: 'beacon' },
    { label: 'Catalyst Partners', value: 'catalyst' },
    { label: 'Delta Mutual', value: 'delta' },
    { label: 'Evergreen Trust', value: 'evergreen' },
  ];

  protected readonly ownerOptions: DropdownOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jordan Anderson', value: 'anderson' },
    { label: 'Priya Patel', value: 'patel' },
    { label: 'Maya Diaz', value: 'diaz' },
  ];
}
