import type { IconName } from '../../icons/icons.data';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: IconName;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

export type SelectItem = SelectOption | SelectOptionGroup;

export function isSelectOptionGroup(
  item: SelectItem,
): item is SelectOptionGroup {
  return (
    'options' in item && Array.isArray((item as SelectOptionGroup).options)
  );
}
