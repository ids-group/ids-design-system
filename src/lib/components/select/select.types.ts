import type { DsOption, DsOptionGroup, DsOptionItem } from '../../core/option';
import { isDsOptionGroup } from '../../core/option';
import type { DsControlWidth } from '../../core/width';

export interface SelectOption extends DsOption<string> {}

export type SelectWidth = DsControlWidth;

export interface SelectOptionGroup extends DsOptionGroup<string> {}

export type SelectItem = DsOptionItem<string>;

export function isSelectOptionGroup(
  item: SelectItem,
): item is SelectOptionGroup {
  return isDsOptionGroup(item);
}
