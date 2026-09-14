// `text` coexists with the global `.link` class: use `.link` on bare <a>/<button>;
// use variant="text" for the ds-button API (loading, fullWidth, color, typed) on
// a link look. All color×variant pairs render; some are UX-discouraged and
// dev-warned — see DISCOURAGED_COMBOS in button.component.ts.
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'error'
  | 'success'
  | 'warning';
export type ButtonVariant = 'solid' | 'tonal' | 'ghost' | 'outline' | 'text';
export type ButtonType = 'button' | 'submit' | 'reset';
