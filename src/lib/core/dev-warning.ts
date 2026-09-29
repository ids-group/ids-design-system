import { effect, isDevMode } from '@angular/core';

/**
 * Warns once per distinct message, not once per recomputation: the effect re-runs whenever any
 * signal the condition reads changes, so a static misconfiguration would otherwise log on every
 * keystroke. Returning the message from the condition keeps a condition from drifting away from
 * its message.
 *
 * Must be called from an injection context.
 *
 * Callers wrap this in `if (typeof ngDevMode === 'undefined' || ngDevMode)`. That is a
 * BUILD-time expression, not a repeat of the `isDevMode()` below: a minifier folds it and drops
 * the message with it, which the opaque `isDevMode()` call never allows. For the same reason it
 * cannot become a helper function.
 * @internal
 */
export function devWarn(message: () => string | null): void {
  if (!isDevMode()) {
    return;
  }
  const seen = new Set<string>();
  effect(() => {
    const text = message();
    if (!text || seen.has(text)) {
      return;
    }
    seen.add(text);
    console.warn(text);
  });
}
