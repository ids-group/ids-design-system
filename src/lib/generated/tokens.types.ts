/* eslint-disable */
// =============================================================
// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Sources:
//   ds/src/lib/themes/_theme-default.scss  (Tier 1 palette)
//   ds/src/lib/styles/_tokens.scss         (Tier 2 semantic + Tier 3 component)
// Regenerate: npm run sync:tokens (from prototype/)
//
// This file is the single source of truth for token *names* in TS.
// Each exported union literal type lists the valid suffixes for a
// token category, and the companion const maps each suffix to its
// full CSS custom-property name. Editing this file by hand will
// be overwritten the next time the sync script runs.
// =============================================================

export type NeutralToken = '0' | '50' | '100' | '150' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';

export const NEUTRAL_TOKENS: Readonly<Record<NeutralToken, string>> = {
  '0': '--neutral-0',
  '50': '--neutral-50',
  '100': '--neutral-100',
  '150': '--neutral-150',
  '200': '--neutral-200',
  '300': '--neutral-300',
  '400': '--neutral-400',
  '500': '--neutral-500',
  '600': '--neutral-600',
  '700': '--neutral-700',
  '800': '--neutral-800',
  '900': '--neutral-900',
  '950': '--neutral-950',
};

export type VioletToken = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export const VIOLET_TOKENS: Readonly<Record<VioletToken, string>> = {
  '50': '--violet-50',
  '100': '--violet-100',
  '200': '--violet-200',
  '300': '--violet-300',
  '400': '--violet-400',
  '500': '--violet-500',
  '600': '--violet-600',
  '700': '--violet-700',
  '800': '--violet-800',
  '900': '--violet-900',
};

export type OrangeToken = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';

export const ORANGE_TOKENS: Readonly<Record<OrangeToken, string>> = {
  '50': '--orange-50',
  '100': '--orange-100',
  '200': '--orange-200',
  '300': '--orange-300',
  '400': '--orange-400',
  '500': '--orange-500',
  '600': '--orange-600',
  '700': '--orange-700',
  '800': '--orange-800',
};

export type GreenToken = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700';

export const GREEN_TOKENS: Readonly<Record<GreenToken, string>> = {
  '50': '--green-50',
  '100': '--green-100',
  '200': '--green-200',
  '300': '--green-300',
  '400': '--green-400',
  '500': '--green-500',
  '600': '--green-600',
  '700': '--green-700',
};

export type YellowToken = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700';

export const YELLOW_TOKENS: Readonly<Record<YellowToken, string>> = {
  '50': '--yellow-50',
  '100': '--yellow-100',
  '200': '--yellow-200',
  '300': '--yellow-300',
  '400': '--yellow-400',
  '500': '--yellow-500',
  '600': '--yellow-600',
  '700': '--yellow-700',
};

export type RedToken = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700';

export const RED_TOKENS: Readonly<Record<RedToken, string>> = {
  '50': '--red-50',
  '100': '--red-100',
  '200': '--red-200',
  '300': '--red-300',
  '400': '--red-400',
  '500': '--red-500',
  '600': '--red-600',
  '700': '--red-700',
};

export type BlueToken = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700';

export const BLUE_TOKENS: Readonly<Record<BlueToken, string>> = {
  '50': '--blue-50',
  '100': '--blue-100',
  '200': '--blue-200',
  '300': '--blue-300',
  '400': '--blue-400',
  '500': '--blue-500',
  '600': '--blue-600',
  '700': '--blue-700',
};

export type BrandChannelToken = 'brand-h' | 'brand-s' | 'brand-l' | 'danger-h' | 'danger-s' | 'danger-l';

export const BRAND_CHANNEL_TOKENS: Readonly<Record<BrandChannelToken, string>> = {
  'brand-h': '--brand-h',
  'brand-s': '--brand-s',
  'brand-l': '--brand-l',
  'danger-h': '--danger-h',
  'danger-s': '--danger-s',
  'danger-l': '--danger-l',
};

export type SurfaceToken = 'canvas' | 'default' | 'secondary' | 'overlay' | 'inverted' | 'inverted-hover' | 'tint' | 'disabled' | 'muted' | 'scrim';

export const SURFACE_TOKENS: Readonly<Record<SurfaceToken, string>> = {
  'canvas': '--surface-canvas',
  'default': '--surface-default',
  'secondary': '--surface-secondary',
  'overlay': '--surface-overlay',
  'inverted': '--surface-inverted',
  'inverted-hover': '--surface-inverted-hover',
  'tint': '--surface-tint',
  'disabled': '--surface-disabled',
  'muted': '--surface-muted',
  'scrim': '--surface-scrim',
};

export type BorderToken = 'default' | 'strong' | 'subtle' | 'divider' | 'inverted' | 'disabled';

export const BORDER_TOKENS: Readonly<Record<BorderToken, string>> = {
  'default': '--border-default',
  'strong': '--border-strong',
  'subtle': '--border-subtle',
  'divider': '--border-divider',
  'inverted': '--border-inverted',
  'disabled': '--border-disabled',
};

export type TextToken = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'disabled' | 'inverted' | 'link' | 'on-brand' | 'on-success' | 'on-error';

export const TEXT_TOKENS: Readonly<Record<TextToken, string>> = {
  'primary': '--text-primary',
  'secondary': '--text-secondary',
  'tertiary': '--text-tertiary',
  'muted': '--text-muted',
  'disabled': '--text-disabled',
  'inverted': '--text-inverted',
  'link': '--text-link',
  'on-brand': '--text-on-brand',
  'on-success': '--text-on-success',
  'on-error': '--text-on-error',
};

export type IconRoleToken = 'default' | 'strong' | 'muted' | 'on-brand';

export const ICON_ROLE_TOKENS: Readonly<Record<IconRoleToken, string>> = {
  'default': '--icon-default',
  'strong': '--icon-strong',
  'muted': '--icon-muted',
  'on-brand': '--icon-on-brand',
};

export type BrandToken = 'brand' | 'brand-hover' | 'brand-pressed' | 'brand-selected-hover' | 'brand-subtle' | 'brand-muted' | 'brand-muted-strong' | 'brand-strong' | 'brand-on';

export const BRAND_TOKENS: Readonly<Record<BrandToken, string>> = {
  'brand': '--brand',
  'brand-hover': '--brand-hover',
  'brand-pressed': '--brand-pressed',
  'brand-selected-hover': '--brand-selected-hover',
  'brand-subtle': '--brand-subtle',
  'brand-muted': '--brand-muted',
  'brand-muted-strong': '--brand-muted-strong',
  'brand-strong': '--brand-strong',
  'brand-on': '--brand-on',
};

export type SecondaryToken = 'secondary' | 'secondary-hover' | 'secondary-pressed' | 'secondary-strong' | 'secondary-subtle' | 'secondary-muted' | 'secondary-on' | 'secondary-h' | 'secondary-s' | 'secondary-l';

export const SECONDARY_TOKENS: Readonly<Record<SecondaryToken, string>> = {
  'secondary': '--secondary',
  'secondary-hover': '--secondary-hover',
  'secondary-pressed': '--secondary-pressed',
  'secondary-strong': '--secondary-strong',
  'secondary-subtle': '--secondary-subtle',
  'secondary-muted': '--secondary-muted',
  'secondary-on': '--secondary-on',
  'secondary-h': '--secondary-h',
  'secondary-s': '--secondary-s',
  'secondary-l': '--secondary-l',
};

export type StatusToken = 'planning-bg' | 'planning-fg' | 'confirmed-bg' | 'confirmed-fg' | 'active-bg' | 'active-fg' | 'completed-bg' | 'completed-fg' | 'dot-size';

export const STATUS_TOKENS: Readonly<Record<StatusToken, string>> = {
  'planning-bg': '--status-planning-bg',
  'planning-fg': '--status-planning-fg',
  'confirmed-bg': '--status-confirmed-bg',
  'confirmed-fg': '--status-confirmed-fg',
  'active-bg': '--status-active-bg',
  'active-fg': '--status-active-fg',
  'completed-bg': '--status-completed-bg',
  'completed-fg': '--status-completed-fg',
  'dot-size': '--status-dot-size',
};

export type SuccessToken = 'success' | 'success-hover' | 'success-subtle' | 'success-muted' | 'success-border' | 'success-text';

export const SUCCESS_TOKENS: Readonly<Record<SuccessToken, string>> = {
  'success': '--success',
  'success-hover': '--success-hover',
  'success-subtle': '--success-subtle',
  'success-muted': '--success-muted',
  'success-border': '--success-border',
  'success-text': '--success-text',
};

export type WarningToken = 'warning' | 'warning-hover' | 'warning-subtle' | 'warning-muted' | 'warning-border' | 'warning-text';

export const WARNING_TOKENS: Readonly<Record<WarningToken, string>> = {
  'warning': '--warning',
  'warning-hover': '--warning-hover',
  'warning-subtle': '--warning-subtle',
  'warning-muted': '--warning-muted',
  'warning-border': '--warning-border',
  'warning-text': '--warning-text',
};

export type DangerToken = 'danger' | 'danger-hover' | 'danger-pressed' | 'danger-subtle' | 'danger-muted' | 'danger-border' | 'danger-text';

export const DANGER_TOKENS: Readonly<Record<DangerToken, string>> = {
  'danger': '--danger',
  'danger-hover': '--danger-hover',
  'danger-pressed': '--danger-pressed',
  'danger-subtle': '--danger-subtle',
  'danger-muted': '--danger-muted',
  'danger-border': '--danger-border',
  'danger-text': '--danger-text',
};

export type InfoToken = 'info' | 'info-hover' | 'info-subtle' | 'info-muted' | 'info-border' | 'info-text';

export const INFO_TOKENS: Readonly<Record<InfoToken, string>> = {
  'info': '--info',
  'info-hover': '--info-hover',
  'info-subtle': '--info-subtle',
  'info-muted': '--info-muted',
  'info-border': '--info-border',
  'info-text': '--info-text',
};

export type FocusToken = 'ring-inner' | 'ring-outer-h' | 'ring-outer-s' | 'ring-outer-l' | 'ring-outer-alpha' | 'ring' | 'ring-inverted' | 'ring-danger' | 'field-alpha' | 'field' | 'field-error';

export const FOCUS_TOKENS: Readonly<Record<FocusToken, string>> = {
  'ring-inner': '--focus-ring-inner',
  'ring-outer-h': '--focus-ring-outer-h',
  'ring-outer-s': '--focus-ring-outer-s',
  'ring-outer-l': '--focus-ring-outer-l',
  'ring-outer-alpha': '--focus-ring-outer-alpha',
  'ring': '--focus-ring',
  'ring-inverted': '--focus-ring-inverted',
  'ring-danger': '--focus-ring-danger',
  'field-alpha': '--focus-field-alpha',
  'field': '--focus-field',
  'field-error': '--focus-field-error',
};

export type LinkToken = 'visited';

export const LINK_TOKENS: Readonly<Record<LinkToken, string>> = {
  'visited': '--link-visited',
};

export type SpacingToken = '0' | 'px' | '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '14' | '16' | '20' | '24' | '32';

export const SPACING_TOKENS: Readonly<Record<SpacingToken, string>> = {
  '0': '--s-0',
  'px': '--s-px',
  '0-5': '--s-0-5',
  '1': '--s-1',
  '1-5': '--s-1-5',
  '2': '--s-2',
  '2-5': '--s-2-5',
  '3': '--s-3',
  '4': '--s-4',
  '5': '--s-5',
  '6': '--s-6',
  '8': '--s-8',
  '10': '--s-10',
  '12': '--s-12',
  '14': '--s-14',
  '16': '--s-16',
  '20': '--s-20',
  '24': '--s-24',
  '32': '--s-32',
};

export type RadiusToken = '0' | 'sm' | 'md' | 'lg' | '2xl' | 'pill-value' | 'pill' | 'flat';

export const RADIUS_TOKENS: Readonly<Record<RadiusToken, string>> = {
  '0': '--r-0',
  'sm': '--r-sm',
  'md': '--r-md',
  'lg': '--r-lg',
  '2xl': '--r-2xl',
  'pill-value': '--r-pill-value',
  'pill': '--r-pill',
  'flat': '--r-flat',
};

export type IconSizeToken = '2xs' | 'xs' | 'sm' | 'md' | 'lg';

export const ICON_SIZE_TOKENS: Readonly<Record<IconSizeToken, string>> = {
  '2xs': '--icon-2xs',
  'xs': '--icon-xs',
  'sm': '--icon-sm',
  'md': '--icon-md',
  'lg': '--icon-lg',
};

export type ElevationToken = 'shadow-tint-h' | 'shadow-tint-s' | 'shadow-tint-l' | 'z100' | 'z200' | 'z300' | 'z400' | 'shadow-popover' | 'shadow-modal' | 'shadow-toast' | 'shadow-card';

export const ELEVATION_TOKENS: Readonly<Record<ElevationToken, string>> = {
  'shadow-tint-h': '--shadow-tint-h',
  'shadow-tint-s': '--shadow-tint-s',
  'shadow-tint-l': '--shadow-tint-l',
  'z100': '--z100',
  'z200': '--z200',
  'z300': '--z300',
  'z400': '--z400',
  'shadow-popover': '--shadow-popover',
  'shadow-modal': '--shadow-modal',
  'shadow-toast': '--shadow-toast',
  'shadow-card': '--shadow-card',
};

export type MotionDurationToken = 'instant' | 'fast' | 'base' | 'slow' | 'slower' | 'loop-fast' | 'loop-slow';

export const MOTION_DURATION_TOKENS: Readonly<Record<MotionDurationToken, string>> = {
  'instant': '--dur-instant',
  'fast': '--dur-fast',
  'base': '--dur-base',
  'slow': '--dur-slow',
  'slower': '--dur-slower',
  'loop-fast': '--dur-loop-fast',
  'loop-slow': '--dur-loop-slow',
};

export type MotionEasingToken = 'standard' | 'emphasized' | 'decelerate' | 'accelerate' | 'spring';

export const MOTION_EASING_TOKENS: Readonly<Record<MotionEasingToken, string>> = {
  'standard': '--ease-standard',
  'emphasized': '--ease-emphasized',
  'decelerate': '--ease-decelerate',
  'accelerate': '--ease-accelerate',
  'spring': '--ease-spring',
};

export type BreakpointToken = 'xs' | 'sm' | 'md' | 'lg' | '2xl';

export const BREAKPOINT_TOKENS: Readonly<Record<BreakpointToken, string>> = {
  'xs': '--bp-xs',
  'sm': '--bp-sm',
  'md': '--bp-md',
  'lg': '--bp-lg',
  '2xl': '--bp-2xl',
};

export type HitTargetToken = 'xs' | 'sm' | 'md' | 'min' | 'cozy' | 'comfy' | 'touch';

export const HIT_TARGET_TOKENS: Readonly<Record<HitTargetToken, string>> = {
  'xs': '--hit-xs',
  'sm': '--hit-sm',
  'md': '--hit-md',
  'min': '--hit-min',
  'cozy': '--hit-cozy',
  'comfy': '--hit-comfy',
  'touch': '--hit-touch',
};

export type OpacityToken = 'disabled' | 'muted' | 'text-disabled' | 'scrim' | 'state-hover' | 'state-pressed';

export const OPACITY_TOKENS: Readonly<Record<OpacityToken, string>> = {
  'disabled': '--opacity-disabled',
  'muted': '--opacity-muted',
  'text-disabled': '--opacity-text-disabled',
  'scrim': '--opacity-scrim',
  'state-hover': '--opacity-state-hover',
  'state-pressed': '--opacity-state-pressed',
};

export type BorderWidthToken = 'default' | 'strong';

export const BORDER_WIDTH_TOKENS: Readonly<Record<BorderWidthToken, string>> = {
  'default': '--bw-default',
  'strong': '--bw-strong',
};

export type BlurToken = 'sm' | 'md';

export const BLUR_TOKENS: Readonly<Record<BlurToken, string>> = {
  'sm': '--blur-sm',
  'md': '--blur-md',
};

export type LayerToken = 'base' | 'raised' | 'sticky' | 'dropdown' | 'overlay' | 'drawer' | 'modal' | 'popover' | 'toast' | 'tooltip';

export const LAYER_TOKENS: Readonly<Record<LayerToken, string>> = {
  'base': '--layer-base',
  'raised': '--layer-raised',
  'sticky': '--layer-sticky',
  'dropdown': '--layer-dropdown',
  'overlay': '--layer-overlay',
  'drawer': '--layer-drawer',
  'modal': '--layer-modal',
  'popover': '--layer-popover',
  'toast': '--layer-toast',
  'tooltip': '--layer-tooltip',
};

export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export const FONT_WEIGHT_TOKENS: Readonly<Record<FontWeightToken, string>> = {
  'regular': '--fw-regular',
  'medium': '--fw-medium',
  'semibold': '--fw-semibold',
  'bold': '--fw-bold',
  'extrabold': '--fw-extrabold',
};

export type FontSizeToken = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h5-strong' | 'l' | 'm' | 's' | 'xs' | '2xs' | '3xs' | '4xs' | 'mono';

export const FONT_SIZE_TOKENS: Readonly<Record<FontSizeToken, string>> = {
  'display': '--fs-display',
  'h1': '--fs-h1',
  'h2': '--fs-h2',
  'h3': '--fs-h3',
  'h4': '--fs-h4',
  'h5': '--fs-h5',
  'h5-strong': '--fs-h5-strong',
  'l': '--fs-l',
  'm': '--fs-m',
  's': '--fs-s',
  'xs': '--fs-xs',
  '2xs': '--fs-2xs',
  '3xs': '--fs-3xs',
  '4xs': '--fs-4xs',
  'mono': '--fs-mono',
};

export type LineHeightToken = 'tight' | 'snug' | 'base' | 'loose' | 'flat';

export const LINE_HEIGHT_TOKENS: Readonly<Record<LineHeightToken, string>> = {
  'tight': '--lh-tight',
  'snug': '--lh-snug',
  'base': '--lh-base',
  'loose': '--lh-loose',
  'flat': '--lh-flat',
};

export type LetterSpacingToken = 'tight' | 'snug' | 'normal' | 'wide' | 'wider';

export const LETTER_SPACING_TOKENS: Readonly<Record<LetterSpacingToken, string>> = {
  'tight': '--ls-tight',
  'snug': '--ls-snug',
  'normal': '--ls-normal',
  'wide': '--ls-wide',
  'wider': '--ls-wider',
};
