import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { NotificationService } from '../notifications/notification.service';

/** Builds a CanActivateFn that allows access only when `checkFn` passes. */
export function roleGuard(
  checkFn: (store: InstanceType<typeof AuthStore>) => boolean,
): CanActivateFn {
  return async () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (checkFn(authStore)) {
      return true;
    }

    const notifications = inject(NotificationService);
    notifications.error('You do not have permission to access this area.');

    await firstValueFrom(authStore.logout());

    return router.createUrlTree(['/auth/login']);
  };
}

export const adminGuard: CanActivateFn = roleGuard((store) => store.isAdmin());
