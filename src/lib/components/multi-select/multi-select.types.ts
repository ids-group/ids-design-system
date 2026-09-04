import type {
  DsOption,
  DsOptionGroup,
  DsOptionItem,
} from '@ids-group-ltd/ids-design-system/core';
import type { DsControlWidth } from '@ids-group-ltd/ids-design-system/core';

export interface MultiSelectOption extends DsOption<string> {}

export interface MultiSelectOptionGroup extends DsOptionGroup<string> {}

export type MultiSelectItem = DsOptionItem<string>;

export type MultiSelectWidth = DsControlWidth;
