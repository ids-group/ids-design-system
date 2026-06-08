// Material 3 canonical naming. `ghost` and `outline` both kept (they differ in
// iconOnly mode: ghost is chromeless, outline keeps its border). `error`/`success`/
// `warning` are status fills (error was `danger`). `text` is the no-chrome text button (was `link`).
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'error' | 'success' | 'warning' | 'text';
// Legacy tier: s/m/l (24/32/40). Canonical tier: sm/md/lg (32/40/48 — aligned with
// input, select, dropdown, date-picker). Prefer sm/md/lg in new code.
export type ButtonSize = 's' | 'm' | 'l' | 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
