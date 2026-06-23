import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    title: 'Sign In',
    loadComponent: () =>
      import('./pages/login/login.page').then(({ LoginPage }) => LoginPage),
  },
];
