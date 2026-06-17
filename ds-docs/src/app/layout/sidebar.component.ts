import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { IconComponent } from 'ds';
import { NAV } from './nav.config';
import { DS_VERSION } from '../shared/docs-stats';

const STORAGE_KEY = 'ds-docs-sidebar-collapsed';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.is-collapsed]': 'collapsed()',
  },
  template: `
    <nav class="toc" [class.is-collapsed]="collapsed()">
      <div class="brand">
        <span class="mark">
          D
        </span>

        @if (!collapsed()) {
          <div class="brand-text">
            <span class="brand-name">
              Design System
            </span>

            <small>
              Boilerplate v{{ version }}
            </small>
          </div>
        }

        <button
          class="collapse-toggle"
          type="button"
          (click)="toggleCollapsed()"
        >
          <ds-icon
            [name]="collapsed() ? 'chevronRight' : 'chevronLeft'"
            [size]="14"
          />
        </button>
      </div>

      @if (!collapsed()) {
        <input
          class="nav-search"
          type="search"
          placeholder="Search…"
          aria-label="Filter sections"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />

        @for (group of filteredNav(); track group.title) {
          @if (group.title === 'Start') {
            @for (item of group.items; track item.anchor) {
              <a
                class="link start-link"
                [class.is-active]="isActive(item.anchor)"
                (click)="scrollTo($event, item.anchor)"
              >
                {{ item.label }}
              </a>
            }
          } @else {
            <div class="group">
              {{ group.title }}
            </div>

            @for (item of group.items; track item.anchor) {
              <a
                class="link"
                [class.is-active]="isActive(item.anchor)"
                (click)="scrollTo($event, item.anchor)"
              >
                {{ item.label }}
              </a>
            }
          }
        }

        @if (filteredNav().length === 0) {
          <div class="nav-empty">
            Nothing found
          </div>
        }
      }
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .toc {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        padding: var(--space-8) var(--space-6);
        background: var(--surface-default);
        border-right: var(--border-width-default) solid var(--border-divider);
        min-height: 100%;
        transition: padding var(--duration-fast) var(--ease-standard);
      }
      .toc.is-collapsed {
        padding: var(--space-3) var(--space-1);
        align-items: center;
        gap: var(--space-2);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--space-2-5);
        margin-bottom: var(--space-6);
        letter-spacing: var(--letter-spacing-snug);
      }
      .toc.is-collapsed .brand {
        flex-direction: column;
        gap: var(--space-3);
        margin-bottom: 0;
      }

      .collapse-toggle {
        margin-left: auto;
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border: var(--border-width-default) solid var(--border-divider);
        border-radius: var(--radius-md);
        background: var(--surface-default);
        color: var(--icon-default);
        cursor: pointer;
        transition:
          background var(--duration-fast) var(--ease-standard),
          color var(--duration-fast) var(--ease-standard),
          border-color var(--duration-fast) var(--ease-standard);
      }
      .collapse-toggle:hover {
        background: var(--surface-secondary);
        color: var(--icon-strong);
        border-color: var(--border-default);
      }
      .toc.is-collapsed .collapse-toggle {
        margin-left: 0;
      }
      .brand .mark {
        width: var(--space-8);
        height: var(--space-8);
        border-radius: var(--radius-md);
        background: var(--primary);
        color: var(--primary-on);
        display: grid;
        place-items: center;
        font: var(--font-weight-extrabold) 16px/1 var(--font-sans);
        flex-shrink: 0;
      }
      .brand-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .brand-name {
        font: var(--font-weight-extrabold) var(--font-size-h5)/1
          var(--font-sans);
        color: var(--text-primary);
      }
      .brand small {
        display: block;
        font: var(--font-weight-medium) 11px/1 var(--font-sans);
        color: var(--text-tertiary);
        letter-spacing: var(--letter-spacing-wider);
        text-transform: uppercase;
      }

      .group {
        font: var(--font-weight-bold) 11px/1.4 var(--font-sans);
        letter-spacing: var(--letter-spacing-wider);
        text-transform: uppercase;
        color: var(--text-tertiary);
        padding: var(--space-4) var(--space-2) var(--space-1-5);
      }

      .link {
        display: block;
        padding: 7px var(--space-2-5);
        color: var(--text-secondary);
        font: var(--font-weight-medium) 13px/1.4 var(--font-sans);
        border-radius: var(--radius-md);
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        transition:
          background-color var(--duration-fast) var(--ease-standard),
          color var(--duration-fast) var(--ease-standard);
      }
      .link:hover {
        background: var(--surface-secondary);
        color: var(--text-primary);
      }
      .link.is-active {
        background: var(--primary-subtitle);
        color: var(--primary-strong);
        font-weight: var(--font-weight-bold);
      }

      .start-link {
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        margin-bottom: var(--space-1);
      }

      .nav-search {
        width: 100%;
        padding: 7px var(--space-3);
        margin-bottom: var(--space-2);
        border: var(--border-width-default) solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--surface-default);
        color: var(--text-primary);
        font: var(--font-weight-medium) 13px/1.4 var(--font-sans);
      }
      .nav-search::placeholder {
        color: var(--text-tertiary);
      }
      .nav-search:focus-visible {
        outline: none;
        border-color: var(--primary);
        box-shadow: var(--focus-field, 0 0 0 3px var(--primary-subtitle));
      }
      .nav-empty {
        padding: var(--space-3) var(--space-2);
        color: var(--text-tertiary);
        font: var(--font-weight-medium) 13px/1.4 var(--font-sans);
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly version = DS_VERSION;
  protected readonly query = signal('');
  protected readonly filteredNav = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return NAV;
    }

    return NAV.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  });
  protected readonly activeAnchor = signal<string>('');
  protected readonly collapsed = signal<boolean>(this.readCollapsed());

  private observer: IntersectionObserver | null = null;
  // Anchors of sections currently intersecting the spy band.
  private readonly intersecting = new Set<string>();
  private readonly anchorToSection = new Map<string, HTMLElement>();
  // True while a user-initiated smooth scroll (nav click) is in flight.
  // Suppresses scroll-spy updates so intermediate sections passing through
  // the spy band don't sequentially light up the nav.
  private programmaticScrollUntil = 0;
  private programmaticScrollTimer: number | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });
    // Docs pages are lazy-loaded — sections may not be in the DOM when the
    // sidebar mounts. Poll for `[data-anchor]` elements up to ~3s before
    // wiring the IntersectionObserver. Without this the observer initialises
    // with zero targets and `activeAnchor` never updates on scroll.
    this.setupWhenSectionsExist();

    // Reflect collapsed state on the document so the layout grid can react.
    effect(() => {
      const isCollapsed = this.collapsed();
      try {
        localStorage.setItem(STORAGE_KEY, isCollapsed ? '1' : '0');
      } catch {
        /* ignore */
      }
      this.document.documentElement.classList.toggle(
        'ds-docs-sidebar-collapsed',
        isCollapsed,
      );
    });

    // Sync URL hash with the active section as the user scrolls — replaceState
    // so the browser history isn't polluted with every intermediate section.
    effect(() => {
      const anchor = this.activeAnchor();
      if (!anchor) {
        return;
      }
      const win = this.document.defaultView;
      if (!win) {
        return;
      }
      const targetHash = '#' + anchor;
      if (win.location.hash === targetHash) {
        return;
      }
      try {
        win.history.replaceState(null, '', targetHash);
      } catch {
        /* ignore */
      }
    });
  }

  private async setupWhenSectionsExist(
    maxWaitMs = 3000,
    intervalMs = 100,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const found = this.document.querySelectorAll('[data-anchor]').length;
      if (found > 0) {
        this.refreshObserver();
        this.scrollToHashOnLoad();

        return;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    this.refreshObserver();
    this.scrollToHashOnLoad();
  }

  // On initial mount, if the URL has #anchor, scroll the main container
  // to that section instantly (no smooth scroll on load — feels janky).
  private scrollToHashOnLoad(): void {
    const win = this.document.defaultView;
    const rawHash = win?.location.hash ?? '';
    const anchor = rawHash.startsWith('#') ? rawHash.slice(1) : '';
    if (!anchor) {
      return;
    }
    const section =
      this.anchorToSection.get(anchor) ??
      (this.document.querySelector(
        `[data-anchor="${anchor}"]`,
      ) as HTMLElement | null);
    if (!section) {
      return;
    }

    this.activeAnchor.set(anchor);

    const main = this.document.querySelector('main.main') as HTMLElement | null;
    const topbarH = this.computeTopbarHeight();
    if (main) {
      const containerTop = main.getBoundingClientRect().top;
      const targetTop = section.getBoundingClientRect().top;
      main.scrollTo({
        top: main.scrollTop + (targetTop - containerTop) - topbarH,
        behavior: 'auto',
      });
    } else {
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  protected isActive(anchor: string): boolean {
    return this.activeAnchor() === anchor;
  }

  // Click handler: scroll the .main container to the section without
  // touching window.location.hash. The clicked anchor stays pinned during
  // the smooth scroll — scroll-spy updates are suppressed via
  // `programmaticScrollUntil` so intermediate sections don't flicker the
  // active highlight as they pass through the spy band.
  protected scrollTo(event: Event, anchor: string): void {
    event.preventDefault();
    const section =
      this.anchorToSection.get(anchor) ??
      (this.document.querySelector(
        `[data-anchor="${anchor}"]`,
      ) as HTMLElement | null);
    if (!section) {
      return;
    }

    this.activeAnchor.set(anchor);
    this.beginProgrammaticScroll();

    const main = this.document.querySelector('main.main') as HTMLElement | null;
    const topbarH = this.computeTopbarHeight();
    if (main) {
      const containerTop = main.getBoundingClientRect().top;
      const targetTop = section.getBoundingClientRect().top;
      main.scrollTo({
        top: main.scrollTop + (targetTop - containerTop) - topbarH,
        behavior: 'smooth',
      });
      this.watchScrollEnd(main, anchor);
    } else {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Pin the clicked anchor for at least 1.2s. The real release happens on
  // scroll-end detection (`watchScrollEnd`); this is the upper-bound safety
  // net in case scroll events stop firing before reaching the target.
  private beginProgrammaticScroll(): void {
    this.programmaticScrollUntil = Date.now() + 1200;
    if (this.programmaticScrollTimer !== null) {
      clearTimeout(this.programmaticScrollTimer);
    }
    this.programmaticScrollTimer = window.setTimeout(() => {
      this.programmaticScrollUntil = 0;
      this.programmaticScrollTimer = null;
    }, 1200);
  }

  // Listen for scroll events on the container; when they stop firing for
  // ~150ms the smooth scroll has settled. Release the guard immediately
  // and re-assert the clicked anchor as the active one (the observer was
  // suppressed during the animation, so its last verdict is stale).
  private watchScrollEnd(main: HTMLElement, anchor: string): void {
    let settleTimer: number | null = null;
    const onScroll = (): void => {
      if (settleTimer !== null) {
        clearTimeout(settleTimer);
      }
      settleTimer = window.setTimeout(() => {
        main.removeEventListener('scroll', onScroll);
        this.programmaticScrollUntil = 0;
        if (this.programmaticScrollTimer !== null) {
          clearTimeout(this.programmaticScrollTimer);
          this.programmaticScrollTimer = null;
        }
        this.activeAnchor.set(anchor);
      }, 150);
    };
    main.addEventListener('scroll', onScroll, { passive: true });
  }

  private refreshObserver(): void {
    this.observer?.disconnect();
    this.intersecting.clear();
    this.anchorToSection.clear();

    const main = this.document.querySelector('main.main') as HTMLElement | null;
    const sections = Array.from(
      this.document.querySelectorAll<HTMLElement>('[data-anchor]'),
    );
    if (sections.length === 0) {
      this.observer = null;

      return;
    }

    for (const section of sections) {
      const anchor = section.dataset['anchor'];
      if (anchor) {
        this.anchorToSection.set(anchor, section);
      }
    }

    const firstAnchor = sections[0]?.dataset['anchor'] ?? '';
    if (firstAnchor && !this.activeAnchor()) {
      this.activeAnchor.set(firstAnchor);
    }

    // rootMargin: shrink the top by the topbar height so a section only
    // counts as active once its top has crossed the topbar. The -60%
    // bottom margin means the section must occupy at least the top 40%
    // of the visible area to qualify.
    const topbarH = this.computeTopbarHeight();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const anchor = (entry.target as HTMLElement).dataset['anchor'];
          if (!anchor) {
            continue;
          }
          if (entry.isIntersecting) {
            this.intersecting.add(anchor);
          } else {
            this.intersecting.delete(anchor);
          }
        }

        // Suppress spy-driven updates while a click-triggered smooth scroll
        // is animating — intermediate sections would otherwise flash active.
        if (Date.now() < this.programmaticScrollUntil) {
          return;
        }

        // Pick THE topmost intersecting section: smallest non-negative
        // top relative to the topbar line wins. If none qualify (all
        // have scrolled past the line), fall back to the one closest
        // to the line from above. If nothing intersects at all, keep
        // the last active anchor.
        let bestAnchor: string | null = null;
        let bestNonNeg = Number.POSITIVE_INFINITY;
        let fallbackAnchor: string | null = null;
        let fallbackTop = Number.NEGATIVE_INFINITY;
        for (const anchor of this.intersecting) {
          const section = this.anchorToSection.get(anchor);
          if (!section) {
            continue;
          }
          const top = section.getBoundingClientRect().top - topbarH;
          if (top >= 0 && top < bestNonNeg) {
            bestNonNeg = top;
            bestAnchor = anchor;
          } else if (top < 0 && top > fallbackTop) {
            fallbackTop = top;
            fallbackAnchor = anchor;
          }
        }
        const next = bestAnchor ?? fallbackAnchor;
        if (next) {
          this.activeAnchor.set(next);
        }
      },
      {
        root: main,
        rootMargin: `-${topbarH}px 0px -60% 0px`,
        threshold: [0, 0.01, 1],
      },
    );

    for (const section of sections) {
      this.observer.observe(section);
    }
  }

  private computeTopbarHeight(): number {
    const styles = getComputedStyle(this.document.documentElement);
    const raw = styles.getPropertyValue('--topbar-h').trim();
    if (raw.endsWith('px')) {
      const pixels = parseFloat(raw);
      if (!Number.isNaN(pixels)) {
        return pixels;
      }
    }
    const header = this.document.querySelector(
      '.docs-header',
    ) as HTMLElement | null;

    return header?.getBoundingClientRect().height ?? 56;
  }
}
