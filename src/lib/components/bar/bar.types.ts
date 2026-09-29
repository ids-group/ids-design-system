/** Colour role for the fill. */
export type BarVariant = 'default' | 'success' | 'warning' | 'error';

/** What the bar IS, which decides how it is announced.
 *
 *  - `'progress'`: how far a task has got. `role="progressbar"`.
 *  - `'meter'`: a measurement on a known scale, with no beginning or completion. `role="meter"`.
 *  - `'none'`: drawn only, hidden from assistive technology. For a bar whose figure is printed
 *    beside it. */
export type BarSemantics = 'progress' | 'meter' | 'none';
