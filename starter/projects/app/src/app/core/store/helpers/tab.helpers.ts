import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

export const TAB_QUERY_KEY = 'tab';

/** Parses the `tab` query param to a valid tab value, or the default. */
export function parseTabFromQueryParams<T extends string>(
  queryParams: Record<string, string>,
  tabsObject: Record<string, T>,
  defaultTab: T,
): T {
  const tab = queryParams[TAB_QUERY_KEY];
  const validTabs = Object.values(tabsObject) as string[];

  return validTabs.includes(tab) ? (tab as T) : defaultTab;
}

/**
 * Resets the active tab to default when navigating away from the feature (or
 * returning without a `tab` param). Call inside an injection context
 * (e.g. `withHooks.onInit`).
 */
export function setupTabResetOnNavigation(
  resetTab: () => void,
  routePrefix: string,
): void {
  const router = inject(Router);
  const destroyRef = inject(DestroyRef);

  router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
    if (event instanceof NavigationEnd) {
      const url = event.urlAfterRedirects;
      const path = url.split('?')[0];

      if (
        !path.startsWith(routePrefix) ||
        (path === routePrefix && !url.includes('tab='))
      ) {
        resetTab();
      }
    }
  });
}
