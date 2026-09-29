import type { IconName } from './icon-names';

/**
 * The shape every picker's option shares (select, multi-select, autocomplete). Each keeps its
 * own exported name. `T` exists because autocomplete carries typed values.
 */
export interface DsOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Why this option cannot be picked; reaches the row as `aria-describedby`. Needs `disabled`. */
  disabledReason?: string;
  /** Rendered before the label at 16px. */
  icon?: IconName;
}

/** A labelled section of options. `disabled` turns the whole section off. */
export interface DsOptionGroup<T = string> {
  label: string;
  options: DsOption<T>[];
  disabled?: boolean;
}

/**
 * What a picker's `options` input takes: flat options, groups, or both mixed.
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
          // Copy only when the flag is missing: pickers pre-apply a disabled group to the options
          // they render, and a second copy would break the identity their flat-index lookup uses.
          item.disabled && !option.disabled
            ? { ...option, disabled: true }
            : option,
        )
      : [item],
  );
}
