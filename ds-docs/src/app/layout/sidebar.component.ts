import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppLayoutComponent, AppLayoutScrollService } from 'ds/app-layout';
import { IconButtonComponent } from 'ds/icon-button';
import { IconComponent } from 'ds/icons';
import { SearchComponent } from 'ds/search';
import {
  NAV,
  type NavGroup,
  type NavItem,
  groupForAnchor,
  urlForAnchor,
  urlForGroupPath,
} from '../core/nav.config';
import {
  type SectionChapter,
  SectionChaptersService,
} from '../core/section-chapters.service';
import { DS_VERSION } from '../shared/docs-stats';

const STORAGE_KEY = 'ds-docs-sidebar-collapsed';
const CHAPTER_LINE_SLACK_PX = 2;

// Past the 3s timer that resolves any section the reader never scrolled to, plus room for the
// bodies to lay out.
const ANCHOR_SETTLE_MS = 12000;
const ANCHOR_SETTLE_INTERVAL_MS = 120;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    IconButtonComponent,
    IconComponent,
    SearchComponent,
    RouterLink,
    RouterLinkActive,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.is-collapsed]': 'effectiveCollapsed()',
  },
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly layoutScroll = inject(AppLayoutScrollService);
  protected readonly layout = inject(AppLayoutComponent);

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
  // Read from the layout, not a second media query: ds-app-layout already owns the
  // lg breakpoint, and a copy here is the duplication its --bp-lg lesson was about.
  protected readonly effectiveCollapsed = computed(() =>
    this.layout.railOverlay() ? false : this.collapsed(),
  );

  protected readonly urlForAnchor = urlForAnchor;
  protected readonly urlForGroupPath = urlForGroupPath;

  private readonly chaptersService = inject(SectionChaptersService);
  /** Read once, before anything can rewrite it: the scroll-spy republishes the URL from the
   *  active anchor, and with no chapter known yet that write dropped the fragment a deep link
   *  arrived with. */
  private readonly initialChapter = this.chapterFromUrl(this.router.url);
  protected readonly activeChapter = signal<string>(this.initialChapter);
  // A group page mounts EVERY section it holds, so every item has chapters to show — 67 of them on
  // Data display. Only the section being read opens its own, the way a group holding the active
  // section is open regardless; an explicit close still wins, because 35 chapters is a lot to
  // scroll past to reach the next component.
  private readonly openedItems = signal<ReadonlySet<string>>(new Set());
  private readonly closedItems = signal<ReadonlySet<string>>(new Set());

  protected chaptersFor(item: NavItem): readonly SectionChapter[] {
    return this.chaptersService.chaptersOf(item.anchor);
  }

  protected isItemOpen(item: NavItem): boolean {
    if (this.chaptersFor(item).length === 0) {
      return false;
    }
    if (this.closedItems().has(item.anchor)) {
      return false;
    }

    return this.isActive(item.anchor) || this.openedItems().has(item.anchor);
  }

  protected toggleItem(item: NavItem): void {
    const anchor = item.anchor;
    const closing = this.isItemOpen(item);
    const opened = new Set(this.openedItems());
    const closed = new Set(this.closedItems());
    if (closing) {
      opened.delete(anchor);
      closed.add(anchor);
    } else {
      closed.delete(anchor);
      opened.add(anchor);
    }
    this.openedItems.set(opened);
    this.closedItems.set(closed);
  }

  protected isChapterActive(chapter: SectionChapter): boolean {
    return this.activeChapter() === chapter.slug;
  }

  /** Scrolls to a chapter heading the same way `onItem` scrolls to a section. */
  protected onChapter(chapter: SectionChapter): void {
    this.navigated.emit();
    const main = this.layoutScroll.scroller() as HTMLElement | null;
    if (!main) {
      return;
    }
    const topbarHeight = this.computeTopbarHeight();
    const containerTop = main.getBoundingClientRect().top;
    const targetTop = chapter.heading.getBoundingClientRect().top;
    main.scrollTo({
      top: main.scrollTop + (targetTop - containerTop) - topbarHeight,
      behavior: 'auto',
    });
    this.activeChapter.set(chapter.slug);
  }

  private observer: IntersectionObserver | null = null;
  private chapterObserver: IntersectionObserver | null = null;
  private readonly chapterHeadings = new Map<HTMLElement, string>();
  // Anchors of sections currently intersecting the spy band.
  private readonly intersecting = new Set<string>();
  private readonly anchorToSection = new Map<string, HTMLElement>();
  // Group (page) of the last real navigation. The scroll-spy rewrites only the
  // URL's anchor segment WITHIN a page, so we compare the resolved GROUP (not the
  // raw path) to skip those self-updates without re-scrolling / re-observing.
  private readonly lastGroup = signal<string | null>(null);
  // Whether the current page has >1 spy section — home/changelog have ≤1 and so
  // never sync an anchor into the URL.
  private multiSection = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });
    // Docs pages are lazy-loaded, so sections may not be in the DOM yet when the sidebar mounts. Poll for `[data-anchor]`
    // elements for ~3s before wiring the IntersectionObserver — otherwise it starts with zero targets and never updates.
    this.setupWhenSectionsExist();

    // A different group page swaps its sections: reset scroll to the target section (or top) and re-scan `[data-anchor]`.
    // Same-group anchor rewrites are skipped here to avoid observer thrash; the layout's content region is the scroll container, not window.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
        const group = this.groupPathForUrl(url);
        if (group === this.lastGroup()) {
          return;
        }
        this.lastGroup.set(group);
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
    // isn't polluted, and dsSamePage so the layout does not read a scroll-driven
    // path rewrite as a page change and reset the scroll we are describing.
    // Single-section pages (home/changelog) carry no anchor.
    effect(() => {
      const anchor = this.activeAnchor();
      if (!anchor || !this.multiSection) {
        return;
      }
      const area = this.currentArea();
      if (!area) {
        return;
      }
      const chapter = this.activeChapter();
      const target = chapter
        ? `/${area}/${anchor}#${chapter}`
        : `/${area}/${anchor}`;
      if (this.router.url.split('?')[0] === target) {
        return;
      }
      void this.router.navigateByUrl(target, {
        replaceUrl: true,
        state: { dsSamePage: true },
      });
    });

    // A second observer for chapter headings, rebuilt whenever the mounted section republishes
    // them. Separate from the section spy so neither rule has to know about the other's targets.
    effect((onCleanup) => {
      const chapters = this.chaptersService.chaptersOf(this.activeAnchor());
      this.chapterObserver?.disconnect();
      this.chapterObserver = null;
      this.chapterHeadings.clear();
      if (chapters.length === 0) {
        this.activeChapter.set('');

        return;
      }
      const main = this.layoutScroll.scroller() as HTMLElement | null;
      const topbarHeight = this.computeTopbarHeight();
      for (const chapter of chapters) {
        this.chapterHeadings.set(chapter.heading, chapter.slug);
      }
      const observer = new IntersectionObserver(
        () => this.syncActiveChapter(topbarHeight),
        {
          root: main,
          rootMargin: `-${topbarHeight}px 0px -60% 0px`,
          threshold: [0, 1],
        },
      );
      for (const chapter of chapters) {
        observer.observe(chapter.heading);
      }
      this.chapterObserver = observer;
      this.syncActiveChapter(topbarHeight);
      onCleanup(() => observer.disconnect());
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

  // A click on a section already on this page scrolls directly (deterministic, router-independent); routerLink still fires
  // but resolves to the same group so NavigationEnd no-ops. Cross-group items fall through to routerLink + NavigationEnd.
  protected onItem(anchor: string): void {
    this.navigated.emit();
    const section =
      this.anchorToSection.get(anchor) ??
      (this.document.querySelector(
        `[data-anchor="${anchor}"]`,
      ) as HTMLElement | null);
    const main = this.layoutScroll.scroller() as HTMLElement | null;
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
    const main = this.layoutScroll.scroller() as HTMLElement | null;
    main?.scrollTo({ top: 0, behavior: 'auto' });
  }

  // On initial mount, jump to the section named by the URL's anchor segment.
  private scrollToAnchorOnLoad(): void {
    const anchor = this.anchorFromUrl(this.router.url);
    this.scrollToAnchor(anchor);
    this.holdAnchorWhileContentGrows(anchor);
    // A `#chapter` fragment is finer-grained than the section, so it wins — but the chapters are
    // published after render, so wait for them rather than reading an empty list.
    const wanted = this.initialChapter;
    if (!wanted) {
      return;
    }
    afterNextRender(
      () => {
        const chapter = this.chaptersService
          .chaptersOf(this.activeAnchor())
          .find((each) => each.slug === wanted);
        if (chapter) {
          this.onChapter(chapter);
        }
      },
      { injector: this.injector },
    );
  }

  /** A section whose body is still a deferred placeholder is shorter than the section it becomes,
   *  so everything under it moves down as the bodies arrive and a deep link lands short of its
   *  anchor. Re-aims on every height change until a real gesture says the reader has taken over -
   *  never on `scrollTop` moving, which the growth itself does. */
  private holdAnchorWhileContentGrows(anchor: string): void {
    const main = this.layoutScroll.scroller() as HTMLElement | null;
    if (!anchor || !main) {
      return;
    }
    let height = main.scrollHeight;
    const stop = (): void => {
      window.clearInterval(timer);
      window.clearTimeout(deadline);
      for (const name of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
        main.removeEventListener(name, stop);
      }
    };
    const timer = window.setInterval(() => {
      if (main.scrollHeight === height) {
        return;
      }
      height = main.scrollHeight;
      this.scrollToAnchor(anchor);
    }, ANCHOR_SETTLE_INTERVAL_MS);
    const deadline = window.setTimeout(stop, ANCHOR_SETTLE_MS);
    for (const name of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
      main.addEventListener(name, stop, { passive: true });
    }
    this.destroyRef.onDestroy(stop);
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

    const main = this.layoutScroll.scroller() as HTMLElement | null;
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
    const segments = this.pathOf(url).split('/').filter(Boolean);
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
    const segments = this.pathOf(url).split('/').filter(Boolean);

    return segments.length >= 2 ? segments[1] : '';
  }

  /** The `#chapter` of `/<area>/<anchor>#<chapter>`, else ''. */
  private chapterFromUrl(url: string): string {
    return url.split('?')[0].split('#')[1] ?? '';
  }

  /** Path with the query and the fragment cut off — a chapter fragment must not be read as part
   *  of the anchor segment, or every group lookup fails the moment one is in the URL. */
  private pathOf(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private currentArea(): string {
    return this.pathOf(this.router.url).split('/').filter(Boolean)[0] ?? '';
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

  /**
   * Marks a link whose section is already on screen as same-page navigation.
   *
   * `onItem` scrolls those directly and synchronously, but the `routerLink`
   * beside it still changes the path — and `ds-app-layout` resets the scroll on
   * a path change, undoing it before the reader sees anything. Clicking the SAME
   * item again then worked, because the second navigation was to an unchanged
   * URL and triggered no reset. That is the "only opens on the second click".
   *
   * `dsSamePage` is the contract `AppLayoutNavigationService` documents for exactly
   * this: a docs URL that names the reader's position changes the path without
   * changing the page. The scroll-spy rewrite already used it; the click that
   * causes the rewrite did not.
   */
  protected linkState(groupPath: string): { dsSamePage: true } | undefined {
    return groupPath === this.lastGroup() ? { dsSamePage: true } : undefined;
  }

  /** Groups the reader has opened by hand. A group holding the active section is open regardless,
   *  so the one being read never has to be opened to be seen. */
  private readonly openedGroups = signal<ReadonlySet<string>>(new Set());

  protected isGroupOpen(group: NavGroup): boolean {
    return this.isGroupActive(group) || this.openedGroups().has(group.title);
  }

  protected toggleGroup(group: NavGroup): void {
    const next = new Set(this.openedGroups());
    if (next.has(group.title)) {
      next.delete(group.title);
    } else {
      next.add(group.title);
    }
    this.openedGroups.set(next);
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

    const main = this.layoutScroll.scroller() as HTMLElement | null;
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

    // rootMargin shrinks the top by the topbar height so a section counts as active only once it clears the topbar;
    // the -60% bottom margin requires the section to occupy the top 40% of the viewport to qualify.
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

        // Picks the topmost intersecting section (smallest non-negative top vs. the topbar line); falls back to the closest
        // section above the line if none qualify, or keeps the last active anchor if nothing intersects at all.
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

  /**
   * The chapter the reader is in: the last heading to have passed the topbar line, so a chapter
   * stays current for its whole body rather than only while its one-line heading is on screen.
   * Headings BELOW the line do not qualify — the reader has not reached them.
   */
  private syncActiveChapter(topbarHeight: number): void {
    let bestSlug = '';
    let bestTop = Number.NEGATIVE_INFINITY;
    for (const [heading, slug] of this.chapterHeadings) {
      const top = heading.getBoundingClientRect().top - topbarHeight;
      // A couple of px of slack: a click scrolls the heading TO the line, and a fractional
      // remainder there read as "not reached yet" and handed the highlight to the chapter above.
      if (top <= CHAPTER_LINE_SLACK_PX && top > bestTop) {
        bestTop = top;
        bestSlug = slug;
      }
    }
    if (bestSlug) {
      this.activeChapter.set(bestSlug);
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
