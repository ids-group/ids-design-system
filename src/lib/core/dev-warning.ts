import { effect, isDevMode } from '@angular/core';

/**
 * Warns once per distinct message: the effect re-runs whenever a signal the condition reads
 * changes, so a static misconfiguration would otherwise log on every keystroke.
 *
 * Must be called from an injection context.
 *
 * Callers wrap this in `if (typeof ngDevMode === 'undefined' || ngDevMode)`: a BUILD-time
 * expression a minifier folds away with the message, which the opaque `isDevMode()` call never
 * allows. It cannot become a helper function for the same reason.
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
