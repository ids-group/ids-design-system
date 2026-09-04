import { effect, isDevMode } from '@angular/core';

/**
 * Once per message, not once per recomputation: the hand-written copies of this
 * re-ran whenever ANY signal they read changed, so a warning about a static
 * misconfiguration could log again on every keystroke, and a console repeating
 * one line is a console people stop reading.
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
 * It does work: `ds-stat` and `ds-split-button` compile to `constructor(){}` in the
 * shipped bundle. `ds-toast-region`'s strip is UNVERIFIED — the bundle came out
 * byte-identical after adding the guard, so re-check on a clean `.angular/cache`.
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
