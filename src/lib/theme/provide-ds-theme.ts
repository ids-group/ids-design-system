import {
  EnvironmentProviders,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface DsThemeOptions {
  /**
   * Follow the operating-system colour scheme: sets `data-theme` on `<html>`
   * from `prefers-color-scheme` at startup and on every OS change.
   * Default `false`: light, with dark opt-in via `<html data-theme="dark">`.
   */
  followSystem?: boolean;
}

/**
 * App-root theme configuration for the design system.
 *
 * ```ts
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideDsTheme({ followSystem: true })],
 * };
 * ```
 *
 * Light is the default with no provider; `followSystem` opts into OS-driven
 * switching. A manual `<html data-theme="dark">` wins over the initial value.
 */
export function provideDsTheme(
  options: DsThemeOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer((): void => {
      if (!options.followSystem || !isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
      }
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = (): void =>
        document.documentElement.setAttribute(
          'data-theme',
          query.matches ? 'dark' : 'light',
        );
      apply();
      query.addEventListener('change', apply);
    }),
  ]);
}
