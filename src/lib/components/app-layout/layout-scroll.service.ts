import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutNavigationService } from './layout-navigation.service';

/**
 * Owns the layout's content scroller. In the fixed-frame layout the window
 * never scrolls, so the router's built-in window-based scrolling no-ops —
 * this service resets the registered container to the top when navigation
 * lands on a different PATH instead. Provided by `ds-app-layout`, so routed
 * pages can `inject(LayoutScrollService)` and call `scrollToTop()` manually
 * (e.g. list pages that DO want the top after a filter change). Per-route
 * scroll restoration is a documented growth point — add it here if a page
 * ever needs back-navigation scroll memory.
 */
@Injectable()
export class LayoutScrollService {
  private readonly navigation = inject(LayoutNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = signal<Element | null>(null);

  /**
   * The content scroller, once the layout has rendered it. Exposed so a host that
   * must measure or drive the scroll itself — a scroll-spy, a virtualizer — can
   * ask the layout for it instead of guessing the layout's internal markup with
   * `document.querySelector`.
   */
  readonly scroller = this.container.asReadonly();

  constructor() {
    this.navigation.pathChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scrollToTop());
  }

  setScrollContainer(element: Element): void {
    this.container.set(element);
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
}
