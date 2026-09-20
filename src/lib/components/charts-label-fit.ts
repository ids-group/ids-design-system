/** A label turned 45 degrees takes this fraction of its width across the axis. 45 is where the
 *  policy stops: past it the eye has to tilt rather than glance. */
const ROTATED_FOOTPRINT = Math.sin(Math.PI / 4);

/** Two labels that merely fail to overlap still read as one run of text, so a label's footprint is
 *  its width PLUS this. 16 sits in the middle of the 12-36 band the probe's cases allow, so a later
 *  nudge does not flip an interval. */
const LABEL_GAP = 16;

/** The WIDEST label decides for all of them: an axis that thins on the average still collides on
 *  the one long month name, and a reader meets the collision rather than the average.
 *
 *  @internal */
export function labelInterval(
  labelWidths: readonly number[],
  step: number,
  rotated: boolean,
): number {
  const usable = labelWidths.filter((width) => Number.isFinite(width));
  if (usable.length === 0 || !Number.isFinite(step) || step <= 0) {
    return 1;
  }
  const widest = usable.reduce((max, width) => Math.max(max, width), 0);
  const footprint = (rotated ? widest * ROTATED_FOOTPRINT : widest) + LABEL_GAP;

  return Math.max(1, Math.ceil(footprint / step));
}

/** Asked before thinning, so the axis spends a tilt before it spends a reading.
 *
 *  @internal */
export function rotationWouldFit(
  labelWidths: readonly number[],
  step: number,
): boolean {
  return (
    labelInterval(labelWidths, step, false) > 1 &&
    labelInterval(labelWidths, step, true) === 1
  );
}
