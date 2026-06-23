import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from '@app/common';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard',
        data: { breadcrumb: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'items',
        data: { breadcrumb: 'Items' },
        loadChildren: () =>
          import('./features/items/items.routes').then((m) => m.itemsRoutes),
      },
      {
        path: 'admin',
        title: 'Admin',
        data: { breadcrumb: 'Admin' },
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.page').then((m) => m.AdminPage),
      },
      {
        path: 'not-found',
        title: 'Not found',
        loadComponent: () =>
          import('./features/not-found/not-found.page').then(
            (m) => m.NotFoundPage,
          ),
      },
      // Unknown path under the authed shell → 404 (unauthenticated users are
      // bounced to /auth/login by authGuard before reaching here).
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found.page').then(
            (m) => m.NotFoundPage,
          ),
      },
    ],
  },
];
