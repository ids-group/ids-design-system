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
