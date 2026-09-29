/**
 * `ngDevMode` is defined as the literal `false` by `@angular/build` whenever script
 * optimization is on. Guarding a dev-only statement with it inline lets the bundler fold the
 * whole statement out of a consumer's production build, closure arguments included.
 *
 * `devWarn`'s own `isDevMode()` check cannot do that: it is a function CALL, so esbuild cannot
 * prove the branch dead and every message closure ships to production (1 590 B gzip across the
 * 13 call sites, measured 2026-09-01).
 *
 * Two rules, both load-bearing:
 * - The guard must sit INLINE on the branch. esbuild inlines a top-level `const` only when the
 *   declaring module has no `import` statement at all (measured 2026-09-02). Every Angular
 *   component module imports `@angular/core`, so behind a `const` the branch survives and
 *   ships the whole body.
 * - It must be the `typeof` form: a development build does NOT define the identifier, so
 *   `ngDevMode && ...` emits an undeclared free identifier and throws unless `@angular/core`
 *   initialised the global first.
 */
