import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  EMPTY,
  Observable,
  retry,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { NotificationService } from '../notifications/notification.service';
import { ErrorReporter } from '../errors/error-reporter';
import { ENVIRONMENT_NAME } from '../tokens/environment.tokens';
import { MANUAL_ERROR_HANDLING } from '../tokens/http-error-handling.token';
import { HTTP_RETRY_COUNT } from '../tokens/http-retry.token';
import {
  addAuthorizationHeader,
  getPathname,
  matchesApiPath,
  matchesAny,
} from '../utils/http.utils';
import {
  NO_REFRESH_PATHS,
  REFRESH_TOKEN_PATH,
  SILENT_PATHS,
} from '../constants/api-paths.constants';

// Statuses we consider "expected" — these are not reported to the ErrorReporter.
const EXPECTED_HTTP_STATUSES = new Set([400, 401, 403, 404, 422]);

function handleHttpError(
  reporter: ErrorReporter,
  notifications: NotificationService,
  envName: string,
  error: HttpErrorResponse,
  isSilentPath: boolean,
  isManualHandling: boolean,
): Observable<never> {
  if (!isSilentPath && !isManualHandling) {
    const failure = error.error?.failure;

    if (error.status === 0) {
      notifications.error(
        'Unable to connect to the server. Please check your connection.',
        'Connection Error',
      );
    } else if (error.status === 403) {
      notifications.error(failure, 'Access Denied');
    } else if (error.status >= 400) {
      notifications.error(failure);
    }
  }

  if (!EXPECTED_HTTP_STATUSES.has(error.status)) {
    reporter.report(error);
  }

  if (envName === 'development' || envName === 'test') {
    console.error('[HTTP Error]', error);
  }

  return isManualHandling ? throwError(() => error) : EMPTY;
}

/**
 * Maps HTTP failures to user-facing notifications, performs a single 401-refresh
 * + retry via AuthStore, applies opt-in retries (HTTP_RETRY_COUNT), and respects
 * the MANUAL_ERROR_HANDLING opt-out. No raw HttpErrorResponse escapes.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const notifications = inject(NotificationService);
  const reporter = inject(ErrorReporter);
  const envName = inject(ENVIRONMENT_NAME);
  const retryCount = request.context.get(HTTP_RETRY_COUNT);
  const isManualHandling = request.context.get(MANUAL_ERROR_HANDLING);

  let source$ = next(request);

  if (retryCount > 0) {
    source$ = source$.pipe(
      retry({
        count: retryCount,
        delay: (_error, attempt) => timer(1000 * attempt),
      }),
    );
  }

  return source$.pipe(
    catchError((error: HttpErrorResponse) => {
      const pathname = getPathname(request.url);
      const isRefreshPath = matchesApiPath(pathname, REFRESH_TOKEN_PATH);
      const isNoRefreshPath = matchesAny(pathname, NO_REFRESH_PATHS);
      const isSilentPath = matchesAny(pathname, SILENT_PATHS);

      if (error.status === 401 && !isRefreshPath && !isNoRefreshPath) {
        return authStore.handleUnauthorized().pipe(
          catchError(() => {
            notifications.warning(
              'Your session has expired. Please log in again.',
              'Session Expired',
            );

            return EMPTY;
          }),
          switchMap((token) =>
            next(addAuthorizationHeader(request, token)).pipe(
              catchError((retryError: HttpErrorResponse) =>
                handleHttpError(
                  reporter,
                  notifications,
                  envName,
                  retryError,
                  isSilentPath,
                  isManualHandling,
                ),
              ),
            ),
          ),
        );
      }

      return handleHttpError(
        reporter,
        notifications,
        envName,
        error,
        isSilentPath,
        isManualHandling,
      );
    }),
  );
};
