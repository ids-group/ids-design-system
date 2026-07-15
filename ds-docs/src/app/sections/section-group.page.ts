import { NgComponentOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GROUP_PAGES } from '../group-pages';

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
        <h1 class="group-title t-h2">{{ group.title }}</h1>
      }
      @for (section of group.sections; track section) {
        <div class="section-slot">
          <ng-container [ngComponentOutlet]="section" />
        </div>
      }

      @if (nextGroup(); as next) {
        <a
          class="next-group"
          [routerLink]="'/' + next.path"
        >
          <span class="next-group__label">Next</span>
          <span class="next-group__title">{{ next.title }} →</span>
        </a>
      }
    }
  `,
})
export class SectionGroupPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly def = computed(() => {
    const path = this.route.snapshot.data['path'] as string | undefined;
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
}
