import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export interface BreadcrumbItem {
  label?: string;
  href?: string;
  icon?: IconName;
  /** The name of a crumb with an icon and no `label`. Nothing is derived from `icon` — a glyph id
   *  is not a word for the user. */
  ariaLabel?: string;
}
