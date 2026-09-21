import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, type Observable } from 'rxjs';

/**
 * Emits the new path whenever navigation lands on a DIFFERENT one. A query- or
 * fragment-only navigation is a search, sort or page step on the same screen, and
 * everything that reacts to "went somewhere else" must agree on that — the scroll
 * reset, the responsive rail, and now your own code — so they read one source
 * instead of each deciding for itself.
 *
 * PUBLIC since 0.8.x, because consumers were re-deriving it and disagreeing: one
 * consumer had three separate answers to "did the path change?" — route snapshots
 * in a view-transition skip, this stream inside the layout, and a `split('?')`
 * in a tab helper that ignored the fragment this one strips. Inject it and read
 * `pathChanged` rather than writing a fourth:
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
 * A PATH change is not always a page change. An app whose URL mirrors the
 * reader's position — a docs layout rewriting `/area/section` from a scroll spy,
 * a wizard that names its step — changes the path while staying on the screen,
 * and resetting the scroll there fights the user: the reset moves the scroll,
 * the spy rewrites the path again, and the page ping-pongs. Such a navigation
 * must carry `state: { dsSamePage: true }`, which is skipped here.
 *
 * Root-provided, which is also what makes it safe to expose: the stream is
 * derived from the router and holds no state, so one instance serves every
 * reader. `AppLayoutScrollService` depends on it, so a consumer providing THAT
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
