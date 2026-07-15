import { NgComponentOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GROUP_PAGES } from '../group-pages';

@Component({
  selector: 'page-section-group',
  standalone: true,
  imports: [NgComponentOutlet],
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
    }
  `,
})
export class SectionGroupPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly def = computed(() => {
    const path = this.route.snapshot.data['path'] as string | undefined;
    return GROUP_PAGES.find((group) => group.path === path) ?? null;
  });
}
