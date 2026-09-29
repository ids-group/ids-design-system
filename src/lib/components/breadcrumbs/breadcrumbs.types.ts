import type { IconName } from '@ids-group-ltd/ids-design-system/core';

export interface BreadcrumbItem {
  label?: string;
  href?: string;
  icon?: IconName;
  /** The accessible name of a crumb with an icon and no `label`; not derived from `icon`. */
  ariaLabel?: string;
}
