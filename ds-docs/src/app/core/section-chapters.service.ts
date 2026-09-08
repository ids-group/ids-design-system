import { Injectable, signal } from '@angular/core';

export interface SectionChapter {
  /** `id` given to the heading, and the URL fragment that reaches it. */
  slug: string;
  label: string;
  heading: HTMLElement;
}

/**
 * The `h3` chapters a mounted docs section declares, published for the sidebar.
 *
 * Docs-app only, and derived rather than declared: ds-table alone carries 35 chapters against the
 * next section's 14, and a hand-kept copy of that list in `nav.config.ts` would be 35 entries to
 * drift against the template. Nothing here reaches the published library.
 */
@Injectable({ providedIn: 'root' })
export class SectionChaptersService {
  private readonly byAnchor = signal<ReadonlyMap<string, SectionChapter[]>>(
    new Map(),
  );

  chaptersOf(anchor: string): readonly SectionChapter[] {
    return this.byAnchor().get(anchor) ?? [];
  }

  /** Called by `docs-section` once its own content has rendered. */
  publish(anchor: string, chapters: SectionChapter[]): void {
    const next = new Map(this.byAnchor());
    if (chapters.length === 0) {
      next.delete(anchor);
    } else {
      next.set(anchor, chapters);
    }
    this.byAnchor.set(next);
  }

  /** A section leaving the DOM takes its chapters with it. */
  withdraw(anchor: string): void {
    const next = new Map(this.byAnchor());
    if (!next.delete(anchor)) {
      return;
    }
    this.byAnchor.set(next);
  }
}

/**
 * Heading text → URL fragment. Strips the decorative separators the docs headings use (`·`, an em
 * dash) and any entity-decoded punctuation, so `Persisted layout & export` and
 * `Loading · skeleton` become `persisted-layout-export` and `loading-skeleton`.
 */
export function chapterSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
