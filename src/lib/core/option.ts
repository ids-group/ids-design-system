import type { IconName } from './icon-names';

/**
 * The shape every picker's option shares — select, multi-select, autocomplete.
 * Add a field HERE, or the three drift apart the way `icon` did. Each keeps its
 * own exported name: those are public API.
 *
 * `T` exists because autocomplete carries typed values; the other two are keyed
 * by string.
 */
export interface DsOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Why this option cannot be picked. Reaches the row as `aria-describedby`, so a
   *  reader hears the reason instead of only meeting a dead row. Ignored unless
   *  `disabled` is set. */
  disabledReason?: string;
  /** Rendered before the label at 16px by every picker's option row. */
  icon?: IconName;
}

/**
 * A labelled section of options. `disabled` turns the whole section off.
 */
export interface DsOptionGroup<T = string> {
  label: string;
  options: DsOption<T>[];
  disabled?: boolean;
}

/**
 * What a picker's `options` input takes: flat options, groups, or both mixed.
 * One input rather than two, because a second `optionGroups` input can only
 * answer "what if both are set" by silently ignoring one.
 */
export type DsOptionItem<T = string> = DsOption<T> | DsOptionGroup<T>;

export function isDsOptionGroup<T>(
  item: DsOptionItem<T>,
): item is DsOptionGroup<T> {
  return 'options' in item && Array.isArray((item as DsOptionGroup<T>).options);
}

/** Every option in `items`, groups flattened in place, in source order. */
export function flattenDsOptions<T>(
  items: readonly DsOptionItem<T>[],
): DsOption<T>[] {
  return items.flatMap((item) =>
    isDsOptionGroup(item)
      ? item.options.map((option) =>
          // Only copy when the flag is not already there: the pickers pre-apply a
          // disabled group to the options THEY render, and a second copy here
          // would break the object identity their flat-index lookup compares by.
          item.disabled && !option.disabled
            ? { ...option, disabled: true }
            : option,
        )
      : [item],
  );
}
