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

// NOT `scroll`: our own restore emits one and would cancel itself.
const CANCEL_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

const pathOf = (url: string): string => url.split(/[?#]/)[0];

/**
 * When the layout resets the content scroll to the top.
 *
 * `'path'` (default): only when navigation lands on a different PATH.
 * `'always'` resets on every navigation. `'never'` leaves it to the screen,
 * which can call `AppLayoutScrollService.scrollToTop()`.
 */
export type DsAppLayoutScrollReset = 'path' | 'never' | 'always';

/**
 * Owns the layout's content scroller. The window never scrolls in the
 * fixed-frame layout, so the router's window-based scrolling no-ops; this
 * service resets the registered container when navigation lands on a different
 * PATH. Provided by `ds-app-layout`; routed pages can inject it and call
 * `scrollToTop()`.
 *
 * With `restoreScroll` on the layout it also restores the reader's place, but
 * only when armed: going BACK restores, following a link does not.
 */
@Injectable()
export class AppLayoutScrollService {
  private readonly navigation = inject(AppLayoutNavigationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = signal<Element | null>(null);

  /** The content scroller, once the layout has rendered it. */
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
      // Skipped while a restore is armed: the reset would undo the offset about to be applied.
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

  /** Wiring for `ds-app-layout`; not for consumers. */
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

  /** Scrolls the content region to an absolute offset. Assigns `scrollTop`, so `scroll-behavior: smooth` cannot animate it. */
  scrollTo(top: number): void {
    const element = this.container();
    if (element) {
      element.scrollTop = top;
    }
  }

  /**
   * Takes the offset this navigation is going to restore, and cancels the restore.
   * For a host that must know the offset BEFORE it builds rows (a virtualizer).
   * Returns null when nothing is pending.
   */
  consumePendingOffset(): number | null {
    const offset = this.pendingOffset;
    if (offset === null) {
      return null;
    }
    this.finishRestore();

    return offset;
  }

  /** Optional: tells the layout the route's content is in the DOM, ending the restore wait early. */
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
    this.remember(pathOf(this.router.url), this.container()?.scrollTop ?? 0);

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
    // `pathChanged` ignores query/fragment-only navigations, which 'always' still resets.
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
    const growth = new ResizeObserver(settle);
    growth.observe(element.firstElementChild ?? element);

    const cancel = (): void => this.finishRestore();
    for (const type of CANCEL_EVENTS) {
      element.addEventListener(type, cancel, { passive: true });
    }
    // A bfcache restore brings its own scroll position back.
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

  // Guarded: Safari private mode throws on write, and that must not break navigation.
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
    // Re-insert so the key moves to the end and the oldest is dropped below.
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
