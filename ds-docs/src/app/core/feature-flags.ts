import { isDevMode } from '@angular/core';

/**
 * Chapter lists under a nav item are unfinished, so a release build hides them while local work
 * keeps them: `isDevMode()` is true under `ng serve` and the development build, false in the
 * production build the docs site is deployed from.
 *
 * A function rather than a constant because `isDevMode()` reads a global the platform sets at
 * bootstrap — evaluated at module scope it can answer before that has happened. Call it from a
 * render hook or a computed.
 *
 * Two limits keep it off: chapters reach only sections whose headings are `h3.block-title`, and the
 * active chapter is not scrolled into the rail's own viewport. Both are in `docs/todo.md`; replace
 * the body with `true` when they are closed.
 */
export const chapterNavEnabled = (): boolean => isDevMode();
