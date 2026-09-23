import type { AnimationCallbackEvent } from '@angular/core';

// Past this the entrance stops reading as one gesture and starts reading as a queue: at 40ms a
// 100-mark series would otherwise take four seconds to finish arriving.
const STAGGER_CAP_MS = 300;

/** Entrance delay for the mark at `index`, in milliseconds. `stepMs` of `0` is the default and
 *  means no stagger at all.
 *
 *  @internal */
export function staggerDelay(index: number, stepMs: number): number {
  if (!(stepMs > 0) || !Number.isFinite(index) || index <= 0) {
    return 0;
  }

  return Math.min(index * stepMs, STAGGER_CAP_MS);
}

/** Starts a mark's exit, bound as `(animate.leave)="leaveMark($event)"`: `_chart-motion.scss`
 *  animates `.mark-leave`, and Angular removes the mark on its `animationend`. The function form,
 *  not `animate.leave="mark-leave"`: the class form calls `getAnimations()` once per leaving mark,
 *  and in Chrome that call costs more the more animations are running.
 *
 *  @internal */
export function leaveMark(event: AnimationCallbackEvent): void {
  event.target.classList.add('mark-leave');
}
