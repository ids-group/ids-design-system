import { effect, isDevMode } from '@angular/core';

const reported = new Set<string>();
const sinks = new Set<(message: string) => void>();
// Held for a sink registered later, e.g. a ToastService first injected after the warning fired.
const unsunk: string[] = [];
const UNSUNK_LIMIT = 50;

/**
 * The one exit for every dev-mode warning of the library: logs `message` with `console.warn` once
 * per page, however many instances raise it, and hands it to each sink (`ToastService` registers
 * one). Messages raised before any sink exists are kept, up to 50, for the first one.
 *
 * Callers wrap this in `if (typeof ngDevMode === 'undefined' || ngDevMode)`, so the message text
 * folds out of a production build.
 * @internal
 */
export function reportDevWarning(message: string): void {
  if (!isDevMode() || reported.has(message)) {
    return;
  }
  reported.add(message);
  console.warn(message);
  if (sinks.size) {
    for (const sink of sinks) {
      sink(message);
    }
  } else if (unsunk.length < UNSUNK_LIMIT) {
    unsunk.push(message);
  }
}

/**
 * Receives every dev warning from now on, plus the ones raised before the first sink existed.
 * Returns the unregister function.
 * @internal
 */
export function addDevWarningSink(sink: (message: string) => void): () => void {
  sinks.add(sink);
  for (const message of unsunk.splice(0)) {
    sink(message);
  }

  return () => sinks.delete(sink);
}

/**
 * Reports `message()` through `reportDevWarning` each time it yields a text: the effect re-runs
 * whenever a signal the condition reads changes, and `reportDevWarning` drops a repeat.
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
  effect(() => {
    const text = message();
    if (text) {
      reportDevWarning(text);
    }
  });
}
