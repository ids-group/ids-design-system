import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { computeStatus, readBuilt, readCurrent, ShowcaseStatus } from './showcase-globals';

/**
 * Staleness banner for the self-contained showcase build. Compares the
 * build-time source hash (window.__DS_BUILT__, injected by the inliner)
 * with the current one (window.__DS_CURRENT__ from the sibling
 * ds-version.js, kept fresh by the pre-commit hook). Hidden in dev serve
 * and when the showcase is up to date.
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
          Cannot verify actuality (no <code>ds-version.js</code> beside this file). Built {{ builtDate() }} from <code>{{ builtHash() }}</code>.
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
  private readonly built = readBuilt();
  private readonly current = readCurrent();
  protected readonly status = signal<ShowcaseStatus>(computeStatus(this.built, this.current));

  protected readonly visible = computed(() =>
    this.status() === 'stale' ||
    this.status() === 'current-diff-commit' ||
    this.status() === 'unverifiable');

  protected readonly builtHash = () => (this.built?.hash ?? '').slice(0, 8);
  protected readonly currentHash = () => (this.current?.hash ?? '').slice(0, 8);
  protected readonly builtCommit = () => (this.built?.commit ?? '').slice(0, 8);
  protected readonly builtDate = () => this.built?.date ?? '';
}
