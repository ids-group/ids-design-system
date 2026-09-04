import { NgComponentOutlet } from '@angular/common';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutScrollService } from 'ds/app-layout';
import { GROUP_PAGES } from '../group-pages';
import { groupForAnchor, urlForGroupPath } from '../core/nav.config';

@Component({
  selector: 'page-section-group',
  standalone: true,
  imports: [NgComponentOutlet, RouterLink],
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./section-group.page.scss'],
  template: `
    @let group = def();

    @if (group) {
      @if (group.title) {
        <h1 class="group-title t-h2">
          {{ group.title }}
        </h1>
      }

      @for (section of group.sections; track section) {
        <div class="section-slot">
          <ng-container [ngComponentOutlet]="section" />
        </div>
      }

      @if (nextLink(); as link) {
        <a class="next-group" [routerLink]="link">
          <span class="next-group-label">
            Next
          </span>

          <span class="next-group-title">
            {{ nextGroup()?.title }} →
          </span>
        </a>
      }
    }
  `,
})
export class SectionGroupPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {
    requireSync: true,
  });
  private readonly data = toSignal(this.route.data, { requireSync: true });

  // URLs are flat `/<area>/<anchor>` — resolve the owning group from the params,
  // falling back to the fixed `data.path` for anchorless pages (home, changelog).
  protected readonly def = computed(() => {
    const params = this.params();
    const area = params?.get('area');
    const anchor = params?.get('anchor');
    let path: string | undefined;
    if (area && anchor) {
      path = groupForAnchor(area, anchor)?.path;
    } else {
      path = this.data()?.['path'] as string | undefined;
    }

    return GROUP_PAGES.find((group) => group.path === path) ?? null;
  });

  private readonly layoutScroll = inject(LayoutScrollService);
  // Whether the app had already navigated when this instance was built. On the
  // very first navigation focus is already where the reader expects it, and
  // moving it there would be startling; on a later one that rebuilt this
  // component (a route with a different definition) it must still move.
  private readonly resumed = !!this.router.lastSuccessfulNavigation();

  constructor() {
    // `:area/:anchor` matches any pair, so a mistyped or renamed anchor under a
    // real area (/foundations/app-layout) is a route hit with nothing to render —
    // the `**` fallback never sees it. Send those home instead of a blank page.
    effect(() => {
      if (!this.def()) {
        void this.router.navigateByUrl('/', { replaceUrl: true });
      }
    });

    // Angular leaves focus on BODY after a route change, so a keyboard user's
    // next Tab restarts from the top of the document instead of the page they
    // just navigated to. Moving focus is the APP's call — a layout that stole it
    // on every navigation would be wrong — so the layout only makes its `<main>`
    // focusable and this does the moving. `preventScroll` because the layout's
    // scroll service owns the position, including a restored one.
    let first = !this.resumed;
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (first) {
          first = false;

          return;
        }
        const main = this.layoutScroll.scroller();
        if (main instanceof HTMLElement) {
          main.focus({ preventScroll: true });
        }
      });
  }

  protected readonly nextGroup = computed(() => {
    const current = this.def();
    if (!current) {
      return null;
    }
    const index = GROUP_PAGES.findIndex((group) => group.path === current.path);
    if (index === -1 || index === GROUP_PAGES.length - 1) {
      return null;
    }

    return GROUP_PAGES[index + 1];
  });

  protected readonly nextLink = computed(() => {
    const next = this.nextGroup();

    return next ? urlForGroupPath(next.path) : null;
  });
}
