import { HttpContextToken } from '@angular/common/http';

/**
 * Enables automatic retry for a failed request. Value = number of attempts
 * (default 0 = no retry). The error interceptor uses exponential backoff and
 * only shows the error toast after all retries are exhausted.
 *
 * @example new HttpContext().set(HTTP_RETRY_COUNT, 1)
 */
export const HTTP_RETRY_COUNT = new HttpContextToken<number>(() => 0);
