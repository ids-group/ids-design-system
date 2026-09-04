// The colour axis is shared with ds-button (brand/status hue family); icon-button
// keeps its own `variant` as the FILL axis (M3 icon-button vocabulary).
export type { ButtonColor } from '@ids-group-ltd/ids-design-system/components/button';

// Material 3-style icon-button taxonomy — distinct from ds-button's text variants.
//   standard — chromeless tool button (chrome on hover); the default
//   filled   — solid --primary fill (high-emphasis single action)
//   tonal    — --primary-muted tint (medium emphasis)
//   outlined — bordered, transparent fill
export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

export type IconButtonType = 'button' | 'submit' | 'reset';
