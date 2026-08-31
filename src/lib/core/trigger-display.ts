/**
 * What a picker's trigger shows.
 *
 * `full` is the control's own display — chips, or the selected value. `compact`
 * replaces it with a caption and a selected-count badge at intrinsic width, for
 * a filter toolbar where a field that grows with the selection does not fit.
 *
 * Only pickers that hold several values offer `compact`: a single-value control
 * has nothing to count, and its `full` trigger is already the caption plus the
 * value.
 */
export type DsTriggerDisplay = 'full' | 'compact';
