import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-dropzone" data-anchor="dropzone" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Dropzone</h2>
      <p class="lede t-m">
        Drag-and-drop file upload with progress, success / error states, and a queued file list.
      </p>

      <!-- ============================================================ States showcase -->
      <!-- Raw .dropzone markup is used here (not <ds-dropzone>) so each cell
           can be pinned to one state — idle, drag-active, populated with mixed
           per-row states, disabled — without faking pointer events. The global
           .dropzone / .file rules live in styles/_forced-states.scss. -->
      <h3 class="block-title t-h4">States showcase</h3>
      <p class="block-desc t-s">Every dropzone surface state stacked vertically — one per row. Static specimens, no interaction needed.</p>
      <div class="states states--cols-1">
        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="dropzone">
              <ds-icon name="upload" [size]="24" />
              <div class="title">Drop files here or click to upload</div>
              <div class="hint">PDF · DOCX · max 10 MB</div>
            </div>
          </div>
          <div class="state-cell__label">Idle</div>
        </div>

        <div class="state-cell">
          <div class="state-cell__stage">
            <div class="dropzone is-forced-active">
              <ds-icon name="upload" [size]="24" />
              <div class="title">Drop to upload</div>
              <div class="hint">Release to add 3 files</div>
            </div>
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
            <div class="dropzone disabled">
              <ds-icon name="upload" [size]="24" />
              <div class="title">Upload locked</div>
              <div class="hint">Submission window closed</div>
            </div>
          </div>
          <div class="state-cell__label">Disabled</div>
        </div>
      </div>

      <!-- ============================================================ Single-file mode -->
      <h3 class="block-title t-h4">Single-file mode</h3>
      <p class="block-desc t-s">Narrower variant accepting one file at a time. Replaces the existing file rather than appending.</p>
      <div class="single-wrap">
        <div class="dropzone single">
          <ds-icon name="upload" [size]="24" />
          <div class="title">Drop one file here or click to upload</div>
          <div class="hint">PNG · JPG · max 5 MB · one image only</div>
        </div>
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
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); }

    /* ---------- Single-file wrap ---------- */
    .single-wrap {
      margin-top: var(--s-3);
      max-width: var(--col-cap-text);
    }

    /* ---------- States showcase ---------- */
    .states {
      display: grid;
      gap: var(--s-4);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .states--cols-1 { grid-template-columns: 1fr; }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .state-cell__stage {
      display: flex; align-items: stretch; justify-content: stretch;
      padding: var(--s-4);
      min-height: 200px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
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
export class DropzoneSection {}
