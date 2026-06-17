export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
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
