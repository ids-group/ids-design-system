import { NgComponentOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GROUP_PAGES } from '../group-pages';
import { groupForAnchor, urlForGroupPath } from '../layout/nav.config';

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
        <a
          class="next-group"
          [routerLink]="link"
        >
          <span class="next-group__label">
            Next
          </span>

          <span class="next-group__title">
            {{ nextGroup()?.title }} →
          </span>
        </a>
      }
    }
  `,
})
export class SectionGroupPage {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
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
