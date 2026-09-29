/** A label turned 45 degrees takes this fraction of its width across the axis. 45 is the policy's ceiling. */
const ROTATED_FOOTPRINT = Math.sin(Math.PI / 4);

/** Labels that merely fail to overlap read as one run, so a label's footprint is its width plus
 *  this. 16 sits mid-band of the 12-36 range that keeps the interval decisions stable. */
const LABEL_GAP = 16;

/** The widest label decides for all: thinning on the average still collides on the one long label.
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

/** Asked before thinning: a tilt is spent before a reading.
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
