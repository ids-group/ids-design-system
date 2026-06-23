import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
}

/**
 * Builds the breadcrumb trail from each route's `data.breadcrumb` (set in the
 * route config), recomputed on every navigation. Exposed as a signal for the shell.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);

  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        this.breadcrumbs.set(this.build(this.router.routerState.snapshot.root)),
      );
  }

  private build(root: ActivatedRouteSnapshot): Breadcrumb[] {
    const crumbs: Breadcrumb[] = [];
    let node: ActivatedRouteSnapshot | null = root;

    while (node) {
      const label = node.data['breadcrumb'];
      if (typeof label === 'string') {
        crumbs.push({ label });
      }
      node = node.firstChild;
    }

    return crumbs;
  }
}
