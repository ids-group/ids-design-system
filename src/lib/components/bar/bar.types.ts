/** Colour role for the fill. */
export type BarVariant = 'default' | 'success' | 'warning' | 'error';

/** What the bar IS, which decides how it is announced.
 *
 *  - `'progress'` — how far a task has got. `role="progressbar"`.
 *  - `'meter'` — a measurement on a known scale: a rate, a score, a count against a ceiling. It
 *    has no beginning and no completion. `role="meter"`.
 *  - `'none'` — drawn only, hidden from assistive technology. For a bar in a table cell whose
 *    figure is printed beside it, where announcing each one repeats what the row already says. */
export type BarSemantics = 'progress' | 'meter' | 'none';
