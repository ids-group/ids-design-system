// Button has two orthogonal axes:
//   color   — which brand/status hue family (the theme holds full --secondary/
//             --tertiary channel families; statuses are error/success/warning).
//   variant — the fill pattern: solid / tonal / ghost / outline, plus `text`
//             (no chrome, underlined — a link-styled button). Matches
//             ds-icon-button's `variant` axis. `text` coexists with the global
//             `.link` class (use `.link` on bare <a>/<button> outside the
//             component; use variant="text" when you want the ds-button API —
//             loading, fullWidth, color, typed (pressed) — on a link look).
// Defaults: color="primary" variant="solid". Icon-only actions → ds-icon-button.
//
// All color × variant pairs RENDER. A few are UX-discouraged (they work, but
// read poorly) — flagged with a dev-mode console.warn:
//   neutral + solid          → a solid grey button reads as disabled
//   success + ghost/outline  → low-emphasis success rarely warrants an action
//   warning + ghost/outline  → yellow at low emphasis is too low-contrast
// Prefer solid/tonal for success & warning, and tonal/ghost/outline for neutral.
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'error'
  | 'success'
  | 'warning';
export type ButtonVariant = 'solid' | 'tonal' | 'ghost' | 'outline' | 'text';
// sm/md/lg = 32/40/48, aligned with input, select, dropdown, date-picker and icon-button.
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
