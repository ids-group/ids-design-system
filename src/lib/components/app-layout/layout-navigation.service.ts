import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, type Observable } from 'rxjs';

/**
 * Emits the new path whenever navigation lands on a DIFFERENT one. Internal to
 * `ds-app-layout`: a query- or fragment-only navigation is a search, sort or
 * page step on the same screen, and both the scroll reset and the responsive
 * rail must agree on that — so they read one source instead of each deciding
 * for itself what "went somewhere else" means.
 *
 * A PATH change is not always a page change. An app whose URL mirrors the
 * reader's position — a docs shell rewriting `/area/section` from a scroll spy,
 * a wizard that names its step — changes the path while staying on the screen,
 * and resetting the scroll there fights the user: the reset moves the scroll,
 * the spy rewrites the path again, and the page ping-pongs. Such a navigation
 * must carry `state: { dsSamePage: true }`, which is skipped here.
 *
 * Root-provided although it is internal: the PUBLIC `LayoutScrollService` now
 * depends on it, and that service must be provided by whoever uses it. A
 * consumer who provides it outside `ds-app-layout` cannot provide this one too
 * — it is not exported — so anything but root would hand them a
 * `NullInjectorError`. Safe as a singleton: the stream is derived from the
 * router and holds no state.
 */
@Injectable({ providedIn: 'root' })
export class LayoutNavigationService {
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
