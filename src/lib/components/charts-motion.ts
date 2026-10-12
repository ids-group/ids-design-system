import type { AnimationCallbackEvent } from '@angular/core';

// The whole spread of a series' arrival; past it the entrance reads as a queue, not one gesture.
const STAGGER_BUDGET_MS = 260;

/** Entrance delay for the mark at `index` of `count`, in milliseconds: `stepMs` apart, narrowed so
 *  the last mark starts within the budget. `stepMs` of `0` means no stagger.
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

/** Starts a mark's exit, bound as `(animate.leave)="leaveMark($event)"`. The function form, not
 *  `animate.leave="mark-leave"`: the class form calls `getAnimations()` once per leaving mark.
 *
 *  @internal */
export function leaveMark(event: AnimationCallbackEvent): void {
  event.target.classList.add('mark-leave');
}

/** A CSS duration (`300ms`, `0.3s`) in milliseconds; anything unparsable is `0`.
 *
 *  @internal */
export function cssDurationMs(duration: string): number {
  const value = parseFloat(duration);
  if (!Number.isFinite(value)) {
    return 0;
  }

  return duration.trim().endsWith('ms') ? value : value * 1000;
}

/** Eases `apply` from `from` to `to` on the timing `element` inherits (`--ds-motion-chart-<timing>-*`),
 *  for geometry CSS cannot interpolate. A zero duration, as under reduced motion, applies `to` at once.
 *  Returns the cancel; a caller starting the next tween cancels this one and passes what it last applied.
 *
 *  @internal */
export function tweenMarks(
  element: Element,
  from: readonly number[],
  to: readonly number[],
  apply: (values: readonly number[]) => void,
  timing: 'mark' | 'tooltip-move' = 'mark',
): () => void {
  const style = getComputedStyle(element);
  const duration = cssDurationMs(
    style.getPropertyValue(`--ds-motion-chart-${timing}-duration`),
  );
  if (
    duration <= 0 ||
    from.length !== to.length ||
    typeof KeyframeEffect === 'undefined'
  ) {
    apply(to);

    return () => undefined;
  }
  // A target-less effect is only a clock: it eases by the token's own curve, whatever its form.
  const clock = new Animation(
    new KeyframeEffect(null, null, {
      duration,
      easing:
        style.getPropertyValue(`--ds-motion-chart-${timing}-easing`).trim() ||
        'ease',
      fill: 'forwards',
    }),
  );
  let frame = 0;
  const step = (): void => {
    const progress = clock.effect?.getComputedTiming().progress ?? 1;
    apply(
      to.map((value, index) => from[index] + (value - from[index]) * progress),
    );
    if (clock.playState !== 'finished') {
      frame = requestAnimationFrame(step);
    }
  };
  clock.play();
  frame = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(frame);
    clock.cancel();
  };
}
