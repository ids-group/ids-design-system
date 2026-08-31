import type { DsOption, DsOptionGroup, DsOptionItem } from '../../core/option';
import type { DsControlWidth } from '../../core/width';

/** `content` here also reserves a minimum typing area beside the chips. */
export type AutocompleteWidth = DsControlWidth;

/** What a settled single value does when it outgrows the trigger. */
export type AutocompleteValueOverflow = 'ellipsis' | 'wrap';

export interface AutocompleteOption<T = unknown> extends DsOption<T> {}

export interface AutocompleteOptionGroup<
  T = unknown,
> extends DsOptionGroup<T> {}

export type AutocompleteItem<T = unknown> = DsOptionItem<T>;
