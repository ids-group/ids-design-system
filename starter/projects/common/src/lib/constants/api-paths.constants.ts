/** Public auth endpoints that carry no user session. */
export const AUTH_PATHS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/account/activate',
] as const;

/** Token refresh endpoint (unique behaviour — listed separately). */
export const REFRESH_TOKEN_PATH = '/auth/refresh-token' as const;

/** All public auth paths — auth interceptor skips the Authorization header for these. */
export const PUBLIC_AUTH_PATHS: readonly string[] = [
  ...AUTH_PATHS,
  REFRESH_TOKEN_PATH,
];

/** A 401 on these must NOT trigger a silent refresh (not authed yet / logging out). */
export const NO_REFRESH_PATHS: readonly string[] = [
  ...AUTH_PATHS,
  '/auth/logout',
];

/** The error interceptor shows no toast for these (handled elsewhere). */
export const SILENT_PATHS: readonly string[] = [
  REFRESH_TOKEN_PATH,
  '/auth/logout',
];
