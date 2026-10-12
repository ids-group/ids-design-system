import type { AnimationCallbackEvent, NgZone } from '@angular/core';

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

// A CSS duration (`300ms`, `0.3s`) in milliseconds; anything unparsable is `0`.
function cssDurationMs(duration: string): number {
  const value = parseFloat(duration);
  if (!Number.isFinite(value)) {
    return 0;
  }

  return duration.trim().endsWith('ms') ? value : value * 1000;
}

type ChartTimingName = 'mark' | 'mark-grow' | 'state' | 'tooltip-move';

/** The duration and easing `element` inherits from `--ds-motion-chart-<timing>-*`, or `null` when the
 *  duration is zero, as under reduced motion.
 *
 *  @internal */
export function chartTiming(
  element: Element,
  timing: ChartTimingName,
): { duration: number; easing: string } | null {
  const style = getComputedStyle(element);
  const duration = cssDurationMs(
    style.getPropertyValue(`--ds-motion-chart-${timing}-duration`),
  );
  if (duration <= 0) {
    return null;
  }

  return {
    duration,
    easing:
      style.getPropertyValue(`--ds-motion-chart-${timing}-easing`).trim() ||
      'ease',
  };
}

/** Eases `apply` from `from` to `to` on the timing `element` inherits (`--ds-motion-chart-<timing>-*`),
 *  for geometry CSS cannot interpolate. A zero duration, as under reduced motion, applies `to` at once.
 *  `onDone` runs after the last apply, inside this call when there is no motion. Returns the cancel;
 *  a caller starting the next tween cancels this one and passes what it last applied.
 *
 *  Frames run in whatever zone the call runs in: call it outside Angular's zone, or every frame is
 *  an application tick.
 *
 *  @internal */
export function tweenMarks(
  element: Element,
  from: readonly number[],
  to: readonly number[],
  apply: (values: readonly number[]) => void,
  timing: ChartTimingName = 'mark',
  onDone: () => void = () => undefined,
): () => void {
  const eased = chartTiming(element, timing);
  if (
    !eased ||
    from.length !== to.length ||
    typeof KeyframeEffect === 'undefined'
  ) {
    apply(to);
    onDone();

    return () => undefined;
  }
  // A target-less effect is only a clock: it eases by the token's own curve, whatever its form.
  const clock = new Animation(
    new KeyframeEffect(null, null, { ...eased, fill: 'forwards' }),
  );
  let frame = 0;
  const step = (): void => {
    const progress = clock.effect?.getComputedTiming().progress ?? 1;
    apply(
      to.map((value, index) => from[index] + (value - from[index]) * progress),
    );
    if (clock.playState !== 'finished') {
      frame = requestAnimationFrame(step);

      return;
    }
    onDone();
  };
  clock.play();
  frame = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(frame);
    clock.cancel();
  };
}

/** Runs `run` two frames from now, outside Angular's zone; returns the cancel.
 *
 *  @internal */
export function afterTwoFrames(zone: NgZone, run: () => void): () => void {
  let first = 0;
  let second = 0;
  // Outside the zone: under zone.js each frame callback is a full application tick.
  zone.runOutsideAngular(() => {
    first = requestAnimationFrame(() => {
      second = requestAnimationFrame(run);
    });
  });

  return () => {
    cancelAnimationFrame(first);
    cancelAnimationFrame(second);
  };
}
