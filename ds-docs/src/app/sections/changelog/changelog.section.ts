import { Component, ViewEncapsulation, signal } from '@angular/core';
import { marked } from 'marked';

import { DocsSectionComponent } from '../../shared/docs-section.component';
import { DS_VERSION } from '../../shared/docs-stats';

@Component({
  selector: 'section-changelog',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <docs-section anchor="changelog" eyebrow="Changelog" title="Changelog">
      <span lede>
        Every published release of
        <code>
          &#64;ids-group-ltd/ids-design-system
        </code>, newest first. This
        is the same <code>CHANGELOG.md</code> shipped in the npm package.
      </span>

      <div class="changelog-body" [innerHTML]="html()"></div>
    </docs-section>
  `,
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
      .then((response) => response.text())
      .then((markdown) => Promise.resolve(marked.parse(markdown)))
      .then((rendered) => this.html.set(rendered))
      .catch(() => this.html.set('<p>Changelog is currently unavailable.</p>'));
  }
}
