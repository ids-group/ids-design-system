import { booleanAttribute, input } from '@angular/core';
import { InputComponent, SelectComponent } from '@ids-group-ltd/ids-design-system';

export class AppInput extends InputComponent {
  // @ts-expect-error after TS2416
  override readonly hint = input<string>('');
  override readonly invalid = input(false, { transform: booleanAttribute });
}

export class AppInputRetyped extends InputComponent {
  // @ts-expect-error before TS2416
  override readonly hint = input<string, string | null | undefined>('', { transform: (value) => value?.trim() ?? '' });
}

export class AppSelect extends SelectComponent {
  // @ts-expect-error after TS4114
  readonly success = input<string, string | null | undefined>('', { transform: (value) => value?.trim() ?? '' });
}

export class AppSelectFlag extends SelectComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly success = true;
}
