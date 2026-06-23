import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import {
  addAuthorizationHeader,
  getPathname,
  matchesAny,
} from '../utils/http.utils';
import { PUBLIC_AUTH_PATHS } from '../constants/api-paths.constants';

/** Attaches the Bearer token to every request except the public auth endpoints. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (matchesAny(getPathname(request.url), PUBLIC_AUTH_PATHS)) {
    return next(request);
  }

  const token = inject(TokenStorageService).getToken();

  return token ? next(addAuthorizationHeader(request, token)) : next(request);
};
