// Material 3-style icon-button taxonomy — distinct from ds-button's text variants.
//   standard — chromeless tool button (chrome on hover); the default
//   filled   — solid --primary fill (high-emphasis single action)
//   tonal    — --primary-muted tint (medium emphasis)
//   outlined — bordered, transparent fill
export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

// Heights align with the field / button scale: sm 32, md 40, lg 48.
export type IconButtonSize = 'sm' | 'md' | 'lg';

export type IconButtonType = 'button' | 'submit' | 'reset';
