import type { DsOption } from '../../core/option';
import type { DsControlWidth } from '../../core/width';

export interface SelectOption extends DsOption<string> {}

export type SelectWidth = DsControlWidth;

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
