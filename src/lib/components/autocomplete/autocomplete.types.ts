import type {
  DsOption,
  DsOptionGroup,
  DsOptionItem,
} from '@ids-group-ltd/ids-design-system/core';
import type { DsControlWidth } from '@ids-group-ltd/ids-design-system/core';

/** `content` here also reserves a minimum typing area beside the chips. */
export type AutocompleteWidth = DsControlWidth;

/** Handling of a settled single value wider than the trigger. */
export type AutocompleteValueOverflow = 'ellipsis' | 'wrap';

export interface AutocompleteOption<T = unknown> extends DsOption<T> {}

export interface AutocompleteOptionGroup<
  T = unknown,
> extends DsOptionGroup<T> {}

export type AutocompleteItem<T = unknown> = DsOptionItem<T>;
