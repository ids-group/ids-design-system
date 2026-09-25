import type { AnimationCallbackEvent } from '@angular/core';

// The whole spread of a series' arrival. Past it the entrance stops reading as one gesture and
// starts reading as a queue.
const STAGGER_BUDGET_MS = 260;

/** Entrance delay for the mark at `index` of `count`, in milliseconds: `stepMs` apart, narrowed so
 *  the last mark starts within the budget. Spread evenly rather than capped, so a long series still
 *  arrives in order instead of landing all at once past the cap. `stepMs` of `0` means no stagger.
 *
 *  @internal */
export function staggerDelay(
  index: number,
  count: number,
  stepMs: number,
): number {
  if (!(stepMs > 0) || !Number.isFinite(index) || index <= 0 || count <= 1) {
    return 0;
  }

  return index * Math.min(stepMs, STAGGER_BUDGET_MS / (count - 1));
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
