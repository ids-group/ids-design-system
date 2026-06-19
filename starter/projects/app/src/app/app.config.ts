import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  AuthProvider,
  AuthStore,
  BASE_URL,
  ConfirmService,
  ENVIRONMENT_NAME,
  ErrorReporter,
  GlobalErrorHandler,
  MockAuthProvider,
  NoopErrorReporter,
  NotificationService,
  WindowConfirmService,
} from '@app/common';
import { environment } from '@app/common/config';

import { routes } from './app.routes';
import { ToastNotificationService } from './core/notifications/toast-notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: BASE_URL, useValue: environment.baseUrl },
    { provide: ENVIRONMENT_NAME, useValue: environment.name },
    { provide: NotificationService, useClass: ToastNotificationService },
    // Swap NoopErrorReporter for your own ErrorReporter if you add crash reporting.
    { provide: ErrorReporter, useClass: NoopErrorReporter },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Auth: MockAuthProvider runs with no backend — swap for HttpAuthProvider.
    { provide: AuthProvider, useClass: MockAuthProvider },
    { provide: ConfirmService, useClass: WindowConfirmService },
    // Resolve auth state before first render.
    provideAppInitializer(() => inject(AuthStore).initialize()),
  ],
};
