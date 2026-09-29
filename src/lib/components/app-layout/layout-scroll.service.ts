import {
  DestroyRef,
  Injectable,
  type Signal,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppLayoutNavigationService } from './layout-navigation.service';

const STORAGE_KEY = 'ds-app-layout:scroll';

const MAX_ENTRIES = 20;

// Input events only. NOT `scroll`: our own restore writes emit one, so listening
// for it would cancel the restore we are performing.
const CANCEL_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

const pathOf = (url: string): string => url.split(/[?#]/)[0];

/**
 * When the layout resets the content scroll to the top.
 *
 * `'path'` (default): only when navigation lands on a
 * different PATH, so a search, a sort or a page step on the same screen keeps
 * the reader's place. `'always'` resets on every navigation, which is what a
 * server-paged list usually wants.
 * `'never'` hands the decision back to the screen, which can still call
 * `AppLayoutScrollService.scrollToTop()` itself.
 */
export type DsAppLayoutScrollReset = 'path' | 'never' | 'always';

/**
 * Owns the layout's content scroller. In the fixed-frame layout the window never
 * scrolls, so the router's built-in window-based scrolling no-ops; this service
 * resets the registered container to the top when navigation lands on a different
 * PATH instead. Provided by `ds-app-layout`, so routed pages can
 * `inject(AppLayoutScrollService)` and call `scrollToTop()` manually (e.g. list pages
 * that DO want the top after a filter change).
 *
 * With `restoreScroll` on the layout it also restores the reader's place. Only
 * when armed: going BACK to a list returns to where the reader was, following a
 * link into a new screen does not.
 */
@Injectable()
export class AppLayoutScrollService {
  private readonly navigation = inject(AppLayoutNavigationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = signal<Element | null>(null);

  /**
   * The content scroller, once the layout has rendered it. Exposed so a host that
   * must measure or drive the scroll itself (a scroll-spy, a virtualizer) can
   * read it instead of querying the layout's internal markup.
   */
  readonly scroller: Signal<Element | null> = this.container.asReadonly();

  // null = restoration off.
  private restoreTimeoutMs: number | null = null;
  private resetStrategy: DsAppLayoutScrollReset = 'path';
  private armed = false;
  private pendingOffset: number | null = null;
  private endRestore: (() => void) | null = null;
  private firstNavigation = true;

  constructor() {
    this.navigation.pathChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      // Skipped while a restore is armed for this very navigation: the reset would
      // undo the offset we are about to apply.
      .subscribe(() => {
        if (this.resetStrategy === 'path' && !this.armed) {
          this.scrollToTop();
        }
      });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.onNavigationStart(event));

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.onNavigationEnd());

    this.destroyRef.onDestroy(() => this.finishRestore());
  }

  /**
   * Wiring, called by `ds-app-layout` once its content region exists. Not for
   * consumers: calling it points the service at the wrong element.
   */
  setScrollContainer(element: Element): void {
    this.container.set(element);
  }

  /** Wiring: `ds-app-layout` mirrors its `restoreScroll` inputs through here. */
  configureRestore(timeoutMs: number | null): void {
    this.restoreTimeoutMs = timeoutMs;
  }

  /** Wiring: `ds-app-layout` mirrors its `scrollReset` input through here. */
  configureReset(strategy: DsAppLayoutScrollReset): void {
    this.resetStrategy = strategy;
  }

  scrollToTop(): void {
    this.scrollTo(0);
  }

  /**
   * Scroll the content region to an absolute offset. Assigns `scrollTop` rather
   * than calling `scrollTo`, so a themed `scroll-behavior: smooth` cannot turn a
   * positioning jump into an animation.
   */
  scrollTo(top: number): void {
    const element = this.container();
    if (element) {
      element.scrollTop = top;
    }
  }

  /**
   * Take the offset this navigation is going to restore, and cancel the restore.
   *
   * For a host that renders its own scroll position: a virtualizer needs the
   * offset BEFORE it builds rows, so assigning `scrollTop` afterwards would scroll
   * a list that does not exist yet. Returns null when nothing is pending (any
   * navigation that is not a back).
   */
  consumePendingOffset(): number | null {
    const offset = this.pendingOffset;
    if (offset === null) {
      return null;
    }
    this.finishRestore();

    return offset;
  }

  /**
   * Optional accelerator: tell the layout the content for this route is in the
   * DOM. Without it the restore still lands (it waits for the container to grow
   * and clamps at the deadline), but a host that knows when its data arrived can
   * end the wait early.
   */
  contentReady(): void {
    if (this.pendingOffset !== null) {
      this.applyClamped(this.pendingOffset);
      this.finishRestore();
    }
  }

  private onNavigationStart(event: NavigationStart): void {
    const wasFirst = this.firstNavigation;
    this.firstNavigation = false;
    if (this.restoreTimeoutMs === null) {
      return;
    }
    // Save the position we are leaving while the old content is still mounted.
    this.remember(pathOf(this.router.url), this.container()?.scrollTop ?? 0);

    // Armed by a popstate traversal (back, forward, side button, Alt+left, edge swipe),
    // by a host that pushes and says so, or by the first navigation after a reload.
    const explicit =
      this.router.currentNavigation()?.extras.state?.['dsRestoreScroll'] ===
      true;
    const offset = this.recall(pathOf(event.url));
    this.armed =
      offset !== null &&
      (event.navigationTrigger === 'popstate' || explicit || wasFirst);
    this.pendingOffset = this.armed ? offset : null;
  }

  private onNavigationEnd(): void {
    // 'always' also resets on the query/fragment-only navigations `pathChanged`
    // ignores; `armed` guards it so a pending restore is not undone first.
    if (this.resetStrategy === 'always' && !this.armed) {
      this.scrollToTop();
    }
    if (!this.armed || this.pendingOffset === null) {
      this.armed = false;

      return;
    }
    this.armed = false;
    this.beginRestore(this.pendingOffset);
  }

  private beginRestore(target: number): void {
    this.finishRestore(/* keepPending */ true);
    const element = this.container();
    if (!element) {
      this.pendingOffset = null;

      return;
    }

    const deadline = window.setTimeout(() => {
      // Land as close as the content allows rather than not at all.
      this.applyClamped(target);
      this.finishRestore();
    }, this.restoreTimeoutMs ?? 0);

    const settle = (): void => {
      if (element.scrollHeight - element.clientHeight >= target) {
        this.scrollTo(target);
        this.finishRestore();
      }
    };

    // Observe the child: the container's own box does not change as content arrives.
    // A frame count would differ between engines.
    const growth = new ResizeObserver(settle);
    growth.observe(element.firstElementChild ?? element);

    const cancel = (): void => this.finishRestore();
    for (const type of CANCEL_EVENTS) {
      element.addEventListener(type, cancel, { passive: true });
    }
    // A bfcache restore brings its own scroll position back; fighting it would
    // move the page under a reader who never asked.
    const onPageShow = (event: PageTransitionEvent): void => {
      if (event.persisted) {
        this.finishRestore();
      }
    };
    window.addEventListener('pageshow', onPageShow);

    this.endRestore = () => {
      growth.disconnect();
      clearTimeout(deadline);
      for (const type of CANCEL_EVENTS) {
        element.removeEventListener(type, cancel);
      }
      window.removeEventListener('pageshow', onPageShow);
    };

    // A cached list may already be tall enough.
    settle();
  }

  private applyClamped(target: number): void {
    const element = this.container();
    if (!element) {
      return;
    }
    this.scrollTo(
      Math.min(target, element.scrollHeight - element.clientHeight),
    );
  }

  private finishRestore(keepPending = false): void {
    this.endRestore?.();
    this.endRestore = null;
    if (!keepPending) {
      this.pendingOffset = null;
    }
  }

  // sessionStorage, not local: a position is worthless once the tab outlives the visit.
  // Guarded because Safari private mode throws on write and quota errors must not break navigation.
  private read(): Record<string, number> {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);

      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  }

  private remember(path: string, offset: number): void {
    const entries = this.read();
    // Re-insert so the key moves to the end: insertion order makes the oldest droppable below.
    delete entries[path];
    entries[path] = Math.round(offset);
    const keys = Object.keys(entries);
    for (const stale of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) {
      delete entries[stale];
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Full or blocked: losing the position is acceptable.
    }
  }

  private recall(path: string): number | null {
    const offset = this.read()[path];

    return typeof offset === 'number' && offset > 0 ? offset : null;
  }
}
