import { input } from '@angular/core';
import { MultiSelectComponent } from '@ids-group-ltd/ids-design-system';

export class AppMultiSelect extends MultiSelectComponent {
  // @ts-expect-error after TS2416
  override readonly maxVisibleChips = input<number | 'fit' | null>('fit');
}
