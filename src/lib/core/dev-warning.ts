import { effect, isDevMode } from '@angular/core';

/**
 * A dev-mode warning that watches signals and fires at most once per message.
 *
 * Every component that has one of these wrote the same four lines around it —
 * `if (isDevMode())`, an `effect`, a condition, a `console.warn` — and each copy
 * carried the same flaw: the effect re-runs whenever ANY signal it read changes,
 * so a warning about a static misconfiguration could be logged again on every
 * keystroke or every time a host rebuilt an input array. A console repeating the
 * same line is a console people stop reading.
 *
 * Pass a function that returns the message when something is wrong and `null`
 * when it is not. Keeping the two together is the point: a condition that drifts
 * from its message is how a warning ends up describing a state that cannot
 * happen any more.
 *
 * ```ts
 * constructor() {
 *   devWarn(() =>
 *     this.unit() && !this.value()
 *       ? `[ds-stat] unit="${this.unit()}" is set but there is no value input…`
 *       : null,
 *   );
 * }
 * ```
 *
 * Call it from an injection context (a constructor or a field initialiser). In
 * production it does nothing at all — no effect is created, so the signals it
 * would have read are never even subscribed to.
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
