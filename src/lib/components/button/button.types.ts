// Material 3 canonical naming. `ghost` and `outline` are both bordered neutral
// text buttons (kept as distinct names for call-site intent). `error`/`success`/
// `warning` are status fills (error was `danger`). `text` is the no-chrome text
// button (was `link`). Icon-only actions live in the dedicated ds-icon-button.
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'error' | 'success' | 'warning' | 'text';
// Legacy tier: s/m/l (24/32/40). Canonical tier: sm/md/lg (32/40/48 — aligned with
// input, select, dropdown, date-picker). Prefer sm/md/lg in new code.
export type ButtonSize = 's' | 'm' | 'l' | 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
