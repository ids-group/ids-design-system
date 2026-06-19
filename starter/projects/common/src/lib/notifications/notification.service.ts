import { MonoTypeOperatorFunction, tap } from 'rxjs';

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';
const VALIDATION_ERROR_MESSAGE = 'Validation Error';

/** Accepted by `error()` — a plain string or an API failure object. */
export type ErrorSource =
  | string
  | { message?: string; validationErrors?: { message: string }[] };

/**
 * Abstract notification service — each app provides its own implementation.
 * The IDS starter implements it with the DS `ds-toast` (ToastNotificationService).
 */
export abstract class NotificationService {
  abstract error(source?: ErrorSource, title?: string): void;
  abstract success(message: string, title?: string): void;
  abstract warning(message: string, title?: string): void;
  abstract info(message: string, title?: string): void;

  /**
   * RxJS operator: shows a success/error notification based on an ApiResult-like value.
   *
   * @example api.create(data).pipe(notifications.notifyOnSuccess('Created.'))
   */
  notifyOnSuccess<T extends { isSuccess: boolean; failure?: ErrorSource }>(
    message: string,
    severity: 'success' | 'info' = 'success',
  ): MonoTypeOperatorFunction<T> {
    return tap((result) => {
      if (result.isSuccess) {
        this[severity](message);
      } else {
        this.error(result.failure);
      }
    });
  }

  /** Resolves an error source to a display string, with a default fallback. */
  protected resolveErrorMessage(source?: ErrorSource): string {
    if (!source) {
      return DEFAULT_ERROR_MESSAGE;
    }

    if (typeof source === 'string') {
      return source || DEFAULT_ERROR_MESSAGE;
    }

    if (
      source.message === VALIDATION_ERROR_MESSAGE &&
      source.validationErrors?.length
    ) {
      return source.validationErrors.map((error) => error.message).join('\n');
    }

    return source.message || DEFAULT_ERROR_MESSAGE;
  }
}
