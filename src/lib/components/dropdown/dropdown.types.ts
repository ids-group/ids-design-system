import type { IconName } from '../../icons/icons.data';

export type DropdownSize = 'sm' | 'md' | 'lg';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: IconName;
}

export interface DropdownOptionGroup {
  label: string;
  options: DropdownOption[];
}
