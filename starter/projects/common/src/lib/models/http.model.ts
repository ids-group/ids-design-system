import { HttpContext } from '@angular/common/http';

export type SortOrder = 'Asc' | 'Desc';

/** Per-request options passed to HttpService (params, cache-bust, context). */
export class ExecutionOptions {
  params?: Record<string, string>;
  getMethod?: boolean;
  context?: HttpContext;
}
