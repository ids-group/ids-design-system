import { DestroyRef, Injectable, inject } from '@angular/core';
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
  private scrollContainer: Element | null = null;

  constructor() {
    this.navigation.pathChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scrollToTop());
  }

  setScrollContainer(element: Element): void {
    this.scrollContainer = element;
  }

  scrollToTop(): void {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTop = 0;
    }
  }
}
