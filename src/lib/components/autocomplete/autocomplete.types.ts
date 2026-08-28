import type { DsOption } from '../../core/option';
import type { DsControlWidth } from '../../core/width';

/** `content` here also reserves a minimum typing area beside the chips. */
export type AutocompleteWidth = DsControlWidth;

export interface AutocompleteOption<T = unknown> extends DsOption<T> {}

export interface AutocompleteOptionGroup<T = unknown> {
  readonly label: string;
  readonly options: AutocompleteOption<T>[];
}
