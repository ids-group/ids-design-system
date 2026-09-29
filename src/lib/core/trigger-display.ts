/**
 * What a picker's trigger shows.
 *
 * `full` is the control's own display: chips, or the selected value.
 *
 * `count` is a caption and a selected-count badge at intrinsic width, for a filter toolbar
 * where a field that grows with the selection does not fit. `labels` has the same footprint but
 * names what is selected, cut to what the trigger is wide enough for, with the rest behind "+N".
 *
 * Only pickers that hold several values offer the other two.
 */
export type DsTriggerDisplay = 'full' | 'count' | 'labels';
