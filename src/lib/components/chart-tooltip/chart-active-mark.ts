import { DestroyRef, Signal, inject, signal } from '@angular/core';

/** @internal */
export interface ChartActiveMark {
  /** Index of the mark under the pointer or holding focus; `-1` when none is. */
  readonly index: Signal<number>;
  /** The mark's own element, which is what the tooltip anchors to. */
  readonly origin: Signal<Element | null>;
  /** Whether the active mark is held rather than followed — a tap, or a click under `pinOnClick`. */
  readonly pinned: Signal<boolean>;
  /** `mark` is the hovered element, for a listener delegated to the marks' parent; it defaults to
   *  the event's `currentTarget`. */
  enter(
    index: number,
    event: Event,
    anchor?: string | Element | null,
    mark?: Element,
  ): void;
  /** Moves the active index with no pointer behind it - a keyboard, or a mark handing over which
   *  category it took focus on. Leaves the anchor alone: the caller that has no event has no
   *  element to aim at either. A pin holds against this too. */
  setIndex(index: number): void;
  leave(): void;
  /** Holds the mark that was activated, for any pointer type. Activating the mark that is already
   *  pinned releases it, so one gesture both sets and clears. */
  pin(
    index: number,
    event: Event,
    anchor?: string | Element | null,
    mark?: Element,
  ): void;
  /** Lets go of a held mark, for a control that offers the way out in as many words. */
  release(): void;
}

/**
 * The pointer-and-focus target the tooltip reads, for a chart whose marks are elements.
 * Pointer and keyboard write the same pair, so a chart wires `pointerenter` and `focus` to
 * `enter` and gets one code path rather than two.
 *
 * A TAP LATCHES. A touch fires `pointerleave` the moment the finger lifts, so without this the
 * panel would flash and vanish; latched, it stays until the next tap lands outside the mark. Call
 * from an injection context — the release listener is torn down with the component.
 *
 * @internal
 */
export function chartActiveMark(
  lingerMs: () => number = () => 0,
): ChartActiveMark {
  const index = signal(-1);
  const origin = signal<Element | null>(null);
  // One flag for two ways of arriving at the same state: a tap, which has no hover to hold the
  // panel open, and a deliberate click under `pinOnClick`. Both release the same way.
  const pinned = signal(false);
  let pendingClear: ReturnType<typeof setTimeout> | null = null;
  // The element that OWNS the handlers, which is not always the tooltip anchor: a column anchors
  // its panel to the bar while the whole cell answers the pointer. A press is "outside" only when
  // it misses this, or a click on the cell beside the bar would release the pin and immediately
  // re-take it, leaving the pin looking stuck.
  let host: Element | null = null;

  const clear = (): void => {
    pinned.set(false);
    host = null;
    cancelPendingClear();
    index.set(-1);
    origin.set(null);
    document.removeEventListener('pointerdown', release, true);
    document.removeEventListener('keydown', releaseOnEscape, true);
    document.removeEventListener('pointerover', trackPointer, true);
  };

  // The tooltip anchors to the MARK, not to the box that catches the pointer: a column's cell is
  // the full plot height, so anchoring to it opens the panel at the top of the chart rather than
  // over the column it is about. A selector is resolved INSIDE the box; a legend item's mark is not
  // inside it, so that caller passes the element.
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
      // A mark drawn from a zero value is degenerate in one axis - a column loses its height, a
      // bar its width - and an overlay anchored to it lands at that edge rather than near the
      // reading. Both dimensions have to be real. The hover target always is.
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

  // Escape releases the mark as well as the panel. Without this the panel would go and the dimming
  // it caused would stay, leaving the chart in a state with nothing on screen explaining it.
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

  // One listener answers both halves of "is the pointer on the panel": `pointerover` fires on every
  // element the pointer crosses, so arriving on the panel cancels the clear and leaving it for
  // anything that is not the mark schedules a new one. Without the second half a panel the pointer
  // once touched would never close, because the mark's own `pointerleave` has already fired.
  const trackPointer = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (pinned() || event.target.closest('.ds-chart-tooltip-pane')) {
      cancelPendingClear();

      return;
    }
    // Against the HOST, not the anchor: a legend item and the arc its panel points at are disjoint
    // elements, so testing the anchor would clear the panel the moment the pointer moved inside the
    // legend item that opened it.
    if (!host || !host.contains(event.target)) {
      scheduleClear();
    }
  };

  // The chart the aimed mark belongs to. Every chart puts its plot in one `<figure>`, so this is
  // what tells "pressed another mark of the same chart" apart from "pressed away".
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
    // Hopping the pin from one mark to the next must not pass through "nothing is pinned". This
    // handler runs on `pointerdown`, the re-aim on the `click` after it, so clearing here would
    // unmount the Unpin control and the pinned styling for a frame and mount them again — a
    // flicker on every hop. The press is a re-aim when it lands on another mark of the same chart.
    const pressedMark = event.target.closest('[data-mark-index]');
    if (pressedMark && chartOf(pressedMark) === chartOf(host)) {
      return;
    }
    clear();
  };

  if (typeof document !== 'undefined') {
    inject(DestroyRef).onDestroy(() => {
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
      // A pin HOLDS. Without this the next mark the pointer crossed took the active slot straight
      // back, so pinning appeared to work and then followed the pointer anyway — the one thing a
      // pin exists not to do. It is released by Escape, or by a press outside the pinned mark.
      if (pinned()) {
        return;
      }
      aim(at, event, anchor, mark);
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
      }
    },
    setIndex(at) {
      if (pinned()) {
        return;
      }
      cancelPendingClear();
      index.set(at);
    },
    leave() {
      if (pinned()) {
        return;
      }
      scheduleClear();
    },
    release() {
      if (typeof document !== 'undefined') {
        clear();
      }
    },
    pin(at, event, anchor, mark) {
      if (typeof document === 'undefined') {
        return;
      }
      // The same gesture that set the pin clears it. A press on a DIFFERENT mark has already gone
      // through `release` by the time the click lands, so this only ever sees a fresh mark or the
      // pinned one.
      if (pinned() && index() === at) {
        clear();

        return;
      }
      // Re-aiming while already pinned keeps `pinned` true throughout, so nothing that renders on
      // it — the Unpin control, the held mark's styling — unmounts between the two marks.
      aim(at, event, anchor, mark);
      if (!pinned()) {
        hold();
      }
    },
  };
}
