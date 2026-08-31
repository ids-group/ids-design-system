import { SheriffConfig } from '@softarc/sheriff-core';

/**
 * Module boundaries for the `ds-docs` showcase app (lint-enforced via the
 * @softarc/eslint-plugin-sheriff block in eslint.config.mjs, scoped to
 * `ds-docs/src/**`). Does NOT apply to the published library `src/lib`.
 *
 * Each docs section is its own module, so one section cannot import another
 * (sections are leaves that compose only `shared/` + `layout/` + the `ds` lib).
 * `encapsulation` is relaxed (see eslint.config.mjs) so existing deep relative
 * imports into `shared/`/`layout/` keep working without a barrel rewrite.
 */
export const config: SheriffConfig = {
  version: 1,
  enableBarrelLess: true,
  autoTagging: false,
  excludeRoot: true,
  modules: {
    'ds-docs/src/app/sections/<group>/<section>': 'docs:section',
    'ds-docs/src/app/core': 'docs:core',
    'ds-docs/src/app/shared': 'docs:shared',
    'ds-docs/src/app/layout': 'docs:layout',
  },
  depRules: {
    // Root = composition files (docs.page, app.*, tweaks-panel) AND the `ds`
    // library itself (its alias resolves to in-repo dist/ds). Everyone may use it.
    root: () => true,
    // A section composes core + shared + layout + the ds lib (root); NOT another section.
    'docs:section': ['docs:core', 'docs:shared', 'docs:layout', 'root'],
    // The bottom tier: the nav config, which is data and depends on nothing.
    // It exists so `shared` and `layout` can both read it without pointing at
    // each other — that pair used to be a cycle (docs-stats reads nav.config
    // while the sidebar reads docs-stats).
    'docs:core': ['root'],
    'docs:shared': ['docs:core', 'root'],
    'docs:layout': ['docs:core', 'docs:shared', 'root'],
  },
};
