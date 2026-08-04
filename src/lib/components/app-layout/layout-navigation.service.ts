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
    map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
    distinctUntilChanged(),
  );
}
