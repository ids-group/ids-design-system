import type { DsOption, DsOptionGroup, DsOptionItem } from '../../core/option';
import type { DsControlWidth } from '../../core/width';

export interface MultiSelectOption extends DsOption<string> {}

export interface MultiSelectOptionGroup extends DsOptionGroup<string> {}

export type MultiSelectItem = DsOptionItem<string>;

export type MultiSelectWidth = DsControlWidth;
