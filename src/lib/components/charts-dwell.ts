import { DestroyRef, inject, type WritableSignal } from '@angular/core';

/** Delays a chart's answer to a resting pointer.
 *
 *  @internal */
export interface ChartDwell {
  /** Runs `answer` once the pointer has rested on `target` for the delay; focus, touch and a chart
   *  that has already answered run it at once. Asking again for the same `target` keeps the running
   *  wait and swaps in the newer `answer`. */
  schedule(target: unknown, answer: () => void, event: Event): void;
  /** Drops a wait that has not run yet. */
  cancel(): void;
}

// A chart stays warm from its first answer until the pointer leaves it; one set for the page, as a legend and its plot are one chart.
const warmCharts = new WeakSet<Element>();

/** The chart `element` sits in.
 *
 *  @internal */
export function chartOf(element: Element | null): Element | null {
  return element ? element.closest('figure') : null;
}

function warmUp(chart: Element): void {
  if (warmCharts.has(chart)) {
    return;
  }
  warmCharts.add(chart);
  const coolOnLeave = (event: PointerEvent): void => {
    if (!(event.target instanceof Node) || !chart.contains(event.target)) {
      warmCharts.delete(chart);
      document.removeEventListener('pointerover', coolOnLeave, true);
    }
  };
  document.addEventListener('pointerover', coolOnLeave, true);
}

/** Call from an injection context; the caller's own `leave` cancels the wait, and so does destroying
 *  the context. `delayMs` is read at each `schedule`.
 *
 *  @internal */
export function chartDwell(delayMs: () => number): ChartDwell {
  let waiting: {
    readonly target: unknown;
    answer: () => void;
    readonly timer: ReturnType<typeof setTimeout>;
  } | null = null;

  const cancel = (): void => {
    if (waiting) {
      clearTimeout(waiting.timer);
      waiting = null;
    }
  };

  inject(DestroyRef).onDestroy(cancel);

  return {
    schedule(target, answer, event) {
      const pointer =
        typeof PointerEvent !== 'undefined' &&
        event instanceof PointerEvent &&
        event.pointerType !== 'touch';
      const node = event.currentTarget ?? event.target;
      const chart = chartOf(node instanceof Element ? node : null);
      const delay = Math.max(delayMs(), 0);
      if (!pointer || delay === 0 || (chart && warmCharts.has(chart))) {
        cancel();
        answer();
        if (pointer && chart) {
          warmUp(chart);
        }

        return;
      }
      if (waiting && waiting.target === target) {
        waiting.answer = answer;

        return;
      }
      cancel();
      const timer = setTimeout(() => {
        const ready = waiting;
        waiting = null;
        ready?.answer();
        if (chart) {
          warmUp(chart);
        }
      }, delay);
      waiting = { target, answer, timer };
    },
    cancel,
  };
}

/** Sets `highlighted` to the item the pointer rests on, after the dwell, and back to `null` when it
 *  leaves. Call from an injection context.
 *
 *  @internal */
export function dwellHighlight<T>(
  highlighted: WritableSignal<T | null>,
  delayMs: () => number,
): { enter(item: T, event: Event): void; leave(): void } {
  const dwell = chartDwell(delayMs);

  return {
    enter(item, event) {
      dwell.schedule(item, () => highlighted.set(item), event);
    },
    leave() {
      dwell.cancel();
      highlighted.set(null);
    },
  };
}
