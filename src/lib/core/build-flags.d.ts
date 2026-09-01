/**
 * `ngDevMode` is defined as the literal `false` by `@angular/build` whenever script
 * optimization is on — see `application-code-bundle.js`, which adds it to esbuild's
 * `define`. Guarding a dev-only statement with it inline lets the bundler fold the whole
 * statement out of a consumer's production build, closure arguments included.
 *
 * `devWarn`'s own `isDevMode()` check cannot do that: it is a function CALL, so esbuild
 * cannot prove the branch dead, and every message closure ships to production. Measured
 * 2026-09-01: 1 590 B gzip across the 14 call sites, 827 B of it on `ds-button` alone.
 *
 * Two rules, both load-bearing:
 * - The guard must sit INLINE on the branch. Behind an intermediate `const` the fold does
 *   not happen — esbuild substitutes the identifier but will not propagate the constant
 *   through module scope.
 * - It must be the `typeof` form. A development build does NOT define the identifier, so a
 *   bare `ngDevMode && …` depends on `@angular/core` having initialised the global first.
 */
declare const ngDevMode: boolean | object | undefined;
