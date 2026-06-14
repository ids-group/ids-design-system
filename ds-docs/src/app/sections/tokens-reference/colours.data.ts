import type { ColourRow, RampSpec } from './tokens-reference.types';

export const SEMANTIC_PRIMARY: readonly ColourRow[] = [
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

export const SEMANTIC_TERTIARY: readonly ColourRow[] = [
  { name: '--tertiary',         value: 'hsl(--tertiary-h, --tertiary-s, --tertiary-l)',  notes: 'Third brand hue — tertiary button fill, tonal chips, indicators.' },
  { name: '--tertiary-hover',   value: 'color-mix(--tertiary 88%, black)',           notes: 'Hover on tertiary fill.' },
  { name: '--tertiary-pressed', value: 'color-mix(--tertiary 76%, black)',           notes: 'Pressed tertiary fill.' },
  { name: '--tertiary-strong',  value: 'hsl(--tertiary-h, --tertiary-s, --tertiary-l - 11%)', notes: 'Darker tertiary for text on tertiary tints.' },
  { name: '--tertiary-subtle',  value: 'hsl(--tertiary-h, 100%, 97%)',               notes: 'Light tertiary tint surface.' },
  { name: '--tertiary-muted',   value: 'hsl(--tertiary-h, 95%, 94%)',                notes: 'Slightly stronger tint than subtle.' },
  { name: '--tertiary-on',      value: 'var(--primary-on)',                          notes: 'Text/icon colour ON tertiary fill.', inverted: true },
];

export const SEMANTIC_ERROR: readonly ColourRow[] = [
  { name: '--error',         value: 'var(--red-500)', notes: 'Destructive action fill, error border.' },
  { name: '--error-hover',   value: 'var(--red-600)', notes: 'Hover on danger fill.' },
  { name: '--error-pressed', value: 'var(--red-700)', notes: 'Pressed danger fill.' },
  { name: '--error-subtle',  value: 'var(--red-50)',  notes: 'Inline error banner background.' },
  { name: '--error-muted',   value: 'var(--red-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--error-border',  value: 'var(--red-200)', notes: 'Border on subtle danger surfaces.' },
  { name: '--error-text',    value: 'var(--red-600)', notes: 'Body text on danger surfaces.' },
];

export const SEMANTIC_SUCCESS: readonly ColourRow[] = [
  { name: '--success',        value: 'var(--green-500)', notes: 'Success fill, confirmation dot.' },
  { name: '--success-hover',  value: 'var(--green-600)', notes: 'Hover on success fill.' },
  { name: '--success-subtle', value: 'var(--green-50)',  notes: 'Success banner background.' },
  { name: '--success-muted',  value: 'var(--green-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--success-border', value: 'var(--green-200)', notes: 'Border on subtle success surfaces.' },
  { name: '--success-text',   value: 'var(--green-700)', notes: 'Body text on success surfaces.' },
];

export const SEMANTIC_WARNING: readonly ColourRow[] = [
  { name: '--warning',        value: 'var(--yellow-400)', notes: 'Warning fill / attention badge.' },
  { name: '--warning-hover',  value: 'var(--yellow-500)', notes: 'Hover on warning fill.' },
  { name: '--warning-subtle', value: 'var(--yellow-50)',  notes: 'Warning banner background.' },
  { name: '--warning-muted',  value: 'var(--yellow-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--warning-border', value: 'var(--yellow-200)', notes: 'Border on subtle warning surfaces.' },
  { name: '--warning-text',   value: 'var(--yellow-700)', notes: 'Body text on warning surfaces.' },
];

export const SEMANTIC_INFO: readonly ColourRow[] = [
  { name: '--info',        value: 'var(--sky-500)', notes: 'Informational fill / icon.' },
  { name: '--info-hover',  value: 'var(--sky-600)', notes: 'Hover on info fill.' },
  { name: '--info-subtle', value: 'var(--sky-50)',  notes: 'Info banner background.' },
  { name: '--info-muted',  value: 'var(--sky-100)', notes: 'Slightly stronger tint than subtle.' },
  { name: '--info-border', value: 'var(--sky-200)', notes: 'Border on subtle info surfaces.' },
  { name: '--info-text',   value: 'var(--sky-700)', notes: 'Body text on info surfaces.' },
];

export const SEMANTIC_TEXT: readonly ColourRow[] = [
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

export const SEMANTIC_SURFACE: readonly ColourRow[] = [
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

export const SEMANTIC_BORDER: readonly ColourRow[] = [
  { name: '--border-default',  value: 'var(--neutral-200)', notes: 'Default field / card border.' },
  { name: '--border-strong',   value: 'var(--neutral-300)', notes: 'Hover / emphasised border.' },
  { name: '--border-subtle',   value: 'var(--neutral-150)', notes: 'Faint border, light dividers.' },
  { name: '--border-divider',  value: 'var(--neutral-150)', notes: 'Section dividers, table rows.' },
  { name: '--border-inverted', value: 'var(--neutral-700)', notes: 'Border on dark surfaces.', inverted: true },
  { name: '--border-disabled', value: 'var(--neutral-150)', notes: 'Disabled control border.' },
];

export const SEMANTIC_FOCUS: readonly ColourRow[] = [
  { name: '--focus-ring-inner',       value: 'var(--surface-canvas)', notes: 'Inner ring band (reads canvas — flips with theme).' },
  { name: '--focus-ring-outer-h',     value: 'var(--primary-h)',        notes: 'Outer halo hue channel — re-skin propagates.' },
  { name: '--focus-ring-outer-s',     value: 'var(--primary-s)',        notes: 'Outer halo saturation channel.' },
  { name: '--focus-ring-outer-l',     value: 'var(--primary-l)',        notes: 'Outer halo lightness channel.' },
  { name: '--focus-ring-outer-alpha', value: '1',                     notes: 'Outer halo alpha.' },
  { name: '--focus-field-alpha',      value: '.22',                   notes: 'Field focus halo alpha (boost in dark themes).' },
];

export const RAMPS: readonly RampSpec[] = [
  { label: 'Neutral', prefix: 'neutral', stops: [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950], notes: '13 stops. Base for surface/border/text.' },
  { label: 'Blue (primary)', prefix: 'blue', stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], notes: 'HSL-channel split — default theme maps --primary here; drives focus halos and re-skin.' },
  { label: 'Orange', prefix: 'orange', stops: [50, 100, 200, 300, 400, 500, 600, 700, 800], notes: 'Secondary signal, focus accent.' },
  { label: 'Green (success)', prefix: 'green', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'Status — success / confirmed.' },
  { label: 'Yellow (warning)', prefix: 'yellow', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'Status — attention / warning.' },
  { label: 'Red (error)', prefix: 'red', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'HSL-channel split — default theme maps --error here; drives error halos.' },
  { label: 'Sky (info)', prefix: 'sky', stops: [50, 100, 200, 300, 400, 500, 600, 700], notes: 'Informational — a brighter blue, distinct from the primary --blue ramp.' },
];
