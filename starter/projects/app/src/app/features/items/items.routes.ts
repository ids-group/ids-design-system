import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '@app/common';
import { ItemActionsService } from './services/item-actions.service';

export const itemsRoutes: Routes = [
  {
    path: '',
    providers: [ItemActionsService],
    children: [
      {
        path: '',
        title: 'Items',
        loadComponent: () =>
          import('./pages/item-list/item-list.page').then(
            (m) => m.ItemListPage,
          ),
      },
      {
        path: 'new',
        title: 'New Item',
        data: { breadcrumb: 'New' },
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./pages/item-form/item-form.page').then(
            (m) => m.ItemFormPage,
          ),
      },
      {
        path: ':id/edit',
        title: 'Edit Item',
        data: { breadcrumb: 'Edit' },
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./pages/item-form/item-form.page').then(
            (m) => m.ItemFormPage,
          ),
      },
    ],
  },
];
