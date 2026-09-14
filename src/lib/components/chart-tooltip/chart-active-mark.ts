import { DestroyRef, Signal, inject, signal } from '@angular/core';

// Long enough to cross the gap between a mark and its panel at an ordinary pointer speed, short
// enough that a panel left behind does not linger over the plot.
const LEAVE_GRACE_MS = 140;

/** @internal */
export interface ChartActiveMark {
  /** Index of the mark under the pointer or holding focus; `-1` when none is. */
  readonly index: Signal<number>;
  /** The mark's own element, which is what the tooltip anchors to. */
  readonly origin: Signal<Element | null>;
  enter(index: number, event: Event, anchorWithin?: string): void;
  leave(): void;
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
export function chartActiveMark(): ChartActiveMark {
  const index = signal(-1);
  const origin = signal<Element | null>(null);
  let latched = false;
  let pendingClear: ReturnType<typeof setTimeout> | null = null;

  const clear = (): void => {
    latched = false;
    cancelPendingClear();
    index.set(-1);
    origin.set(null);
    document.removeEventListener('pointerdown', release, true);
    document.removeEventListener('pointerover', trackPointer, true);
  };

  const cancelPendingClear = (): void => {
    if (pendingClear !== null) {
      clearTimeout(pendingClear);
      pendingClear = null;
    }
  };

  // WCAG 1.4.13 requires the pointer to be able to REACH the panel without it vanishing, and the
  // panel is portaled to `document.body` — so leaving the mark fires `pointerleave` long before the
  // pointer can arrive. Clearing on a short delay instead leaves a window to cross the gap.
  const scheduleClear = (): void => {
    cancelPendingClear();
    pendingClear = setTimeout(() => {
      pendingClear = null;
      index.set(-1);
      origin.set(null);
      document.removeEventListener('pointerover', trackPointer, true);
    }, LEAVE_GRACE_MS);
  };

  // One listener answers both halves of "is the pointer on the panel": `pointerover` fires on every
  // element the pointer crosses, so arriving on the panel cancels the clear and leaving it for
  // anything that is not the mark schedules a new one. Without the second half a panel the pointer
  // once touched would never close, because the mark's own `pointerleave` has already fired.
  const trackPointer = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (event.target.closest('.ds-chart-tooltip-pane')) {
      cancelPendingClear();

      return;
    }
    const mark = origin();
    if (!(mark instanceof Element) || !mark.contains(event.target)) {
      scheduleClear();
    }
  };

  const release = (event: PointerEvent): void => {
    const mark = origin();
    if (mark && event.target instanceof Node && mark.contains(event.target)) {
      return;
    }
    clear();
  };

  if (typeof document !== 'undefined') {
    inject(DestroyRef).onDestroy(() => {
      cancelPendingClear();
      document.removeEventListener('pointerdown', release, true);
      document.removeEventListener('pointerover', trackPointer, true);
    });
  }

  return {
    index: index.asReadonly(),
    origin: origin.asReadonly(),
    enter(at, event, anchorWithin) {
      const host = event.currentTarget;
      if (host instanceof Element) {
        // The tooltip anchors to the MARK, not to the box that catches the pointer: a column's
        // cell is the full plot height, so anchoring to it opens the panel at the top of the
        // chart rather than over the column it is about.
        const anchor = anchorWithin ? host.querySelector(anchorWithin) : null;
        origin.set(anchor ?? host);
      }
      index.set(at);
      cancelPendingClear();
      if (typeof document !== 'undefined') {
        document.addEventListener('pointerover', trackPointer, true);
      }
      if (
        typeof document !== 'undefined' &&
        event instanceof PointerEvent &&
        event.pointerType === 'touch'
      ) {
        latched = true;
        document.addEventListener('pointerdown', release, true);
      }
    },
    leave() {
      if (latched) {
        return;
      }
      scheduleClear();
    },
  };
}
