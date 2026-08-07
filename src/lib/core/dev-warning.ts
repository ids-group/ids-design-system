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
