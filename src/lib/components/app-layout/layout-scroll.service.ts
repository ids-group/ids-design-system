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
import { LayoutNavigationService } from './layout-navigation.service';

const STORAGE_KEY = 'ds-app-layout:scroll';

// Enough for a reader's back-stack without letting one tab's history grow unbounded.
const MAX_ENTRIES = 20;

// Input events only. NOT `scroll`: our own restore writes emit one, so listening
// for it would cancel the restore we are performing.
const CANCEL_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

const pathOf = (url: string): string => url.split(/[?#]/)[0];

/**
 * When the layout resets the content scroll to the top.
 *
 * `'path'` (default) is today's behaviour: only when navigation lands on a
 * different PATH, so a search, a sort or a page step on the same screen keeps
 * the reader's place. `'always'` resets on every navigation, which is what a
 * server-paged list usually wants — a new page should start at the top.
 * `'never'` hands the decision back to the screen, which can still call
 * `LayoutScrollService.scrollToTop()` itself.
 */
export type DsScrollReset = 'path' | 'never' | 'always';

/**
 * Owns the layout's content scroller. In the fixed-frame layout the window never
 * scrolls, so the router's built-in window-based scrolling no-ops — this service
 * resets the registered container to the top when navigation lands on a different
 * PATH instead. Provided by `ds-app-layout`, so routed pages can
 * `inject(LayoutScrollService)` and call `scrollToTop()` manually (e.g. list pages
 * that DO want the top after a filter change).
 *
 * With `restoreScroll` on the layout it also restores the reader's place. Only
 * when ARMED, which is the whole design: going BACK to a list should return to
 * where the reader was, while following a link into a new screen should not.
 */
@Injectable()
export class LayoutScrollService {
  private readonly navigation = inject(LayoutNavigationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = signal<Element | null>(null);

  /**
   * The content scroller, once the layout has rendered it. Exposed so a host that
   * must measure or drive the scroll itself — a scroll-spy, a virtualizer — can
   * ask the layout for it instead of guessing the layout's internal markup with
   * `document.querySelector`.
   */
  readonly scroller: Signal<Element | null> = this.container.asReadonly();

  // null = restoration off, which is the default.
  private restoreTimeoutMs: number | null = null;
  private resetStrategy: DsScrollReset = 'path';
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
   * Wiring, called by `ds-app-layout` once its content region exists. Public only
   * because the component and the service sit in different files - a consumer has
   * no reason to call it, and calling it points the service at the wrong element.
   */
  setScrollContainer(element: Element): void {
    this.container.set(element);
  }

  /** Wiring: `ds-app-layout` mirrors its `restoreScroll` inputs through here. */
  configureRestore(timeoutMs: number | null): void {
    this.restoreTimeoutMs = timeoutMs;
  }

  /** Wiring: `ds-app-layout` mirrors its `scrollReset` input through here. */
  configureReset(strategy: DsScrollReset): void {
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
   * For a host that renders its own scroll position — a virtualizer needs the
   * offset BEFORE it decides which rows to build, so letting the service assign
   * `scrollTop` afterwards would scroll a list that has not been built yet.
   * Returns null when nothing is pending, which is every navigation that is not a
   * back.
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
   * DOM. Without it the restore still lands — it waits for the container to grow
   * and clamps at the deadline — but a host that knows when its data arrived can
   * end the wait early instead of paying the growth watch.
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
    // Save where we are LEAVING from, while the old content is still mounted.
    this.remember(pathOf(this.router.url), this.container()?.scrollTop ?? 0);

    // Armed by a history traversal (back, forward, the mouse side button, Alt+←,
    // an edge swipe — all arrive as popstate), by a host that pushes instead of
    // traversing and says so, or by the first navigation of a reload, where the
    // reader expects the page they left.
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
    // 'always' resets on navigations `pathChanged` deliberately ignores — a query
    // or fragment step on the same screen. Guarded by `armed` for the same reason
    // the path reset is: a restore about to run must not be undone first.
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
      // Out of patience: land as close as the content allows rather than not at
      // all. A list that loaded 8 of 40 rows still returns near the reader's row.
      this.applyClamped(target);
      this.finishRestore();
    }, this.restoreTimeoutMs ?? 0);

    const settle = (): void => {
      if (element.scrollHeight - element.clientHeight >= target) {
        this.scrollTo(target);
        this.finishRestore();
      }
    };

    // The CONTAINER's own box does not change as content arrives — its child's
    // does, which is what makes scrollHeight grow. No fixed frame count: native
    // timing differs between engines, so watch for the growth instead of guessing
    // how many frames it takes.
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

    // The content may already be tall enough — a cached list renders synchronously.
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

  // sessionStorage, not local: a remembered scroll position is worthless in a
  // tab that outlives the visit. Every access is guarded — Safari's private mode
  // throws on write, and a quota error must not take the navigation down with it.
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
    // Re-insert so the key moves to the end: JSON object order is insertion
    // order, which is what makes the oldest entry droppable below.
    delete entries[path];
    entries[path] = Math.round(offset);
    const keys = Object.keys(entries);
    for (const stale of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) {
      delete entries[stale];
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Full or blocked: a lost scroll position is not worth an error.
    }
  }

  private recall(path: string): number | null {
    const offset = this.read()[path];

    return typeof offset === 'number' && offset > 0 ? offset : null;
  }
}
