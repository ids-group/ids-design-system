import { SheriffConfig, sameTag } from '@softarc/sheriff-core';

/**
 * Module boundaries (lint-enforced via @softarc/eslint-plugin-sheriff).
 *
 * The rule that matters: `common` (the shared library) must NEVER import from
 * `app`. Apps depend on common; common depends only on itself.
 *
 * `barrelFileName: 'public-api.ts'` tells Sheriff the module boundary is each
 * library's public surface (Angular libs use public-api.ts, not index.ts), so
 * `common` is one module and the nested `index.ts` barrels are just tidy imports
 * — not module walls. The app has no public-api.ts, so it's the (unrestricted)
 * root project. Finer intra-app layering (core/shared/features) is a follow-up.
 */
export const config: SheriffConfig = {
  version: 1,
  barrelFileName: 'public-api.ts',
  modules: {
    'projects/common/src': 'common',
    'projects/common/config/src': 'common',
    'projects/common/dev/src': 'common',
  },
  depRules: {
    // App (root) + entry/composition files may import anything.
    root: () => true,
    // common is self-contained — importing app code is forbidden.
    common: [sameTag],
  },
};
