import type { TypeRow } from './tokens-reference.types';

export const TYPOGRAPHY_FONT: readonly TypeRow[] = [
  {
    name: '--font-sans',
    value: 'Mulish, system-ui',
    sample: 'The quick brown fox jumps over the lazy dog',
    sampleClass: 'sample-font',
    notes: 'Body and UI text.',
  },
  {
    name: '--font-mono',
    value: 'JetBrains Mono, ui-monospace',
    sample: 'const total = items.reduce(sum, 0);',
    sampleClass: 'sample-font',
    notes: 'Code, tokens, kbd, numeric.',
  },
  {
    name: '--font-display',
    value: 'var(--font-sans)',
    sample: 'Display sample',
    sampleClass: 'sample-font',
    notes: 'Hero / display headings. Themable.',
  },
  {
    name: '--font-heading',
    value: 'var(--font-sans)',
    sample: 'Heading sample',
    sampleClass: 'sample-font',
    notes: 'h1–h5 headings. Themable.',
  },
];

export const TYPOGRAPHY_SIZE: readonly TypeRow[] = [
  {
    name: '--font-size-display',
    value: '64px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Display hero.',
  },
  {
    name: '--font-size-h1',
    value: '48px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Page title.',
  },
  {
    name: '--font-size-h2',
    value: '36px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Section title.',
  },
  {
    name: '--font-size-h3',
    value: '28px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Sub-section.',
  },
  {
    name: '--font-size-h4',
    value: '22px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Card / panel title.',
  },
  {
    name: '--font-size-h5',
    value: '18px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Small heading.',
  },
  {
    name: '--font-size-h5-strong',
    value: '20px',
    sample: 'Aa',
    sampleClass: 'sample-fs',
    notes: 'Modal titles, condensed headers.',
  },
  {
    name: '--font-size-l',
    value: '18px',
    sample: 'Body large',
    sampleClass: 'sample-fs',
    notes: 'Lede paragraph.',
  },
  {
    name: '--font-size-m',
    value: '16px',
    sample: 'Body medium',
    sampleClass: 'sample-fs',
    notes: 'Default body.',
  },
  {
    name: '--font-size-s',
    value: '14px',
    sample: 'Body small',
    sampleClass: 'sample-fs',
    notes: 'Dense body, table cells.',
  },
  {
    name: '--font-size-xs',
    value: '12px',
    sample: 'Body xs',
    sampleClass: 'sample-fs',
    notes: 'Captions, table head, helper text.',
  },
  {
    name: '--font-size-2xs',
    value: '11px',
    sample: 'Tiny',
    sampleClass: 'sample-fs',
    notes: 'Overline labels.',
  },
  {
    name: '--font-size-3xs',
    value: '10px',
    sample: 'Micro',
    sampleClass: 'sample-fs',
    notes: 'avatar-sm font.',
  },
  {
    name: '--font-size-4xs',
    value: '9px',
    sample: 'Micro',
    sampleClass: 'sample-fs',
    notes: 'avatar-xs font.',
  },
  {
    name: '--font-size-mono',
    value: '13px',
    sample: 'const x = 42;',
    sampleClass: 'sample-fs',
    notes: 'Inline mono / code blocks.',
  },
];

export const TYPOGRAPHY_LH: readonly TypeRow[] = [
  {
    name: '--line-height-tight',
    value: '1.1',
    sample: 'Tight leading — display\nand h1 headings.',
    sampleClass: 'sample-lh',
    notes: 'Display + h1.',
  },
  {
    name: '--line-height-snug',
    value: '1.25',
    sample: 'Snug leading — sub-headings\nand condensed UI.',
    sampleClass: 'sample-lh',
    notes: 'h2–h5.',
  },
  {
    name: '--line-height-base',
    value: '1.4',
    sample: 'Base leading — body copy\nand most UI.',
    sampleClass: 'sample-lh',
    notes: 'Body default.',
  },
  {
    name: '--line-height-loose',
    value: '1.6',
    sample: 'Loose leading — long-form\nreading and editorial.',
    sampleClass: 'sample-lh',
    notes: 'Long-form prose, mono blocks.',
  },
  {
    name: '--line-height-flat',
    value: '1',
    sample: 'Flat leading',
    sampleClass: 'sample-lh',
    notes: 'Button labels, single-line UI.',
  },
];

export const TYPOGRAPHY_LS: readonly TypeRow[] = [
  {
    name: '--letter-spacing-tight',
    value: '-.02em',
    sample: 'Tight tracking — display, h1',
    sampleClass: 'sample-ls',
    notes: 'Display / h1.',
  },
  {
    name: '--letter-spacing-snug',
    value: '-.01em',
    sample: 'Snug tracking — h2, h3',
    sampleClass: 'sample-ls',
    notes: 'h2 / h3.',
  },
  {
    name: '--letter-spacing-normal',
    value: '0',
    sample: 'Normal tracking — body text',
    sampleClass: 'sample-ls',
    notes: 'Default body.',
  },
  {
    name: '--letter-spacing-wide',
    value: '.02em',
    sample: 'Wide tracking — labels',
    sampleClass: 'sample-ls',
    notes: 'Subtle emphasis.',
  },
  {
    name: '--letter-spacing-wider',
    value: '.08em',
    sample: 'WIDER TRACKING — OVERLINE',
    sampleClass: 'sample-ls',
    notes: 'Overline / uppercase eyebrows.',
  },
];

export const TYPOGRAPHY_FW: readonly TypeRow[] = [
  {
    name: '--font-weight-regular',
    value: '400',
    sample: 'Regular — body text',
    sampleClass: 'sample-fw',
    notes: 'Body default.',
  },
  {
    name: '--font-weight-medium',
    value: '500',
    sample: 'Medium — mono / nav',
    sampleClass: 'sample-fw',
    notes: 'Mono code, nav items.',
  },
  {
    name: '--font-weight-semibold',
    value: '600',
    sample: 'Semibold — emphasis',
    sampleClass: 'sample-fw',
    notes: 'Field labels, mild emphasis.',
  },
  {
    name: '--font-weight-bold',
    value: '700',
    sample: 'Bold — headings h4/h5',
    sampleClass: 'sample-fw',
    notes: 'h4–h5, strong body.',
  },
  {
    name: '--font-weight-extrabold',
    value: '800',
    sample: 'Extrabold — display, h1',
    sampleClass: 'sample-fw',
    notes: 'Display + h1–h3.',
  },
];
