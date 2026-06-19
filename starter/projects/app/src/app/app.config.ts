import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  BASE_URL,
  ENVIRONMENT_NAME,
  ErrorReporter,
  GlobalErrorHandler,
  NoopErrorReporter,
  NotificationService,
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
  ],
};
