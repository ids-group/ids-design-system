import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withPreloading,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { devInterceptors } from '@app/common/dev';
import {
  AppTitleStrategy,
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
  createViewTransitionSkip,
  initTransitionToggle,
} from '@app/common';
import { environment } from '@app/common/config';

import { routes } from './app.routes';
import { ToastNotificationService } from './core/notifications/toast-notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        onViewTransitionCreated: createViewTransitionSkip(routes),
      }),
      withPreloading(PreloadAllModules),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withNavigationErrorHandler((error) => {
        inject(ErrorHandler).handleError(error.error);
      }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(withInterceptors([...devInterceptors])),
    { provide: BASE_URL, useValue: environment.baseUrl },
    { provide: ENVIRONMENT_NAME, useValue: environment.name },
    { provide: NotificationService, useClass: ToastNotificationService },
    // Swap NoopErrorReporter for your own ErrorReporter if you add crash reporting.
    { provide: ErrorReporter, useClass: NoopErrorReporter },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Auth: MockAuthProvider runs with no backend — swap for HttpAuthProvider.
    { provide: AuthProvider, useClass: MockAuthProvider },
    { provide: ConfirmService, useClass: WindowConfirmService },
    // Resolve auth state before first render, then wire transition-flash guard.
    provideAppInitializer(() => inject(AuthStore).initialize()),
    provideAppInitializer(() => initTransitionToggle()),
  ],
};
