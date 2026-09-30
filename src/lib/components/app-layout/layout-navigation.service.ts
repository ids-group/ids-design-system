import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, type Observable } from 'rxjs';

/**
 * Emits the new path whenever navigation lands on a DIFFERENT one; query- or
 * fragment-only navigations are ignored. Read `pathChanged` instead of
 * re-deriving the path change:
 *
 * ```ts
 * private readonly navigation = inject(AppLayoutNavigationService);
 * constructor() {
 *   this.navigation.pathChanged
 *     .pipe(takeUntilDestroyed())
 *     .subscribe((path) => …);
 * }
 * ```
 *
 * A navigation that changes the path while staying on the same screen (a scroll
 * spy rewriting the URL, a wizard step) must carry `state: { dsSamePage: true }`,
 * which is skipped here; otherwise the scroll reset and the spy ping-pong.
 *
 * `AppLayoutScrollService` depends on it, so a consumer providing THAT
 * outside `ds-app-layout` needs this one resolvable too.
 */
@Injectable({ providedIn: 'root' })
export class AppLayoutNavigationService {
  private readonly router = inject(Router);

  readonly pathChanged: Observable<string> = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    filter(() => !this.samePage()),
    map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
    distinctUntilChanged(),
  );

  // `lastSuccessfulNavigation`, not `getCurrentNavigation()`: the latter is
  // already cleared by the time NavigationEnd reaches a subscriber.
  private samePage(): boolean {
    const state = this.router.lastSuccessfulNavigation()?.extras.state;

    return state?.['dsSamePage'] === true;
  }
}
