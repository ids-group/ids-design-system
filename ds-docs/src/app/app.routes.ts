import type { Routes } from '@angular/router';
import { GROUP_PAGES } from './group-pages';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  ...GROUP_PAGES.map((group) => ({
    path: group.path,
    loadComponent: () =>
      import('./sections/section-group.page').then((m) => m.SectionGroupPage),
    data: { path: group.path },
  })),
  { path: '**', redirectTo: 'home' },
];
