import { DestroyRef, Signal, inject, signal } from '@angular/core';

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

  const clear = (): void => {
    latched = false;
    index.set(-1);
    origin.set(null);
    document.removeEventListener('pointerdown', release, true);
  };

  const release = (event: PointerEvent): void => {
    const mark = origin();
    if (mark && event.target instanceof Node && mark.contains(event.target)) {
      return;
    }
    clear();
  };

  if (typeof document !== 'undefined') {
    inject(DestroyRef).onDestroy(() =>
      document.removeEventListener('pointerdown', release, true),
    );
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
      index.set(-1);
      origin.set(null);
    },
  };
}
