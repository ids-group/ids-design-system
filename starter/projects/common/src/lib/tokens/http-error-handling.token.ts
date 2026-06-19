import { HttpContext, HttpContextToken } from '@angular/common/http';
import { ExecutionOptions } from '../models/http.model';

/**
 * Suppresses the default error toast in the error interceptor. When `true`,
 * the interceptor still does 401-refresh + error reporting, but skips the
 * user-facing toast and re-throws so the caller can handle the error.
 *
 * @example this.http.post(url, body, MANUAL_ERROR_OPTIONS);
 */
export const MANUAL_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

/** Pre-built ExecutionOptions with MANUAL_ERROR_HANDLING enabled. */
export const MANUAL_ERROR_OPTIONS: ExecutionOptions = {
  context: new HttpContext().set(MANUAL_ERROR_HANDLING, true),
};
