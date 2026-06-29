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
   * Follow the operating-system colour scheme: on startup set `data-theme` on
   * `<html>` from `prefers-color-scheme` and keep it in sync as the OS changes.
   * Default `false` — the design system stays on its explicit light default
   * and dark is opt-in via `<html data-theme="dark">`.
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
 * switching. A manual `<html data-theme="dark">` always wins over the initial
 * value this sets.
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
