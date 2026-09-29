/**
 * What a picker's trigger shows.
 *
 * `full` is the control's own display: chips, or the selected value.
 *
 * `count` is a caption and a selected-count badge at intrinsic width, for a filter toolbar.
 * `labels` has the same footprint but names the selection, cut to what fits, the rest behind "+N".
 *
 * Only pickers that hold several values offer the other two.
 */
export type DsTriggerDisplay = 'full' | 'count' | 'labels';
