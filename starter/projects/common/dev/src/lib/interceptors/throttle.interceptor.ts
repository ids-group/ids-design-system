import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay } from 'rxjs';
import { DevSettings } from '../dev-settings.service';

/** Dev-only: adds the configured artificial latency to every response. */
export const throttleInterceptor: HttpInterceptorFn = (request, next) => {
  const ms = inject(DevSettings).throttleMs();

  return ms > 0 ? next(request).pipe(delay(ms)) : next(request);
};
