import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconButtonComponent, SearchComponent } from 'ds';
import {
  NAV,
  type NavGroup,
  groupForAnchor,
  urlForAnchor,
  urlForGroupPath,
} from './nav.config';
import { DS_VERSION } from '../shared/docs-stats';

const STORAGE_KEY = 'ds-docs-sidebar-collapsed';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [IconButtonComponent, SearchComponent, RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.is-collapsed]': 'effectiveCollapsed()',
  },
  template: `
    <nav class="toc" [class.is-collapsed]="effectiveCollapsed()" [class.is-drawer]="mode() === 'drawer'">
      @if (mode() === 'rail') {
        <div class="brand">
          <span class="mark">
            D
          </span>

          @if (!effectiveCollapsed()) {
            <div class="brand-text">
              <span class="brand-name">
                Design System
              </span>

              <small>
                Boilerplate v{{ version }}
              </small>
            </div>
          }

          <ds-icon-button
            class="collapse-toggle"
            variant="outlined"
            size="sm"
            [icon]="effectiveCollapsed() ? 'chevronRight' : 'chevronLeft'"
            [ariaLabel]="effectiveCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
            (pressed)="toggleCollapsed()"
          />
        </div>
      }

      @if (!effectiveCollapsed()) {
        <ds-search
          class="nav-search"
          placeholder="Search…"
          ariaLabel="Filter sections"
          [clearable]="true"
          [(value)]="query"
        />

        @for (group of filteredNav(); track group.title) {
          @if (group.title === 'Start') {
            @for (item of group.items; track item.anchor) {
              <a
                class="link start-link"
                routerLinkActive="is-active"
                [routerLink]="urlForGroupPath(group.path)"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="navigated.emit()"
              >
                {{ item.label }}
              </a>
            }
          } @else {
            <a
              class="group group-link"
              [routerLink]="urlForGroupPath(group.path)"
              [class.is-active]="isGroupActive(group)"
              (click)="navigated.emit()"
            >
              {{ group.title }}
            </a>

            @for (item of group.items; track item.anchor) {
              <a
                class="link"
                [routerLink]="urlForAnchor(group.path, item.anchor)"
                [class.is-active]="isActive(item.anchor)"
                (click)="onItem(item.anchor)"
              >
                <span class="link-label">
                  {{ item.label }}
                </span>

                @if (item.new) {
                  <span class="nav-new">
                    new
                  </span>
                }
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
        display: block;
        font: var(--font-weight-bold) 11px/1.4 var(--font-sans);
        letter-spacing: var(--letter-spacing-wider);
        text-transform: uppercase;
        color: var(--text-tertiary);
        padding: var(--space-4) var(--space-2) var(--space-1-5);
      }
      .group-link {
        text-decoration: none;
        cursor: pointer;
      }
      .group-link.is-active {
        color: var(--text-primary);
      }

      .link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-2);
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
      .link-label {
        min-width: 0;
      }
      .nav-new {
        flex: none;
        padding: 2px 6px;
        border-radius: var(--radius-pill);
        background: var(--primary);
        color: var(--primary-on);
        font: var(--font-weight-bold) 9px/1 var(--font-sans);
        letter-spacing: var(--letter-spacing-wider);
        text-transform: uppercase;
      }
      .link:hover {
        background: var(--surface-secondary);
        color: var(--text-primary);
      }
      .link:active {
        background: var(--surface-muted);
        color: var(--text-primary);
        transform: scale(0.97);
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
        display: block;
        margin-bottom: var(--space-2);
      }
      .nav-empty {
        padding: var(--space-3) var(--space-2);
        color: var(--text-tertiary);
        font: var(--font-weight-medium) 13px/1.4 var(--font-sans);
      }

      .toc.is-drawer {
        border-right: none;
        padding: var(--space-2) 0 var(--space-6);
      }
      .toc.is-drawer .link {
        min-height: var(--hit-comfy);
        padding-block: var(--space-2);
      }
      .toc.is-drawer .start-link {
        min-height: var(--hit-comfy);
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly mode = input<'rail' | 'drawer'>('rail');
  readonly navigated = output<void>();

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
  protected readonly effectiveCollapsed = computed(() =>
    this.mode() === 'drawer' ? false : this.collapsed(),
  );

  protected readonly urlForAnchor = urlForAnchor;
  protected readonly urlForGroupPath = urlForGroupPath;

  private observer: IntersectionObserver | null = null;
  // Anchors of sections currently intersecting the spy band.
  private readonly intersecting = new Set<string>();
  private readonly anchorToSection = new Map<string, HTMLElement>();
  // Group (page) of the last real navigation. The scroll-spy rewrites only the
  // URL's anchor segment WITHIN a page, so we compare the resolved GROUP (not the
  // raw path) to skip those self-updates without re-scrolling / re-observing.
  private lastGroup: string | null = null;
  // Whether the current page has >1 spy section — home/changelog have ≤1 and so
  // never sync an anchor into the URL.
  private multiSection = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });
    // Docs pages are lazy-loaded — sections may not be in the DOM when the
    // sidebar mounts. Poll for `[data-anchor]` elements up to ~3s before
    // wiring the IntersectionObserver. Without this the observer initialises
    // with zero targets and `activeAnchor` never updates on scroll.
    this.setupWhenSectionsExist();

    // A change to a DIFFERENT group page swaps its sections: reset the main
    // scroll (to the target section, or the top) and re-scan `[data-anchor]`.
    // The scroll-spy's within-page anchor rewrites resolve to the SAME group, so
    // they're skipped here — no fighting / observer thrash. `main.main` is the
    // scroll container, not the window, so the router can't do this for us.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
        const group = this.groupPathForUrl(url);
        if (group === this.lastGroup) {
          return;
        }
        this.lastGroup = group;
        setTimeout(() => {
          this.refreshObserver();
          this.scrollForNavigation(url);
        }, 0);
      });

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

    // Sync the URL's anchor segment with the active section as the user scrolls
    // (/components/button → /components/segmented …) — replaceUrl so history
    // isn't polluted. Single-section pages (home/changelog) carry no anchor.
    effect(() => {
      const anchor = this.activeAnchor();
      if (!anchor || !this.multiSection) {
        return;
      }
      const area = this.currentArea();
      if (!area) {
        return;
      }
      const target = `/${area}/${anchor}`;
      if (this.router.url.split('?')[0].split('#')[0] === target) {
        return;
      }
      void this.router.navigateByUrl(target, { replaceUrl: true });
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
        this.scrollToAnchorOnLoad();

        return;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    this.refreshObserver();
    this.scrollToAnchorOnLoad();
  }

  // Sidebar item click: when the target section is on the CURRENT page, scroll
  // to it directly — deterministic and independent of the router (the routerLink
  // still fires but resolves to the same group, so the NavigationEnd handler
  // skips it). Cross-group items find no section here and fall through to the
  // routerLink + NavigationEnd handler on the new page.
  protected onItem(anchor: string): void {
    this.navigated.emit();
    const section =
      this.anchorToSection.get(anchor) ??
      (this.document.querySelector(`[data-anchor="${anchor}"]`) as HTMLElement | null);
    const main = this.document.querySelector('main.main') as HTMLElement | null;
    if (!section || !main) {
      return;
    }
    const topbarHeight = this.computeTopbarHeight();
    const containerTop = main.getBoundingClientRect().top;
    const targetTop = section.getBoundingClientRect().top;
    main.scrollTo({
      top: main.scrollTop + (targetTop - containerTop) - topbarHeight,
      behavior: 'auto',
    });
    this.activeAnchor.set(anchor);
  }

  // On a group-page change: scroll main to the target section (the URL's anchor
  // segment), else to the top (a fresh group starts at its top).
  private scrollForNavigation(url: string): void {
    if (this.scrollToAnchor(this.anchorFromUrl(url))) {
      return;
    }
    const main = this.document.querySelector('main.main') as HTMLElement | null;
    main?.scrollTo({ top: 0, behavior: 'auto' });
  }

  // On initial mount, jump to the section named by the URL's anchor segment.
  private scrollToAnchorOnLoad(): void {
    this.scrollToAnchor(this.anchorFromUrl(this.router.url));
  }

  // Scroll main to `anchor`'s section and mark it active. Returns false when the
  // section isn't on the page (no anchor / unknown / not mounted yet).
  private scrollToAnchor(anchor: string): boolean {
    if (!anchor) {
      return false;
    }
    const section =
      this.anchorToSection.get(anchor) ??
      (this.document.querySelector(
        `[data-anchor="${anchor}"]`,
      ) as HTMLElement | null);
    if (!section) {
      return false;
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

    return true;
  }

  // '/components/button' -> 'components/actions'; '/foundations/color' ->
  // 'foundations'; '/changelog' -> 'changelog'; '/' -> ''.
  private groupPathForUrl(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) {
      return '';
    }
    if (segments.length === 1) {
      return segments[0];
    }
    const [area, anchor] = segments;

    return groupForAnchor(area, anchor)?.path ?? area;
  }

  // The `<anchor>` of a flat `/<area>/<anchor>` URL, else '' (home / bare page).
  private anchorFromUrl(url: string): string {
    const segments = url.split('?')[0].split('/').filter(Boolean);

    return segments.length >= 2 ? segments[1] : '';
  }

  private currentArea(): string {
    return this.router.url.split('?')[0].split('/').filter(Boolean)[0] ?? '';
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

  // A group header is active when the active section belongs to it (the flat URL
  // shares the `/components/` prefix across groups, so prefix-match can't do it).
  protected isGroupActive(group: NavGroup): boolean {
    const active = this.activeAnchor();

    return group.items.some((item) => item.anchor === active);
  }

  private refreshObserver(): void {
    this.observer?.disconnect();
    this.intersecting.clear();
    this.anchorToSection.clear();

    const main = this.document.querySelector('main.main') as HTMLElement | null;
    const sections = Array.from(
      this.document.querySelectorAll<HTMLElement>('[data-anchor]'),
    );
    this.multiSection = sections.length > 1;
    if (sections.length === 0) {
      this.observer = null;
      // Landing (home) has no spy sections — clear any stale anchor so the URL
      // doesn't carry a leftover fragment from the previous page.
      this.activeAnchor.set('');

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
