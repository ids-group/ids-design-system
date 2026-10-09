import { computed } from '@angular/core';
import { AutocompleteComponent, MultiSelectComponent, SelectComponent, type AutocompleteOptionGroup } from '@ids-group-ltd/ids-design-system';

export class AppSelect extends SelectComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly width = 1;
}

// @ts-expect-error after TS2415
export class AppMultiSelect extends MultiSelectComponent {
  // @ts-expect-error after TS4114
  private firstEnabledIndex(): number {
    return 0;
  }
}

export class AppAutocomplete extends AutocompleteComponent<string> {
  // @ts-expect-error after TS4113
  protected override readonly filteredGroups = computed<AutocompleteOptionGroup<string>[]>(() => []);
}

export class AppAutocompleteUnmarked extends AutocompleteComponent<string> {
  // @ts-expect-error before TS4114
  protected readonly filteredGroups = computed<AutocompleteOptionGroup<string>[]>(() => []);
}
