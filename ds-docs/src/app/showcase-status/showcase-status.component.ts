import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { computeStatus, readBuildStamp, readSourceStamp, ShowcaseStatus } from './showcase-globals';

/**
 * Staleness banner for the self-contained showcase build. Compares the
 * build-time source hash (window.__DS_BUILD_STAMP__ from build-stamp.js,
 * injected by the inliner) with the current one (window.__DS_SOURCE_STAMP__
 * from the sibling source-stamp.js, kept fresh by the pre-commit hook). Hidden
 * in dev serve and when the showcase is up to date.
 */
@Component({
  selector: 'app-showcase-status',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @if (visible()) {
      <div class="ds-stale" [class.is-stale]="status() === 'stale'" role="status">
        @if (status() === 'stale') {
          <strong>Showcase is out of date.</strong>
          Built from <code>{{ builtHash() }}</code>, current source is <code>{{ currentHash() }}</code>.
          Rebuild: <code>npm run build:showcase</code>.
        } @else if (status() === 'current-diff-commit') {
          Built from a different commit (<code>{{ builtCommit() }}</code>), but DS/docs source is unchanged — up to date.
        } @else if (status() === 'unverifiable') {
          Cannot verify actuality (no <code>source-stamp.js</code> beside this file). Built {{ builtDate() }} from <code>{{ builtHash() }}</code>.
        }
      </div>
    }
  `,
  styles: [`
    .ds-stale {
      padding: var(--s-3) var(--s-6);
      font: var(--fw-medium) var(--fs-s)/1.5 var(--font-sans);
      background: var(--surface-secondary);
      color: var(--text-secondary);
      border-bottom: var(--bw-default) solid var(--border-divider);
    }
    .ds-stale.is-stale {
      background: var(--error-subtle);
      color: var(--error-text);
    }
    .ds-stale code {
      font-family: var(--font-mono);
      font-size: 0.92em;
    }
  `],
})
export class ShowcaseStatusComponent {
  private readonly buildStamp = readBuildStamp();
  private readonly sourceStamp = readSourceStamp();
  protected readonly status = signal<ShowcaseStatus>(computeStatus(this.buildStamp, this.sourceStamp));

  protected readonly visible = computed(() =>
    this.status() === 'stale' ||
    this.status() === 'current-diff-commit' ||
    this.status() === 'unverifiable');

  protected readonly builtHash = () => (this.buildStamp?.hash ?? '').slice(0, 8);
  protected readonly currentHash = () => (this.sourceStamp?.hash ?? '').slice(0, 8);
  protected readonly builtCommit = () => (this.buildStamp?.commit ?? '').slice(0, 8);
  protected readonly builtDate = () => this.buildStamp?.date ?? '';
}
