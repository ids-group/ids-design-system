/** A label turned 45 degrees takes this fraction of its width across the axis. Past 45 the label
 *  stops being scannable - the eye has to tilt rather than glance - so that is the rotation the
 *  policy stops at, and thinning takes over from there. */
const ROTATED_FOOTPRINT = Math.sin(Math.PI / 4);

/** Clear space demanded between two labels, in the same units their widths are measured in. Two
 *  labels that merely fail to overlap still read as one run of text, so a label's footprint is its
 *  width PLUS this - which is why 90 units of label does not fit a 100 unit step. 16 is
 *  `--space-4`, and it sits in the middle of the 12-36 band every case in the suite allows, so a
 *  later nudge does not flip an interval. */
const LABEL_GAP = 16;

/** Draw every label, every second one, every third - whatever it takes for the widest to fit the
 *  step between two of them.
 *
 *  The WIDEST decides for all of them: an axis that thins on the average still collides on the one
 *  long month name, and a reader meets the collision rather than the average. Rotation is tried
 *  before thinning because it costs the reader a tilt, where thinning costs them a reading.
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

/** Whether turning the labels would let every one of them be drawn. Asked before thinning, so the
 *  axis spends a tilt before it spends a reading.
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
