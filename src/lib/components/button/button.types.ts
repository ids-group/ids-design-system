// `text` coexists with the global `.link` class: `.link` on bare <a>/<button>, variant="text"
// where the ds-button API (loading, fullWidth, color) is needed. Some color×variant pairs are dev-warned.
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

export type ButtonAlign = 'center' | 'between';

export type ButtonLoadingMode = 'auto' | 'icon' | 'replace';
