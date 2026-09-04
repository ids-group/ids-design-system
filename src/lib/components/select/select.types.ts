import type {
  DsOption,
  DsOptionGroup,
  DsOptionItem,
} from '@ids-group-ltd/ids-design-system/core';
import { isDsOptionGroup } from '@ids-group-ltd/ids-design-system/core';
import type { DsControlWidth } from '@ids-group-ltd/ids-design-system/core';

export interface SelectOption extends DsOption<string> {}

export type SelectWidth = DsControlWidth;

export interface SelectOptionGroup extends DsOptionGroup<string> {}

export type SelectItem = DsOptionItem<string>;

export function isSelectOptionGroup(
  item: SelectItem,
): item is SelectOptionGroup {
  return isDsOptionGroup(item);
}
