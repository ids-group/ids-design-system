import { computed, effect, Signal, signal } from '@angular/core';

export interface LoadingStateOptions {
  delay?: number;
  minDisplay?: number;
}

const DEFAULTS: Required<LoadingStateOptions> = {
  delay: 300,
  minDisplay: 500,
};

/**
 * Debounced loading signal that avoids UI flicker:
 * - waits `delay` ms before showing (fast loads never flash),
 * - once shown, stays for at least `minDisplay` ms.
 * Mirrors Angular `@defer @loading (after; minimum)`. Call in an injection context.
 */
export function debouncedLoading(
  source: Signal<boolean>,
  options?: LoadingStateOptions,
): Signal<boolean> {
  const { delay, minDisplay } = { ...DEFAULTS, ...options };

  const visible = signal(false);
  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let shownAt: number | null = null;

  function clearTimers(): void {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  effect((onCleanup) => {
    const loading = source();

    clearTimers();

    if (loading) {
      showTimer = setTimeout(() => {
        showTimer = null;
        shownAt = Date.now();
        visible.set(true);
      }, delay);
    } else if (shownAt) {
      const remaining = minDisplay - (Date.now() - shownAt);

      if (remaining > 0) {
        hideTimer = setTimeout(() => {
          hideTimer = null;
          visible.set(false);
          shownAt = null;
        }, remaining);
      } else {
        visible.set(false);
        shownAt = null;
      }
    }

    onCleanup(() => {
      clearTimers();
    });
  });

  return computed(() => visible());
}
