import type { WritableSignal } from '@angular/core';

/** Read from the token rather than hard-coded, so retuning the role retunes the demo with it. */
function exitDurationMs(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-motion-chart-mark-exit-duration')
    .trim();
  const ms = raw.endsWith('ms')
    ? Number.parseFloat(raw)
    : Number.parseFloat(raw) * 1000;

  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Empty a chart's data and put it back, which is the only way to watch the enter animation again:
 * a mark animates in when it is ADDED, and nothing on a settled chart adds one.
 *
 * The gap is the exit duration, so the removals finish before the additions start — the same
 * staging the charts do, rather than a reload that skips straight to the end state.
 */
export function replayMarks<T>(
  ...models: WritableSignal<readonly T[]>[]
): void {
  const snapshots = models.map((model) => model());
  for (const model of models) {
    model.set([]);
  }
  setTimeout(() => {
    models.forEach((model, index) => model.set(snapshots[index]));
  }, exitDurationMs() + 20);
}
