import { SelectComponent, type SelectOption } from '@ids-group-ltd/ids-design-system';

export class AppSelect extends SelectComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly loading = 1;
}

// @ts-expect-error after TS2415
export class AppSelectWithPrivate extends SelectComponent {
  // @ts-expect-error after TS4114
  private pickActive(): void {}
}

// @ts-expect-error before TS2353
export const explained: SelectOption = { value: 'a', label: 'A', disabled: true, disabledReason: 'Sold out' };
