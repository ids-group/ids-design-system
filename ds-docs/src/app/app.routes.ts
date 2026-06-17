import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sections/docs.page').then((m) => m.DocsPage),
  },
  { path: '**', redirectTo: '' },
];
