import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { chartDwell } from '@ids-group-ltd/ids-design-system/components';

/** @internal */
export interface ChartActiveMark {
  /** Index of the mark under the pointer or holding focus; `-1` when none is. */
  readonly index: Signal<number>;
  /** The mark's own element, which is what the tooltip anchors to. */
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
  /** Moves the active index with no pointer behind it (keyboard, or a mark handing over its category).
   *  Leaves the anchor alone; a pin holds against this too. */
  setIndex(index: number): void;
  leave(): void;
  /** Holds the activated mark, for any pointer type. Activating the already-pinned mark releases it. */
  pin(
    index: number,
    event: Event,
    anchor?: string | Element | null,
    mark?: Element,
  ): void;
  /** Lets go of a held mark. */
  release(): void;
}

/**
 * The pointer-and-focus target the tooltip reads, for a chart whose marks are elements.
 * Pointer and keyboard write the same pair, so a chart wires `pointerenter` and `focus` to
 * `enter` and gets one code path rather than two.
 *
 * A POINTER WAITS. It is answered once it has rested on a mark for `hoverDelayMs`, and at once
 * while the chart has already answered it; focus, a tap and a pin are answered at once.
 *
 * A TAP LATCHES. A touch fires `pointerleave` the moment the finger lifts, so without this the
 * panel would flash and vanish; latched, it stays until the next tap lands outside the mark. Call
 * from an injection context: the release listener is torn down with the component.
 *
 * @internal
 */
export function chartActiveMark(
  lingerMs: () => number = () => 0,
  hoverDelayMs: () => number = () => 0,
): ChartActiveMark {
  const index = signal(-1);
  const origin = signal<Element | null>(null);
  // Set by a tap (no hover to hold the panel open) and by a click under `pinOnClick`.
  const pinned = signal(false);
  // The click the browser fires after a latching tap belongs to the tap, not to a second press that lets go.
  let tapLatched = false;
  let pendingClear: ReturnType<typeof setTimeout> | null = null;
  // The element that owns the handlers, not always the anchor (a column anchors to the bar, the whole
  // cell answers the pointer). A press is "outside" only when it misses this, or a click beside the
  // bar would release the pin and immediately re-take it.
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

  // Anchors to the mark, not the box that catches the pointer: a column's cell is the full plot
  // height, so the panel would open at the top of the chart. A selector resolves inside the box; a
  // legend item's mark is outside it, so that caller passes the element.
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
      // A zero-value mark is degenerate in one axis (no height, no width); anchoring to it lands the
      // overlay at that edge. Both dimensions must be real; the hover target always is.
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

  // Escape releases the mark too, or the dimming would outlive the panel.
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

  // `pointerover` fires on every element crossed: arriving on the panel cancels the clear, leaving it
  // for anything but the mark schedules one. Without the second half a panel the pointer once
  // touched never closes, since the mark's `pointerleave` already fired.
  const trackPointer = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (pinned() || event.target.closest('.ds-chart-tooltip-pane')) {
      cancelPendingClear();

      return;
    }
    // Host, not anchor: a legend item and the arc its panel points at are disjoint, so testing the
    // anchor would clear the panel as the pointer moves inside the legend item.
    if (!host || !host.contains(event.target)) {
      scheduleClear();
    }
  };

  // Every chart puts its plot in one `<figure>`.
  const chartOf = (element: Element | null): Element | null =>
    element ? element.closest('figure') : null;

  const release = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      clear();

      return;
    }
    if (host && host.contains(event.target)) {
      return;
    }
    // Hopping the pin between marks must not pass through "nothing pinned": this runs on
    // `pointerdown`, the re-aim on the following `click`, so clearing here flickers the Unpin control.
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
      // A pin holds: released only by Escape or a press outside the pinned mark.
      if (pinned()) {
        return;
      }
      // Taken now: `currentTarget` is gone by the time a delayed answer runs.
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
    pin(at, event, anchor, mark) {
      dwell.cancel();
      if (typeof document === 'undefined') {
        return;
      }
      // A press on a different mark already went through `release`, so this sees a fresh mark or the pinned one.
      if (pinned() && index() === at) {
        if (tapLatched) {
          tapLatched = false;

          return;
        }
        clear();

        return;
      }
      tapLatched = false;
      // Re-aiming while pinned keeps `pinned` true, so the Unpin control does not unmount between marks.
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
