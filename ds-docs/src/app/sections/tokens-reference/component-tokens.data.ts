import type { ComponentTokenGroup } from './tokens-reference.types';

export const COMPONENT_TOKENS: readonly ComponentTokenGroup[] = [
  {
    component: 'Button',
    selector: '.button',
    description:
      'Read with fallbacks, never declared by DS — override on the host or any ancestor. ' +
      'For solid variants (primary/error/success/warning) hover/active derive from --ds-button-bg-color ' +
      'via color-mix (88% / 76% + black); tonal variants keep explicit ramp defaults. Press = darken + micro scale-down.',
    tokens: [
      {
        name: '--ds-button-bg-color',
        value: 'var(--primary)',
        notes: 'Surface fill — variants re-point the default.',
      },
      {
        name: '--ds-button-bg-color-hover',
        value: 'color-mix(bg 88%, black)',
        notes: 'Hover fill — derived from the resolved bg unless set.',
      },
      {
        name: '--ds-button-bg-color-active',
        value: 'color-mix(bg 76%, black)',
        notes: 'Active/pressed fill — derived from the resolved bg unless set.',
      },
      {
        name: '--ds-button-label-color',
        value: 'var(--primary-on)',
        notes: 'Label/icon colour.',
      },
      {
        name: '--ds-button-border',
        value: 'transparent',
        notes: 'Border colour (outline variant overrides).',
      },
      {
        name: '--ds-button-bg-color-disabled',
        value: 'oklch(accent .92 .03)',
        notes:
          'Disabled fill — per-variant muted tint: A (flat pale) for solid + text; secondary/tertiary/outline use B = color-mix(fill 28%, surface-disabled).',
      },
      {
        name: '--ds-button-label-color-disabled',
        value: 'oklch(accent .58 .035)',
        notes: 'Disabled label — low-chroma tint of the accent hue.',
      },
      {
        name: '--ds-button-border-disabled',
        value: 'oklch(accent .86 .04)',
        notes: 'Disabled border (B variants: color-mix(border 55%)).',
      },
      {
        name: '--ds-button-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-button-focus-shadow',
        value: 'var(--focus-ring)',
        notes: 'Focus halo.',
      },
      {
        name: '--ds-button-press-scale',
        value: '0.98',
        notes: 'Press scale-down on :active (set 1 to disable).',
      },
      {
        name: '--ds-button-pressed-shadow',
        value: 'none',
        notes:
          'Opt-in pressed halo (default off) — set to re-enable a ring on press.',
      },
    ],
  },
  {
    component: 'Icon button',
    selector: '.icon-button',
    description:
      'Read with fallbacks, never declared by DS — override on the host or any ancestor. ' +
      'filled/selected derive hover/active from --ds-icon-button-bg-color via color-mix (88% / 76% + black); ' +
      'standard/tonal/outlined keep explicit ramp defaults.',
    tokens: [
      {
        name: '--ds-icon-button-bg-color',
        value: 'transparent',
        notes:
          'Surface fill — variants re-point the default (filled/selected → --primary).',
      },
      {
        name: '--ds-icon-button-icon-color',
        value: 'var(--text-secondary)',
        notes: 'Icon colour.',
      },
      {
        name: '--ds-icon-button-border',
        value: 'transparent',
        notes: 'Border colour (outlined variant overrides).',
      },
      {
        name: '--ds-icon-button-bg-color-hover',
        value: 'var(--surface-muted)',
        notes: 'Hover fill — filled/selected derive it from the resolved bg.',
      },
      {
        name: '--ds-icon-button-bg-color-active',
        value: 'var(--ds-icon-button-bg-color-hover)',
        notes:
          'Pressed fill — follows hover unless set; filled/selected derive 76% mix.',
      },
      {
        name: '--ds-icon-button-icon-color-hover',
        value: 'var(--text-primary)',
        notes: 'Hover icon colour.',
      },
      {
        name: '--ds-icon-button-bg-color-disabled',
        value: 'transparent · filled/selected: oklch(accent .92 .03)',
        notes:
          'Disabled fill — boxless for standard; tonal/outlined use color-mix(fill 28%, surface-disabled).',
      },
      {
        name: '--ds-icon-button-icon-color-disabled',
        value: 'oklch(accent .58 .035)',
        notes: 'Disabled icon — low-chroma tint of the accent hue.',
      },
      {
        name: '--ds-icon-button-border-disabled',
        value: 'transparent · outlined: color-mix(border 55%)',
        notes: 'Disabled border.',
      },
      {
        name: '--ds-icon-button-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-icon-button-focus-shadow',
        value: 'var(--focus-ring)',
        notes: 'Focus halo.',
      },
      {
        name: '--ds-icon-button-press-scale',
        value: '0.96',
        notes: 'Press scale-down on :active (set 1 to disable).',
      },
    ],
  },
  {
    component: 'Badge',
    selector: '.badge',
    description:
      'Lifecycle/semantic modifiers override --ds-badge-bg-color and --ds-badge-label-color.',
    tokens: [
      {
        name: '--ds-badge-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Surface fill.',
      },
      {
        name: '--ds-badge-label-color',
        value: 'var(--text-secondary)',
        notes: 'Label colour.',
      },
      {
        name: '--ds-badge-radius',
        value: 'var(--radius-pill)',
        notes: 'Pill radius.',
      },
      {
        name: '--ds-badge-pad-x',
        value: 'var(--badge-pad-x)',
        notes: 'Horizontal padding.',
      },
      {
        name: '--ds-badge-pad-y',
        value: 'var(--badge-pad-y)',
        notes: 'Vertical padding.',
      },
      {
        name: '--ds-badge-font-weight',
        value: 'var(--font-weight-bold)',
        notes: 'Label weight.',
      },
    ],
  },
  {
    component: 'Tag',
    selector: ':host (ds-tag)',
    description:
      'Pill label. Interactive / filter-chip modes add hover + selected (active) tokens; ' +
      'the selected state re-points bg / fg / border.',
    tokens: [
      {
        name: '--ds-tag-bg-color',
        value: 'var(--primary)',
        notes:
          'Surface fill — interactive/ghost re-point to --surface-secondary.',
      },
      {
        name: '--ds-tag-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-tag-pad-x',
        value: 'var(--tag-pad-x)',
        notes: 'Horizontal padding.',
      },
      {
        name: '--ds-tag-pad-y',
        value: 'var(--tag-pad-y)',
        notes: 'Vertical padding.',
      },
      {
        name: '--ds-tag-fw',
        value: 'var(--font-weight-bold)',
        notes: 'Label weight.',
      },
      {
        name: '--ds-tag-fs',
        value: 'var(--font-size-xs)',
        notes: 'Label size.',
      },
      {
        name: '--ds-tag-lh',
        value: 'var(--line-height-base)',
        notes: 'Label line-height.',
      },
      {
        name: '--ds-tag-hover-bg-color',
        value: 'var(--surface-muted)',
        notes: 'Hover fill (interactive mode).',
      },
      {
        name: '--ds-tag-active-bg-color',
        value: 'var(--primary-muted)',
        notes: 'Selected fill.',
      },
      {
        name: '--ds-tag-active-label-color',
        value: 'var(--primary-strong)',
        notes: 'Selected label.',
      },
      {
        name: '--ds-tag-active-border',
        value: 'var(--primary)',
        notes: 'Selected border.',
      },
    ],
  },
  {
    component: 'Status dot',
    selector: '.status-dot',
    description: 'Severity classes only override --ds-statusdot-color.',
    tokens: [
      {
        name: '--ds-statusdot-size',
        value: 'var(--status-dot-size)',
        notes: 'Diameter.',
      },
      {
        name: '--ds-statusdot-color',
        value: 'var(--neutral-400)',
        notes: 'Default = planning.',
      },
    ],
  },
  {
    component: 'Avatar',
    selector: ':host (ds-avatar)',
    description: 'Initials & image avatar. Used inside avatar-group with ring.',
    tokens: [
      {
        name: '--ds-avatar-size',
        value: 'var(--avatar-md)',
        notes: 'Width / height.',
      },
      {
        name: '--ds-avatar-bg-color',
        value: 'var(--primary-muted)',
        notes: 'Surface fill.',
      },
      {
        name: '--ds-avatar-label-color',
        value: 'var(--primary-strong)',
        notes: 'Initials colour.',
      },
      {
        name: '--ds-avatar-radius',
        value: 'var(--radius-pill)',
        notes: 'Pill / square.',
      },
      {
        name: '--ds-avatar-ring-width',
        value: 'var(--avatar-bw-group)',
        notes: 'Ring width when stacked.',
      },
    ],
  },
  {
    component: 'Avatar group',
    selector: ':host (ds-avatar-group)',
    description: 'Stack overlap + ring colour.',
    tokens: [
      {
        name: '--ds-avatargroup-overlap',
        value: 'calc(-1 * var(--space-2))',
        notes: 'Negative gap between avatars.',
      },
      {
        name: '--ds-avatargroup-ring',
        value: 'var(--surface-default)',
        notes: 'Outline between stacked avatars.',
      },
    ],
  },
  {
    component: 'Card',
    selector: '.card',
    description:
      'Surface, border, radius, padding, shadow (flat / raised / hover / interactive).',
    tokens: [
      {
        name: '--ds-card-bg-color',
        value: 'var(--surface-default)',
        notes: 'Card fill.',
      },
      {
        name: '--ds-card-border',
        value: 'var(--border-divider)',
        notes: 'Card border.',
      },
      {
        name: '--ds-card-radius',
        value: 'var(--radius-lg)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-card-pad',
        value: 'var(--space-6)',
        notes: 'Inner padding.',
      },
      { name: '--ds-card-shadow', value: 'none', notes: 'Default (flat).' },
      {
        name: '--ds-card-shadow-hover',
        value: 'var(--shadow-1)',
        notes: 'Hover lift shadow.',
      },
      {
        name: '--ds-card-focus-shadow',
        value: 'var(--focus-ring)',
        notes: 'Focus halo on interactive cards.',
      },
      {
        name: '--ds-card-hover-lift',
        value: 'var(--card-hover-lift)',
        notes: 'Translate-Y on hover.',
      },
    ],
  },
  {
    component: 'Stat',
    selector: '.stat',
    description: 'KPI tile: surface, label, value, delta up/down.',
    tokens: [
      {
        name: '--ds-stat-bg-color',
        value: 'var(--surface-default)',
        notes: 'Tile fill.',
      },
      {
        name: '--ds-stat-border',
        value: 'var(--border-divider)',
        notes: 'Tile border.',
      },
      {
        name: '--ds-stat-radius',
        value: 'var(--radius-lg)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-stat-pad',
        value: 'var(--ds-container-pad)',
        notes: 'Inner padding.',
      },
      {
        name: '--ds-stat-label-color',
        value: 'var(--text-tertiary)',
        notes: 'Label colour.',
      },
      {
        name: '--ds-stat-value-color',
        value: 'var(--text-primary)',
        notes: 'Value colour.',
      },
      {
        name: '--ds-stat-up-color',
        value: 'var(--success-text)',
        notes: 'Positive delta.',
      },
      {
        name: '--ds-stat-down-color',
        value: 'var(--error-text)',
        notes: 'Negative delta.',
      },
    ],
  },
  {
    component: 'Tabs',
    selector: '.tabs',
    description:
      'Underline + pills variants. Pills tokens activate inside .tabs.pills.',
    tokens: [
      {
        name: '--ds-tab-label-color',
        value: 'var(--text-secondary)',
        notes: 'Default tab label.',
      },
      {
        name: '--ds-tab-label-color-hover',
        value: 'var(--text-primary)',
        notes: 'Hover label.',
      },
      {
        name: '--ds-tab-label-color-active',
        value: 'var(--primary)',
        notes: 'Active label.',
      },
      {
        name: '--ds-tab-indicator-color',
        value: 'var(--primary)',
        notes: 'Underline colour.',
      },
      {
        name: '--ds-tab-indicator-width',
        value: 'var(--border-width-strong)',
        notes: 'Underline thickness.',
      },
      {
        name: '--ds-tab-pad-x',
        value: 'var(--space-4)',
        notes: 'Horizontal padding.',
      },
      {
        name: '--ds-tab-pad-y',
        value: 'var(--space-3)',
        notes: 'Vertical padding.',
      },
      {
        name: '--ds-tabs-divider',
        value: 'var(--border-divider)',
        notes: 'Bottom divider.',
      },
      {
        name: '--ds-tabs-pills-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Pills track fill.',
      },
      {
        name: '--ds-tab-pill-bg-color-active',
        value: 'var(--surface-default)',
        notes: 'Active pill thumb.',
      },
      {
        name: '--ds-tab-pill-bg-color-hover',
        value: 'var(--primary-subtitle)',
        notes: 'Pill hover fill.',
      },
      {
        name: '--ds-tab-pill-bg-color-active-hover',
        value: 'var(--primary-subtitle)',
        notes: 'Active pill hover fill.',
      },
      {
        name: '--ds-tab-pill-label-color-active',
        value: 'var(--primary-strong)',
        notes: 'Active pill label.',
      },
      {
        name: '--ds-tab-pill-radius',
        value: 'var(--radius-md)',
        notes: 'Pill radius.',
      },
    ],
  },
  {
    component: 'Input',
    selector: '.field',
    description:
      'Default field — surface, border (default/hover/focus), error/success/disabled, focus shadow.',
    tokens: [
      {
        name: '--ds-input-bg-color',
        value: 'var(--surface-default)',
        notes: 'Field fill.',
      },
      {
        name: '--ds-input-border',
        value: 'var(--border-default)',
        notes: 'Default border.',
      },
      {
        name: '--ds-input-border-hover',
        value: 'var(--border-strong)',
        notes: 'Hover border.',
      },
      {
        name: '--ds-input-border-focus',
        value: 'var(--primary)',
        notes: 'Focus border.',
      },
      {
        name: '--ds-input-text-color',
        value: 'var(--text-primary)',
        notes: 'Value text.',
      },
      {
        name: '--ds-input-placeholder',
        value: 'var(--text-tertiary)',
        notes: 'Placeholder text.',
      },
      {
        name: '--ds-input-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-input-pad-x',
        value: 'var(--field-pad-x)',
        notes: 'Horizontal padding.',
      },
      {
        name: '--ds-input-pad-y',
        value: 'var(--field-pad-y)',
        notes: 'Vertical padding.',
      },
      {
        name: '--ds-input-focus-shadow',
        value: 'var(--focus-field)',
        notes: 'Focus halo.',
      },
      {
        name: '--ds-input-border-error',
        value: 'var(--error)',
        notes: 'Error border.',
      },
      {
        name: '--ds-input-bg-color-error',
        value: 'var(--error-subtitle)',
        notes: 'Error fill tint.',
      },
      {
        name: '--ds-input-border-success',
        value: 'var(--success)',
        notes: 'Success border.',
      },
      {
        name: '--ds-input-bg-color-disabled',
        value: 'var(--surface-disabled)',
        notes: 'Disabled fill.',
      },
      {
        name: '--ds-input-fs',
        value: 'var(--font-size-s)',
        notes: 'Value text size.',
      },
      {
        name: '--ds-input-label-color',
        value: 'var(--text-secondary)',
        notes: 'Label colour.',
      },
      {
        name: '--ds-input-label-fs',
        value: 'var(--font-size-xs)',
        notes: 'Label size.',
      },
      {
        name: '--ds-input-label-fw',
        value: 'var(--font-weight-bold)',
        notes: 'Label weight.',
      },
    ],
  },
  {
    component: 'Field message',
    selector: '.field-message',
    description:
      'Shared helper / error line rendered by every form field (input, textarea, select, multi-select, otp-input, slider, color-picker). The error state uses --error-text and success uses --success-text; these two hooks tune the neutral helper text.',
    tokens: [
      {
        name: '--ds-field-message-color',
        value: 'var(--text-tertiary)',
        notes: 'Default (neutral) helper-text colour.',
      },
      {
        name: '--ds-field-message-font-size',
        value: 'var(--font-size-xs)',
        notes: 'Helper-text size.',
      },
    ],
  },
  {
    component: 'Select',
    selector: '.field (select)',
    description:
      'Same surface as Input. --ds-select-* vars default to the matching --ds-input-* var.',
    tokens: [
      {
        name: '--ds-input-bg-color',
        value: 'var(--surface-default)',
        notes: 'Field fill.',
      },
      {
        name: '--ds-input-border',
        value: 'var(--border-default)',
        notes: 'Default border.',
      },
      {
        name: '--ds-input-border-hover',
        value: 'var(--border-strong)',
        notes: 'Hover border.',
      },
      {
        name: '--ds-input-border-focus',
        value: 'var(--primary)',
        notes: 'Focus border.',
      },
      {
        name: '--ds-input-text-color',
        value: 'var(--text-primary)',
        notes: 'Value text.',
      },
      {
        name: '--ds-input-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-input-focus-shadow',
        value: 'var(--focus-field)',
        notes: 'Focus halo.',
      },
      {
        name: '--ds-input-border-error',
        value: 'var(--error)',
        notes: 'Error border.',
      },
      {
        name: '--ds-input-border-success',
        value: 'var(--success)',
        notes: 'Success border.',
      },
      {
        name: '--ds-input-bg-color-disabled',
        value: 'var(--surface-disabled)',
        notes: 'Disabled fill.',
      },
    ],
  },
  {
    component: 'Search',
    selector: '.search',
    description:
      'Compact search pill — secondary surface by default, brand-focused border.',
    tokens: [
      {
        name: '--ds-search-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Default fill.',
      },
      {
        name: '--ds-search-bg-color-focus',
        value: 'var(--surface-default)',
        notes: 'Focused fill.',
      },
      {
        name: '--ds-search-border',
        value: 'transparent',
        notes: 'Default border.',
      },
      {
        name: '--ds-search-border-hover',
        value: 'var(--border-default)',
        notes: 'Hover border.',
      },
      {
        name: '--ds-search-border-focus',
        value: 'var(--primary)',
        notes: 'Focus border.',
      },
      {
        name: '--ds-search-focus-shadow',
        value: 'var(--focus-field)',
        notes: 'Focus halo.',
      },
      {
        name: '--ds-search-text-color',
        value: 'var(--text-primary)',
        notes: 'Query text.',
      },
      {
        name: '--ds-search-placeholder',
        value: 'var(--text-tertiary)',
        notes: 'Placeholder.',
      },
      {
        name: '--ds-search-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-search-height',
        value: 'var(--search-h)',
        notes: 'Control height.',
      },
    ],
  },
  {
    component: 'Table',
    selector: '.table',
    description:
      'Data table — surface, head, divider, hover/selected row, sort accent.',
    tokens: [
      {
        name: '--ds-table-bg-color',
        value: 'var(--surface-default)',
        notes: 'Table fill.',
      },
      {
        name: '--ds-table-row-hover-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Row hover fill.',
      },
      {
        name: '--ds-table-row-selected-bg-color',
        value: 'var(--primary-subtitle)',
        notes: 'Selected row.',
      },
      {
        name: '--ds-table-head-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Head fill.',
      },
      {
        name: '--ds-table-head-text-color',
        value: 'var(--text-tertiary)',
        notes: 'Head label.',
      },
      {
        name: '--ds-table-divider',
        value: 'var(--border-divider)',
        notes: 'Row divider.',
      },
      {
        name: '--ds-table-sort-active-icon-color',
        value: 'var(--primary)',
        notes: 'Active sort caret.',
      },
      {
        name: '--ds-table-cell-pad-x',
        value: 'var(--table-cell-pad-x)',
        notes: 'Cell horizontal padding.',
      },
      {
        name: '--ds-table-cell-pad-y',
        value: 'var(--table-cell-pad-y)',
        notes: 'Cell vertical padding.',
      },
      {
        name: '--ds-table-radius',
        value: 'var(--radius-xl)',
        notes: 'Outer corner radius.',
      },
      {
        name: '--ds-table-border',
        value: 'var(--border-default)',
        notes: 'Outer border.',
      },
      {
        name: '--ds-table-head-fs',
        value: 'var(--font-size-xs)',
        notes: 'Head label size.',
      },
      {
        name: '--ds-table-head-h',
        value: '40px',
        notes: 'Sticky head height.',
      },
    ],
  },
  {
    component: 'Pagination',
    selector: '.pagination',
    description: 'Pager buttons + active state.',
    tokens: [
      {
        name: '--ds-pagination-btn-bg-color',
        value: 'var(--surface-default)',
        notes: 'Button fill.',
      },
      {
        name: '--ds-pagination-btn-bg-color-hover',
        value: 'var(--surface-secondary)',
        notes: 'Hover fill.',
      },
      {
        name: '--ds-pagination-btn-label-color',
        value: 'var(--text-secondary)',
        notes: 'Button label.',
      },
      {
        name: '--ds-pagination-btn-label-color-hover',
        value: 'var(--text-primary)',
        notes: 'Hover label.',
      },
      {
        name: '--ds-pagination-btn-border',
        value: 'var(--border-default)',
        notes: 'Button border.',
      },
      {
        name: '--ds-pagination-active-bg-color',
        value: 'var(--primary)',
        notes: 'Active page fill.',
      },
      {
        name: '--ds-pagination-active-label-color',
        value: 'var(--primary-on)',
        notes: 'Active page label.',
      },
      {
        name: '--ds-pagination-radius',
        value: 'var(--radius-md)',
        notes: 'Button radius.',
      },
      {
        name: '--ds-pagination-active-bg-color-hover',
        value: 'var(--primary-hover)',
        notes: 'Active page hover fill.',
      },
    ],
  },
  {
    component: 'Date picker',
    selector: '.calendar',
    description:
      'Pop-over surface + day cell states (today / selected / range / disabled).',
    tokens: [
      {
        name: '--ds-datepicker-bg-color',
        value: 'var(--surface-overlay)',
        notes: 'Popover fill.',
      },
      {
        name: '--ds-datepicker-border',
        value: 'var(--border-default)',
        notes: 'Popover border.',
      },
      {
        name: '--ds-datepicker-shadow',
        value: 'var(--shadow-popover)',
        notes: 'Popover shadow.',
      },
      {
        name: '--ds-datepicker-day-hover-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Day hover fill.',
      },
      {
        name: '--ds-datepicker-day-today-label-color',
        value: 'var(--primary)',
        notes: 'Today label.',
      },
      {
        name: '--ds-datepicker-day-selected-bg-color',
        value: 'var(--primary)',
        notes: 'Selected day fill.',
      },
      {
        name: '--ds-datepicker-day-selected-label-color',
        value: 'var(--primary-on)',
        notes: 'Selected day label.',
      },
      {
        name: '--ds-datepicker-day-range-bg-color',
        value: 'var(--primary-subtitle)',
        notes: 'Range fill.',
      },
      {
        name: '--ds-datepicker-day-range-label-color',
        value: 'var(--primary-strong)',
        notes: 'Range label.',
      },
      {
        name: '--ds-datepicker-day-disabled-label-color',
        value: 'var(--text-disabled)',
        notes: 'Disabled day label.',
      },
      {
        name: '--ds-datepicker-width',
        value: 'var(--datepicker-w)',
        notes: 'Calendar width.',
      },
      {
        name: '--ds-datepicker-day-selected-bg-color-hover',
        value: 'var(--primary-selected-hover)',
        notes: 'Selected day hover fill.',
      },
    ],
  },
  {
    component: 'Breadcrumbs',
    selector: '.breadcrumbs',
    description: 'Inline link trail.',
    tokens: [
      {
        name: '--ds-breadcrumbs-label-color',
        value: 'var(--text-tertiary)',
        notes: 'Link colour.',
      },
      {
        name: '--ds-breadcrumbs-label-color-hover',
        value: 'var(--primary)',
        notes: 'Link hover.',
      },
      {
        name: '--ds-breadcrumbs-current-label-color',
        value: 'var(--text-primary)',
        notes: 'Current crumb.',
      },
      {
        name: '--ds-breadcrumbs-separator-icon-color',
        value: 'var(--icon-muted)',
        notes: 'Chevron / slash.',
      },
    ],
  },
  {
    component: 'Sidenav',
    selector: ':host / .item / .group-label',
    description:
      'Left rail chrome + items + group labels. Host vs item vs group vars are independent.',
    tokens: [
      {
        name: '--ds-sidenav-bg-color',
        value: 'var(--surface-default)',
        notes: 'Rail fill.',
      },
      {
        name: '--ds-sidenav-border',
        value: 'var(--border-divider)',
        notes: 'Rail border.',
      },
      {
        name: '--ds-sidenav-width',
        value: 'var(--sidenav-w)',
        notes: 'Expanded width.',
      },
      {
        name: '--ds-sidenav-width-collapsed',
        value: 'var(--sidenav-w-collapsed)',
        notes: 'Collapsed width.',
      },
      {
        name: '--ds-sidenav-mark-bg-color',
        value: 'var(--primary)',
        notes: 'Brand mark fill.',
      },
      {
        name: '--ds-sidenav-mark-label-color',
        value: 'var(--primary-on)',
        notes: 'Brand mark label.',
      },
      {
        name: '--ds-sidenav-item-label-color',
        value: 'var(--text-secondary)',
        notes: 'Item label.',
      },
      {
        name: '--ds-sidenav-item-label-color-hover',
        value: 'var(--text-primary)',
        notes: 'Item hover label.',
      },
      {
        name: '--ds-sidenav-item-bg-color-hover',
        value: 'var(--surface-secondary)',
        notes: 'Item hover fill.',
      },
      {
        name: '--ds-sidenav-item-bg-color-active',
        value: 'var(--primary)',
        notes: 'Active item fill.',
      },
      {
        name: '--ds-sidenav-item-label-color-active',
        value: 'var(--text-on-primary)',
        notes: 'Active item label.',
      },
      {
        name: '--ds-sidenav-item-radius',
        value: 'var(--radius-md)',
        notes: 'Item radius.',
      },
      {
        name: '--ds-sidenav-alert-color',
        value: 'var(--error)',
        notes: 'Alert pip colour.',
      },
      {
        name: '--ds-sidenav-group-label-color',
        value: 'var(--text-tertiary)',
        notes: 'Group section-label text colour.',
      },
      {
        name: '--ds-sidenav-group-open-bg-color',
        value: 'var(--surface-secondary)',
        notes: 'Open group fill.',
      },
      {
        name: '--ds-sidenav-group-child-indent',
        value: 'var(--space-3)',
        notes: 'Child item indent.',
      },
      {
        name: '--ds-sidenav-group-radius',
        value: 'var(--radius-md)',
        notes: 'Group radius.',
      },
      {
        name: '--ds-sidenav-item-bg-color-active-hover',
        value: 'color-mix(item-bg-active 88%, white)',
        notes: 'Active item hover fill.',
      },
      {
        name: '--ds-sidenav-item-rail',
        value: 'var(--secondary)',
        notes: 'Active item rail accent.',
      },
    ],
  },
  {
    component: 'Topbar',
    selector: '.topbar',
    description: 'App top bar — title, actions, ping indicator.',
    tokens: [
      {
        name: '--ds-topbar-bg-color',
        value: 'var(--surface-default)',
        notes: 'Bar fill.',
      },
      {
        name: '--ds-topbar-border',
        value: 'var(--border-divider)',
        notes: 'Bottom border.',
      },
      {
        name: '--ds-topbar-height',
        value: 'var(--topbar-h)',
        notes: 'Bar height.',
      },
      {
        name: '--ds-topbar-title-text-color',
        value: 'var(--text-primary)',
        notes: 'Title colour.',
      },
    ],
  },
  {
    component: 'Page header',
    selector: '.page-header',
    description: 'Title block + meta row.',
    tokens: [
      {
        name: '--ds-pagehdr-eyebrow-text-color',
        value: 'var(--text-tertiary)',
        notes: 'Eyebrow label.',
      },
      {
        name: '--ds-pagehdr-title-text-color',
        value: 'var(--text-primary)',
        notes: 'Title.',
      },
      {
        name: '--ds-pagehdr-subtitle-text-color',
        value: 'var(--text-secondary)',
        notes: 'Subtitle.',
      },
      {
        name: '--ds-pagehdr-meta-text-color',
        value: 'var(--text-secondary)',
        notes: 'Meta text.',
      },
      {
        name: '--ds-pagehdr-meta-icon-color',
        value: 'var(--icon-default)',
        notes: 'Meta icon.',
      },
      {
        name: '--ds-pagehdr-divider',
        value: 'var(--border-divider)',
        notes: 'Divider below header.',
      },
      {
        name: '--ds-pagehdr-title-fs',
        value: 'var(--font-size-h3)',
        notes: 'Title size.',
      },
      {
        name: '--ds-pagehdr-title-gap',
        value: 'var(--space-1-5)',
        notes: 'Gap below title.',
      },
    ],
  },
  {
    component: 'Modal',
    selector: '.modal',
    description:
      'Overlay dialog. Danger title fg is separate (--ds-modal-title-text-color-error).',
    tokens: [
      {
        name: '--ds-modal-bg-color',
        value: 'var(--surface-overlay)',
        notes: 'Dialog fill.',
      },
      {
        name: '--ds-modal-radius',
        value: 'var(--radius-lg)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-modal-shadow',
        value: 'var(--shadow-modal)',
        notes: 'Dialog shadow.',
      },
      {
        name: '--ds-modal-divider',
        value: 'var(--border-divider)',
        notes: 'Header/actions divider.',
      },
      {
        name: '--ds-modal-title-text-color',
        value: 'var(--text-primary)',
        notes: 'Title colour.',
      },
      {
        name: '--ds-modal-title-text-color-error',
        value: 'var(--error-text)',
        notes: 'Danger title colour.',
      },
      {
        name: '--ds-modal-close-icon-color',
        value: 'var(--icon-default)',
        notes: 'Close icon.',
      },
      {
        name: '--ds-modal-close-icon-color-hover',
        value: 'var(--icon-strong)',
        notes: 'Close icon hover.',
      },
      {
        name: '--ds-modal-backdrop',
        value: 'var(--surface-scrim)',
        notes: 'Backdrop scrim.',
      },
    ],
  },
  {
    component: 'Banner',
    selector: '.banner',
    description:
      'Severity modifiers (success/warning/severe/error) re-set bg, fg, bar, border.',
    tokens: [
      {
        name: '--ds-banner-bg-color',
        value: 'var(--info-subtitle)',
        notes: 'Banner fill (default = info).',
      },
      {
        name: '--ds-banner-text-color',
        value: 'var(--info-text)',
        notes: 'Body text.',
      },
      {
        name: '--ds-banner-bar',
        value: 'var(--info)',
        notes: 'Left bar colour.',
      },
      {
        name: '--ds-banner-title-text-color',
        value: 'var(--text-primary)',
        notes: 'Title colour.',
      },
      {
        name: '--ds-banner-close-icon-color',
        value: 'var(--icon-default)',
        notes: 'Close icon.',
      },
      {
        name: '--ds-banner-close-icon-color-hover',
        value: 'var(--icon-strong)',
        notes: 'Close icon hover.',
      },
      {
        name: '--ds-banner-radius',
        value: 'var(--radius-md)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-banner-bar-width',
        value: 'var(--banner-bar-w)',
        notes: 'Left bar width.',
      },
      {
        name: '--ds-banner-pad-x',
        value: 'var(--space-4)',
        notes: 'Horizontal padding.',
      },
      {
        name: '--ds-banner-pad-y',
        value: 'var(--space-3)',
        notes: 'Vertical padding.',
      },
    ],
  },
  {
    component: 'Toast',
    selector: '.toast',
    description:
      'Notification pill. Per-severity tints fall back to the base --ds-toast-bg-color / --ds-toast-border ' +
      'when their var is unset.',
    tokens: [
      {
        name: '--ds-toast-bg-color',
        value: 'var(--surface-overlay)',
        notes: 'Base surface fill.',
      },
      {
        name: '--ds-toast-border',
        value: 'var(--border-default)',
        notes: 'Base border.',
      },
      {
        name: '--ds-toast-bg-color-info',
        value: 'var(--ds-toast-bg-color)',
        notes: 'Info tint fill.',
      },
      {
        name: '--ds-toast-bg-color-success',
        value: 'var(--ds-toast-bg-color)',
        notes: 'Success tint fill.',
      },
      {
        name: '--ds-toast-bg-color-warning',
        value: 'var(--ds-toast-bg-color)',
        notes: 'Warning tint fill.',
      },
      {
        name: '--ds-toast-bg-color-error',
        value: 'var(--ds-toast-bg-color)',
        notes: 'Error tint fill.',
      },
      {
        name: '--ds-toast-border-info',
        value: 'var(--ds-toast-border)',
        notes: 'Info tint border.',
      },
      {
        name: '--ds-toast-border-success',
        value: 'var(--ds-toast-border)',
        notes: 'Success tint border.',
      },
      {
        name: '--ds-toast-border-warning',
        value: 'var(--ds-toast-border)',
        notes: 'Warning tint border.',
      },
      {
        name: '--ds-toast-border-error',
        value: 'var(--ds-toast-border)',
        notes: 'Error tint border.',
      },
    ],
  },
  {
    component: 'Empty state',
    selector: '.empty-state',
    description:
      'Zero-data / error / locked / success placeholder. Severity classes re-point the icon-tile colours.',
    tokens: [
      {
        name: '--ds-empty-state-tile-bg-color',
        value: 'var(--surface-tint)',
        notes: 'Icon-tile fill — severity classes re-point.',
      },
      {
        name: '--ds-empty-state-tile-icon-color',
        value: 'var(--text-secondary)',
        notes: 'Icon-tile colour.',
      },
      {
        name: '--ds-empty-state-title-text-color',
        value: 'var(--text-primary)',
        notes: 'Title colour.',
      },
      {
        name: '--ds-empty-state-body-text-color',
        value: 'var(--text-secondary)',
        notes: 'Body colour.',
      },
      {
        name: '--ds-empty-state-body-maxw',
        value: 'var(--empty-body-maxw)',
        notes: 'Body max width.',
      },
      {
        name: '--ds-empty-state-pad',
        value: 'var(--space-12) var(--space-6)',
        notes: 'Inner padding.',
      },
    ],
  },
  {
    component: 'Dropzone',
    selector: '.dropzone',
    description:
      'File drop target + per-file state colours (progress / success / error).',
    tokens: [
      {
        name: '--ds-dropzone-bg-color',
        value: 'var(--surface-default)',
        notes: 'Default fill.',
      },
      {
        name: '--ds-dropzone-bg-color-hover',
        value: 'var(--primary-subtitle)',
        notes: 'Hover fill.',
      },
      {
        name: '--ds-dropzone-bg-color-active',
        value: 'var(--primary-subtitle)',
        notes: 'Drag-active fill.',
      },
      {
        name: '--ds-dropzone-border',
        value: 'var(--border-default)',
        notes: 'Default border.',
      },
      {
        name: '--ds-dropzone-border-hover',
        value: 'var(--primary)',
        notes: 'Hover border.',
      },
      {
        name: '--ds-dropzone-border-active',
        value: 'var(--primary)',
        notes: 'Drag-active border.',
      },
      {
        name: '--ds-dropzone-text-color',
        value: 'var(--text-secondary)',
        notes: 'Body text.',
      },
      {
        name: '--ds-dropzone-text-color-active',
        value: 'var(--primary-strong)',
        notes: 'Drag-active text.',
      },
      {
        name: '--ds-dropzone-radius',
        value: 'var(--radius-lg)',
        notes: 'Corner radius.',
      },
      {
        name: '--ds-dropzone-file-progress',
        value: 'var(--primary)',
        notes: 'Upload progress.',
      },
      {
        name: '--ds-dropzone-file-success',
        value: 'var(--success)',
        notes: 'Per-file success.',
      },
      {
        name: '--ds-dropzone-file-error',
        value: 'var(--error)',
        notes: 'Per-file error.',
      },
    ],
  },
  {
    component: 'Bottom sheet',
    selector: '.bottom-sheet',
    description:
      'Mobile-anchored sheet. Prefer ds-modal / ds-drawer on larger viewports.',
    tokens: [
      {
        name: '--ds-bottom-sheet-maxw',
        value: '480px',
        notes: 'Max width — centred above this.',
      },
      {
        name: '--ds-bottom-sheet-maxh',
        value: '80%',
        notes: 'Max height of the sheet.',
      },
      {
        name: '--ds-bottom-sheet-radius',
        value: 'var(--radius-lg)',
        notes: 'Top corner radius.',
      },
    ],
  },
  {
    component: 'Menu',
    selector: '.menu-item',
    description: 'Dropdown / context menu item.',
    tokens: [
      {
        name: '--ds-menu-item-label-color',
        value: 'var(--text-primary)',
        notes: 'Item label colour.',
      },
    ],
  },
  {
    component: 'Container (shared)',
    selector: ':root / any ancestor',
    description:
      'Shared inner padding for surface containers — card and stat default their own --ds-*-pad to this, ' +
      'so one override retunes them together.',
    tokens: [
      {
        name: '--ds-container-pad',
        value: 'var(--space-6)',
        notes: 'Default inner padding for card / stat.',
      },
    ],
  },
];
