import type {
  SpacingRow,
  RadiusRow,
  ShadowRow,
  MotionRow,
  SizeRow,
  LayoutRow,
  MiscRow,
} from './tokens-reference.types';

export const SPACING: readonly SpacingRow[] = [
  { name: '--space-0', value: '0', notes: 'Zero — explicit no-gap.' },
  {
    name: '--space-px',
    value: '1px',
    notes: 'Hairline — border-width equivalents.',
  },
  {
    name: '--space-0-5',
    value: '2px',
    notes: 'Hairline insets, icon close button pad.',
  },
  { name: '--space-1', value: '4px', notes: 'Atom-level gap.' },
  {
    name: '--space-1-5',
    value: '6px',
    notes: 'Badge / tag gap, field-label gap.',
  },
  { name: '--space-2', value: '8px', notes: 'Small gap.' },
  { name: '--space-2-5', value: '10px', notes: 'Tooltip pad-x, badge pad-x.' },
  { name: '--space-3', value: '12px', notes: 'Default gap, field pad-x.' },
  { name: '--space-4', value: '16px', notes: 'Card padding, row gap.' },
  { name: '--space-5', value: '20px', notes: 'Medium block separation.' },
  { name: '--space-6', value: '24px', notes: 'Section padding.' },
  { name: '--space-8', value: '32px', notes: 'Group separation.' },
  { name: '--space-10', value: '40px', notes: 'Empty-state padding.' },
  { name: '--space-12', value: '48px', notes: 'Page section spacing.' },
  { name: '--space-14', value: '56px', notes: 'Top bar height token.' },
  {
    name: '--space-16',
    value: '64px',
    notes: 'Empty-state icon size, hero padding.',
  },
  { name: '--space-20', value: '80px', notes: 'Wide page-level gap.' },
  { name: '--space-24', value: '96px', notes: 'Hero gap.' },
  { name: '--space-32', value: '128px', notes: 'Maximum scale step.' },
  {
    name: '--ds-container-pad',
    value: 'var(--space-6)',
    notes:
      'Shared container padding — components default their own --ds-*-pad to this so a single override re-pads card / stat / etc.',
  },
];

export const RADIUS: readonly RadiusRow[] = [
  { name: '--radius-0', value: '0', notes: 'Squared — explicit no-radius.' },
  {
    name: '--radius-sm',
    value: '4px',
    notes: 'kbd, indeterminate-checkbox tick, link focus halo.',
  },
  {
    name: '--radius-md',
    value: '8px',
    notes: 'Buttons, fields, tooltips, search, segmented, tags.',
  },
  {
    name: '--radius-lg',
    value: '12px',
    notes: 'Menus, popovers, cards, modals, drawers, toasts.',
  },
  {
    name: '--radius-xl',
    value: '16px',
    notes: 'Large containers — viewport / scanner frames, hero cards.',
  },
  { name: '--radius-2xl', value: '24px', notes: 'Heroic surfaces — reserved.' },
  {
    name: '--radius-pill-value',
    value: '999px',
    notes: 'Configurable pill — themes can override.',
  },
  {
    name: '--radius-pill',
    value: 'var(--radius-pill-value)',
    notes: 'Pills, avatars, switches, segmented thumb.',
  },
  {
    name: '--radius-flat',
    value: 'var(--radius-0)',
    notes: 'Intentionally squared — btn-group middle, in-range datepicker.',
  },
];

export const SHADOWS: readonly ShadowRow[] = [
  { name: '--shadow-1', alias: '', notes: 'Lowest elevation — cards.' },
  { name: '--shadow-2', alias: '', notes: 'Popovers, dropdowns.' },
  { name: '--shadow-3', alias: '', notes: 'Toasts.' },
  { name: '--shadow-4', alias: '', notes: 'Modals, highest elevation.' },
  {
    name: '--shadow-card',
    alias: 'var(--shadow-1)',
    notes: 'Alias — applied to .card.',
  },
  {
    name: '--shadow-popover',
    alias: 'var(--shadow-2)',
    notes: 'Alias — popovers, dropdowns.',
  },
  {
    name: '--shadow-toast',
    alias: 'var(--shadow-3)',
    notes: 'Alias — toasts.',
  },
  {
    name: '--shadow-modal',
    alias: 'var(--shadow-4)',
    notes: 'Alias — modals.',
  },
  {
    name: '--text-on-media-shadow',
    alias: '',
    notes:
      'Text-legibility drop shadow — pair with --text-on-media over photos / camera feeds.',
  },
  {
    name: '--shadow-tint-h',
    alias: '225',
    notes: 'Shadow hue channel — themable.',
  },
  {
    name: '--shadow-tint-s',
    alias: '39%',
    notes: 'Shadow saturation channel.',
  },
  {
    name: '--shadow-tint-l',
    alias: '7%',
    notes: 'Shadow lightness — flip in dark mode.',
  },
];

export const MOTION_DUR: readonly MotionRow[] = [
  {
    name: '--duration-instant',
    value: '80ms',
    notes: 'Near-instant feedback.',
  },
  {
    name: '--duration-fast',
    value: '120ms',
    notes: 'Quick state changes (hover/focus).',
  },
  { name: '--duration-base', value: '180ms', notes: 'Default transitions.' },
  {
    name: '--duration-slow',
    value: '260ms',
    notes: 'Layout/expand transitions.',
  },
  {
    name: '--duration-slower',
    value: '400ms',
    notes: 'Long enter/exit (modals, drawers).',
  },
  {
    name: '--duration-loop-fast',
    value: '700ms',
    notes: 'Indeterminate spinner rhythm.',
  },
  {
    name: '--duration-loop-slow',
    value: '1400ms',
    notes: 'Skeleton shimmer rhythm.',
  },
];

export const MOTION_EASE: readonly MotionRow[] = [
  {
    name: '--ease-standard',
    value: 'cubic-bezier(.2, 0, 0, 1)',
    notes: 'Default — decelerates into rest.',
  },
  {
    name: '--ease-emphasized',
    value: 'cubic-bezier(.3, 0, .1, 1.4)',
    notes: 'Pick up and put down — overlays.',
  },
  {
    name: '--ease-decelerate',
    value: 'cubic-bezier(0, 0, 0, 1)',
    notes: 'Incoming only — appears.',
  },
  {
    name: '--ease-accelerate',
    value: 'cubic-bezier(.3, 0, 1, 1)',
    notes: 'Outgoing only — leaves.',
  },
  {
    name: '--ease-spring',
    value: 'cubic-bezier(.5, 1.5, .5, 1)',
    notes: 'Playful overshoot — sparingly.',
  },
];

export const DENSITY_HIT: readonly SizeRow[] = [
  {
    name: '--hit-xs',
    value: '24px',
    notes: 'btn-s, datepicker nav, modal close.',
  },
  { name: '--hit-sm', value: '28px', notes: 'segmented btn, stepper node.' },
  {
    name: '--hit-md',
    value: '36px',
    notes: 'search, pagination, tag-input rows.',
  },
  { name: '--hit-min', value: '32px', notes: 'Dense desktop default.' },
  { name: '--hit-cozy', value: '40px', notes: 'Default control height.' },
  { name: '--hit-comfy', value: '44px', notes: 'WCAG minimum for touch.' },
  {
    name: '--hit-touch',
    value: '48px',
    notes: 'Mobile-friendly, floating-label fields.',
  },
];

export const DENSITY_TIERS: readonly {
  name: string;
  value: string;
  notes: string;
}[] = [
  {
    name: 'ultra-compact',
    value: '24px hit',
    notes: 'Power-user tier — keyboard-first, opt-in only.',
  },
  { name: 'compact', value: '32px hit', notes: 'Dense desktop default.' },
  { name: 'cozy', value: '40px hit', notes: 'Default — most products.' },
  { name: 'comfy', value: '48px hit', notes: 'Touch-friendly.' },
];

export const LAYOUT_BP: readonly LayoutRow[] = [
  { name: '--bp-xs', value: '480px', notes: 'Phone landscape.' },
  { name: '--bp-sm', value: '640px', notes: 'Small tablet.' },
  { name: '--bp-md', value: '768px', notes: 'Tablet.' },
  { name: '--bp-lg', value: '1024px', notes: 'Small desktop.' },
  { name: '--bp-2xl', value: '1536px', notes: 'Wide desktop.' },
];

export const LAYOUT_COL: readonly LayoutRow[] = [
  {
    name: '--col-cap-text',
    value: '720px',
    notes: 'Optimal reading column for prose.',
  },
  {
    name: '--col-cap-content',
    value: '1280px',
    notes: 'Maximum content column for app layouts.',
  },
];

export const ICONS: readonly SizeRow[] = [
  { name: '--icon-2xs', value: '10px', notes: 'Status dot, chart legend dot.' },
  { name: '--icon-xs', value: '12px', notes: 'Sort caret, tag close glyph.' },
  {
    name: '--icon-sm',
    value: '14px',
    notes: 'Button icon (small), inline icon.',
  },
  {
    name: '--icon-md',
    value: '16px',
    notes: 'Default button icon, field affix.',
  },
  {
    name: '--icon-lg',
    value: '20px',
    notes: 'Topbar, sidenav, modal header icon.',
  },
];

export const MISC_BW: readonly MiscRow[] = [
  {
    name: '--border-width-default',
    value: '1px',
    renderAs: 'bar',
    notes: 'Every border, divider, field outline.',
  },
  {
    name: '--border-width-strong',
    value: '2px',
    renderAs: 'bar',
    notes: 'Radio dot, slider thumb, tabs underline, dropzone dash.',
  },
];

export const MISC_OPACITY: readonly MiscRow[] = [
  {
    name: '--opacity-disabled',
    value: '0.5',
    renderAs: 'opacity',
    notes: 'Full disabled state on interactive components.',
  },
  {
    name: '--opacity-muted',
    value: '0.6',
    renderAs: 'opacity',
    notes: 'Legacy alias — being phased out.',
  },
  {
    name: '--opacity-text-disabled',
    value: '0.38',
    renderAs: 'opacity',
    notes: 'Disabled text where colour token unavailable.',
  },
  {
    name: '--opacity-scrim',
    value: '0.55',
    renderAs: 'opacity',
    notes: 'Modal/drawer backdrop overlay.',
  },
  {
    name: '--opacity-state-hover',
    value: '0.08',
    renderAs: 'opacity',
    notes: 'Hover layer over surface.',
  },
  {
    name: '--opacity-state-pressed',
    value: '0.16',
    renderAs: 'opacity',
    notes: 'Active/pressed layer.',
  },
];

export const MISC_BLUR: readonly MiscRow[] = [
  {
    name: '--blur-sm',
    value: '4px',
    renderAs: 'literal',
    notes: 'Subtle backdrop blur.',
  },
  {
    name: '--blur-md',
    value: '8px',
    renderAs: 'literal',
    notes: 'Stronger backdrop blur — modals, drawers.',
  },
];
