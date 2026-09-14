import { Signal, signal } from '@angular/core';

export interface ChartActiveMark {
  /** Index of the mark under the pointer or holding focus; `-1` when none is. */
  readonly index: Signal<number>;
  /** The mark's own element, which is what the tooltip anchors to. */
  readonly origin: Signal<Element | null>;
  enter(index: number, event: Event): void;
  leave(): void;
}

/**
 * The pointer-and-focus target the tooltip reads, for a chart whose marks are elements.
 * Pointer and keyboard write the same pair, so a chart wires `pointerenter` and `focus`
 * to `enter` and gets one code path rather than two.
 *
 * @internal
 */
export function chartActiveMark(): ChartActiveMark {
  const index = signal(-1);
  const origin = signal<Element | null>(null);

  return {
    index: index.asReadonly(),
    origin: origin.asReadonly(),
    enter(at, event) {
      if (event.currentTarget instanceof Element) {
        origin.set(event.currentTarget);
      }
      index.set(at);
    },
    leave() {
      index.set(-1);
      origin.set(null);
    },
  };
}
