import { Component, ViewEncapsulation, signal } from '@angular/core';
import { marked } from 'marked';

import { DocsSectionComponent } from '../../shared/docs-section.component';
import { DS_VERSION } from '../../shared/docs-stats';

/**
 * The cut EMPTIES `## Unreleased` rather than deleting it (`cut-release.sh`), and
 * the docs deploy from the release — so on a published site that heading is
 * always there and always bare. Notes accumulate under it on `dev`, which this
 * page never renders. Drop the section only when it has nothing under it, so a
 * docs build taken from `dev` still shows work in progress.
 */
function dropEmptyUnreleased(markdown: string): string {
  return markdown.replace(
    /^## Unreleased[^\S\n]*\n(?:[^\S\n]*\n)*(?=^## |(?![\s\S]))/m,
    '',
  );
}

@Component({
  selector: 'section-changelog',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './changelog.section.html',
  styles: [
    `
      .changelog-body {
        margin-top: var(--space-6);
        max-width: var(--col-cap-text);
      }
      :host ::ng-deep .changelog-body h2 {
        margin-top: var(--space-10);
        padding-top: var(--space-4);
        border-top: var(--border-width-default) solid var(--border-divider);
      }
      :host ::ng-deep .changelog-body h3 {
        margin-top: var(--space-6);
        color: var(--text-secondary);
      }
      :host ::ng-deep .changelog-body ul {
        margin: var(--space-2) 0;
        padding-left: var(--space-6);
      }
      :host ::ng-deep .changelog-body li {
        margin-top: var(--space-1);
      }
      :host ::ng-deep .changelog-body code {
        font-family: var(--font-mono);
        font-size: 0.9em;
      }
      :host ::ng-deep .changelog-body pre,
      :host ::ng-deep .changelog-body table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
      }
      :host ::ng-deep .changelog-body p code,
      :host ::ng-deep .changelog-body li code {
        overflow-wrap: anywhere;
      }
    `,
  ],
})
export class ChangelogSection {
  readonly html = signal<string>('Loading changelog…');

  constructor() {
    // Versioned URL, because CHANGELOG.md has a stable name and was served for a
    // year as `immutable`. Fixing the header stops NEW caches going stale but
    // cannot dislodge the copies already pinned in visitors' browsers — only a
    // different URL does that. The file only changes on release, so the package
    // version is exactly the right key.
    fetch(new URL(`CHANGELOG.md?v=${DS_VERSION}`, document.baseURI))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.text();
      })
      .then((markdown) =>
        Promise.resolve(marked.parse(dropEmptyUnreleased(markdown))),
      )
      .then((rendered) => this.html.set(rendered))
      .catch(() => this.html.set('<p>Changelog is currently unavailable.</p>'));
  }
}
