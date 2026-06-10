import { Component, ViewEncapsulation } from '@angular/core';
import { BannerComponent, DropdownComponent, type DropdownOption, IconComponent, ModalCardComponent } from 'ds';

@Component({
  selector: 'section-components-modal',
  standalone: true,
  imports: [BannerComponent, DropdownComponent, IconComponent, ModalCardComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-modal" data-anchor="modal" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Modal</h2>
      <p class="lede t-m">
        Centered dialog over a scrim. Three sizes plus a danger variant for destructive
        confirmations. Inline specimens render the modal card without the backdrop so all
        sizes can be compared side by side.
      </p>

      <!-- ============================================================ Sizes -->
      <h3 class="block-title t-h4">Sizes</h3>
      <p class="block-desc t-s">sm · md · lg specimens rendered as static cards.</p>
      <div class="modal-grid modal-grid--1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Quick confirm" size="sm" [showClose]="false">
              <span body>Tight modal for binary confirmations and short messages.</span>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button">Confirm</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">sm · 480 px</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Edit Project Alpha" size="md" [showClose]="false">
              <span body>Default size. Most edits, detail dialogs, and confirmations with a paragraph of context.</span>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button">Save</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">md · 640 px</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Run report" size="lg" [showClose]="false">
              <span body>Wider canvas for forms, multi-column previews, and bulk-edit dialogs.</span>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button">Run</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">lg · 800 px</div>
        </div>
      </div>

      <!-- ============================================================ Variants -->
      <h3 class="block-title t-h4">Variants</h3>
      <p class="block-desc t-s">Default · danger confirm · impact warning with affected records.</p>
      <div class="modal-grid modal-grid--1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Save changes?" size="sm" [showClose]="false">
              <span body>Apply schedule changes to all 24 records?</span>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button">Apply</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Delete record?" size="sm" [danger]="true" [showClose]="false">
              <span body>This cannot be undone. 12 resource allocations will be released.</span>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button error">Delete</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">Danger confirm</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Confirm recompute" size="md" [showClose]="false">
              <span body>Saving these dates will recompute downstream allocations across three projects.</span>
              <ds-banner impact variant="severe" title="Affected records">
                <ul class="list">
                  <li>Project Alpha · 3 Logistics plans</li>
                  <li>Project Beta · 8 Resource allocations</li>
                  <li>Project Gamma · 1 Sub-record</li>
                </ul>
              </ds-banner>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button">Recompute &amp; save</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">Impact warning</div>
        </div>
      </div>

      <!-- ============================================================ With form -->
      <h3 class="block-title t-h4">With form</h3>
      <p class="block-desc t-s">Modal hosting a small form — label, input, select.</p>
      <div class="modal-grid modal-grid--1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-modal-card title="Edit sub-record" size="md" [showClose]="false">
              <div body class="form-stack">
                <div class="field">
                  <span class="label">Sub-record name</span>
                  <div class="control"><input value="Project Alpha · Phase 1" /></div>
                </div>
                <div class="field">
                  <span class="label">Capacity</span>
                  <div class="control"><input type="number" value="60" /></div>
                </div>
                <div class="field">
                  <span class="label">Owner</span>
                  <ds-dropdown [options]="ownerOptions" value="brooks" />
                </div>
              </div>
              <ng-container actions>
                <button class="button outline">Cancel</button>
                <button class="button">Save changes</button>
              </ng-container>
            </ds-modal-card>
          </div>
          <div class="state-cell__label">Form modal · md</div>
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
            <span class="trunc__field">Title</span>
            <span class="trunc__behaviour">Single line, ellipsis on overflow. Tooltip on hover when clipped. Keep the close button visible.</span>
          </li>
          <li>
            <span class="trunc__field">Body</span>
            <span class="trunc__behaviour">Wrap, no clip. Scrolls inside the body when content exceeds the modal height.</span>
          </li>
          <li>
            <span class="trunc__field">Actions</span>
            <span class="trunc__behaviour">Single line per label. If the row overflows, stack vertically full-width.</span>
          </li>
          <li>
            <span class="trunc__field">Form fields inside body</span>
            <span class="trunc__behaviour">Inherit field truncation rules. Hints wrap to 2 lines; errors never clip.</span>
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

    /* ---------- Modal specimen grid ---------- */
    .modal-grid {
      display: grid;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .modal-grid--1 { grid-template-columns: 1fr; }

    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .state-cell__stage {
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-4);
      min-height: 220px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);

      ::ng-deep .modal { max-width: 100%; }
    }
    .state-cell__label {
      text-align: center;
      font: var(--font-weight-bold) var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* ---------- Form stack inside modal body ---------- */
    .form-stack {
      display: flex; flex-direction: column;
      gap: var(--space-3);
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
export class ModalSection {
  protected readonly ownerOptions: DropdownOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jamie Lin', value: 'lin' },
    { label: 'Morgan Reyes', value: 'reyes' },
  ];
}
