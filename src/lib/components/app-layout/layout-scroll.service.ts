import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Owns the layout's content scroller. In the fixed-frame layout the window
 * never scrolls, so the router's built-in window-based scrolling no-ops —
 * this service resets the registered container to the top after every
 * navigation instead. Provided by `ds-app-layout`, so routed pages can
 * `inject(LayoutScrollService)` and call `scrollToTop()` manually (e.g. list
 * pages resetting scroll on filter changes). Per-route scroll restoration is
 * a documented growth point — add it here if a page ever needs
 * back-navigation scroll memory.
 */
@Injectable()
export class LayoutScrollService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private scrollContainer: Element | null = null;

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.scrollToTop();
        }
      });
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
