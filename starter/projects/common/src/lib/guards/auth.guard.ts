import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Auth is resolved before first render via provideAppInitializer, so
  // isLoading should be false here. If still loading, deny defensively.
  if (authStore.isLoading()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
