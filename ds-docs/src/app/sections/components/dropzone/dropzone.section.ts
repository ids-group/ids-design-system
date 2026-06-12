import { Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [DropzoneComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-dropzone" data-anchor="dropzone" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Dropzone</h2>
      <p class="lede t-m">
        Drag-and-drop file upload with progress, success / error states, and a queued file list.
      </p>

      <!-- ============================================================ States showcase -->
      <!-- Idle and active cells use live <ds-dropzone>; pin-active on the stage
           reads the component's own resolvers via ::ng-deep. has-files and
           disabled stay raw (no API for static file list or disabled input). -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Every dropzone surface state stacked vertically — one per row. Static specimens, no interaction needed.</p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropzone />
          </div>
          <div class="state-cell__label">Idle</div>
        </div>

        <div class="state-cell">
          <!-- pin-active on the stage reads the component's own --_dropzone-* resolvers. -->
          <div class="state-cell__stage pin-active">
            <ds-dropzone />
          </div>
          <div class="state-cell__label">Active · drag-over</div>
        </div>

        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="dropzone has-files">
              <div class="file-list">
                <div class="file uploading">
                  <ds-icon class="icon" name="file" [size]="20" />
                  <div class="main">
                    <div class="name">project-alpha-brief-v3.pdf</div>
                    <div class="meta">2.4 MB · uploading 65%</div>
                    <div class="progress"><div class="progress-fill" style="width: 65%"></div></div>
                  </div>
                  <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
                </div>
                <div class="file success">
                  <ds-icon class="icon" name="check" [size]="20" />
                  <div class="main">
                    <div class="name">site-map.dwg</div>
                    <div class="meta">8.1 MB · uploaded</div>
                  </div>
                  <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
                </div>
                <div class="file error">
                  <ds-icon class="icon" name="error" [size]="20" />
                  <div class="main">
                    <div class="name">vendor-list-FINAL.xlsx</div>
                    <div class="meta">12.4 MB · exceeds 10 MB limit</div>
                  </div>
                  <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
                </div>
              </div>
            </div>
          </div>
          <div class="state-cell__label">With files</div>
        </div>

        <div class="state-cell">
          <div class="state-cell__stage">
            <ds-dropzone [disabled]="true" />
          </div>
          <div class="state-cell__label">Disabled</div>
        </div>
      </div>

      <!-- ============================================================ Single-file mode -->
      <h3 class="block-title t-h4">Single-file mode</h3>
      <p class="block-desc t-s">Narrower variant accepting one file at a time. Replaces the existing file rather than appending.</p>
      <div class="single-wrap">
        <ds-dropzone [single]="true">
          <p hint>PNG · JPG · max 5 MB · one image only</p>
        </ds-dropzone>
      </div>

      <!-- ============================================================ File row states -->
      <h3 class="block-title t-h4">File row states</h3>
      <p class="block-desc t-s">Individual file cell variants — stacked vertically, one per row.</p>
      <div class="states states--cols-1 states--file-rows">
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="file">
              <ds-icon class="icon" name="file" [size]="20" />
              <div class="main">
                <div class="name">project-brief.pdf</div>
                <div class="meta">2.4 MB</div>
              </div>
              <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
            </div>
          </div>
          <div class="state-cell__label">Default</div>
        </div>

        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="file uploading">
              <ds-icon class="icon" name="file" [size]="20" />
              <div class="main">
                <div class="name">site-survey.dwg</div>
                <div class="meta">8.1 MB · 42%</div>
                <div class="progress"><div class="progress-fill" style="width: 42%"></div></div>
              </div>
              <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
            </div>
          </div>
          <div class="state-cell__label">Uploading</div>
        </div>

        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="file success">
              <ds-icon class="icon" name="check" [size]="20" />
              <div class="main">
                <div class="name">risk-assessment.docx</div>
                <div class="meta">1.2 MB · uploaded</div>
              </div>
              <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
            </div>
          </div>
          <div class="state-cell__label">Success</div>
        </div>

        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="file error">
              <ds-icon class="icon" name="error" [size]="20" />
              <div class="main">
                <div class="name">vendor-list-FINAL.xlsx</div>
                <div class="meta">Upload failed — exceeds 10 MB limit</div>
              </div>
              <button class="remove" type="button"><ds-icon name="x" [size]="14" /></button>
            </div>
          </div>
          <div class="state-cell__label">Error</div>
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
            <span class="trunc__field">File name</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover with full name.</span>
          </li>
          <li>
            <span class="trunc__field">Progress percentage</span>
            <span class="trunc__behaviour">Numeric — no clip.</span>
          </li>
          <li>
            <span class="trunc__field">Error message</span>
            <span class="trunc__behaviour">Wrap, no clip — must remain visible.</span>
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

    /* State pin — force drag-over visual on live ds-dropzone by reading its own resolvers. */
    :host ::ng-deep .pin-active .dropzone {
      border-color: var(--_dropzone-border-active);
      background: var(--_dropzone-bg-active);
      color: var(--_dropzone-fg-active);
    }

    /* ---------- Single-file wrap ---------- */
    .single-wrap { margin-top: var(--space-3); }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--space-4);
      margin-top: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .states--cols-1 { grid-template-columns: 1fr; }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--space-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--space-4);
      min-height: 200px;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-md);
    }
    .state-cell__stage > * { flex: 1; }

    /* File row showcase — height follows row content (icon + name + meta),
       no width cap; let each row span the full stage. */
    .states--file-rows .state-cell__stage {
      min-height: 0;
      align-items: center;
      justify-content: stretch;
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
  `],
})
export class DropzoneSection {}
