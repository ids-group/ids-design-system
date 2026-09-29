/**
 * `@angular/build` defines `ngDevMode` as the literal `false` when script optimization is on,
 * so an inline guard folds a dev-only statement, closure arguments included, out of a
 * production build. `devWarn`'s `isDevMode()` is a function CALL and cannot be folded.
 *
 * Two rules, both load-bearing:
 * - The guard must sit INLINE on the branch. esbuild inlines a top-level `const` only when its
 *   module has no `import` statement, and every component module imports `@angular/core`.
 * - It must be the `typeof` form: a development build does not define the identifier, so
 *   `ngDevMode && ...` throws unless `@angular/core` initialised the global first.
 */
