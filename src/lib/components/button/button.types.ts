// Button has two orthogonal axes:
//   color   — which brand/status hue family (the theme holds full --secondary/
//             --tertiary channel families; statuses are error/success/warning).
//   variant — the fill pattern (solid / tonal / ghost / outline).
// Defaults: color="primary" variant="solid". The old single `variant` enum
// (which conflated colour + fill) is gone — `variant` now means ONLY the fill
// pattern, matching ds-icon-button's `variant` axis. The no-chrome `text` button
// is the global `.link` class on <button>. Icon-only actions → ds-icon-button.
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'error'
  | 'success'
  | 'warning';
export type ButtonVariant = 'solid' | 'tonal' | 'ghost' | 'outline';
// sm/md/lg = 32/40/48, aligned with input, select, dropdown, date-picker and icon-button.
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
