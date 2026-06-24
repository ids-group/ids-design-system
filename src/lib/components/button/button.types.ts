// Material 3 canonical naming. `outline` is the bordered neutral low-emphasis
// button (replaced the old `ghost`). `error`/`success`/`warning` are status
// fills (error was `danger`). `text` is the no-chrome text button (was `link`).
// Icon-only actions live in the dedicated ds-icon-button.
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'error'
  | 'success'
  | 'warning'
  | 'text';
// sm/md/lg = 32/40/48, aligned with input, select, dropdown, date-picker and icon-button.
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
