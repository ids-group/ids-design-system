import { HttpRequest } from '@angular/common/http';

export function addAuthorizationHeader<T>(
  request: HttpRequest<T>,
  token: string,
): HttpRequest<T> {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

/** Pathname from a full request URL (strips query/fragment). */
export const getPathname = (url: string): string => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

/** Matches both `/api/auth/login` and bare `/auth/login` forms. */
export const matchesApiPath = (pathname: string, apiPath: string): boolean =>
  pathname === apiPath || pathname === `/api${apiPath}`;

/** True if the pathname matches any path in the list. */
export const matchesAny = (
  pathname: string,
  paths: readonly string[],
): boolean => paths.some((path) => matchesApiPath(pathname, path));
