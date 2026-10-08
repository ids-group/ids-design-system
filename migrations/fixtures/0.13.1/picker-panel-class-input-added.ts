import { input } from '@angular/core';
import { SelectComponent } from '@ids-group-ltd/ids-design-system';

export class AppSelect extends SelectComponent {
  // @ts-expect-error after TS4114
  readonly panelClass = input<string | readonly string[]>('');
}

export class AppSelectFlag extends SelectComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly panelClass = 1;
}
