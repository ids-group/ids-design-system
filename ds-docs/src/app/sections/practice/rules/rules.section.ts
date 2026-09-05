import { Component, ViewEncapsulation, signal } from '@angular/core';
import { marked } from 'marked';

import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DS_VERSION } from '../../../shared/docs-stats';

@Component({
  selector: 'practice-rules',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <docs-section
      anchor="practice-rules"
      eyebrow="Practice"
      title="Composition rules">
      <span lede>
        Which spacing goes between what, which type role a piece of text takes,
        which colour role does which job, and when a transition earns its place.
        Knowing the tokens is not enough to build a page with them — the tokens
        are a vocabulary, and these are the rules that decide which word.
      </span>

      <p class="rules-source t-s">
        Rendered from <code class="t-mono-inline">design-system.md</code>, the
        same file shipped in the npm package so a consumer's agents read exactly
        this. <strong> One source, two renderings </strong> — a second
        hand-maintained copy would disagree with this one inside a release.
      </p>

      <div class="rules-body" [innerHTML]="html()"></div>
    </docs-section>
  `,
  styles: [
    `
      .rules-source {
        margin-top: var(--space-4);
        padding: var(--space-3) var(--space-4);
        background: var(--surface-secondary);
        border-radius: var(--ds-radius-panel);
        color: var(--text-secondary);
        max-width: var(--col-cap-text);
      }
      /* ::ng-deep because the body is set through innerHTML: emulated encapsulation
         stamps _ngcontent on the container but not on nodes marked() produced, so a
         plain .rules-body h2 selector matches nothing. The changelog page had this
         bug — its whole markdown style block was dead. */
      .rules-body {
        margin-top: var(--space-6);
        max-width: var(--col-cap-text);
      }
      /* The file opens with its own H1 and a blockquote aimed at an agent reading
         it from node_modules; the page already carries a title and a lede. */
      :host ::ng-deep .rules-body > h1,
      :host ::ng-deep .rules-body > blockquote {
        display: none;
      }
      :host ::ng-deep .rules-body h2 {
        margin-top: var(--space-10);
        padding-top: var(--space-4);
        border-top: var(--border-width-default) solid var(--border-divider);
      }
      :host ::ng-deep .rules-body h3 {
        margin-top: var(--space-6);
        color: var(--text-secondary);
      }
      :host ::ng-deep .rules-body table {
        width: 100%;
        border-collapse: collapse;
        margin: var(--space-4) 0;
        font-size: var(--font-size-s);
      }
      :host ::ng-deep .rules-body th,
      :host ::ng-deep .rules-body td {
        text-align: left;
        padding: var(--space-2) var(--space-3);
        border-bottom: var(--border-width-default) solid var(--border-divider);
        vertical-align: top;
      }
      :host ::ng-deep .rules-body th {
        color: var(--text-tertiary);
        font-weight: var(--font-weight-semibold);
      }
      :host ::ng-deep .rules-body code {
        font-family: var(--font-mono);
        font-size: var(--font-size-mono);
        background: var(--surface-secondary);
        padding: 1px 4px;
        border-radius: var(--ds-radius-inner);
      }
      :host ::ng-deep .rules-body pre {
        overflow-x: auto;
        padding: var(--space-3) var(--space-4);
        background: var(--surface-secondary);
        border-radius: var(--ds-radius-panel);
      }
      :host ::ng-deep .rules-body pre code {
        background: none;
        padding: 0;
      }
      :host ::ng-deep .rules-body hr {
        display: none;
      }
    `,
  ],
})
export class RulesSection {
  readonly html = signal<string>('Loading rules…');

  constructor() {
    // Versioned like the changelog: the file has a stable name, so a cached copy
    // would otherwise outlive the release that changed it.
    fetch(new URL(`design-system.md?v=${DS_VERSION}`, document.baseURI))
      .then((response) => response.text())
      .then((markdown) => Promise.resolve(marked.parse(markdown)))
      .then((rendered) => this.html.set(rendered))
      .catch(() =>
        this.html.set(
          '<p>The rules are currently unavailable — they ship in the package as <code>design-system.md</code>.</p>',
        ),
      );
  }
}
