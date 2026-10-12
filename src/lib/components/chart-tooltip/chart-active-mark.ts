import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { chartDwell } from '@ids-group-ltd/ids-design-system/components';

/** @internal */
export interface ChartActiveMark {
  /** Index of the mark under the pointer or holding focus; `-1` when none is. */
  readonly index: Signal<number>;
  /** The element the tooltip anchors to. */
  readonly origin: Signal<Element | null>;
  /** Whether the active mark is held rather than followed: a tap, or a click under `pinOnClick`. */
  readonly pinned: Signal<boolean>;
  /** `mark` is the hovered element, for a listener delegated to the marks' parent; it defaults to
   *  the event's `currentTarget`. */
  enter(
    index: number,
    event: Event,
    anchor?: string | Element | null,
    mark?: Element,
  ): void;
  /** Moves the active index with no pointer (keyboard, category handover); leaves the anchor alone, and a pin holds. */
  setIndex(index: number): void;
  leave(): void;
  /** Holds the activated mark, for any pointer type. Activating the already-pinned mark releases it. */
  pin(
    index: number,
    event: Event,
    anchor?: string | Element | null,
    mark?: Element,
  ): void;
  release(): void;
  /** The pinned mark, looked up by its index, as a list keyed by that index: pinning another mark
   *  puts a new pin in the list, the same mark keeps its pin. Empty when nothing is pinned. */
  pinnedAt<T>(
    lookup: (index: number) => T | null | undefined,
  ): Signal<readonly { index: number; value: T }[]>;
}

/**
 * The pointer-and-focus target the tooltip reads, for a chart whose marks are elements.
 * Pointer and keyboard write the same pair: wire `pointerenter` and `focus` to `enter`.
 *
 * A pointer is answered after resting `hoverDelayMs` on a mark (at once while the chart has
 * already answered); focus, a tap and a pin are answered at once.
 *
 * A tap latches: touch fires `pointerleave` on lift, so the panel stays until the next tap
 * outside the mark. Call from an injection context.
 *
 * @internal
 */
export function chartActiveMark(
  lingerMs: () => number = () => 0,
  hoverDelayMs: () => number = () => 0,
): ChartActiveMark {
  const index = signal(-1);
  const origin = signal<Element | null>(null);
  const pinned = signal(false);
  // The click after a latching tap belongs to the tap, not to a press that lets go.
  let tapLatched = false;
  let pendingClear: ReturnType<typeof setTimeout> | null = null;
  // Owns the handlers (a column anchors to the bar, the whole cell takes the pointer). A press is
  // outside only when it misses this, or a click beside the bar releases and re-takes the pin.
  let host: Element | null = null;
  const dwell = chartDwell(hoverDelayMs);

  const clear = (): void => {
    pinned.set(false);
    tapLatched = false;
    host = null;
    cancelPendingClear();
    index.set(-1);
    origin.set(null);
    document.removeEventListener('pointerdown', release, true);
    document.removeEventListener('keydown', releaseOnEscape, true);
    document.removeEventListener('pointerover', trackPointer, true);
  };

  // Anchors to the mark, not the pointer-catching box (a column cell spans the plot height). A
  // selector resolves inside the box; a legend item's mark is outside it, so its caller passes the element.
  const aim = (
    at: number,
    event: Event,
    anchor?: string | Element | null,
    mark: EventTarget | null = event.currentTarget,
  ): void => {
    const target = mark;
    if (target instanceof Element) {
      host = target;
      const mark =
        typeof anchor === 'string' ? target.querySelector(anchor) : anchor;
      // A zero-value mark has no height or width and would anchor to an edge.
      const box = mark?.getBoundingClientRect();
      const aimable = box && box.width > 0 && box.height > 0;
      origin.set(aimable ? (mark ?? target) : target);
    }
    index.set(at);
  };

  const hold = (): void => {
    pinned.set(true);
    cancelPendingClear();
    document.addEventListener('pointerdown', release, true);
    document.addEventListener('keydown', releaseOnEscape, true);
  };

  const releaseOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      clear();
    }
  };

  const cancelPendingClear = (): void => {
    if (pendingClear !== null) {
      clearTimeout(pendingClear);
      pendingClear = null;
    }
  };

  const scheduleClear = (): void => {
    cancelPendingClear();
    pendingClear = setTimeout(
      () => {
        pendingClear = null;
        index.set(-1);
        origin.set(null);
        document.removeEventListener('pointerover', trackPointer, true);
      },
      Math.max(lingerMs(), 0),
    );
  };

  // `pointerover` fires per element crossed: the panel cancels the clear, anything else but the mark
  // schedules one. Without that a panel the pointer once touched never closes.
  const trackPointer = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (pinned() || event.target.closest('.ds-chart-tooltip-pane')) {
      cancelPendingClear();

      return;
    }
    // Host, not anchor: a legend item and the arc its panel points at are disjoint.
    if (!host || !host.contains(event.target)) {
      scheduleClear();
    }
  };

  const chartOf = (element: Element | null): Element | null =>
    element ? element.closest('figure') : null;

  const release = (event: PointerEvent): void => {
    if (!isPrimaryPress(event)) {
      return;
    }
    if (!(event.target instanceof Element)) {
      clear();

      return;
    }
    if (host && host.contains(event.target)) {
      return;
    }
    // Runs on `pointerdown`; the re-aim comes on `click`, so clearing here flickers the Unpin control.
    const pressedMark = event.target.closest('[data-mark-index]');
    if (pressedMark && chartOf(pressedMark) === chartOf(host)) {
      return;
    }
    clear();
  };

  if (typeof document !== 'undefined') {
    inject(DestroyRef).onDestroy(() => {
      dwell.cancel();
      cancelPendingClear();
      document.removeEventListener('pointerdown', release, true);
      document.removeEventListener('keydown', releaseOnEscape, true);
      document.removeEventListener('pointerover', trackPointer, true);
    });
  }

  return {
    index: index.asReadonly(),
    origin: origin.asReadonly(),
    pinned: pinned.asReadonly(),
    enter(at, event, anchor, mark) {
      if (pinned()) {
        return;
      }
      // `currentTarget` is gone by the time a delayed answer runs.
      const target = mark ?? event.currentTarget;
      dwell.schedule(at, () => answer(at, event, anchor, target), event);
    },
    setIndex(at) {
      if (pinned()) {
        return;
      }
      dwell.cancel();
      cancelPendingClear();
      index.set(at);
    },
    leave() {
      dwell.cancel();
      if (pinned()) {
        return;
      }
      scheduleClear();
    },
    release() {
      dwell.cancel();
      if (typeof document !== 'undefined') {
        clear();
      }
    },
    pinnedAt(lookup) {
      return computed(() => {
        const at = index();
        const value = pinned() ? lookup(at) : null;

        return value ? [{ index: at, value }] : [];
      });
    },
    pin(at, event, anchor, mark) {
      dwell.cancel();
      if (typeof document === 'undefined' || !isPrimaryPress(event)) {
        return;
      }
      if (pinned() && index() === at) {
        if (tapLatched) {
          tapLatched = false;

          return;
        }
        clear();

        return;
      }
      tapLatched = false;
      // Keeps `pinned` true so the Unpin control stays mounted.
      aim(at, event, anchor, mark);
      if (!pinned()) {
        hold();
      }
    },
  };

  function answer(
    at: number,
    event: Event,
    anchor: string | Element | null | undefined,
    target: EventTarget | null,
  ): void {
    if (pinned()) {
      return;
    }
    aim(at, event, anchor, target);
    cancelPendingClear();
    if (typeof document !== 'undefined') {
      document.addEventListener('pointerover', trackPointer, true);
    }
    if (
      typeof document !== 'undefined' &&
      event instanceof PointerEvent &&
      event.pointerType === 'touch'
    ) {
      hold();
      tapLatched = true;
    }
  }
}

/** Whether `event` may take or drop a pin: a key or a touch always, a mouse only by its main button.
 *
 *  @internal */
export function isPrimaryPress(event: Event): boolean {
  return !(event instanceof MouseEvent) || event.button === 0;
}
