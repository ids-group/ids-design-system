// Button has two orthogonal axes:
//   color — which brand/status hue family (the theme holds full --secondary/
//           --tertiary channel families; statuses are error/success/warning).
//   fill  — the fill pattern (solid / tonal / ghost / outline).
// Defaults: color="primary" fill="solid". The old single `variant` enum (which
// conflated the two) is removed; the no-chrome `text` button is now the global
// `.link` class on <button>. Icon-only actions live in ds-icon-button.
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'error'
  | 'success'
  | 'warning';
export type ButtonFill = 'solid' | 'tonal' | 'ghost' | 'outline';
// sm/md/lg = 32/40/48, aligned with input, select, dropdown, date-picker and icon-button.
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
