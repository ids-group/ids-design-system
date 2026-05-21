export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success' | 'warning' | 'link';
// Legacy tier: s/m/l (24/32/40). Canonical tier: sm/md/lg (32/40/48 — aligned with
// input, select, dropdown, date-picker). Prefer sm/md/lg in new code.
export type ButtonSize = 's' | 'm' | 'l' | 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';
