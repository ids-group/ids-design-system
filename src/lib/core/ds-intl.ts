import {
  InjectionToken,
  computed,
  inject,
  signal,
  type Provider,
  type Signal,
} from '@angular/core';
import { DS_INTL_DEFAULTS } from './ds-intl-defaults';
import type { DsIntl, DsIntlOverrides } from './ds-intl.types';

const DEFAULTS = signal(DS_INTL_DEFAULTS).asReadonly();

/** Every string the library invents, as a signal so a language switch re-renders in place.
 *  Unprovided, it holds the English defaults. */
export const DS_INTL = new InjectionToken<Signal<DsIntl>>('DS_INTL', {
  factory: () => DEFAULTS,
});

/** Provide the library's wording.
 *
 *   providers: [provideDsIntl({ picker: { selectAll: 'Выбрать все' } })]
 *
 * Pass an object for a fixed language, or a factory returning a signal for a language that
 * changes at runtime (the factory runs in an injection context):
 *
 *   provideDsIntl(() => { const language = inject(LanguageService); return computed(() => language.dictionary().ds); })
 *
 * Works at the root, on a `Route` or on a component; a nested call MERGES section by section,
 * as `provideDsConfig` does. Numbers and dates follow `DsConfig.locale`, then `LOCALE_ID`. */
export function provideDsIntl(
  overrides: DsIntlOverrides | (() => Signal<DsIntlOverrides>),
): Provider {
  return {
    provide: DS_INTL,
    useFactory: () => {
      const parent =
        inject(DS_INTL, { skipSelf: true, optional: true }) ?? DEFAULTS;
      const own =
        typeof overrides === 'function'
          ? overrides()
          : signal(overrides).asReadonly();

      return computed(() => mergeDsIntl(parent(), own()));
    },
  };
}

function mergeDsIntl(parent: DsIntl, own: DsIntlOverrides): DsIntl {
  const merged = { ...parent };
  for (const section of Object.keys(own) as (keyof DsIntl)[]) {
    Object.assign(merged, {
      [section]: { ...parent[section], ...own[section] },
    });
  }

  return merged;
}
