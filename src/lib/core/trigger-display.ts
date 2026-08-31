/**
 * What a picker's trigger shows.
 *
 * `full` is the control's own display — chips, or the selected value.
 *
 * `count` is a caption and a selected-count badge at intrinsic width, for a filter
 * toolbar where a field that grows with the selection does not fit. `labels` is the
 * same footprint but names what is selected instead of counting it, cut to what the
 * trigger is wide enough for, with the rest behind "+N" — the same measurement the
 * chips already use.
 *
 * Only pickers that hold several values offer the other two: a single-value control
 * has nothing to count and nothing to list, and its `full` trigger is already the
 * caption plus the value.
 */
export type DsTriggerDisplay = 'full' | 'count' | 'labels';
