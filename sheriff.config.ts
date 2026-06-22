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
    'ds-docs/src/app/shared': 'docs:shared',
    'ds-docs/src/app/layout': 'docs:layout',
  },
  depRules: {
    // Root = composition files (docs.page, app.*, tweaks-panel) AND the `ds`
    // library itself (its alias resolves to in-repo dist/ds). Everyone may use it.
    root: () => true,
    // A section composes shared + layout + the ds lib (root); NOT another section.
    'docs:section': ['docs:shared', 'docs:layout', 'root'],
    // shared derives docs stats from the nav config (layout); + the ds lib.
    'docs:shared': ['docs:layout', 'root'],
    // layout uses its own nav config + shared (sidebar reads docs-stats) + ds lib.
    // NOTE: shared↔layout is a mild cycle (docs-stats reads nav.config); the clean
    // fix is a `core/` tier for nav.config + docs-stats — tracked as a follow-up.
    'docs:layout': ['docs:shared', 'root'],
  },
};
