import { Component, ViewEncapsulation } from '@angular/core';

interface ColourRow { name: string; value: string; notes: string; inverted?: boolean; }
interface RampSpec { label: string; prefix: string; stops: readonly number[]; notes: string; }
interface TypeRow { name: string; value: string; sample: string; sampleClass: 'sample-fs' | 'sample-lh' | 'sample-ls' | 'sample-fw' | 'sample-font'; notes: string; }
interface SpacingRow { name: string; value: string; notes: string; }
interface RadiusRow { name: string; value: string; notes: string; }
interface ShadowRow { name: string; alias: string; notes: string; }
interface MotionRow { name: string; value: string; notes: string; }
interface SizeRow { name: string; value: string; notes: string; }
interface LayoutRow { name: string; value: string; notes: string; }
interface MiscRow { name: string; value: string; renderAs: 'bar' | 'opacity' | 'literal'; notes: string; }

const SEMANTIC_PRIMARY: readonly ColourRow[] = [
  { name: '--primary',                value: 'var(--blue-600)',                       notes: 'Primary brand fill (buttons, links, focus ring outer).' },
  { name: '--primary-hover',          value: 'color-mix(--primary 88%, black)',           notes: 'Hover state on brand fill.' },
  { name: '--primary-pressed',        value: 'color-mix(--primary 76%, black)',           notes: 'Active / pressed state on brand fill.' },
  { name: '--primary-selected-hover', value: 'color-mix(--primary 88%, black)',           notes: 'Hover on already-selected brand surfaces (e.g. active sidenav item hover).' },
  { name: '--primary-subtle',         value: 'var(--blue-50)',                        notes: 'Light brand tint (active row, sidenav active item).' },
  { name: '--primary-muted',          value: 'var(--blue-100)',                       notes: 'Slightly stronger tint than subtle.' },
  { name: '--primary-muted-strong',   value: 'var(--blue-200)',                       notes: 'Strongest tint in the brand-muted family.' },
  { name: '--primary-strong',         value: 'var(--blue-700)',                       notes: 'Darker brand for text on brand tints.' },
  { name: '--primary-on',             value: 'var(--neutral-0)',                        notes: 'Text/icon colour ON brand fill.', inverted: true },
];

const SEMANTIC_TERTIARY: readonly ColourRow[] = [
  { name: '--tertiary',         value: 'hsl(--tertiary-h, --tertiary-s, --tertiary-l)',  notes: 'Third brand hue — tertiary button fill, tonal chips, indicators.' },
  { name: '--tertiary-hover',   value: 'color-mix(--tertiary 88%, black)',           notes: 'Hover on tertiary fill.' },
  { name: '--tertiary-pressed', value: 'color-mix(--tertiary 76%, black)',           notes: 'Pressed tertiary fill.' },
  { name: '--tertiary-strong',  value: 'hsl(--tertiary-h, --tertiary-s, --tertiary-l - 11%)', notes: 'Darker tertiary for text on tertiary tints.' },
  { name: '--tertiary-subtle',  value: 'hsl(--tertiary-h, 100%, 97%)',               notes: 'Light tertiary tint surface.' },
  { name: '--tertiary-muted',   value: 'hsl(--tertiary-h, 95%, 94%)',                notes: 'Slightly stronger tint than subtle.' },
  { name: '--tertiary-on',      value: 'var(--primary-on)',                          notes: 'Text/icon colour ON tertiary fill.', inverted: true },
];

const SEMANTIC_ERROR: readonly ColourRow[] = [
  { name: '--error',         value: 'var(--red-500)', notes: 'Destructive action fill, error border.' },
  { name: '--error-hover',   value: 'var(--red-600)', notes: 'Hover on danger fill.' },
  { name: '--error-pressed', value: 'var(--red-700)', notes: 'Pressed danger fill.' },
  { name: '--error-subtle',  value: 'var(--red-50)',  notes: 'Inline error banner background.' },
  { name: '--error-muted',   value: 'var(--red-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--error-border',  value: 'var(--red-200)', notes: 'Border on subtle danger surfaces.' },
  { name: '--error-text',    value: 'var(--red-600)', notes: 'Body text on danger surfaces.' },
];

const SEMANTIC_SUCCESS: readonly ColourRow[] = [
  { name: '--success',        value: 'var(--green-500)', notes: 'Success fill, confirmation dot.' },
  { name: '--success-hover',  value: 'var(--green-600)', notes: 'Hover on success fill.' },
  { name: '--success-subtle', value: 'var(--green-50)',  notes: 'Success banner background.' },
  { name: '--success-muted',  value: 'var(--green-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--success-border', value: 'var(--green-200)', notes: 'Border on subtle success surfaces.' },
  { name: '--success-text',   value: 'var(--green-700)', notes: 'Body text on success surfaces.' },
];

const SEMANTIC_WARNING: readonly ColourRow[] = [
  { name: '--warning',        value: 'var(--yellow-400)', notes: 'Warning fill / attention badge.' },
  { name: '--warning-hover',  value: 'var(--yellow-500)', notes: 'Hover on warning fill.' },
  { name: '--warning-subtle', value: 'var(--yellow-50)',  notes: 'Warning banner background.' },
  { name: '--warning-muted',  value: 'var(--yellow-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--warning-border', value: 'var(--yellow-200)', notes: 'Border on subtle warning surfaces.' },
  { name: '--warning-text',   value: 'var(--yellow-700)', notes: 'Body text on warning surfaces.' },
];

const SEMANTIC_INFO: readonly ColourRow[] = [
  { name: '--info',        value: 'var(--sky-500)', notes: 'Informational fill / icon.' },
  { name: '--info-hover',  value: 'var(--sky-600)', notes: 'Hover on info fill.' },
  { name: '--info-subtle', value: 'var(--sky-50)',  notes: 'Info banner background.' },
  { name: '--info-muted',  value: 'var(--sky-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--info-border', value: 'var(--sky-200)', notes: 'Border on subtle info surfaces.' },
  { name: '--info-text',   value: 'var(--sky-700)', notes: 'Body text on info surfaces.' },
];

const SEMANTIC_TEXT: readonly ColourRow[] = [
  { name: '--text-primary',    value: 'var(--neutral-900)', notes: 'Primary body text.' },
  { name: '--text-secondary',  value: 'var(--neutral-700)', notes: 'Secondary text, table cell.' },
  { name: '--text-tertiary',   value: 'var(--neutral-500)', notes: 'Tertiary, meta text, labels.' },
  { name: '--text-muted',      value: 'var(--neutral-400)', notes: 'Muted text, placeholders.' },
  { name: '--text-disabled',   value: 'var(--neutral-400)', notes: 'Disabled control text.' },
  { name: '--text-inverted',   value: 'var(--neutral-0)',   notes: 'Text ON dark surfaces.', inverted: true },
  { name: '--text-link',       value: 'var(--blue-700)',  notes: 'Hyperlink text.' },
  { name: '--text-on-primary',   value: 'var(--neutral-0)',   notes: 'Text on brand fill.', inverted: true },
  { name: '--text-on-success', value: 'var(--neutral-0)',   notes: 'Text on solid success fill.', inverted: true },
  { name: '--text-on-error',   value: 'var(--neutral-0)',   notes: 'Text on solid error fill.', inverted: true },
  { name: '--text-on-media',   value: 'var(--neutral-0)',   notes: 'Text over photos / camera feeds; pair with --text-on-media-shadow.', inverted: true },
];

const SEMANTIC_SURFACE: readonly ColourRow[] = [
  { name: '--surface-canvas',    value: 'var(--neutral-50)',  notes: 'Page background.' },
  { name: '--surface-default',   value: 'var(--neutral-0)',   notes: 'Cards, sheets, toolbars (the "paper").' },
  { name: '--surface-secondary', value: 'var(--neutral-100)', notes: 'Hover lane, table head, addons, code blocks.' },
  { name: '--surface-overlay',   value: 'var(--neutral-0)',   notes: 'Modals, drawers, popovers (with scrim).' },
  { name: '--surface-tint',      value: 'var(--blue-50)',   notes: 'Brand-tinted surfaces.' },
  { name: '--surface-disabled',  value: 'var(--neutral-100)', notes: 'Disabled control fill.' },
  { name: '--surface-inverted',       value: 'var(--neutral-900)', notes: 'Dark-on-light callouts, toasts.', inverted: true },
  { name: '--surface-inverted-hover', value: 'var(--neutral-800)', notes: 'Hover state on inverted surfaces.', inverted: true },
  { name: '--surface-muted',          value: 'var(--neutral-150)', notes: 'Muted neutral chip background (stat icon chip, etc.).' },
];

const SEMANTIC_BORDER: readonly ColourRow[] = [
  { name: '--border-default',  value: 'var(--neutral-200)', notes: 'Default field / card border.' },
  { name: '--border-strong',   value: 'var(--neutral-300)', notes: 'Hover / emphasised border.' },
  { name: '--border-subtle',   value: 'var(--neutral-150)', notes: 'Faint border, light dividers.' },
  { name: '--border-divider',  value: 'var(--neutral-150)', notes: 'Section dividers, table rows.' },
  { name: '--border-inverted', value: 'var(--neutral-700)', notes: 'Border on dark surfaces.', inverted: true },
  { name: '--border-disabled', value: 'var(--neutral-150)', notes: 'Disabled control border.' },
];

const SEMANTIC_FOCUS: readonly ColourRow[] = [
  { name: '--focus-ring-inner',       value: 'var(--surface-canvas)', notes: 'Inner ring band (reads canvas — flips with theme).' },
  { name: '--focus-ring-outer-h',     value: 'var(--primary-h)',        notes: 'Outer halo hue channel — re-skin propagates.' },
  { name: '--focus-ring-outer-s',     value: 'var(--primary-s)',        notes: 'Outer halo saturation channel.' },
  { name: '--focus-ring-outer-l',     value: 'var(--primary-l)',        notes: 'Outer halo lightness channel.' },
  { name: '--focus-ring-outer-alpha', value: '1',                     notes: 'Outer halo alpha.' },
  { name: '--focus-field-alpha',      value: '.22',                   notes: 'Field focus halo alpha (boost in dark themes).' },
];

const RAMPS: readonly RampSpec[] = [
  { label: 'Neutral', prefix: 'neutral', stops: [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950], notes: '13 stops. Base for surface/border/text.' },
  { label: 'Blue (primary)', prefix: 'blue', stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], notes: 'HSL-channel split — default theme maps --primary here; drives focus halos and re-skin.' },
  { label: 'Orange', prefix: 'orange', stops: [50, 100, 200, 300, 400, 500, 600, 700, 800], notes: 'Secondary signal, focus accent.' },
  { label: 'Green (success)', prefix: 'green', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'Status — success / confirmed.' },
  { label: 'Yellow (warning)', prefix: 'yellow', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'Status — attention / warning.' },
  { label: 'Red (error)', prefix: 'red', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'HSL-channel split — default theme maps --error here; drives error halos.' },
  { label: 'Sky (info)', prefix: 'sky', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'Informational — a brighter blue, distinct from the primary --blue ramp.' },
];

const TYPOGRAPHY_FONT: readonly TypeRow[] = [
  { name: '--font-sans',    value: 'Mulish, system-ui',         sample: 'The quick brown fox jumps over the lazy dog', sampleClass: 'sample-font', notes: 'Body and UI text.' },
  { name: '--font-mono',    value: 'JetBrains Mono, ui-monospace', sample: 'const total = items.reduce(sum, 0);',     sampleClass: 'sample-font', notes: 'Code, tokens, kbd, numeric.' },
  { name: '--font-display', value: 'var(--font-sans)',          sample: 'Display sample',                              sampleClass: 'sample-font', notes: 'Hero / display headings. Themable.' },
  { name: '--font-heading', value: 'var(--font-sans)',          sample: 'Heading sample',                              sampleClass: 'sample-font', notes: 'h1–h5 headings. Themable.' },
];

const TYPOGRAPHY_SIZE: readonly TypeRow[] = [
  { name: '--font-size-display',    value: '64px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Display hero.' },
  { name: '--font-size-h1',         value: '48px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Page title.' },
  { name: '--font-size-h2',         value: '36px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Section title.' },
  { name: '--font-size-h3',         value: '28px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Sub-section.' },
  { name: '--font-size-h4',         value: '22px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Card / panel title.' },
  { name: '--font-size-h5',         value: '18px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Small heading.' },
  { name: '--font-size-h5-strong',  value: '20px', sample: 'Aa',                       sampleClass: 'sample-fs', notes: 'Modal titles, condensed headers.' },
  { name: '--font-size-l',          value: '18px', sample: 'Body large',               sampleClass: 'sample-fs', notes: 'Lede paragraph.' },
  { name: '--font-size-m',          value: '16px', sample: 'Body medium',              sampleClass: 'sample-fs', notes: 'Default body.' },
  { name: '--font-size-s',          value: '14px', sample: 'Body small',               sampleClass: 'sample-fs', notes: 'Dense body, table cells.' },
  { name: '--font-size-xs',         value: '12px', sample: 'Body xs',                  sampleClass: 'sample-fs', notes: 'Captions, table head, helper text.' },
  { name: '--font-size-2xs',        value: '11px', sample: 'Tiny',                     sampleClass: 'sample-fs', notes: 'Overline labels.' },
  { name: '--font-size-3xs',        value: '10px', sample: 'Micro',                    sampleClass: 'sample-fs', notes: 'avatar-sm font.' },
  { name: '--font-size-4xs',        value: '9px',  sample: 'Micro',                    sampleClass: 'sample-fs', notes: 'avatar-xs font.' },
  { name: '--font-size-mono',       value: '13px', sample: 'const x = 42;',            sampleClass: 'sample-fs', notes: 'Inline mono / code blocks.' },
];

const TYPOGRAPHY_LH: readonly TypeRow[] = [
  { name: '--line-height-tight', value: '1.1',  sample: 'Tight leading — display\nand h1 headings.',              sampleClass: 'sample-lh', notes: 'Display + h1.' },
  { name: '--line-height-snug',  value: '1.25', sample: 'Snug leading — sub-headings\nand condensed UI.',         sampleClass: 'sample-lh', notes: 'h2–h5.' },
  { name: '--line-height-base',  value: '1.4',  sample: 'Base leading — body copy\nand most UI.',                 sampleClass: 'sample-lh', notes: 'Body default.' },
  { name: '--line-height-loose', value: '1.6',  sample: 'Loose leading — long-form\nreading and editorial.',      sampleClass: 'sample-lh', notes: 'Long-form prose, mono blocks.' },
  { name: '--line-height-flat',  value: '1',    sample: 'Flat leading',                                            sampleClass: 'sample-lh', notes: 'Button labels, single-line UI.' },
];

const TYPOGRAPHY_LS: readonly TypeRow[] = [
  { name: '--letter-spacing-tight',  value: '-.02em', sample: 'Tight tracking — display, h1', sampleClass: 'sample-ls', notes: 'Display / h1.' },
  { name: '--letter-spacing-snug',   value: '-.01em', sample: 'Snug tracking — h2, h3',       sampleClass: 'sample-ls', notes: 'h2 / h3.' },
  { name: '--letter-spacing-normal', value: '0',      sample: 'Normal tracking — body text',  sampleClass: 'sample-ls', notes: 'Default body.' },
  { name: '--letter-spacing-wide',   value: '.02em',  sample: 'Wide tracking — labels',       sampleClass: 'sample-ls', notes: 'Subtle emphasis.' },
  { name: '--letter-spacing-wider',  value: '.08em',  sample: 'WIDER TRACKING — OVERLINE',    sampleClass: 'sample-ls', notes: 'Overline / uppercase eyebrows.' },
];

const TYPOGRAPHY_FW: readonly TypeRow[] = [
  { name: '--font-weight-regular',   value: '400', sample: 'Regular — body text',     sampleClass: 'sample-fw', notes: 'Body default.' },
  { name: '--font-weight-medium',    value: '500', sample: 'Medium — mono / nav',     sampleClass: 'sample-fw', notes: 'Mono code, nav items.' },
  { name: '--font-weight-semibold',  value: '600', sample: 'Semibold — emphasis',     sampleClass: 'sample-fw', notes: 'Field labels, mild emphasis.' },
  { name: '--font-weight-bold',      value: '700', sample: 'Bold — headings h4/h5',   sampleClass: 'sample-fw', notes: 'h4–h5, strong body.' },
  { name: '--font-weight-extrabold', value: '800', sample: 'Extrabold — display, h1', sampleClass: 'sample-fw', notes: 'Display + h1–h3.' },
];

const SPACING: readonly SpacingRow[] = [
  { name: '--space-0',   value: '0',     notes: 'Zero — explicit no-gap.' },
  { name: '--space-px',  value: '1px',   notes: 'Hairline — border-width equivalents.' },
  { name: '--space-0-5', value: '2px',   notes: 'Hairline insets, icon close button pad.' },
  { name: '--space-1',   value: '4px',   notes: 'Atom-level gap.' },
  { name: '--space-1-5', value: '6px',   notes: 'Badge / tag gap, field-label gap.' },
  { name: '--space-2',   value: '8px',   notes: 'Small gap.' },
  { name: '--space-2-5', value: '10px',  notes: 'Tooltip pad-x, badge pad-x.' },
  { name: '--space-3',   value: '12px',  notes: 'Default gap, field pad-x.' },
  { name: '--space-4',   value: '16px',  notes: 'Card padding, row gap.' },
  { name: '--space-5',   value: '20px',  notes: 'Medium block separation.' },
  { name: '--space-6',   value: '24px',  notes: 'Section padding.' },
  { name: '--space-8',   value: '32px',  notes: 'Group separation.' },
  { name: '--space-10',  value: '40px',  notes: 'Empty-state padding.' },
  { name: '--space-12',  value: '48px',  notes: 'Page section spacing.' },
  { name: '--space-14',  value: '56px',  notes: 'Top bar height token.' },
  { name: '--space-16',  value: '64px',  notes: 'Empty-state icon size, hero padding.' },
  { name: '--space-20',  value: '80px',  notes: 'Wide page-level gap.' },
  { name: '--space-24',  value: '96px',  notes: 'Hero gap.' },
  { name: '--space-32',  value: '128px', notes: 'Maximum scale step.' },
  { name: '--ds-container-pad', value: 'var(--space-6)', notes: 'Shared container padding — components default their own --ds-*-pad to this so a single override re-pads card / stat / etc.' },
];

const RADIUS: readonly RadiusRow[] = [
  { name: '--radius-0',         value: '0',     notes: 'Squared — explicit no-radius.' },
  { name: '--radius-sm',        value: '4px',   notes: 'kbd, indeterminate-checkbox tick, link focus halo.' },
  { name: '--radius-md',        value: '8px',   notes: 'Buttons, fields, tooltips, search, segmented, tags.' },
  { name: '--radius-lg',        value: '12px',  notes: 'Menus, popovers, cards, modals, drawers, toasts.' },
  { name: '--radius-xl',        value: '16px',  notes: 'Large containers — viewport / scanner frames, hero cards.' },
  { name: '--radius-2xl',       value: '24px',  notes: 'Heroic surfaces — reserved.' },
  { name: '--radius-pill-value', value: '999px', notes: 'Configurable pill — themes can override.' },
  { name: '--radius-pill',      value: 'var(--radius-pill-value)', notes: 'Pills, avatars, switches, segmented thumb.' },
  { name: '--radius-flat',      value: 'var(--radius-0)', notes: 'Intentionally squared — btn-group middle, in-range datepicker.' },
];

const SHADOWS: readonly ShadowRow[] = [
  { name: '--z100',           alias: '',                notes: 'Lowest elevation — cards.' },
  { name: '--z200',           alias: '',                notes: 'Popovers, dropdowns.' },
  { name: '--z300',           alias: '',                notes: 'Toasts.' },
  { name: '--z400',           alias: '',                notes: 'Modals, highest elevation.' },
  { name: '--shadow-card',    alias: 'var(--z100)',     notes: 'Alias — applied to .card.' },
  { name: '--shadow-popover', alias: 'var(--z200)',     notes: 'Alias — popovers, dropdowns.' },
  { name: '--shadow-toast',   alias: 'var(--z300)',     notes: 'Alias — toasts.' },
  { name: '--shadow-modal',   alias: 'var(--z400)',     notes: 'Alias — modals.' },
  { name: '--shadow-tint-h',  alias: '225',             notes: 'Shadow hue channel — themable.' },
  { name: '--shadow-tint-s',  alias: '39%',             notes: 'Shadow saturation channel.' },
  { name: '--shadow-tint-l',  alias: '7%',              notes: 'Shadow lightness — flip in dark mode.' },
];

const MOTION_DUR: readonly MotionRow[] = [
  { name: '--duration-instant',   value: '80ms',   notes: 'Near-instant feedback.' },
  { name: '--duration-fast',      value: '120ms',  notes: 'Quick state changes (hover/focus).' },
  { name: '--duration-base',      value: '180ms',  notes: 'Default transitions.' },
  { name: '--duration-slow',      value: '260ms',  notes: 'Layout/expand transitions.' },
  { name: '--duration-slower',    value: '400ms',  notes: 'Long enter/exit (modals, drawers).' },
  { name: '--duration-loop-fast', value: '700ms',  notes: 'Indeterminate spinner rhythm.' },
  { name: '--duration-loop-slow', value: '1400ms', notes: 'Skeleton shimmer rhythm.' },
];

const MOTION_EASE: readonly MotionRow[] = [
  { name: '--ease-standard',   value: 'cubic-bezier(.2, 0, 0, 1)',     notes: 'Default — decelerates into rest.' },
  { name: '--ease-emphasized', value: 'cubic-bezier(.3, 0, .1, 1.4)',  notes: 'Pick up and put down — overlays.' },
  { name: '--ease-decelerate', value: 'cubic-bezier(0, 0, 0, 1)',      notes: 'Incoming only — appears.' },
  { name: '--ease-accelerate', value: 'cubic-bezier(.3, 0, 1, 1)',     notes: 'Outgoing only — leaves.' },
  { name: '--ease-spring',     value: 'cubic-bezier(.5, 1.5, .5, 1)',  notes: 'Playful overshoot — sparingly.' },
];

const DENSITY_HIT: readonly SizeRow[] = [
  { name: '--hit-xs',    value: '24px', notes: 'btn-s, datepicker nav, modal close.' },
  { name: '--hit-sm',    value: '28px', notes: 'segmented btn, stepper node.' },
  { name: '--hit-md',    value: '36px', notes: 'search, pagination, tag-input rows.' },
  { name: '--hit-min',   value: '32px', notes: 'Dense desktop default.' },
  { name: '--hit-cozy',  value: '40px', notes: 'Default control height.' },
  { name: '--hit-comfy', value: '44px', notes: 'WCAG minimum for touch.' },
  { name: '--hit-touch', value: '48px', notes: 'Mobile-friendly, floating-label fields.' },
];

const DENSITY_TIERS: readonly { name: string; value: string; notes: string }[] = [
  { name: 'ultra-compact', value: '24px hit', notes: 'Power-user tier — keyboard-first, opt-in only.' },
  { name: 'compact',       value: '32px hit', notes: 'Dense desktop default.' },
  { name: 'cozy',          value: '40px hit', notes: 'Default — most products.' },
  { name: 'comfy',         value: '48px hit', notes: 'Touch-friendly.' },
];

const LAYOUT_BP: readonly LayoutRow[] = [
  { name: '--bp-xs',  value: '480px',  notes: 'Phone landscape.' },
  { name: '--bp-sm',  value: '640px',  notes: 'Small tablet.' },
  { name: '--bp-md',  value: '768px',  notes: 'Tablet.' },
  { name: '--bp-lg',  value: '1024px', notes: 'Small desktop.' },
  { name: '--bp-2xl', value: '1536px', notes: 'Wide desktop.' },
];

const LAYOUT_COL: readonly LayoutRow[] = [
  { name: '--col-cap-text',    value: '720px',  notes: 'Optimal reading column for prose.' },
  { name: '--col-cap-content', value: '1280px', notes: 'Maximum content column for app layouts.' },
];

const ICONS: readonly SizeRow[] = [
  { name: '--icon-2xs', value: '10px', notes: 'Status dot, chart legend dot.' },
  { name: '--icon-xs',  value: '12px', notes: 'Sort caret, tag close glyph.' },
  { name: '--icon-sm',  value: '14px', notes: 'Button icon (small), inline icon.' },
  { name: '--icon-md',  value: '16px', notes: 'Default button icon, field affix.' },
  { name: '--icon-lg',  value: '20px', notes: 'Topbar, sidenav, modal header icon.' },
];

const MISC_BW: readonly MiscRow[] = [
  { name: '--border-width-default', value: '1px', renderAs: 'bar', notes: 'Every border, divider, field outline.' },
  { name: '--border-width-strong',  value: '2px', renderAs: 'bar', notes: 'Radio dot, slider thumb, tabs underline, dropzone dash.' },
];

const MISC_OPACITY: readonly MiscRow[] = [
  { name: '--opacity-disabled',       value: '0.5',  renderAs: 'opacity', notes: 'Full disabled state on interactive components.' },
  { name: '--opacity-muted',          value: '0.6',  renderAs: 'opacity', notes: 'Legacy alias — being phased out.' },
  { name: '--opacity-text-disabled',  value: '0.38', renderAs: 'opacity', notes: 'Disabled text where colour token unavailable.' },
  { name: '--opacity-scrim',          value: '0.55', renderAs: 'opacity', notes: 'Modal/drawer backdrop overlay.' },
  { name: '--opacity-state-hover',    value: '0.08', renderAs: 'opacity', notes: 'Hover layer over surface.' },
  { name: '--opacity-state-pressed',  value: '0.16', renderAs: 'opacity', notes: 'Active/pressed layer.' },
];

const MISC_BLUR: readonly MiscRow[] = [
  { name: '--blur-sm', value: '4px', renderAs: 'literal', notes: 'Subtle backdrop blur.' },
  { name: '--blur-md', value: '8px', renderAs: 'literal', notes: 'Stronger backdrop blur — modals, drawers.' },
];

interface ComponentTokenRow { name: string; value: string; notes: string; }
interface ComponentTokenGroup { component: string; selector: string; description: string; tokens: readonly ComponentTokenRow[]; }

const COMPONENT_TOKENS: readonly ComponentTokenGroup[] = [
  {
    component: 'Button',
    selector: '.button',
    description: 'Read with fallbacks, never declared by DS — override on the host or any ancestor. '
      + 'For solid variants (primary/error/success/warning) hover/active/halo derive from --ds-button-bg '
      + 'via color-mix (88% / 76% + black); tonal variants keep explicit ramp defaults.',
    tokens: [
      { name: '--ds-button-bg',             value: 'var(--primary)',                    notes: 'Surface fill — variants re-point the default.' },
      { name: '--ds-button-bg-hover',       value: 'color-mix(bg 88%, black)',          notes: 'Hover fill — derived from the resolved bg unless set.' },
      { name: '--ds-button-bg-active',      value: 'color-mix(bg 76%, black)',          notes: 'Active/pressed fill — derived from the resolved bg unless set.' },
      { name: '--ds-button-fg',             value: 'var(--primary-on)',                 notes: 'Label/icon colour.' },
      { name: '--ds-button-border',         value: 'transparent',                       notes: 'Border colour (outline variant overrides).' },
      { name: '--ds-button-bg-disabled',    value: 'var(--surface-disabled)',           notes: 'Disabled fill.' },
      { name: '--ds-button-fg-disabled',    value: 'var(--text-disabled)',              notes: 'Disabled label.' },
      { name: '--ds-button-radius',         value: 'var(--radius-md)',                       notes: 'Corner radius.' },
      { name: '--ds-button-focus-shadow',   value: 'var(--focus-ring)',                 notes: 'Focus halo.' },
      { name: '--ds-button-pressed-shadow', value: '0 0 0 3px color-mix(bg-active 35%, transparent)', notes: 'Pressed halo — follows the active fill.' },
    ],
  },
  {
    component: 'Icon button',
    selector: '.icon-button',
    description: 'Read with fallbacks, never declared by DS — override on the host or any ancestor. '
      + 'filled/selected derive hover/active from --ds-icon-button-bg via color-mix (88% / 76% + black); '
      + 'standard/tonal/outlined keep explicit ramp defaults.',
    tokens: [
      { name: '--ds-icon-button-bg',           value: 'transparent',                 notes: 'Surface fill — variants re-point the default (filled/selected → --primary).' },
      { name: '--ds-icon-button-fg',           value: 'var(--text-secondary)',       notes: 'Icon colour.' },
      { name: '--ds-icon-button-border',       value: 'transparent',                 notes: 'Border colour (outlined variant overrides).' },
      { name: '--ds-icon-button-bg-hover',     value: 'var(--surface-muted)',        notes: 'Hover fill — filled/selected derive it from the resolved bg.' },
      { name: '--ds-icon-button-bg-active',    value: 'var(--ds-icon-button-bg-hover)', notes: 'Pressed fill — follows hover unless set; filled/selected derive 76% mix.' },
      { name: '--ds-icon-button-fg-hover',     value: 'var(--text-primary)',         notes: 'Hover icon colour.' },
      { name: '--ds-icon-button-radius',       value: 'var(--radius-md)',            notes: 'Corner radius.' },
      { name: '--ds-icon-button-focus-shadow', value: 'var(--focus-ring)',           notes: 'Focus halo.' },
    ],
  },
  {
    component: 'Badge',
    selector: '.badge',
    description: 'Lifecycle/semantic modifiers override --ds-badge-bg and --ds-badge-fg.',
    tokens: [
      { name: '--ds-badge-bg',          value: 'var(--surface-secondary)', notes: 'Surface fill.' },
      { name: '--ds-badge-fg',          value: 'var(--text-secondary)',    notes: 'Label colour.' },
      { name: '--ds-badge-radius',      value: 'var(--radius-pill)',            notes: 'Pill radius.' },
      { name: '--ds-badge-pad-x',       value: 'var(--badge-pad-x)',       notes: 'Horizontal padding.' },
      { name: '--ds-badge-pad-y',       value: 'var(--badge-pad-y)',       notes: 'Vertical padding.' },
      { name: '--ds-badge-font-weight', value: 'var(--font-weight-bold)',           notes: 'Label weight.' },
    ],
  },
  {
    component: 'Status dot',
    selector: '.status-dot',
    description: 'Severity classes only override --ds-statusdot-color.',
    tokens: [
      { name: '--ds-statusdot-size',  value: 'var(--status-dot-size)', notes: 'Diameter.' },
      { name: '--ds-statusdot-color', value: 'var(--neutral-400)',     notes: 'Default = planning.' },
    ],
  },
  {
    component: 'Avatar',
    selector: ':host (ds-avatar)',
    description: 'Initials & image avatar. Used inside avatar-group with ring.',
    tokens: [
      { name: '--ds-avatar-size',        value: 'var(--avatar-md)',       notes: 'Width / height.' },
      { name: '--ds-avatar-bg',          value: 'var(--primary-muted)',     notes: 'Surface fill.' },
      { name: '--ds-avatar-fg',          value: 'var(--primary-strong)',    notes: 'Initials colour.' },
      { name: '--ds-avatar-radius',      value: 'var(--radius-pill)',          notes: 'Pill / square.' },
      { name: '--ds-avatar-ring-color',  value: 'var(--surface-default)', notes: 'Ring when stacked.' },
      { name: '--ds-avatar-ring-width',  value: 'var(--avatar-bw-group)', notes: 'Ring width when stacked.' },
    ],
  },
  {
    component: 'Avatar group',
    selector: ':host (ds-avatar-group)',
    description: 'Stack overlap + ring colour.',
    tokens: [
      { name: '--ds-avatargroup-overlap', value: 'calc(-1 * var(--space-2))', notes: 'Negative gap between avatars.' },
      { name: '--ds-avatargroup-ring',    value: 'var(--surface-default)', notes: 'Outline between stacked avatars.' },
    ],
  },
  {
    component: 'Card',
    selector: '.card',
    description: 'Surface, border, radius, padding, shadow (flat / raised / hover / interactive).',
    tokens: [
      { name: '--ds-card-bg',           value: 'var(--surface-default)', notes: 'Card fill.' },
      { name: '--ds-card-border',       value: 'var(--border-divider)',  notes: 'Card border.' },
      { name: '--ds-card-radius',       value: 'var(--radius-lg)',            notes: 'Corner radius.' },
      { name: '--ds-card-pad',          value: 'var(--space-6)',             notes: 'Inner padding.' },
      { name: '--ds-card-shadow',       value: 'none',                   notes: 'Default (flat).' },
      { name: '--ds-card-shadow-hover', value: 'var(--z100)',            notes: 'Hover lift shadow.' },
      { name: '--ds-card-focus-shadow', value: 'var(--focus-ring)',      notes: 'Focus halo on interactive cards.' },
      { name: '--ds-card-hover-lift',   value: 'var(--card-hover-lift)', notes: 'Translate-Y on hover.' },
    ],
  },
  {
    component: 'Stat',
    selector: '.stat',
    description: 'KPI tile: surface, label, value, delta up/down.',
    tokens: [
      { name: '--ds-stat-bg',          value: 'var(--surface-default)', notes: 'Tile fill.' },
      { name: '--ds-stat-border',      value: 'var(--border-divider)',  notes: 'Tile border.' },
      { name: '--ds-stat-radius',      value: 'var(--radius-lg)',            notes: 'Corner radius.' },
      { name: '--ds-stat-pad',         value: 'var(--space-5)',             notes: 'Inner padding.' },
      { name: '--ds-stat-label-color', value: 'var(--text-tertiary)',   notes: 'Label colour.' },
      { name: '--ds-stat-value-color', value: 'var(--text-primary)',    notes: 'Value colour.' },
      { name: '--ds-stat-up-color',    value: 'var(--success-text)',    notes: 'Positive delta.' },
      { name: '--ds-stat-down-color',  value: 'var(--error-text)',     notes: 'Negative delta.' },
    ],
  },
  {
    component: 'Tabs',
    selector: '.tabs',
    description: 'Underline + pills variants. Pills tokens activate inside .tabs.pills.',
    tokens: [
      { name: '--ds-tab-fg',                 value: 'var(--text-secondary)',    notes: 'Default tab label.' },
      { name: '--ds-tab-fg-hover',           value: 'var(--text-primary)',      notes: 'Hover label.' },
      { name: '--ds-tab-fg-active',          value: 'var(--primary)',             notes: 'Active label.' },
      { name: '--ds-tab-indicator-color',    value: 'var(--primary)',             notes: 'Underline colour.' },
      { name: '--ds-tab-indicator-width',    value: 'var(--border-width-strong)',         notes: 'Underline thickness.' },
      { name: '--ds-tab-pad-x',              value: 'var(--space-4)',               notes: 'Horizontal padding.' },
      { name: '--ds-tab-pad-y',              value: 'var(--space-3)',               notes: 'Vertical padding.' },
      { name: '--ds-tabs-divider',           value: 'var(--border-divider)',    notes: 'Bottom divider.' },
      { name: '--ds-tabs-pills-bg',          value: 'var(--surface-secondary)', notes: 'Pills track fill.' },
      { name: '--ds-tab-pill-bg-active',     value: 'var(--surface-default)',   notes: 'Active pill thumb.' },
    ],
  },
  {
    component: 'Input',
    selector: '.field',
    description: 'Default field — surface, border (default/hover/focus), error/success/disabled, focus shadow.',
    tokens: [
      { name: '--ds-input-bg',             value: 'var(--surface-default)',  notes: 'Field fill.' },
      { name: '--ds-input-border',         value: 'var(--border-default)',   notes: 'Default border.' },
      { name: '--ds-input-border-hover',   value: 'var(--border-strong)',    notes: 'Hover border.' },
      { name: '--ds-input-border-focus',   value: 'var(--primary)',            notes: 'Focus border.' },
      { name: '--ds-input-fg',             value: 'var(--text-primary)',     notes: 'Value text.' },
      { name: '--ds-input-placeholder',    value: 'var(--text-tertiary)',    notes: 'Placeholder text.' },
      { name: '--ds-input-radius',         value: 'var(--radius-md)',             notes: 'Corner radius.' },
      { name: '--ds-input-pad-x',          value: 'var(--field-pad-x)',      notes: 'Horizontal padding.' },
      { name: '--ds-input-pad-y',          value: 'var(--field-pad-y)',      notes: 'Vertical padding.' },
      { name: '--ds-input-focus-shadow',   value: 'var(--focus-field)',      notes: 'Focus halo.' },
      { name: '--ds-input-border-error',   value: 'var(--error)',           notes: 'Error border.' },
      { name: '--ds-input-bg-error',       value: 'var(--error-subtle)',    notes: 'Error fill tint.' },
      { name: '--ds-input-border-success', value: 'var(--success)',          notes: 'Success border.' },
      { name: '--ds-input-bg-disabled',    value: 'var(--surface-disabled)', notes: 'Disabled fill.' },
    ],
  },
  {
    component: 'Select',
    selector: '.field (select)',
    description: 'Same surface as Input. --ds-select-* vars default to the matching --ds-input-* var.',
    tokens: [
      { name: '--ds-input-bg',             value: 'var(--surface-default)',  notes: 'Field fill.' },
      { name: '--ds-input-border',         value: 'var(--border-default)',   notes: 'Default border.' },
      { name: '--ds-input-border-hover',   value: 'var(--border-strong)',    notes: 'Hover border.' },
      { name: '--ds-input-border-focus',   value: 'var(--primary)',            notes: 'Focus border.' },
      { name: '--ds-input-fg',             value: 'var(--text-primary)',     notes: 'Value text.' },
      { name: '--ds-input-radius',         value: 'var(--radius-md)',             notes: 'Corner radius.' },
      { name: '--ds-input-focus-shadow',   value: 'var(--focus-field)',      notes: 'Focus halo.' },
      { name: '--ds-input-border-error',   value: 'var(--error)',           notes: 'Error border.' },
      { name: '--ds-input-border-success', value: 'var(--success)',          notes: 'Success border.' },
      { name: '--ds-input-bg-disabled',    value: 'var(--surface-disabled)', notes: 'Disabled fill.' },
    ],
  },
  {
    component: 'Search',
    selector: '.search',
    description: 'Compact search pill — secondary surface by default, brand-focused border.',
    tokens: [
      { name: '--ds-search-bg',           value: 'var(--surface-secondary)', notes: 'Default fill.' },
      { name: '--ds-search-bg-focus',     value: 'var(--surface-default)',   notes: 'Focused fill.' },
      { name: '--ds-search-border',       value: 'transparent',              notes: 'Default border.' },
      { name: '--ds-search-border-hover', value: 'var(--border-default)',    notes: 'Hover border.' },
      { name: '--ds-search-border-focus', value: 'var(--primary)',             notes: 'Focus border.' },
      { name: '--ds-search-focus-shadow', value: 'var(--focus-field)',       notes: 'Focus halo.' },
      { name: '--ds-search-fg',           value: 'var(--text-primary)',      notes: 'Query text.' },
      { name: '--ds-search-placeholder',  value: 'var(--text-tertiary)',     notes: 'Placeholder.' },
      { name: '--ds-search-radius',       value: 'var(--radius-md)',              notes: 'Corner radius.' },
      { name: '--ds-search-height',       value: 'var(--search-h)',          notes: 'Control height.' },
    ],
  },
  {
    component: 'Table',
    selector: '.table',
    description: 'Data table — surface, head, divider, hover/selected row, sort accent.',
    tokens: [
      { name: '--ds-table-bg',              value: 'var(--surface-default)',   notes: 'Table fill.' },
      { name: '--ds-table-row-hover-bg',    value: 'var(--surface-secondary)', notes: 'Row hover fill.' },
      { name: '--ds-table-row-selected-bg', value: 'var(--primary-subtle)',      notes: 'Selected row.' },
      { name: '--ds-table-head-bg',         value: 'var(--surface-secondary)', notes: 'Head fill.' },
      { name: '--ds-table-head-fg',         value: 'var(--text-tertiary)',     notes: 'Head label.' },
      { name: '--ds-table-divider',         value: 'var(--border-divider)',    notes: 'Row divider.' },
      { name: '--ds-table-sort-active-fg',  value: 'var(--primary)',             notes: 'Active sort caret.' },
      { name: '--ds-table-cell-pad-x',      value: 'var(--table-cell-pad-x)',  notes: 'Cell horizontal padding.' },
      { name: '--ds-table-cell-pad-y',      value: 'var(--table-cell-pad-y)',  notes: 'Cell vertical padding.' },
      { name: '--ds-table-radius',          value: 'var(--radius-xl)',              notes: 'Outer corner radius.' },
    ],
  },
  {
    component: 'Pagination',
    selector: '.pagination',
    description: 'Pager buttons + active state.',
    tokens: [
      { name: '--ds-pagination-btn-bg',       value: 'var(--surface-default)',   notes: 'Button fill.' },
      { name: '--ds-pagination-btn-bg-hover', value: 'var(--surface-secondary)', notes: 'Hover fill.' },
      { name: '--ds-pagination-btn-fg',       value: 'var(--text-secondary)',    notes: 'Button label.' },
      { name: '--ds-pagination-btn-fg-hover', value: 'var(--text-primary)',      notes: 'Hover label.' },
      { name: '--ds-pagination-btn-border',   value: 'var(--border-default)',    notes: 'Button border.' },
      { name: '--ds-pagination-active-bg',    value: 'var(--primary)',             notes: 'Active page fill.' },
      { name: '--ds-pagination-active-fg',    value: 'var(--primary-on)',          notes: 'Active page label.' },
      { name: '--ds-pagination-radius',       value: 'var(--radius-md)',              notes: 'Button radius.' },
    ],
  },
  {
    component: 'Date picker',
    selector: '.calendar',
    description: 'Pop-over surface + day cell states (today / selected / range / disabled).',
    tokens: [
      { name: '--ds-datepicker-bg',              value: 'var(--surface-overlay)',   notes: 'Popover fill.' },
      { name: '--ds-datepicker-border',          value: 'var(--border-default)',    notes: 'Popover border.' },
      { name: '--ds-datepicker-shadow',          value: 'var(--shadow-popover)',    notes: 'Popover shadow.' },
      { name: '--ds-datepicker-day-hover-bg',    value: 'var(--surface-secondary)', notes: 'Day hover fill.' },
      { name: '--ds-datepicker-day-today-fg',    value: 'var(--primary)',             notes: 'Today label.' },
      { name: '--ds-datepicker-day-selected-bg', value: 'var(--primary)',             notes: 'Selected day fill.' },
      { name: '--ds-datepicker-day-selected-fg', value: 'var(--primary-on)',          notes: 'Selected day label.' },
      { name: '--ds-datepicker-day-range-bg',    value: 'var(--primary-subtle)',      notes: 'Range fill.' },
      { name: '--ds-datepicker-day-range-fg',    value: 'var(--primary-strong)',      notes: 'Range label.' },
      { name: '--ds-datepicker-day-disabled-fg', value: 'var(--text-disabled)',     notes: 'Disabled day label.' },
      { name: '--ds-datepicker-width',           value: 'var(--datepicker-w)',      notes: 'Calendar width.' },
    ],
  },
  {
    component: 'Breadcrumbs',
    selector: '.breadcrumbs',
    description: 'Inline link trail.',
    tokens: [
      { name: '--ds-breadcrumbs-fg',           value: 'var(--text-tertiary)', notes: 'Link colour.' },
      { name: '--ds-breadcrumbs-fg-hover',     value: 'var(--primary)',         notes: 'Link hover.' },
      { name: '--ds-breadcrumbs-current-fg',   value: 'var(--text-primary)',  notes: 'Current crumb.' },
      { name: '--ds-breadcrumbs-separator-fg', value: 'var(--icon-muted)',    notes: 'Chevron / slash.' },
    ],
  },
  {
    component: 'Sidenav',
    selector: ':host / .item / .group-label',
    description: 'Left rail chrome + items + group labels. Host vs item vs group vars are independent.',
    tokens: [
      { name: '--ds-sidenav-bg',              value: 'var(--surface-default)',   notes: 'Rail fill.' },
      { name: '--ds-sidenav-border',          value: 'var(--border-divider)',    notes: 'Rail border.' },
      { name: '--ds-sidenav-width',           value: 'var(--sidenav-w)',         notes: 'Expanded width.' },
      { name: '--ds-sidenav-width-collapsed', value: 'var(--sidenav-w-collapsed)', notes: 'Collapsed width.' },
      { name: '--ds-sidenav-mark-bg',         value: 'var(--primary)',             notes: 'Brand mark fill.' },
      { name: '--ds-sidenav-mark-fg',         value: 'var(--primary-on)',          notes: 'Brand mark label.' },
      { name: '--ds-sidenav-item-fg',         value: 'var(--text-secondary)',    notes: 'Item label.' },
      { name: '--ds-sidenav-item-fg-hover',   value: 'var(--text-primary)',      notes: 'Item hover label.' },
      { name: '--ds-sidenav-item-bg-hover',   value: 'var(--surface-secondary)', notes: 'Item hover fill.' },
      { name: '--ds-sidenav-item-bg-active',  value: 'var(--primary-subtle)',      notes: 'Active item fill.' },
      { name: '--ds-sidenav-item-fg-active',  value: 'var(--primary-strong)',      notes: 'Active item label.' },
      { name: '--ds-sidenav-item-radius',     value: 'var(--radius-md)',              notes: 'Item radius.' },
      { name: '--ds-sidenav-alert-color',     value: 'var(--error)',            notes: 'Alert pip colour.' },
      { name: '--ds-sidenav-group-fg',        value: 'var(--text-tertiary)',     notes: 'Group label colour.' },
    ],
  },
  {
    component: 'Topbar',
    selector: '.topbar',
    description: 'App top bar — title, actions, ping indicator.',
    tokens: [
      { name: '--ds-topbar-bg',              value: 'var(--surface-default)',   notes: 'Bar fill.' },
      { name: '--ds-topbar-border',          value: 'var(--border-divider)',    notes: 'Bottom border.' },
      { name: '--ds-topbar-height',          value: 'var(--topbar-h)',          notes: 'Bar height.' },
      { name: '--ds-topbar-action-fg',       value: 'var(--icon-default)',      notes: 'Action icon colour.' },
      { name: '--ds-topbar-action-fg-hover', value: 'var(--icon-strong)',       notes: 'Action hover icon.' },
      { name: '--ds-topbar-action-bg-hover', value: 'var(--surface-secondary)', notes: 'Action hover fill.' },
      { name: '--ds-topbar-title-fg',        value: 'var(--text-primary)',      notes: 'Title colour.' },
      { name: '--ds-topbar-ping-color',      value: 'var(--error)',            notes: 'Notification ping.' },
    ],
  },
  {
    component: 'Page header',
    selector: '.page-header',
    description: 'Title block + meta row.',
    tokens: [
      { name: '--ds-pagehdr-eyebrow-fg',   value: 'var(--text-tertiary)', notes: 'Eyebrow label.' },
      { name: '--ds-pagehdr-title-fg',     value: 'var(--text-primary)',  notes: 'Title.' },
      { name: '--ds-pagehdr-sub-fg',       value: 'var(--text-secondary)', notes: 'Subtitle.' },
      { name: '--ds-pagehdr-meta-fg',      value: 'var(--text-secondary)', notes: 'Meta text.' },
      { name: '--ds-pagehdr-meta-icon-fg', value: 'var(--icon-default)',   notes: 'Meta icon.' },
      { name: '--ds-pagehdr-divider',      value: 'var(--border-divider)', notes: 'Divider below header.' },
    ],
  },
  {
    component: 'Modal',
    selector: '.modal',
    description: 'Overlay dialog. Danger title fg is separate (--ds-modal-title-fg-error).',
    tokens: [
      { name: '--ds-modal-bg',              value: 'var(--surface-overlay)', notes: 'Dialog fill.' },
      { name: '--ds-modal-radius',          value: 'var(--radius-lg)',            notes: 'Corner radius.' },
      { name: '--ds-modal-shadow',          value: 'var(--shadow-modal)',    notes: 'Dialog shadow.' },
      { name: '--ds-modal-divider',         value: 'var(--border-divider)',  notes: 'Header/actions divider.' },
      { name: '--ds-modal-title-fg',        value: 'var(--text-primary)',    notes: 'Title colour.' },
      { name: '--ds-modal-title-fg-error', value: 'var(--error-text)',     notes: 'Danger title colour.' },
      { name: '--ds-modal-close-fg',        value: 'var(--icon-default)',    notes: 'Close icon.' },
      { name: '--ds-modal-close-fg-hover',  value: 'var(--icon-strong)',     notes: 'Close icon hover.' },
      { name: '--ds-modal-backdrop',        value: 'var(--surface-scrim)',   notes: 'Backdrop scrim.' },
    ],
  },
  {
    component: 'Banner',
    selector: '.banner',
    description: 'Severity modifiers (success/warning/severe/error) re-set bg, fg, bar, border.',
    tokens: [
      { name: '--ds-banner-bg',             value: 'var(--info-subtle)',    notes: 'Banner fill (default = info).' },
      { name: '--ds-banner-fg',             value: 'var(--info-text)',      notes: 'Body text.' },
      { name: '--ds-banner-bar',            value: 'var(--info)',           notes: 'Left bar colour.' },
      { name: '--ds-banner-title-fg',       value: 'var(--text-primary)',   notes: 'Title colour.' },
      { name: '--ds-banner-close-fg',       value: 'var(--icon-default)',   notes: 'Close icon.' },
      { name: '--ds-banner-close-fg-hover', value: 'var(--icon-strong)',    notes: 'Close icon hover.' },
      { name: '--ds-banner-radius',         value: 'var(--radius-md)',           notes: 'Corner radius.' },
      { name: '--ds-banner-bar-width',      value: 'var(--banner-bar-w)',   notes: 'Left bar width.' },
    ],
  },
  {
    component: 'Dropzone',
    selector: '.dropzone',
    description: 'File drop target + per-file state colours (progress / success / error).',
    tokens: [
      { name: '--ds-dropzone-bg',            value: 'var(--surface-default)', notes: 'Default fill.' },
      { name: '--ds-dropzone-bg-hover',      value: 'var(--primary-subtle)',    notes: 'Hover fill.' },
      { name: '--ds-dropzone-bg-active',     value: 'var(--primary-subtle)',    notes: 'Drag-active fill.' },
      { name: '--ds-dropzone-border',        value: 'var(--border-default)',  notes: 'Default border.' },
      { name: '--ds-dropzone-border-hover',  value: 'var(--primary)',           notes: 'Hover border.' },
      { name: '--ds-dropzone-border-active', value: 'var(--primary)',           notes: 'Drag-active border.' },
      { name: '--ds-dropzone-fg',            value: 'var(--text-secondary)',  notes: 'Body text.' },
      { name: '--ds-dropzone-fg-active',     value: 'var(--primary-strong)',    notes: 'Drag-active text.' },
      { name: '--ds-dropzone-radius',        value: 'var(--radius-lg)',            notes: 'Corner radius.' },
      { name: '--ds-dropzone-file-progress', value: 'var(--primary)',           notes: 'Upload progress.' },
      { name: '--ds-dropzone-file-success',  value: 'var(--success)',         notes: 'Per-file success.' },
      { name: '--ds-dropzone-file-error',    value: 'var(--error)',          notes: 'Per-file error.' },
    ],
  },
];

@Component({
  selector: 'section-tokens-reference',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-tokens-reference" data-anchor="tokens-reference" class="section">
      <div class="eyebrow t-overline">Reference</div>
      <h2 class="t-h2">Tokens reference</h2>
      <p class="lede t-m">
        Every CSS custom property in the design system. Search-friendly catalogue grouped by purpose.
      </p>

      <!-- ============================================================ Colour — semantic -->
      <h3 class="block-title t-h4">Colour &mdash; semantic</h3>
      <p class="block-desc t-s">Role tokens that components consume. Re-skinning means remapping these to a different ramp.</p>

      <div class="cat-sub t-overline">Primary</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of primarySemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [class.is-inverted]="row.inverted" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Tertiary (third brand hue)</div>
      <p class="block-desc t-s">
        Third brand hue — tertiary button fill, tonal chips, hierarchy tones, indicators. Channels default to <code class="t-mono">--primary</code> HSL so single-hue themes render identical to primary; multi-hue brands override <code class="t-mono">--tertiary-h/s/l</code>.
      </p>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of tertiarySemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [class.is-inverted]="row.inverted" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Error</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of errorSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Success</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of successSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Warning</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of warningSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Info</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of infoSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Text</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of textSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [class.is-inverted]="row.inverted" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Surface</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of surfaceSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [class.is-inverted]="row.inverted" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Border</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of borderSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="swatch-chip" [class.is-inverted]="row.inverted" [style.background]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Focus ring channels</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of focusSemantic; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">channel</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
          <tr>
            <td><code class="t-mono">--focus-ring</code></td>
            <td><code class="t-mono">composed shadow</code></td>
            <td><span class="focus-demo focus-demo--ring"></span></td>
            <td>2px canvas inner band + 4px brand outer halo.</td>
          </tr>
          <tr>
            <td><code class="t-mono">--focus-field</code></td>
            <td><code class="t-mono">composed shadow</code></td>
            <td><span class="focus-demo focus-demo--field"></span></td>
            <td>3px brand &alpha; 0.22 — single coloured halo.</td>
          </tr>
          <tr>
            <td><code class="t-mono">--focus-ring-error</code></td>
            <td><code class="t-mono">composed shadow</code></td>
            <td><span class="focus-demo focus-demo--error"></span></td>
            <td>Same shape as ring, danger hue.</td>
          </tr>
        </tbody>
      </table>

      <!-- ============================================================ Colour ramps -->
      <h3 class="block-title t-h4">Colour &mdash; ramps</h3>
      <p class="block-desc t-s">Raw primitive ramps. Stop names map 1:1 to CSS custom properties (e.g. <code class="t-mono">--blue-600</code>).</p>
      @for (ramp of ramps; track ramp.prefix) {
        <div class="cat-sub t-overline">{{ ramp.label }} &mdash; {{ ramp.notes }}</div>
        <table class="ref-table">
          <thead><tr><th class="col-name">Token</th><th class="col-value">Stop</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
          <tbody>
            @for (stop of ramp.stops; track stop) {
              <tr>
                <td><code class="t-mono">--{{ ramp.prefix }}-{{ stop }}</code></td>
                <td><code class="t-mono">{{ stop }}</code></td>
                <td><span class="swatch-chip" [style.background]="'var(--' + ramp.prefix + '-' + stop + ')'"></span></td>
                <td>{{ ramp.label }} ramp · stop {{ stop }}</td>
              </tr>
            }
          </tbody>
        </table>
      }

      <!-- ============================================================ Typography -->
      <h3 class="block-title t-h4">Typography</h3>
      <p class="block-desc t-s">Font stacks, sizes, line-heights, letter-spacings, weights.</p>

      <div class="cat-sub t-overline">Font families</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of typeFont; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="sample-font" [style.font-family]="'var(' + row.name + ')'">{{ row.sample }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Font sizes</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of typeSize; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="sample-fs" [style.font-size]="'var(' + row.name + ')'">{{ row.sample }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Line heights</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of typeLh; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="sample-lh" [style.line-height]="'var(' + row.name + ')'">{{ row.sample }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Letter spacing</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of typeLs; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="sample-ls" [style.letter-spacing]="'var(' + row.name + ')'">{{ row.sample }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Font weights</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of typeFw; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="sample-fw" [style.font-weight]="'var(' + row.name + ')'">{{ row.sample }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Spacing -->
      <h3 class="block-title t-h4">Spacing</h3>
      <p class="block-desc t-s">4px base scale with named half-steps where atoms need them. Bars render at the true CSS value.</p>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Bar (width)</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of spacing; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="size-bar" [style.width]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Radius -->
      <h3 class="block-title t-h4">Radius</h3>
      <p class="block-desc t-s">Six-stop scale. Each step is functionally distinct at standard zoom.</p>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of radius; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="radius-sample" [style.border-radius]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Elevation -->
      <h3 class="block-title t-h4">Elevation &mdash; shadows</h3>
      <p class="block-desc t-s">Channel-split substrate so a re-skin can re-tint shadows. Alphas constant across themes.</p>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of shadows; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.alias || 'composed' }}</code></td>
              <td>
                @if (hasShadowSample(row.name)) {
                  <span class="shadow-sample" [style.box-shadow]="'var(' + row.name + ')'"></span>
                } @else {
                  <span class="literal-value t-mono">channel</span>
                }
              </td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Motion -->
      <h3 class="block-title t-h4">Motion</h3>
      <p class="block-desc t-s">Durations describe response time; loop durations describe rhythm. Easings shape the curve.</p>

      <div class="cat-sub t-overline">Durations</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of motionDur; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">{{ row.value }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Easings</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of motionEase; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">curve</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Density -->
      <h3 class="block-title t-h4">Density &mdash; hit targets</h3>
      <p class="block-desc t-s">Canonical size scale for interactive height. Density tiers rewrite these at <code class="t-mono">:root</code> via <code class="t-mono">[data-density]</code>.</p>

      <div class="cat-sub t-overline">Hit-target scale</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Square sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of densityHit; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="hit-sample" [style.width]="'var(' + row.name + ')'" [style.height]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Density tiers</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Tier (data-density)</th><th class="col-value">--hit-cozy</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of densityTiers; track row.name) {
            <tr>
              <td><code class="t-mono">[data-density=&quot;{{ row.name }}&quot;]</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">override block</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Layout -->
      <h3 class="block-title t-h4">Layout</h3>
      <p class="block-desc t-s">Breakpoints and content column caps.</p>

      <div class="cat-sub t-overline">Breakpoints</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of layoutBp; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">{{ row.value }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Column caps</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of layoutCol; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">{{ row.value }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Icons -->
      <h3 class="block-title t-h4">Icons</h3>
      <p class="block-desc t-s">Icon size scale. Squares render at the true CSS value.</p>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Square</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of icons; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="icon-sample" [style.width]="'var(' + row.name + ')'" [style.height]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Misc -->
      <h3 class="block-title t-h4">Misc &mdash; borders, opacity, blur</h3>
      <p class="block-desc t-s">Border widths, opacity scale, backdrop blurs.</p>

      <div class="cat-sub t-overline">Border widths</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of miscBw; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="bw-sample" [style.border-top-width]="'var(' + row.name + ')'"></span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Opacity</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of miscOpacity; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="opacity-sample" [style.opacity]="'var(' + row.name + ')'">Aa</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="cat-sub t-overline">Backdrop blur</div>
      <table class="ref-table">
        <thead><tr><th class="col-name">Token</th><th class="col-value">Value</th><th class="col-resolved">Sample</th><th class="col-notes">Notes</th></tr></thead>
        <tbody>
          @for (row of miscBlur; track row.name) {
            <tr>
              <td><code class="t-mono">{{ row.name }}</code></td>
              <td><code class="t-mono">{{ row.value }}</code></td>
              <td><span class="literal-value t-mono">{{ row.value }}</span></td>
              <td>{{ row.notes }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- ============================================================ Component tokens -->
      <h3 class="block-title t-h4">Component tokens</h3>
      <p class="block-desc t-s">
        Per-component <code class="t-mono">--ds-&lt;component&gt;-*</code> custom properties. Each defaults to a global semantic token (see above).
        Override at <code class="t-mono">:root</code>, on a scoped ancestor, or inline on the host to re-skin a component without forking its class internals.
      </p>
      @for (group of componentTokens; track group.component) {
        <details class="component-token-group">
          <summary>
            <span class="component-token-name t-h5">{{ group.component }}</span>
            <span class="component-token-selector t-mono">{{ group.selector }}</span>
            <span class="component-token-count t-mono">{{ group.tokens.length }} vars</span>
          </summary>
          <p class="component-token-desc t-s">{{ group.description }}</p>
          <table class="ref-table">
            <thead><tr><th class="col-name">Token</th><th class="col-value">Default</th><th class="col-resolved">Resolved</th><th class="col-notes">Notes</th></tr></thead>
            <tbody>
              @for (row of group.tokens; track row.name) {
                <tr>
                  <td><code class="t-mono">{{ row.name }}</code></td>
                  <td><code class="t-mono">{{ row.value }}</code></td>
                  <td>
                    @if (isColorValue(row.value)) {
                      <span class="swatch-chip" [style.background]="row.value"></span>
                    } @else {
                      <span class="literal-value t-mono">geometry</span>
                    }
                  </td>
                  <td>{{ row.notes }}</td>
                </tr>
              }
            </tbody>
          </table>
        </details>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-10); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }
    .cat-sub {
      margin-top: var(--space-5);
      margin-bottom: var(--space-2);
      color: var(--text-tertiary);
    }

    /* ---------- Reference table ---------- */
    .ref-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
    }
    .ref-table thead th {
      text-align: left;
      padding: var(--space-2) var(--space-3);
      background: var(--surface-secondary);
      border-bottom: var(--border-width-default) solid var(--border-divider);
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-base) var(--font-sans);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .ref-table tbody td {
      padding: var(--space-2) var(--space-3);
      border-bottom: var(--border-width-default) solid var(--border-divider);
      vertical-align: middle;
      color: var(--text-secondary);
      word-break: break-word;
    }
    .ref-table .col-name     { width: 26%; }
    .ref-table .col-value    { width: 22%; }
    .ref-table .col-resolved { width: 18%; }
    .ref-table .col-notes    { width: 34%; }

    /* ---------- Resolved-value renderers ---------- */
    .swatch-chip {
      display: inline-block;
      width: var(--space-10);
      height: var(--space-6);
      border-radius: var(--radius-sm);
      border: var(--border-width-default) solid var(--border-default);
      vertical-align: middle;
    }
    .swatch-chip.is-inverted { border-color: var(--border-strong); }

    .size-bar {
      display: inline-block;
      height: var(--space-3);
      min-width: 1px;
      background: var(--primary);
      border-radius: var(--radius-sm);
      vertical-align: middle;
    }

    .radius-sample {
      display: inline-block;
      width: var(--space-10);
      height: var(--space-10);
      background: var(--primary-subtle);
      border: var(--border-width-default) solid var(--primary-muted);
      vertical-align: middle;
    }

    .shadow-sample {
      display: inline-block;
      width: var(--space-10);
      height: var(--space-10);
      background: var(--surface-default);
      border-radius: var(--radius-md);
      vertical-align: middle;
    }

    .hit-sample {
      display: inline-block;
      background: var(--primary-subtle);
      border: var(--border-width-default) solid var(--primary-muted);
      border-radius: var(--radius-sm);
      vertical-align: middle;
    }

    .icon-sample {
      display: inline-block;
      background: var(--icon-default);
      border-radius: var(--radius-sm);
      vertical-align: middle;
    }

    .bw-sample {
      display: inline-block;
      width: var(--space-16);
      height: 1px;
      border-top-style: solid;
      border-top-color: var(--text-primary);
      vertical-align: middle;
    }

    .opacity-sample {
      display: inline-block;
      padding: 0 var(--space-2);
      font: var(--font-weight-bold) var(--font-size-m)/var(--line-height-flat) var(--font-sans);
      color: var(--text-primary);
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-default);
      border-radius: var(--radius-sm);
    }

    .literal-value {
      color: var(--text-tertiary);
    }

    .focus-demo {
      display: inline-block;
      width: var(--space-10);
      height: var(--space-6);
      background: var(--surface-default);
      border-radius: var(--radius-md);
      vertical-align: middle;
    }
    .focus-demo--ring   { box-shadow: var(--focus-ring); }
    .focus-demo--field  { box-shadow: var(--focus-field); }
    .focus-demo--error { box-shadow: var(--focus-ring-error); }

    /* ---------- Typography samples ---------- */
    .sample-font {
      color: var(--text-primary);
    }
    .sample-fs {
      color: var(--text-primary);
      line-height: var(--line-height-flat);
    }
    .sample-lh {
      display: inline-block;
      color: var(--text-primary);
      white-space: pre-line;
      font: var(--font-weight-regular) var(--font-size-s) var(--font-sans);
    }
    .sample-ls {
      color: var(--text-primary);
      font: var(--font-weight-regular) var(--font-size-s)/var(--line-height-base) var(--font-sans);
    }
    .sample-fw {
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: var(--font-size-s);
      line-height: var(--line-height-base);
    }

    /* ---------- Component tokens — collapsible group ---------- */
    .component-token-group {
      margin-top: var(--space-4);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-md);
      background: var(--surface-default);
      overflow: hidden;
    }
    .component-token-group > summary {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      cursor: pointer;
      list-style: none;
      background: var(--surface-secondary);
    }
    .component-token-group > summary::-webkit-details-marker { display: none; }
    .component-token-group > summary::before {
      content: '\\203A';
      color: var(--text-tertiary);
      transition: transform var(--duration-base) var(--ease-standard);
      display: inline-block;
    }
    .component-token-group[open] > summary::before {
      transform: rotate(90deg);
    }
    .component-token-name {
      color: var(--text-primary);
    }
    .component-token-selector {
      color: var(--text-tertiary);
      font-size: var(--font-size-xs);
    }
    .component-token-count {
      margin-left: auto;
      color: var(--text-tertiary);
      font-size: var(--font-size-xs);
    }
    .component-token-desc {
      padding: var(--space-3) var(--space-4) 0;
      color: var(--text-secondary);
      margin: 0;
    }
    .component-token-group .ref-table {
      margin: var(--space-3) 0 0;
    }
  `],
})
export class TokensReferenceSection {
  protected readonly primarySemantic   = SEMANTIC_PRIMARY;
  protected readonly tertiarySemantic  = SEMANTIC_TERTIARY;
  protected readonly errorSemantic  = SEMANTIC_ERROR;
  protected readonly successSemantic = SEMANTIC_SUCCESS;
  protected readonly warningSemantic = SEMANTIC_WARNING;
  protected readonly infoSemantic    = SEMANTIC_INFO;
  protected readonly textSemantic    = SEMANTIC_TEXT;
  protected readonly surfaceSemantic = SEMANTIC_SURFACE;
  protected readonly borderSemantic  = SEMANTIC_BORDER;
  protected readonly focusSemantic   = SEMANTIC_FOCUS;
  protected readonly ramps           = RAMPS;
  protected readonly typeFont        = TYPOGRAPHY_FONT;
  protected readonly typeSize        = TYPOGRAPHY_SIZE;
  protected readonly typeLh          = TYPOGRAPHY_LH;
  protected readonly typeLs          = TYPOGRAPHY_LS;
  protected readonly typeFw          = TYPOGRAPHY_FW;
  protected readonly spacing         = SPACING;
  protected readonly radius          = RADIUS;
  protected readonly shadows         = SHADOWS;
  protected readonly motionDur       = MOTION_DUR;
  protected readonly motionEase      = MOTION_EASE;
  protected readonly densityHit      = DENSITY_HIT;
  protected readonly densityTiers    = DENSITY_TIERS;
  protected readonly layoutBp        = LAYOUT_BP;
  protected readonly layoutCol       = LAYOUT_COL;
  protected readonly icons           = ICONS;
  protected readonly miscBw          = MISC_BW;
  protected readonly miscOpacity     = MISC_OPACITY;
  protected readonly miscBlur        = MISC_BLUR;
  protected readonly componentTokens = COMPONENT_TOKENS;

  protected hasShadowSample(name: string): boolean {
    return name === '--z100' || name === '--z200' || name === '--z300' || name === '--z400'
      || name === '--shadow-card' || name === '--shadow-popover' || name === '--shadow-toast' || name === '--shadow-modal';
  }

  /** True when the default value resolves to a colour token (drives the swatch chip vs "geometry" placeholder). */
  protected isColorValue(value: string): boolean {
    const colourTokens = [
      'brand', 'danger', 'success', 'warning', 'info',
      'text-', 'icon-', 'surface-', 'border-', 'neutral-',
    ];
    if (value === 'transparent' || value === 'none') return false;
    return colourTokens.some(prefix => value.includes(prefix));
  }
}
