import { Component, ViewEncapsulation, signal } from '@angular/core';
import { readBuildStamp, ShowcaseStatus } from './showcase-globals';
import { computeContentHashFromFiles } from './source-hash.browser';

/**
 * Freshness banner for the self-contained showcase build. Shows the build
 * provenance (age + commit + src hash) instantly from window.__DS_BUILD_STAMP__
 * (baked into build-stamp.js by the inliner). A `file://` page can't read the
 * repo on its own, so an exact staleness check is on demand: the user clicks
 * "Check freshness" and picks the repo root — the page then re-hashes
 * src/lib + ds-docs/src in-browser (WebCrypto, mirroring tools/showcase/
 * source-hash.mjs) and compares to the baked hash. No server, hook or
 * committed stamp that churns. Hidden under `ng serve` (no build stamp).
 */
@Component({
  selector: 'app-showcase-status',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @if (buildStamp) {
      <div class="ds-stamp" [class.is-stale]="status() === 'stale'" [class.is-current]="status() === 'current'" role="status">
        <span class="ds-stamp__info">
          Showcase built <strong>{{ age() }}</strong> ·
          src <code>{{ shortHash() }}</code> · commit <code>{{ shortCommit() }}</code>
        </span>

        @switch (status()) {
          @case ('checking') {
            <span class="ds-stamp__verdict">Hashing source…</span>
          }
          @case ('current') {
            <span class="ds-stamp__verdict ok">✓ Up to date with current source</span>
          }
          @case ('stale') {
            <span class="ds-stamp__verdict">⚠ Source changed since build — rebuild: <code>npm run build:showcase</code></span>
            <label class="ds-stamp__btn">Re-check<input type="file" webkitdirectory hidden (change)="onPick($event)"></label>
          }
          @case ('no-source') {
            <span class="ds-stamp__verdict">No <code>src/lib</code> in that folder — pick the repo root.</span>
            <label class="ds-stamp__btn">Try again<input type="file" webkitdirectory hidden (change)="onPick($event)"></label>
          }
          @default {
            <label class="ds-stamp__btn">Check freshness<input type="file" webkitdirectory hidden (change)="onPick($event)"></label>
          }
        }
      </div>
    }
  `,
  styles: [`
    .ds-stamp {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
      padding: var(--space-2) var(--space-6);
      font: var(--font-weight-medium) var(--font-size-s)/1.5 var(--font-sans);
      background: var(--surface-secondary);
      color: var(--text-secondary);
      border-bottom: var(--border-width-default) solid var(--border-divider);
    }
    .ds-stamp.is-stale { background: var(--error-subtle); color: var(--error-text); }
    .ds-stamp.is-current { background: var(--success-subtle); color: var(--success-text); }
    .ds-stamp code { font-family: var(--font-mono); font-size: 0.92em; }
    .ds-stamp__verdict { font-weight: var(--font-weight-bold); }
    .ds-stamp__verdict.ok { font-weight: var(--font-weight-medium); }
    .ds-stamp__btn {
      cursor: pointer;
      padding: 2px var(--space-3);
      border-radius: var(--radius-sm);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      color: var(--text-primary);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
    }
    .ds-stamp__btn:hover { background: var(--surface-muted); }
  `],
})
export class ShowcaseStatusComponent {
  protected readonly buildStamp = readBuildStamp();
  protected readonly status = signal<ShowcaseStatus>(this.buildStamp ? 'idle' : 'unknown');

  protected shortHash(): string { return (this.buildStamp?.srcHash ?? '').slice(0, 8); }
  protected shortCommit(): string { return (this.buildStamp?.commit ?? '').slice(0, 8); }

  protected age(): string {
    const built = this.buildStamp?.date ? new Date(this.buildStamp.date).getTime() : NaN;
    if (Number.isNaN(built)) return 'unknown';
    const minutes = Math.max(0, Math.round((Date.now() - built) / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    return `${Math.round(hours / 24)} d ago`;
  }

  protected async onPick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length || !this.buildStamp) return;
    this.status.set('checking');
    try {
      const { srcHash, fileCount } = await computeContentHashFromFiles(files);
      if (fileCount === 0) { this.status.set('no-source'); return; }
      this.status.set(srcHash === this.buildStamp.srcHash ? 'current' : 'stale');
    } catch {
      this.status.set('no-source');
    }
  }
}
