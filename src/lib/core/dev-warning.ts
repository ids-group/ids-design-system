import { effect, isDevMode } from '@angular/core';

/**
 * Warns once per distinct message, not once per recomputation: the effect re-runs whenever any
 * signal the condition reads changes, so without that a static misconfiguration would log again
 * on every keystroke.
 *
 * Returning the message from the condition keeps the two together — a condition
 * that drifts from its message is how a warning ends up describing a state that
 * cannot happen any more.
 *
 * Must be called from an injection context.
 *
 * Callers wrap this in `if (typeof ngDevMode === 'undefined' || ngDevMode)`. That is
 * a BUILD-time expression, not a repeat of the `isDevMode()` below: the intent is for
 * a minifier to fold it and drop the message with it, which `isDevMode()` — an opaque
 * call — can never allow. It cannot become a helper function for the same reason.
 *
 * It does work: `ds-stat`, `ds-split-button` and `ds-toast-region` keep no message text in the
 * shipped bundle.
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
