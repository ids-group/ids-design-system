import { registerHooks } from 'node:module';
import { Injector } from '@angular/core';
import { check, finish } from './probe-check.mjs';

// The core sources import siblings without an extension, which only a bundler resolves.
registerHooks({
  resolve(specifier, context, next) {
    return specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)
      ? next(`${specifier}.ts`, context)
      : next(specifier, context);
  },
});

const { DS_CONFIG, provideDsConfig } =
  await import('../../src/lib/core/ds-config.ts');
const { DS_INTL, provideDsIntl } =
  await import('../../src/lib/core/ds-intl.ts');

const root = Injector.create({
  providers: [
    provideDsConfig({ pagination: { size: 'sm' } }),
    provideDsConfig({
      card: { padding: 'lg' },
      pagination: { layout: 'spread' },
    }),
    provideDsIntl({ picker: { selectAll: 'Tout' } }),
    provideDsIntl({ picker: { noOptions: 'Aucune' } }),
  ],
});
const rootConfig = root.get(DS_CONFIG);
check(
  'two calls in one array keep the first',
  rootConfig.pagination?.size,
  'sm',
);
check('two calls in one array keep the second', rootConfig.card?.padding, 'lg');
check(
  'a later call merges into a shared section',
  rootConfig.pagination?.layout,
  'spread',
);

const rootIntl = root.get(DS_INTL)();
check('two intl calls keep the first', rootIntl.picker.selectAll, 'Tout');
check('two intl calls keep the second', rootIntl.picker.noOptions, 'Aucune');

const child = Injector.create({
  parent: root,
  providers: [provideDsConfig({ pagination: { size: 'lg' } })],
});
const childConfig = child.get(DS_CONFIG);
check('a nested call overrides its key', childConfig.pagination?.size, 'lg');
check(
  'a nested call keeps the parent section keys',
  childConfig.pagination?.layout,
  'spread',
);
check(
  'a nested call keeps the parent sections',
  childConfig.card?.padding,
  'lg',
);

finish();
