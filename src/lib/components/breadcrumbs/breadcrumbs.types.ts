import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export interface BreadcrumbItem {
  label?: string;
  href?: string;
  icon?: IconName;
  /**
   * The crumb's accessible name when it has an icon and no `label` — the usual
   * icon-only home crumb. Nothing is derived from `icon`: "home" is a glyph id,
   * not a word for the user, and guessing it ships the wrong one everywhere the
   * guess is off.
   */
  ariaLabel?: string;
}
